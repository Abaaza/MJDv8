import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

interface PriceItem {
  id: string
  code?: string
  ref?: string
  description: string
  category?: string
  subcategory?: string
  unit?: string
  rate?: number
  keyword_0?: string
  keyword_1?: string
  keyword_2?: string
  keyword_3?: string
  keyword_4?: string
  keyword_5?: string
  keyword_6?: string
  keyword_7?: string
  keyword_8?: string
  keyword_9?: string
  keyword_10?: string
  keyword_11?: string
  keyword_12?: string
  keyword_13?: string
  keyword_14?: string
  keyword_15?: string
  keyword_16?: string
  keyword_17?: string
  keyword_18?: string
  keyword_19?: string
  keyword_20?: string
  keyword_21?: string
  keyword_22?: string
  phrase_0?: string
  phrase_1?: string
  phrase_2?: string
  phrase_3?: string
  phrase_4?: string
  phrase_5?: string
  phrase_6?: string
  phrase_7?: string
  phrase_8?: string
  phrase_9?: string
  phrase_10?: string
  full_context?: string
  version?: number
  created_at: string
  updated_at: string
}

export type SortField = 'code' | 'description' | 'category' | 'unit' | 'rate' | 'created_at'
export type SortDirection = 'asc' | 'desc'

interface PriceListTableProps {
  priceItems: PriceItem[]
  onEditItem: (item: PriceItem) => void
  onDeleteItem: (id: string) => void
  searchTerm: string
  categoryFilter: string
  totalItems: number
  currency: string
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export function PriceListTable({ 
  priceItems, 
  onEditItem, 
  onDeleteItem, 
  searchTerm, 
  categoryFilter, 
  totalItems,
  currency,
  sortField,
  sortDirection,
  onSort
}: PriceListTableProps) {
  const getKeywords = (item: PriceItem) => {
    const keywords = []
    for (let i = 0; i <= 22; i++) {
      const keyword = item[`keyword_${i}` as keyof PriceItem] as string
      if (keyword) keywords.push(keyword)
    }
    return keywords.slice(0, 5)
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

  const SortableHeader = ({ field, children, className }: { 
    field: SortField, 
    children: React.ReactNode,
    className?: string 
  }) => {
    const isActive = sortField === field
    const isAsc = isActive && sortDirection === 'asc'
    const isDesc = isActive && sortDirection === 'desc'

    return (
      <TableHead 
        className={`cursor-pointer select-none hover:bg-muted/50 transition-colors ${className}`}
        onClick={() => onSort(field)}
      >
        <div className="flex items-center justify-center gap-1">
          {children}
          <div className="flex flex-col">
            {!isActive && <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />}
            {isAsc && <ChevronUp className="h-3 w-3 text-primary" />}
            {isDesc && <ChevronDown className="h-3 w-3 text-primary" />}
          </div>
        </div>
      </TableHead>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHeader field="code" className="w-[80px] text-center">
            Code
          </SortableHeader>
          <SortableHeader field="description" className="text-center">
            Description
          </SortableHeader>
          <SortableHeader field="category" className="text-center">
            Category
          </SortableHeader>
          <SortableHeader field="unit" className="text-center">
            Unit
          </SortableHeader>
          <SortableHeader field="rate" className="text-center">
            Rate ({currency})
          </SortableHeader>
          <TableHead className="text-center">Keywords</TableHead>
          <TableHead className="w-[100px] text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {priceItems.map((item) => {
          // Debug logging to understand what's happening with rates
          console.log('Item rate:', item.rate, 'Type:', typeof item.rate, 'Item ID:', item.id)
          
          return (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-center w-[80px]">{item.code || '-'}</TableCell>
              <TableCell className="font-medium text-center" title={item.description}>
                {item.description}
              </TableCell>
              <TableCell className="text-center">
                {item.category && <Badge variant="outline">{item.category}</Badge>}
              </TableCell>
              <TableCell className="text-center">{item.unit || '-'}</TableCell>
              <TableCell className="font-mono text-center">
                {item.rate !== null && item.rate !== undefined && item.rate !== 0 ? 
                  `${getCurrencySymbol(currency)}${Number(item.rate).toFixed(2)}` : '-'}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-wrap gap-1 justify-center">
                  {getKeywords(item).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onEditItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDeleteItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
      {priceItems.length === 0 && (
        <TableBody>
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              No price items found. {searchTerm || categoryFilter !== "all" ? "Try adjusting your filters." : "Add your first item to get started."}
            </TableCell>
          </TableRow>
        </TableBody>
      )}
    </Table>
  )
}
