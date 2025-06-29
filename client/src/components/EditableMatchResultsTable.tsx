import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Trash2, Search, ChevronLeft, ChevronRight, Loader2, Info, Percent, Undo2 } from "lucide-react"
import { PriceItemSelectionModal } from "./PriceItemSelectionModal"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Card, CardContent } from '@/components/ui/card'
import { apiEndpoint } from '@/config/api'

interface MatchResult {
  id: string
  original_description: string
  matched_description: string
  matched_rate: number
  similarity_score: number
  row_number: number
  sheet_name: string
  quantity?: number
  unit?: string
  total_amount?: number
  matched_price_item_id?: string
  section_header?: string
  match_mode?: string
}

interface PriceItem {
  id: string
  description: string
  rate: number
  unit: string
}

interface EditableMatchResultsTableProps {
  matchResults: MatchResult[]
  onUpdateResult: (id: string, updates: Partial<MatchResult>) => void
  onDeleteResult: (id: string) => void
  currency: string
}

export function EditableMatchResultsTable({ 
  matchResults, 
  onUpdateResult, 
  onDeleteResult,
  currency = 'GBP'
}: EditableMatchResultsTableProps) {
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [matchModes, setMatchModes] = useState<Record<string, 'ai' | 'local' | 'manual'>>({})
  const [priceItems, setPriceItems] = useState<Record<string, PriceItem>>({})
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const [localMatches, setLocalMatches] = useState<Record<string, Partial<MatchResult>>>({})
  const [originalAIMatches, setOriginalAIMatches] = useState<Record<string, Partial<MatchResult>>>({})
  const [isBulkDiscountModalOpen, setIsBulkDiscountModalOpen] = useState(false)
  const [discountPercentage, setDiscountPercentage] = useState('')
  const [lastAppliedDiscount, setLastAppliedDiscount] = useState('')
  const [originalRatesBeforeDiscount, setOriginalRatesBeforeDiscount] = useState<Record<string, { matched_rate: number; total_amount: number }>>({})
  const [isDiscountApplied, setIsDiscountApplied] = useState(false)
  
  const safeMatchResults = useMemo(() => Array.isArray(matchResults) ? matchResults.filter(r => r && r.id) : [], [matchResults])
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100
  
  const totalItems = safeMatchResults.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  const currentPageResults = useMemo(() => {
    const pageResults = safeMatchResults.slice(startIndex, endIndex)
    
    const grouped: { header: string | null; items: typeof pageResults }[] = []
    let currentHeader: string | null = null
    let currentGroup: typeof pageResults = []
    
    pageResults.forEach(result => {
      const resultHeader = result.section_header || null
      
      if (resultHeader !== currentHeader) {
        if (currentGroup.length > 0) {
          grouped.push({ header: currentHeader, items: currentGroup })
        }
        currentHeader = resultHeader
        currentGroup = [result]
      } else {
        currentGroup.push(result)
      }
    })
    
    if (currentGroup.length > 0) {
      grouped.push({ header: currentHeader, items: currentGroup })
    }
    
    return grouped
  }, [safeMatchResults, startIndex, endIndex])

  useEffect(() => {
    if (safeMatchResults.length > 0) {
      const newAIMatches = { ...originalAIMatches }
      const newMatchModes = { ...matchModes }
      
      safeMatchResults.forEach(r => {
        if (!newAIMatches[r.id]) newAIMatches[r.id] = { ...r }
        // Initialize match mode from database or default to 'ai'
        if (!newMatchModes[r.id]) {
          newMatchModes[r.id] = (r.match_mode as 'ai' | 'local' | 'manual') || 'ai'
        }
      })
      
      setOriginalAIMatches(newAIMatches)
      setMatchModes(newMatchModes)
    }
  }, [safeMatchResults])

  useEffect(() => {
    const loadPriceItems = async () => {
      try {
        const priceItemIds = safeMatchResults
          .filter(result => result?.matched_price_item_id)
          .map(result => result.matched_price_item_id!)

        if (priceItemIds.length === 0) return

        const { data, error } = await supabase
          .from('price_items')
          .select('id, description, rate, unit')
          .in('id', priceItemIds)

        if (error) {
          console.error('Error loading price items:', error)
          return
        }

        const priceItemMap: Record<string, PriceItem> = {}
        data?.forEach(item => {
          if (item && item.id) {
            priceItemMap[item.id] = item
          }
        })
        console.log('Loaded price items:', priceItemMap)
        console.log('Price item IDs from results:', priceItemIds)
        setPriceItems(priceItemMap)
      } catch (error) {
        console.error('Error loading price items:', error)
      }
    }

    loadPriceItems()
  }, [safeMatchResults])

  if (!Array.isArray(matchResults)) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-destructive">Error: Invalid match results data.</p>
          <p className="text-sm text-muted-foreground">Please try processing the file again.</p>
        </CardContent>
      </Card>
    )
  }
  
  if (safeMatchResults.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Info className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">No match results found.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your file or matching criteria.</p>
        </CardContent>
      </Card>
    )
  }

  const getCurrencySymbol = (currency: string) => ({
    'GBP': '£', 'EUR': '€', 'AED': 'د.إ', 'CAD': 'C$', 'USD': '$'
  }[currency] || '$')

  const calculateTotal = (quantity?: number, rate?: number) => (quantity && rate ? quantity * rate : 0)
  const formatNumber = (value: number) => value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleFieldChange = (id: string, field: keyof MatchResult, value: string | number) => {
    const currentMode = matchModes[id] || 'ai'
    let updates: Partial<MatchResult> = { [field]: value, match_mode: currentMode }
    const result = safeMatchResults.find(r => r.id === id)

    if (result && (field === 'quantity' || field === 'matched_rate')) {
      const newQuantity = field === 'quantity' ? Number(value) : result.quantity
      const newRate = field === 'matched_rate' ? Number(value) : result.matched_rate
      updates.total_amount = calculateTotal(newQuantity, newRate)
    }
    
    onUpdateResult(id, updates)
    if (currentMode === 'ai') {
      setOriginalAIMatches(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }))
    } else if (currentMode === 'local') {
      setLocalMatches(prev => ({ ...prev, [id]: { ...prev[id], ...updates } }))
    }
  }

  const handleMatchModeChange = async (resultId: string, mode: 'ai' | 'local' | 'manual') => {
    console.log(`🔄 [MATCH MODE] Changing mode for ${resultId} to: ${mode}`)
    setMatchModes(prev => ({ ...prev, [resultId]: mode }))
    
    // Save match mode to database immediately
    try {
      const { error } = await supabase
        .from('match_results')
        .update({ match_mode: mode })
        .eq('id', resultId)
      
      if (error) {
        console.error('Error saving match mode:', error)
        toast.error('Failed to save match mode')
      } else {
        console.log(`✅ [MATCH MODE] Saved ${mode} mode for ${resultId}`)
      }
    } catch (error) {
      console.error('Error saving match mode:', error)
      toast.error('Failed to save match mode')
    }
    
    if (mode === 'ai') {
      if (originalAIMatches[resultId]) {
        onUpdateResult(resultId, { ...originalAIMatches[resultId], match_mode: mode })
        toast.success('Restored AI match')
      }
    } else if (mode === 'manual') {
      setSelectedResultId(resultId)
      setIsModalOpen(true)
    } else if (mode === 'local') {
      const result = safeMatchResults.find(r => r.id === resultId)
      if (result) {
        setLoadingStates(prev => ({ ...prev, [resultId]: true }))
        toast.info('Running local matching...')
        try {
          console.log(`🔍 [LOCAL MATCH] Starting local match for: "${result.original_description}"`)
          const response = await fetch(apiEndpoint('/price-matching/match-item-local'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              description: result.original_description,
              threshold: 0.5
            })
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const data = await response.json()
          console.log(`📊 [LOCAL MATCH] Response:`, data)
          
          if (data.success && data.match) {
            const matchData = { 
              ...data.match, 
              similarity_score: data.match.similarity_score / 100, // Convert percentage to decimal
              match_mode: mode
            }
            console.log(`✅ [LOCAL MATCH] Storing local match:`, matchData)
            setLocalMatches(prev => ({ ...prev, [resultId]: matchData }))
            onUpdateResult(resultId, matchData)
            toast.success('Local match found!')
          } else {
            console.log(`❌ [LOCAL MATCH] No match found:`, data.error)
            toast.error(data.error || 'No local match found')
            // Don't revert to AI - keep the local mode selected
          }
        } catch (error) {
          console.error('❌ [LOCAL MATCH] Error:', error)
          toast.error(`Local matching failed: ${error.message}`)
          // Don't revert to AI - keep the local mode selected
        } finally {
          setLoadingStates(prev => ({ ...prev, [resultId]: false }))
        }
      }
    }
  }

  const handleManualSelection = (item: any, customRate?: number) => {
    if (selectedResultId) {
      const result = safeMatchResults.find(r => r.id === selectedResultId)
      const finalRate = customRate || item.rate
      const manualMatchData = {
        matched_description: item.description,
        matched_rate: finalRate,
        unit: item.unit,
        total_amount: calculateTotal(result?.quantity, finalRate),
        similarity_score: 1.0,
        matched_price_item_id: item.id,
        match_mode: 'manual'
      }
      onUpdateResult(selectedResultId, manualMatchData)
      setOriginalAIMatches(prev => ({ ...prev, [selectedResultId]: { ...prev[selectedResultId], ...manualMatchData } }))
      setMatchModes(prev => ({ ...prev, [selectedResultId]: 'manual' }))
      toast.success('Manual selection applied!')
    }
    setIsModalOpen(false)
    setSelectedResultId(null)
  }

  const handleOpenBulkDiscountModal = () => {
    setDiscountPercentage(lastAppliedDiscount)
    setIsBulkDiscountModalOpen(true)
    console.log(`🔧 [BULK DISCOUNT] Modal opened with last applied discount: ${lastAppliedDiscount}%`)
  }

  const handleBulkDiscount = () => {
    const discount = parseFloat(discountPercentage)
    
    if (!discount || discount < 0 || discount > 100) {
      toast.error('Please enter a valid discount percentage (0-100)')
      return
    }

    // Store original rates before applying discount (only if no discount is currently applied)
    let originalRates: Record<string, { matched_rate: number; total_amount: number }> = {}
    
    if (!isDiscountApplied) {
      // First time applying discount - store current rates as original
      safeMatchResults.forEach(result => {
        if (result.matched_rate && result.matched_rate > 0) {
          originalRates[result.id] = {
            matched_rate: result.matched_rate,
            total_amount: result.total_amount || 0
          }
        }
      })
      setOriginalRatesBeforeDiscount(originalRates)
    } else {
      // Discount already applied - keep the existing original rates
      originalRates = originalRatesBeforeDiscount
      console.log(`⚠️ [BULK DISCOUNT] Replacing existing ${lastAppliedDiscount}% discount with new ${discount}% discount`)
    }

    const discountMultiplier = (100 - discount) / 100
    let updatedCount = 0

    console.log(`🎯 [BULK DISCOUNT] Starting bulk discount application of ${discount}%`)
    console.log(`💾 [BULK DISCOUNT] Storing original rates for ${Object.keys(originalRates).length} items`)

    safeMatchResults.forEach(result => {
      if (result.matched_rate && result.matched_rate > 0) {
        const oldRate = result.matched_rate
        // If discount is already applied, calculate new rate from original rate, not current discounted rate
        const baseRate = isDiscountApplied && originalRates[result.id] 
          ? originalRates[result.id].matched_rate 
          : result.matched_rate
        const newRate = baseRate * discountMultiplier
        const updates = {
          matched_rate: Number(newRate.toFixed(2)),
          total_amount: calculateTotal(result.quantity, Number(newRate.toFixed(2)))
        }
        
        console.log(`📝 [BULK DISCOUNT] Item ${result.id}: ${oldRate} → ${updates.matched_rate} (${discount}% discount from base rate ${baseRate})`)
        
        onUpdateResult(result.id, updates)
        
        // Update the stored matches for different modes
        const currentMode = matchModes[result.id] || 'ai'
        if (currentMode === 'ai') {
          setOriginalAIMatches(prev => ({ 
            ...prev, 
            [result.id]: { ...prev[result.id], ...updates }
          }))
        } else if (currentMode === 'local') {
          setLocalMatches(prev => ({ 
            ...prev, 
            [result.id]: { ...prev[result.id], ...updates }
          }))
        }
        
        updatedCount++
      }
    })

    // Remember the last applied discount and mark as applied
    setLastAppliedDiscount(discountPercentage)
    setIsDiscountApplied(true)
    setIsBulkDiscountModalOpen(false)
    
    console.log(`✅ [BULK DISCOUNT] ${discount}% applied successfully to ${updatedCount} items`)
    toast.success(`Applied ${discount}% discount to ${updatedCount} items`)
  }

  const handleUndoDiscount = () => {
    if (!isDiscountApplied || Object.keys(originalRatesBeforeDiscount).length === 0) {
      toast.error('No discount to undo')
      return
    }

    let restoredCount = 0
    console.log(`🔄 [UNDO DISCOUNT] Starting to restore original rates for ${Object.keys(originalRatesBeforeDiscount).length} items`)

    Object.entries(originalRatesBeforeDiscount).forEach(([resultId, originalData]) => {
      const result = safeMatchResults.find(r => r.id === resultId)
      if (result) {
        const updates = {
          matched_rate: originalData.matched_rate,
          total_amount: originalData.total_amount
        }
        
        console.log(`📝 [UNDO DISCOUNT] Item ${resultId}: ${result.matched_rate} → ${originalData.matched_rate} (restored)`)
        
        onUpdateResult(resultId, updates)
        
        // Update the stored matches for different modes
        const currentMode = matchModes[resultId] || 'ai'
        if (currentMode === 'ai') {
          setOriginalAIMatches(prev => ({ 
            ...prev, 
            [resultId]: { ...prev[resultId], ...updates }
          }))
        } else if (currentMode === 'local') {
          setLocalMatches(prev => ({ 
            ...prev, 
            [resultId]: { ...prev[resultId], ...updates }
          }))
        }
        
        restoredCount++
      }
    })

    // Clear the discount state
    setIsDiscountApplied(false)
    setOriginalRatesBeforeDiscount({})
    
    console.log(`✅ [UNDO DISCOUNT] Successfully restored original rates for ${restoredCount} items`)
    toast.success(`Discount cancelled - restored original rates for ${restoredCount} items`)
  }

  const grandTotal = useMemo(() => safeMatchResults.reduce((sum, r) => sum + (r.total_amount || 0), 0), [safeMatchResults])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h3 className="text-lg font-semibold">
          Match Results
          {isDiscountApplied && lastAppliedDiscount && (
            <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
              ({lastAppliedDiscount}% discount applied)
            </span>
          )}
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {isDiscountApplied && (
            <Button 
              variant="outline" 
              onClick={handleUndoDiscount}
              className="flex items-center justify-center gap-2 h-10 touch-manipulation text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300"
            >
              <Undo2 className="h-4 w-4" />
              <span className="text-sm">Undo Discount</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleOpenBulkDiscountModal}
            className="flex items-center justify-center gap-2 h-10 touch-manipulation"
            disabled={safeMatchResults.length === 0}
          >
            <Percent className="h-4 w-4" />
            <span className="text-sm">Bulk Discount</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table className="min-w-[1000px]">
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead className="min-w-[250px]">Match</TableHead>
            <TableHead className="min-w-[80px]">Qty</TableHead>
            <TableHead className="min-w-[60px]">Unit</TableHead>
            <TableHead className="min-w-[100px]">Rate</TableHead>
            <TableHead className="min-w-[70px]">Conf.</TableHead>
            <TableHead className="min-w-[100px]">Total</TableHead>
            <TableHead className="min-w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageResults.map((group, groupIndex) => (
            <React.Fragment key={`group-${groupIndex}`}>
              {groupIndex > 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-2 bg-background border-none p-0" />
                </TableRow>
              )}
              {group.header !== null ? (
                <TableRow className="bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border-y border-primary/20">
                  <TableCell colSpan={8} className="font-semibold py-4 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-6 w-1.5 bg-primary rounded-full" />
                          <div className="h-4 w-1 bg-primary/60 rounded-full" />
                          <div className="h-2 w-0.5 bg-primary/30 rounded-full" />
                        </div>
                        <span className="text-base text-foreground/90 tracking-wide">{group.header}</span>
                      </div>
                      <Badge variant="secondary" className="ml-auto">
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ) : groupIndex === 0 && (
                <TableRow className="bg-muted/30 hover:bg-muted/40 border-y border-muted-foreground/10">
                  <TableCell colSpan={8} className="font-medium py-3 px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-1 bg-muted-foreground/50 rounded-full" />
                          <div className="h-3 w-0.5 bg-muted-foreground/30 rounded-full" />
                        </div>
                        <span className="text-sm text-muted-foreground">General Items</span>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {group.items.map((result) => {
                const currentMode = matchModes[result.id] || 'ai'
                const displayData = (currentMode === 'local' && localMatches[result.id]) ? { ...result, ...localMatches[result.id] } : result
                const score = (displayData.similarity_score < 1 ? displayData.similarity_score * 100 : displayData.similarity_score)

                return (
                  <TableRow key={result.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{result.original_description}</p>
                      <p className="text-xs text-muted-foreground">Row {result.row_number} • {result.sheet_name}</p>
                    </TableCell>
                    <TableCell>
                      <RadioGroup value={currentMode} onValueChange={(v) => handleMatchModeChange(result.id, v as any)} className="mb-2">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="ai" id={`ai-${result.id}`} /><Label htmlFor={`ai-${result.id}`}>AI Match</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="local" id={`local-${result.id}`} /><Label htmlFor={`local-${result.id}`}>Local Match</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="manual" id={`manual-${result.id}`} /><Label htmlFor={`manual-${result.id}`}>Manual Match</Label></div>
                      </RadioGroup>
                      {currentMode === 'manual' && displayData.matched_description ? (
                        <div className="p-2 border rounded-md bg-blue-500/10 border-blue-500/20">
                          <p className="text-sm font-medium">{displayData.matched_description}</p>
                          <p className="text-xs text-muted-foreground">Rate: {getCurrencySymbol(currency)}{formatNumber(displayData.matched_rate || 0)} per {displayData.unit || 'unit'}</p>
                          <p className="text-xs text-muted-foreground">Manual Selection</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => { setSelectedResultId(result.id); setIsModalOpen(true); }} 
                            className="mt-1 h-8 touch-manipulation text-xs"
                          >
                            <Search className="h-3 w-3 mr-1" />Change
                          </Button>
                        </div>
                      ) : currentMode === 'manual' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => { setSelectedResultId(result.id); setIsModalOpen(true); }} 
                          className="mt-2 h-8 touch-manipulation text-xs"
                        >
                          <Search className="h-3 w-3 mr-1" />Search
                        </Button>
                      ) : (
                        <div className={`p-2 border rounded-md ${currentMode === 'ai' ? 'bg-primary/10 border-primary/20' : 'bg-green-500/10 border-green-500/20'}`}>
                          {loadingStates[result.id] ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Matching...</span></div>
                          ) : (
                            <>
                              <p className="text-sm font-medium">{displayData.matched_description || 'No match found'}</p>
                              <p className="text-xs text-muted-foreground">Rate: {getCurrencySymbol(currency)}{formatNumber(displayData.matched_rate || 0)} per {displayData.unit || 'unit'}</p>
                              <p className="text-xs text-muted-foreground">Confidence: {Math.round(score)}%</p>
                            </>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={result.quantity || ''} 
                        onChange={(e) => handleFieldChange(result.id, 'quantity', parseFloat(e.target.value) || 0)} 
                        className="w-20 h-9 touch-manipulation" 
                      />
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{displayData.unit || 'N/A'}</Badge></TableCell>
                    <TableCell>
                      <Input 
                        type="number" 
                        value={displayData.matched_rate || ''} 
                        onChange={(e) => handleFieldChange(result.id, 'matched_rate', parseFloat(e.target.value) || 0)} 
                        className="w-24 h-9 touch-manipulation" 
                      />
                    </TableCell>
                    <TableCell><Badge variant={score > 80 ? 'default' : 'secondary'} className="text-xs">{Math.round(score)}%</Badge></TableCell>
                    <TableCell className="font-medium text-sm">{getCurrencySymbol(currency)}{formatNumber(displayData.total_amount || 0)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDeleteResult(result.id)}
                        className="h-8 w-8 touch-manipulation"
                        aria-label="Delete result"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-4 gap-3">
        <p className="text-sm text-muted-foreground text-center sm:text-left">Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</p>
        <div className="flex items-center justify-center sm:justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            className="h-10 px-3 touch-manipulation"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />Previous
          </Button>
          <span className="text-sm px-3 py-2 bg-muted rounded">{currentPage} / {totalPages}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            className="h-10 px-3 touch-manipulation"
          >
            Next<ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-end border-t pt-4">
        <p className="text-lg font-semibold">Grand Total: {getCurrencySymbol(currency)}{formatNumber(grandTotal)}</p>
      </div>

      <PriceItemSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleManualSelection} inquiryDescription={selectedResultId ? safeMatchResults.find(r => r.id === selectedResultId)?.original_description || '' : ''} />

      <Dialog open={isBulkDiscountModalOpen} onOpenChange={setIsBulkDiscountModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Bulk Discount
            </DialogTitle>
            <DialogDescription>
              Apply a percentage discount to all matched rates. This will reduce all current rates by the specified percentage.
              {isDiscountApplied && (
                <span className="block mt-2 text-orange-600 dark:text-orange-400 font-medium">
                  ⚠️ A {lastAppliedDiscount}% discount is currently applied. Applying a new discount will replace the current one.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discount-percentage">Discount Percentage</Label>
              <Input
                id="discount-percentage"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="Enter discount percentage (e.g., 10 for 10%)"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Enter a value between 0 and 100. For example, enter "10" for a 10% discount.
              </p>
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm">
                <div className="flex justify-between items-center mb-1">
                  <span>Current Total:</span>
                  <span className="font-medium">{getCurrencySymbol(currency)}{formatNumber(grandTotal)}</span>
                </div>
                {discountPercentage && !isNaN(parseFloat(discountPercentage)) && parseFloat(discountPercentage) >= 0 && parseFloat(discountPercentage) <= 100 && (
                  <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                    <span>New Total (after {discountPercentage}% discount):</span>
                    <span className="font-medium">
                      {getCurrencySymbol(currency)}{formatNumber(grandTotal * (100 - parseFloat(discountPercentage)) / 100)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleBulkDiscount}
              className="flex-1"
              disabled={!discountPercentage || isNaN(parseFloat(discountPercentage)) || parseFloat(discountPercentage) < 0 || parseFloat(discountPercentage) > 100}
            >
              Apply Discount
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBulkDiscountModalOpen(false)
                console.log(`❌ [BULK DISCOUNT] Modal cancelled, keeping last value: ${discountPercentage}%`)
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
