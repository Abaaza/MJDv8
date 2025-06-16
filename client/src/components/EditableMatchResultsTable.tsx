
import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Search } from "lucide-react"
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
            <TableHead className="w-[300px]">Description</TableHead>
            <TableHead className="w-[250px]">Match</TableHead>
            <TableHead className="w-[80px]">Qty</TableHead>
            <TableHead className="w-[80px]">Unit</TableHead>
            <TableHead className="w-[100px]">Rate ({currency})</TableHead>
            <TableHead className="w-[80px]">Conf.</TableHead>
            <TableHead className="w-[120px]">Total</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {matchResults.map((result) => {
            const currentMode = matchModes[result.id] || 'cohere'
            const total = calculateTotal(result.quantity, result.matched_rate)
            const matchedPriceItem = result.matched_price_item_id ? priceItems[result.matched_price_item_id] : null
            
            return (
              <TableRow key={result.id}>
                <TableCell>
                  <div className="text-sm">{result.original_description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Row {result.row_number} • {result.sheet_name}
                  </div>
                </TableCell>
                
                <TableCell>
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
                    <div className="mt-2 p-2 border rounded bg-blue-50">
                      <div className="text-xs font-medium text-blue-800">
                        {result.matched_description || 'No match found'}
                      </div>
                      {matchedPriceItem && (
                        <div className="text-xs text-blue-600 mt-1">
                          Rate: {getCurrencySymbol(currency)}{formatNumber(matchedPriceItem.rate)} per {matchedPriceItem.unit}
                        </div>
                      )}
                      <div className="text-xs text-blue-600 mt-1">
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
                
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={result.quantity || ''}
                    onChange={(e) => handleFieldChange(result.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-16 text-xs"
                  />
                </TableCell>
                
                <TableCell>
                  <Input
                    type="text"
                    value={result.unit || (matchedPriceItem?.unit || '')}
                    onChange={(e) => handleFieldChange(result.id, 'unit', e.target.value)}
                    className="w-16 text-xs"
                  />
                </TableCell>
                
                <TableCell>
                  <Input
                    type="number"
                    step="0.01"
                    value={result.matched_rate || (matchedPriceItem?.rate || '')}
                    onChange={(e) => handleFieldChange(result.id, 'matched_rate', parseFloat(e.target.value) || 0)}
                    className="w-20 text-xs"
                  />
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant={result.similarity_score >= 0.8 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {Math.round(result.similarity_score * 100)}%
                  </Badge>
                </TableCell>
                
                <TableCell className="font-mono text-sm">
                  {getCurrencySymbol(currency)}{formatNumber(total)}
                </TableCell>
                
                <TableCell>
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
      
      {matchResults.length > 0 && (
        <div className="flex justify-end border-t pt-4">
          <div className="text-lg font-semibold">
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
