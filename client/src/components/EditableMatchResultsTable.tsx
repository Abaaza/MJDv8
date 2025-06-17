import React, { useState, useEffect, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { PriceItemSelectionModal } from "./PriceItemSelectionModal"
import { supabase } from "@/integrations/supabase/client"

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
  const [matchModes, setMatchModes] = useState<Record<string, 'cohere' | 'manual'>>({})
  const [priceItems, setPriceItems] = useState<Record<string, PriceItem>>({})
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(100) // Show 100 items per page
  
  // Calculate pagination
  const totalItems = matchResults.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  // Get current page items
  const currentPageResults = useMemo(() => {
    return matchResults.slice(startIndex, endIndex)
  }, [matchResults, startIndex, endIndex])

  // Load price items for matched results
  useEffect(() => {
    const loadPriceItems = async () => {
      const priceItemIds = matchResults
        .filter(result => result.matched_price_item_id)
        .map(result => result.matched_price_item_id!)

      if (priceItemIds.length === 0) return

      try {
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
          priceItemMap[item.id] = item
        })
        setPriceItems(priceItemMap)
      } catch (error) {
        console.error('Error loading price items:', error)
      }
    }

    loadPriceItems()
  }, [matchResults])

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
    const updates: Partial<MatchResult> = { [field]: value }
    
    // Recalculate total if quantity or rate changes
    const result = matchResults.find(r => r.id === id)
    if (result && (field === 'quantity' || field === 'matched_rate')) {
      const newQuantity = field === 'quantity' ? Number(value) : result.quantity
      const newRate = field === 'matched_rate' ? Number(value) : result.matched_rate
      updates.total_amount = calculateTotal(newQuantity, newRate)
    }
    
    onUpdateResult(id, updates)
  }

  const handleMatchModeChange = (resultId: string, mode: 'cohere' | 'manual') => {
    setMatchModes(prev => ({ ...prev, [resultId]: mode }))
    
    if (mode === 'manual') {
      setSelectedResultId(resultId)
      setIsModalOpen(true)
    }
  }

  const handleManualSelection = (item: any, customRate?: number) => {
    if (selectedResultId) {
      const finalRate = customRate || item.rate
      const result = matchResults.find(r => r.id === selectedResultId)
      const newTotal = calculateTotal(result?.quantity, finalRate)
      
      onUpdateResult(selectedResultId, {
        matched_description: item.description,
        matched_rate: finalRate,
        unit: item.unit,
        total_amount: newTotal,
        similarity_score: 1.0, // Manual selection gets 100% confidence
        matched_price_item_id: item.id
      })
      
      setMatchModes(prev => ({ ...prev, [selectedResultId]: 'manual' }))
    }
    setIsModalOpen(false)
    setSelectedResultId(null)
  }

  const grandTotal = matchResults.reduce((sum, result) => {
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
          {currentPageResults.map((result) => {
            const currentMode = matchModes[result.id] || 'cohere'
            const total = calculateTotal(result.quantity, result.matched_rate)
            const matchedPriceItem = result.matched_price_item_id ? priceItems[result.matched_price_item_id] : null
            
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
                    onValueChange={(value) => handleMatchModeChange(result.id, value as 'cohere' | 'manual')}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cohere" id={`cohere-${result.id}`} />
                      <Label htmlFor={`cohere-${result.id}`} className="text-xs">
                        Cohere match
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manual" id={`manual-${result.id}`} />
                      <Label htmlFor={`manual-${result.id}`} className="text-xs">
                        Manual search
                      </Label>
                    </div>
                  </RadioGroup>
                  
                  {currentMode === 'cohere' && (
                    <div className="mt-2 p-2 border rounded bg-blue-50 text-left">
                      <div className="text-xs font-medium text-blue-800 text-left">
                        {matchedPriceItem ? matchedPriceItem.description : (result.matched_description || 'No match found')}
                      </div>
                      {(matchedPriceItem || result.matched_rate) && (
                        <div className="text-xs text-blue-600 mt-1 text-left">
                          Rate: {getCurrencySymbol(currency)}{formatNumber(result.matched_rate || matchedPriceItem?.rate || 0)} per {matchedPriceItem?.unit || result.unit || 'unit'}
                        </div>
                      )}
                      <div className="text-xs text-blue-600 mt-1 text-left">
                        Confidence: {Math.round(result.similarity_score * 100)}%
                      </div>
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
                    {matchedPriceItem?.unit || result.unit || 'N/A'}
                  </div>
                </TableCell>
                
                <TableCell className="text-left !text-left">
                  <Input
                    type="number"
                    step="0.01"
                    value={result.matched_rate || ''}
                    onChange={(e) => handleFieldChange(result.id, 'matched_rate', parseFloat(e.target.value) || 0)}
                    className="w-20 text-xs text-left"
                  />
                </TableCell>
                
                <TableCell className="text-left !text-left">
                  <Badge 
                    variant={result.similarity_score >= 0.8 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {Math.round(result.similarity_score * 100)}%
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
      
      {matchResults.length > 0 && (
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
            ? matchResults.find(r => r.id === selectedResultId)?.original_description || ''
            : ''
        }
      />
    </div>
  )
}
