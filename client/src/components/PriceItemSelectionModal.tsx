
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Search, Check } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface PriceItem {
  id: string
  description: string
  rate: number
  category?: string
  unit?: string
  full_context?: string
}

interface PriceItemSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: PriceItem, customRate?: number) => void
  inquiryDescription: string
  suggestedItems?: PriceItem[]
}

export function PriceItemSelectionModal({
  isOpen,
  onClose,
  onSelect,
  inquiryDescription,
  suggestedItems = []
}: PriceItemSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [priceItems, setPriceItems] = useState<PriceItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PriceItem | null>(null)
  const [customRate, setCustomRate] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadPriceItems()
    }
  }, [isOpen, searchTerm])

  const loadPriceItems = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('price_items')
        .select('id, description, rate, category, unit, full_context')
        .not('rate', 'is', null)
        .order('description')
        .limit(50)

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,full_context.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading price items:', error)
        toast.error('Failed to load price items')
        return
      }

      setPriceItems(data || [])
    } catch (error) {
      console.error('Error loading price items:', error)
      toast.error('Failed to load price items')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = () => {
    if (selectedItem) {
      const finalRate = customRate ? parseFloat(customRate) : selectedItem.rate
      onSelect(selectedItem, finalRate)
      onClose()
    }
  }

  const displayItems = searchTerm ? priceItems : [...suggestedItems, ...priceItems]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Price Item</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Inquiry Item: <span className="font-medium">{inquiryDescription}</span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search Price Items</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search descriptions, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Available Items {loading && '(Loading...)'}</Label>
              <ScrollArea className="h-96 border rounded-md">
                <div className="p-2 space-y-1">
                  {suggestedItems.length > 0 && !searchTerm && (
                    <>
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        AI Suggestions
                      </div>
                      {suggestedItems.map((item) => (
                        <div
                          key={`suggested-${item.id}`}
                          className={`p-3 rounded cursor-pointer border transition-colors ${
                            selectedItem?.id === item.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedItem(item)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm line-clamp-2">
                                {item.description}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Rate: £{item.rate} {item.unit && `per ${item.unit}`}
                              </div>
                              {item.category && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {item.category}
                                </Badge>
                              )}
                            </div>
                            {selectedItem?.id === item.id && (
                              <Check className="h-4 w-4 text-primary-foreground" />
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-t mt-2 pt-2">
                        All Items
                      </div>
                    </>
                  )}
                  
                  {displayItems.filter(item => !suggestedItems.some(s => s.id === item.id)).map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded cursor-pointer border transition-colors ${
                        selectedItem?.id === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm line-clamp-2">
                            {item.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Rate: £{item.rate} {item.unit && `per ${item.unit}`}
                          </div>
                          {item.category && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {item.category}
                            </Badge>
                          )}
                        </div>
                        {selectedItem?.id === item.id && (
                          <Check className="h-4 w-4 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="space-y-4">
            {selectedItem && (
              <div className="space-y-4">
                <div>
                  <Label>Selected Item</Label>
                  <div className="p-4 border rounded-md">
                    <div className="font-medium">{selectedItem.description}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      Default Rate: £{selectedItem.rate} {selectedItem.unit && `per ${selectedItem.unit}`}
                    </div>
                    {selectedItem.category && (
                      <Badge variant="secondary" className="mt-2">
                        {selectedItem.category}
                      </Badge>
                    )}
                    {selectedItem.full_context && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-muted-foreground">Full Context:</div>
                        <div className="text-xs text-muted-foreground mt-1 max-h-20 overflow-y-auto">
                          {selectedItem.full_context}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-rate">Custom Rate (Optional)</Label>
                  <Input
                    id="custom-rate"
                    type="number"
                    step="0.01"
                    placeholder={`Default: ${selectedItem.rate}`}
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleSelect} className="flex-1">
                    Use This Item
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!selectedItem && (
              <div className="p-8 text-center text-muted-foreground">
                Select an item from the list to see details
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
