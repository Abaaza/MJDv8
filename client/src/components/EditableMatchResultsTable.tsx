import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, ChevronLeft, ChevronRight, Loader2, Info } from "lucide-react"
import { PriceItemSelectionModal } from "./PriceItemSelectionModal"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Card, CardContent } from '@/components/ui/card'

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
      safeMatchResults.forEach(r => {
        if (!newAIMatches[r.id]) newAIMatches[r.id] = { ...r }
      })
      setOriginalAIMatches(newAIMatches)
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
    let updates: Partial<MatchResult> = { [field]: value }
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
    setMatchModes(prev => ({ ...prev, [resultId]: mode }))
    
    if (mode === 'ai') {
      if (originalAIMatches[resultId]) {
        onUpdateResult(resultId, originalAIMatches[resultId])
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
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/price-matching/match-item-local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemDescription: result.original_description, quantity: result.quantity })
          })
          const data = await response.json()
          if (data.success && data.match) {
            const matchData = { ...data.match, similarity_score: data.match.similarity_score / 100 }
            setLocalMatches(prev => ({ ...prev, [resultId]: matchData }))
            onUpdateResult(resultId, matchData)
            toast.success('Local match found!')
          } else {
            toast.error('No local match found')
            setMatchModes(prev => ({ ...prev, [resultId]: 'ai' }))
          }
        } catch (error) {
          toast.error('Local matching failed')
          setMatchModes(prev => ({ ...prev, [resultId]: 'ai' }))
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
        matched_price_item_id: item.id
      }
      onUpdateResult(selectedResultId, manualMatchData)
      setOriginalAIMatches(prev => ({ ...prev, [selectedResultId]: { ...prev[selectedResultId], ...manualMatchData } }))
      setMatchModes(prev => ({ ...prev, [selectedResultId]: 'manual' }))
    }
    setIsModalOpen(false)
    setSelectedResultId(null)
  }

  const grandTotal = useMemo(() => safeMatchResults.reduce((sum, r) => sum + (r.total_amount || 0), 0), [safeMatchResults])

  return (
    <div className="space-y-4">
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
              {group.header && (
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell colSpan={8} className="font-semibold py-2">
                    <div className="flex items-center gap-2"><div className="h-4 w-1 bg-primary rounded-full" />{group.header}</div>
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
                        <div className="flex items-center space-x-2"><RadioGroupItem value="ai" id={`ai-${result.id}`} /><Label htmlFor={`ai-${result.id}`}>AI</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="local" id={`local-${result.id}`} /><Label htmlFor={`local-${result.id}`}>Local</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="manual" id={`manual-${result.id}`} /><Label htmlFor={`manual-${result.id}`}>Manual</Label></div>
                      </RadioGroup>
                      {currentMode !== 'manual' ? (
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
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => { setSelectedResultId(result.id); setIsModalOpen(true); }} className="mt-2"><Search className="h-4 w-4 mr-2" />Search Price List</Button>
                      )}
                    </TableCell>
                    <TableCell><Input type="number" value={result.quantity || ''} onChange={(e) => handleFieldChange(result.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-20" /></TableCell>
                    <TableCell><Badge variant="outline">{displayData.unit || 'N/A'}</Badge></TableCell>
                    <TableCell><Input type="number" value={displayData.matched_rate || ''} onChange={(e) => handleFieldChange(result.id, 'matched_rate', parseFloat(e.target.value) || 0)} className="w-24" /></TableCell>
                    <TableCell><Badge variant={score > 80 ? 'default' : 'secondary'}>{Math.round(score)}%</Badge></TableCell>
                    <TableCell className="font-medium">{getCurrencySymbol(currency)}{formatNumber(displayData.total_amount || 0)}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => onDeleteResult(result.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                )
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
          <span className="text-sm">{currentPage} / {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
        </div>
      </div>
      
      <div className="flex justify-end border-t pt-4">
        <p className="text-lg font-semibold">Grand Total: {getCurrencySymbol(currency)}{formatNumber(grandTotal)}</p>
      </div>

      <PriceItemSelectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleManualSelection} inquiryDescription={selectedResultId ? safeMatchResults.find(r => r.id === selectedResultId)?.original_description || '' : ''} />
    </div>
  )
}
