import React, { useState, useEffect, useMemo, useCallback, memo } from 'react'
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
import { PerformanceMonitor, usePerformanceMetrics } from './PerformanceMonitor'

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

// Memoized row component for better performance
const MemoizedTableRow = memo<{
  result: MatchResult
  currentMode: string
  displayData: MatchResult
  score: number
  currency: string
  matchModes: Record<string, 'ai' | 'local' | 'manual'>
  loadingStates: Record<string, boolean>
  onMatchModeChange: (resultId: string, mode: 'ai' | 'local' | 'manual') => void
  onFieldChange: (id: string, field: keyof MatchResult, value: string | number) => void
  onDeleteResult: (id: string) => void
  onOpenManualSelection: (id: string) => void
  getCurrencySymbol: (currency: string) => string
  formatNumber: (value: number) => string
}>(({ 
  result, 
  currentMode, 
  displayData, 
  score, 
  currency, 
  onMatchModeChange, 
  onFieldChange, 
  onDeleteResult, 
  onOpenManualSelection,
  getCurrencySymbol,
  formatNumber,
  loadingStates
}) => {
  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(result.id, 'quantity', parseFloat(e.target.value) || 0)
  }, [result.id, onFieldChange])

  const handleRateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onFieldChange(result.id, 'matched_rate', parseFloat(e.target.value) || 0)
  }, [result.id, onFieldChange])

  const handleModeChange = useCallback((mode: 'ai' | 'local' | 'manual') => {
    onMatchModeChange(result.id, mode)
  }, [result.id, onMatchModeChange])

  const handleDelete = useCallback(() => {
    onDeleteResult(result.id)
  }, [result.id, onDeleteResult])

  const handleManualSelection = useCallback(() => {
    onOpenManualSelection(result.id)
  }, [result.id, onOpenManualSelection])

  return (
    <TableRow>
      <TableCell>
        <p className="text-sm font-medium">{result.original_description}</p>
        <p className="text-xs text-muted-foreground">Row {result.row_number} • {result.sheet_name}</p>
      </TableCell>
      <TableCell>
        <RadioGroup value={currentMode} onValueChange={handleModeChange} className="mb-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ai" id={`ai-${result.id}`} />
            <Label htmlFor={`ai-${result.id}`}>AI Match</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="local" id={`local-${result.id}`} />
            <Label htmlFor={`local-${result.id}`}>Local Match</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id={`manual-${result.id}`} />
            <Label htmlFor={`manual-${result.id}`}>Manual Match</Label>
          </div>
        </RadioGroup>
        {currentMode === 'manual' && displayData.matched_description ? (
          <div className="p-2 border rounded-md bg-blue-500/10 border-blue-500/20">
            <p className="text-sm font-medium">{displayData.matched_description}</p>
            <p className="text-xs text-muted-foreground">
              Rate: {getCurrencySymbol(currency)}{formatNumber(displayData.matched_rate || 0)} per {displayData.unit || 'unit'}
            </p>
            <p className="text-xs text-muted-foreground">Manual Selection</p>
            <Button variant="outline" size="sm" onClick={handleManualSelection} className="mt-1">
              <Search className="h-4 w-4 mr-2" />Change Selection
            </Button>
          </div>
        ) : currentMode === 'manual' ? (
          <Button variant="outline" size="sm" onClick={handleManualSelection} className="mt-2">
            <Search className="h-4 w-4 mr-2" />Search Price List
          </Button>
        ) : (
          <div className={`p-2 border rounded-md ${currentMode === 'ai' ? 'bg-primary/10 border-primary/20' : 'bg-green-500/10 border-green-500/20'}`}>
            {loadingStates[result.id] ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Matching...</span>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">{displayData.matched_description || 'No match found'}</p>
                <p className="text-xs text-muted-foreground">
                  Rate: {getCurrencySymbol(currency)}{formatNumber(displayData.matched_rate || 0)} per {displayData.unit || 'unit'}
                </p>
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
          onChange={handleQuantityChange} 
          className="w-20" 
        />
      </TableCell>
      <TableCell>
        <Badge variant="outline">{displayData.unit || 'N/A'}</Badge>
      </TableCell>
      <TableCell>
        <Input 
          type="number" 
          value={displayData.matched_rate || ''} 
          onChange={handleRateChange} 
          className="w-24" 
        />
      </TableCell>
      <TableCell>
        <Badge variant={score > 80 ? 'default' : 'secondary'}>
          {Math.round(score)}%
        </Badge>
      </TableCell>
      <TableCell className="font-medium">
        {getCurrencySymbol(currency)}{formatNumber(displayData.total_amount || 0)}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  )
})

MemoizedTableRow.displayName = 'MemoizedTableRow'

// Memoized header row component
const MemoizedHeaderRow = memo<{
  group: { header: string | null; items: MatchResult[] }
  groupIndex: number
}>(({ group, groupIndex }) => {
  if (group.header !== null) {
    return (
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
    )
  }

  if (groupIndex === 0) {
    return (
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
    )
  }

  return null
})

MemoizedHeaderRow.displayName = 'MemoizedHeaderRow'

export const OptimizedMatchResultsTable = memo<EditableMatchResultsTableProps>(({ 
  matchResults, 
  onUpdateResult, 
  onDeleteResult,
  currency = 'GBP'
}) => {
  const { logPerformance } = usePerformanceMetrics('OptimizedMatchResultsTable')
  
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
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = 100

  // Memoized safe match results
  const safeMatchResults = useMemo(() => {
    const startTime = performance.now()
    const results = Array.isArray(matchResults) ? matchResults.filter(r => r && r.id) : []
    logPerformance('safeMatchResults calculation', startTime)
    return results
  }, [matchResults, logPerformance])

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalItems = safeMatchResults.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    
    return { totalItems, totalPages, startIndex, endIndex }
  }, [safeMatchResults.length, currentPage, itemsPerPage])

  // Memoized current page results with grouping
  const currentPageResults = useMemo(() => {
    const startTime = performance.now()
    const { startIndex, endIndex } = paginationData
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
    
    logPerformance('currentPageResults grouping', startTime)
    return grouped
  }, [safeMatchResults, paginationData, logPerformance])

  // Memoized utility functions
  const getCurrencySymbol = useCallback((currency: string) => ({
    'GBP': '£', 'EUR': '€', 'AED': 'د.إ', 'CAD': 'C$', 'USD': '$'
  }[currency] || '$'), [])

  const calculateTotal = useCallback((quantity?: number, rate?: number) => (
    quantity && rate ? quantity * rate : 0
  ), [])

  const formatNumber = useCallback((value: number) => 
    value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  , [])

  // Memoized grand total
  const grandTotal = useMemo(() => 
    safeMatchResults.reduce((sum, r) => sum + (r.total_amount || 0), 0)
  , [safeMatchResults])

  // Optimized field change handler
  const handleFieldChange = useCallback((id: string, field: keyof MatchResult, value: string | number) => {
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
  }, [matchModes, safeMatchResults, calculateTotal, onUpdateResult])

  // Optimized match mode change handler
  const handleMatchModeChange = useCallback(async (resultId: string, mode: 'ai' | 'local' | 'manual') => {
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
          }
        } catch (error) {
          console.error('❌ [LOCAL MATCH] Error:', error)
          toast.error(`Local matching failed: ${error.message}`)
        } finally {
          setLoadingStates(prev => ({ ...prev, [resultId]: false }))
        }
      }
    }
  }, [originalAIMatches, safeMatchResults, onUpdateResult])

  // Optimized manual selection handler
  const handleManualSelection = useCallback((item: any, customRate?: number) => {
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
  }, [selectedResultId, safeMatchResults, calculateTotal, onUpdateResult])

  const handleOpenManualSelection = useCallback((id: string) => {
    setSelectedResultId(id)
    setIsModalOpen(true)
  }, [])

  // Initialize match modes and AI matches
  useEffect(() => {
    if (safeMatchResults.length > 0) {
      const newAIMatches = { ...originalAIMatches }
      const newMatchModes = { ...matchModes }
      
      safeMatchResults.forEach(r => {
        if (!newAIMatches[r.id]) newAIMatches[r.id] = { ...r }
        if (!newMatchModes[r.id]) {
          newMatchModes[r.id] = (r.match_mode as 'ai' | 'local' | 'manual') || 'ai'
        }
      })
      
      setOriginalAIMatches(newAIMatches)
      setMatchModes(newMatchModes)
    }
  }, [safeMatchResults])

  // Load price items
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

  return (
    <>
      <PerformanceMonitor componentName="OptimizedMatchResultsTable" />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Match Results
            {isDiscountApplied && lastAppliedDiscount && (
              <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                ({lastAppliedDiscount}% discount applied)
              </span>
            )}
          </h3>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="w-[30%]">Match</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Conf.</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Actions</TableHead>
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
                <MemoizedHeaderRow group={group} groupIndex={groupIndex} />
                {group.items.map((result) => {
                  const currentMode = matchModes[result.id] || 'ai'
                  const displayData = (currentMode === 'local' && localMatches[result.id]) 
                    ? { ...result, ...localMatches[result.id] } 
                    : result
                  const score = (displayData.similarity_score < 1 
                    ? displayData.similarity_score * 100 
                    : displayData.similarity_score)

                  return (
                    <MemoizedTableRow
                      key={result.id}
                      result={result}
                      currentMode={currentMode}
                      displayData={displayData}
                      score={score}
                      currency={currency}
                      matchModes={matchModes}
                      loadingStates={loadingStates}
                      onMatchModeChange={handleMatchModeChange}
                      onFieldChange={handleFieldChange}
                      onDeleteResult={onDeleteResult}
                      onOpenManualSelection={handleOpenManualSelection}
                      getCurrencySymbol={getCurrencySymbol}
                      formatNumber={formatNumber}
                    />
                  )
                })}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
        
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {paginationData.startIndex + 1} to {Math.min(paginationData.endIndex, paginationData.totalItems)} of {paginationData.totalItems} results
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />Previous
            </Button>
            <span className="text-sm">{currentPage} / {paginationData.totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(p => Math.min(paginationData.totalPages, p + 1))} 
              disabled={currentPage === paginationData.totalPages}
            >
              Next<ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end border-t pt-4">
          <p className="text-lg font-semibold">Grand Total: {getCurrencySymbol(currency)}{formatNumber(grandTotal)}</p>
        </div>

        <PriceItemSelectionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSelect={handleManualSelection} 
          inquiryDescription={selectedResultId ? safeMatchResults.find(r => r.id === selectedResultId)?.original_description || '' : ''} 
        />
      </div>
    </>
  )
})

OptimizedMatchResultsTable.displayName = 'OptimizedMatchResultsTable'