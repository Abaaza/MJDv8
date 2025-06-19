import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { PriceItemSelectionModal } from "./PriceItemSelectionModal"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

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
  match_method?: string
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
  
  // Safety check - ensure matchResults is an array
  const safeMatchResults = useMemo(() => {
    if (!Array.isArray(matchResults)) {
      console.warn('matchResults is not an array:', matchResults)
      return []
    }
    return matchResults.filter(result => result && result.id) // Filter out invalid results
  }, [matchResults])
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(100) // Show 100 items per page
  
  // Calculate pagination
  const totalItems = safeMatchResults.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  // Get current page results with section grouping
  const currentPageResults = useMemo(() => {
    const pageResults = safeMatchResults.slice(startIndex, endIndex)
    
    // Group by section headers
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
    
    // Add the last group
    if (currentGroup.length > 0) {
      grouped.push({ header: currentHeader, items: currentGroup })
    }
    
    return grouped
  }, [safeMatchResults, startIndex, endIndex])

  // Store original AI match data when match results are first loaded or updated
  useEffect(() => {
    if (safeMatchResults.length > 0) {
      setOriginalAIMatches(prev => {
        const aiMatchData: Record<string, Partial<MatchResult>> = { ...prev }
        
        safeMatchResults.forEach(result => {
          // Only store original data if we don't already have it for this result
          if (!aiMatchData[result.id]) {
            aiMatchData[result.id] = {
              matched_description: result.matched_description,
              matched_rate: result.matched_rate,
              unit: result.unit,
              similarity_score: result.similarity_score,
              matched_price_item_id: result.matched_price_item_id,
              total_amount: result.total_amount
            }
          }
        })
        
        return aiMatchData
      })
    }
  }, [safeMatchResults]) // Re-run when safeMatchResults changes

  // Load price items for matched results
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

  // Safety check for render
  if (!Array.isArray(matchResults)) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error: Invalid match results data</p>
        <p className="text-sm text-gray-500">Please try processing the file again</p>
      </div>
    )
  }

  if (safeMatchResults.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No match results found</p>
        <p className="text-sm text-gray-400">Try adjusting your search criteria or file format</p>
      </div>
    )
  }

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'GBP': return '£'
      case 'EUR': return '€'
      case 'AED': return 'د.إ'
      case 'CAD': return 'C$'
      case 'USD':
      default: return '$'
    }
  }

  const calculateTotal = (quantity?: number, rate?: number) => {
    if (!quantity || !rate) return 0
    return quantity * rate
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const handleFieldChange = (id: string, field: keyof MatchResult, value: string | number) => {
    const currentMode = matchModes[id] || 'ai'
    
    if (currentMode === 'local' && localMatches[id]) {
      // Update local match data
      const result = safeMatchResults.find(r => r.id === id)
      const newLocalMatch = { ...localMatches[id], [field]: value }
      
      // Recalculate total if quantity or rate changes
      if (result && (field === 'quantity' || field === 'matched_rate')) {
        const newQuantity = field === 'quantity' ? Number(value) : result.quantity
        const newRate = field === 'matched_rate' ? Number(value) : (newLocalMatch.matched_rate || 0)
        newLocalMatch.total_amount = calculateTotal(newQuantity, newRate)
      }
      
      setLocalMatches(prev => ({ ...prev, [id]: newLocalMatch }))
      
      // Also update the original result for quantity changes
      if (field === 'quantity') {
        onUpdateResult(id, { quantity: value as number })
      }
    } else {
      // Update original result data
      const updates: Partial<MatchResult> = { [field]: value }
      
      // Recalculate total if quantity or rate changes
      const result = safeMatchResults.find(r => r.id === id)
      if (result && (field === 'quantity' || field === 'matched_rate')) {
        const newQuantity = field === 'quantity' ? Number(value) : result.quantity
        const newRate = field === 'matched_rate' ? Number(value) : result.matched_rate
        updates.total_amount = calculateTotal(newQuantity, newRate)
      }
      
      onUpdateResult(id, updates)
      
      // Update original AI match data if in AI mode (preserve user edits)
      if (currentMode === 'ai') {
        setOriginalAIMatches(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            ...updates
          }
        }))
      }
    }
  }

  const handleMatchModeChange = async (resultId: string, mode: 'ai' | 'local' | 'manual') => {
    setMatchModes(prev => ({ ...prev, [resultId]: mode }))
    
    if (mode === 'ai') {
      // When switching back to AI mode, restore the original AI match data
      const originalAIMatch = originalAIMatches[resultId]
      if (originalAIMatch) {
        onUpdateResult(resultId, originalAIMatch)
        toast.success('Restored AI match')
      }
      return
    } else if (mode === 'manual') {
      setSelectedResultId(resultId)
      setIsModalOpen(true)
    } else if (mode === 'local') {
      // Trigger local matching for this specific item
      const result = safeMatchResults.find(r => r.id === resultId)
      if (result) {
        try {
          // Set loading state
          setLoadingStates(prev => ({ ...prev, [resultId]: true }))
          toast.info('Running local matching...')
          
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/price-matching/match-item-local`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              itemDescription: result.original_description,
              quantity: result.quantity
            })
          })
          
          const data = await response.json()
          
          if (data.success && data.match) {
            // Store local match separately to preserve AI match data
            setLocalMatches(prev => ({
              ...prev,
              [resultId]: {
                matched_description: data.match.matched_description,
                matched_rate: data.match.matched_rate,
                unit: data.match.unit,
                similarity_score: data.match.similarity_score / 100, // Convert from percentage to decimal
                matched_price_item_id: data.match.matched_price_item_id,
                total_amount: data.match.total_amount
              }
            }))
            
            toast.success('Local match found!')
          } else {
            toast.error('No local match found')
            // Reset to AI mode if no match
            setMatchModes(prev => ({ ...prev, [resultId]: 'ai' }))
          }
        } catch (error) {
          console.error('Local matching error:', error)
          toast.error('Local matching failed')
          // Reset to AI mode on error
          setMatchModes(prev => ({ ...prev, [resultId]: 'ai' }))
        } finally {
          // Clear loading state
          setLoadingStates(prev => ({ ...prev, [resultId]: false }))
        }
      }
    }
  }

  const handleManualSelection = (item: any, customRate?: number) => {
    if (selectedResultId) {
      const finalRate = customRate || item.rate
      const result = safeMatchResults.find(r => r.id === selectedResultId)
      const newTotal = calculateTotal(result?.quantity, finalRate)
      
      const manualMatchData = {
        matched_description: item.description,
        matched_rate: finalRate,
        unit: item.unit,
        total_amount: newTotal,
        similarity_score: 1.0, // Manual selection gets 100% confidence
        matched_price_item_id: item.id
      }
      
      onUpdateResult(selectedResultId, manualMatchData)
      
      // Update original AI match data to preserve manual selection
      setOriginalAIMatches(prev => ({
        ...prev,
        [selectedResultId]: {
          ...prev[selectedResultId],
          ...manualMatchData
        }
      }))
      
      setMatchModes(prev => ({ ...prev, [selectedResultId]: 'manual' }))
    }
    setIsModalOpen(false)
    setSelectedResultId(null)
  }

  const grandTotal = safeMatchResults.reduce((sum, result) => {
    return sum + (result.total_amount || 0)
  }, 0)

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px] text-left !text-left" style={{ textAlign: 'left' }}>Description</TableHead>
            <TableHead className="w-[250px] text-left !text-left" style={{ textAlign: 'left' }}>Match</TableHead>
            <TableHead className="w-[80px] text-left !text-left" style={{ textAlign: 'left' }}>Qty</TableHead>
            <TableHead className="w-[80px] text-left !text-left" style={{ textAlign: 'left' }}>Unit</TableHead>
            <TableHead className="w-[100px] text-left !text-left" style={{ textAlign: 'left' }}>Rate ({currency})</TableHead>
            <TableHead className="w-[80px] text-left !text-left" style={{ textAlign: 'left' }}>Conf.</TableHead>
            <TableHead className="w-[120px] text-left !text-left" style={{ textAlign: 'left' }}>Total</TableHead>
            <TableHead className="w-[80px] text-left !text-left" style={{ textAlign: 'left' }}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageResults.map((group, groupIndex) => (
            <React.Fragment key={`group-${groupIndex}`}>
              {/* Section Header Row */}
              {group.header && (
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell colSpan={8} className="font-semibold text-left py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-1 bg-primary rounded"></div>
                      {group.header}
                    </div>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Items in this section */}
              {group.items.map((result) => {
                const currentMode = matchModes[result.id] || 'ai'
                const localMatch = localMatches[result.id]
                
                // Use appropriate data based on current mode
                let displayData = result
                if (currentMode === 'local' && localMatch) {
                  displayData = { ...result, ...localMatch }
                }
                
                const total = calculateTotal(result.quantity, displayData.matched_rate)
                const matchedPriceItem = displayData.matched_price_item_id ? priceItems[displayData.matched_price_item_id] : null
                
                return (
                  <TableRow key={result.id}>
                    <TableCell className="text-left !text-left">
                      <div className="text-sm text-left">{result.original_description}</div>
                      <div className="text-xs text-muted-foreground mt-1 text-left">
                        Row {result.row_number} • {result.sheet_name}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-left !text-left">
                      <RadioGroup
                        value={currentMode}
                        onValueChange={(value) => handleMatchModeChange(result.id, value as 'ai' | 'local' | 'manual')}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ai" id={`ai-${result.id}`} />
                          <Label htmlFor={`ai-${result.id}`} className="text-xs">
                            AI Match
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="local" id={`local-${result.id}`} />
                          <Label htmlFor={`local-${result.id}`} className="text-xs">
                            Local Match
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id={`manual-${result.id}`} />
                          <Label htmlFor={`manual-${result.id}`} className="text-xs">
                            Manual Search
                          </Label>
                        </div>
                      </RadioGroup>
                      
                      {currentMode === 'ai' && (
                        <div className="mt-2 p-2 border rounded bg-blue-50 text-left">
                          <div className="text-xs font-medium text-blue-800 text-left">
                            {matchedPriceItem ? matchedPriceItem.description : (displayData.matched_description || 'No match found')}
                          </div>
                          {(matchedPriceItem || displayData.matched_rate) && (
                            <div className="text-xs text-blue-600 mt-1 text-left">
                              Rate: {getCurrencySymbol(currency)}{formatNumber(displayData.matched_rate || matchedPriceItem?.rate || 0)} per {matchedPriceItem?.unit || displayData.unit || 'unit'}
                            </div>
                          )}
                          <div className="text-xs text-blue-600 mt-1 text-left">
                            Confidence: {Math.round(displayData.similarity_score)}%
                          </div>
                        </div>
                      )}
                      
                      {currentMode === 'local' && (
                        <div className="mt-2 p-2 border rounded bg-green-50 text-left">
                          {loadingStates[result.id] ? (
                            <div className="flex items-center space-x-2">
                              <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                              <span className="text-xs text-green-600">Finding best local match...</span>
                            </div>
                          ) : (
                            <>
                              <div className="text-xs font-medium text-green-800 text-left">
                                {matchedPriceItem ? matchedPriceItem.description : (displayData.matched_description || 'No local match found')}
                              </div>
                              {(matchedPriceItem || displayData.matched_rate) && (
                                <div className="text-xs text-green-600 mt-1 text-left">
                                  Rate: {getCurrencySymbol(currency)}{formatNumber(displayData.matched_rate || matchedPriceItem?.rate || 0)} per {matchedPriceItem?.unit || displayData.unit || 'unit'}
                                </div>
                              )}
                              <div className="text-xs text-green-600 mt-1 text-left">
                                Confidence: {Math.round(displayData.similarity_score < 1 ? displayData.similarity_score * 100 : displayData.similarity_score)}%
                              </div>
                            </>
                          )}
                        </div>
                      )}
                      
                      {currentMode === 'manual' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedResultId(result.id)
                            setIsModalOpen(true)
                          }}
                          className="mt-2 text-xs"
                        >
                          <Search className="h-3 w-3 mr-1" />
                          Search items...
                        </Button>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-left !text-left">
                      <Input
                        type="number"
                        step="0.01"
                        value={result.quantity || ''}
                        onChange={(e) => handleFieldChange(result.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-16 text-xs text-left"
                      />
                    </TableCell>
                    
                    <TableCell className="text-left !text-left">
                      <div className="w-16 text-xs text-left p-2 bg-muted/50 rounded border text-muted-foreground">
                        {matchedPriceItem?.unit || displayData.unit || 'N/A'}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-left !text-left">
                      <Input
                        type="number"
                        step="0.01"
                        value={displayData.matched_rate || ''}
                        onChange={(e) => handleFieldChange(result.id, 'matched_rate', parseFloat(e.target.value) || 0)}
                        className="w-20 text-xs text-left"
                      />
                    </TableCell>
                    
                    <TableCell className="text-left !text-left">
                      <Badge 
                        variant={(displayData.similarity_score < 1 ? displayData.similarity_score * 100 : displayData.similarity_score) >= 80 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {Math.round(displayData.similarity_score < 1 ? displayData.similarity_score * 100 : displayData.similarity_score)}%
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="font-mono text-sm text-left !text-left">
                      {getCurrencySymbol(currency)}{formatNumber(total)}
                    </TableCell>
                    
                    <TableCell className="text-left !text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteResult(result.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground text-left">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {safeMatchResults.length > 0 && (
        <div className="flex justify-start border-t pt-4">
          <div className="text-lg font-semibold text-left">
            Grand Total: {getCurrencySymbol(currency)}{formatNumber(grandTotal)}
          </div>
        </div>
      )}

      <PriceItemSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedResultId(null)
        }}
        onSelect={handleManualSelection}
        inquiryDescription={
          selectedResultId 
            ? safeMatchResults.find(r => r.id === selectedResultId)?.original_description || ''
            : ''
        }
      />
    </div>
  )
}
