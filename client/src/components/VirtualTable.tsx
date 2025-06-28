import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { FixedSizeList as List } from 'react-window'
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface VirtualTableProps<T> {
  items: T[]
  height: number
  itemHeight: number
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode
  renderHeader?: () => React.ReactNode
  overscan?: number
  className?: string
}

export function VirtualTable<T>({
  items,
  height,
  itemHeight,
  renderItem,
  renderHeader,
  overscan = 5,
  className = ""
}: VirtualTableProps<T>) {
  const listRef = useRef<List>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // Memoize the item renderer to prevent unnecessary re-renders
  const MemoizedItem = useMemo(() => {
    return React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
      if (index >= items.length) return null
      return renderItem(items[index], index, style)
    })
  }, [items, renderItem])

  // Handle scroll events for sync with header
  const handleScroll = useCallback(({ scrollTop }: { scrollTop: number }) => {
    setScrollTop(scrollTop)
  }, [])

  // Auto-scroll to top when items change significantly
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0, 'start')
    }
  }, [items.length])

  return (
    <div className={`virtual-table ${className}`}>
      {renderHeader && (
        <div className="virtual-table-header" style={{ transform: `translateX(-${scrollTop}px)` }}>
          {renderHeader()}
        </div>
      )}
      <List
        ref={listRef}
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        onScroll={handleScroll}
        overscanCount={overscan}
        className="virtual-table-body"
      >
        {MemoizedItem}
      </List>
    </div>
  )
}

// Specialized virtual table for match results
interface VirtualMatchResultsTableProps {
  items: any[]
  onUpdateResult: (id: string, updates: any) => void
  onDeleteResult: (id: string) => void
  currency: string
}

export function VirtualMatchResultsTable({
  items,
  onUpdateResult,
  onDeleteResult,
  currency
}: VirtualMatchResultsTableProps) {
  const renderHeader = useCallback(() => (
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
    </Table>
  ), [])

  const renderItem = useCallback((item: any, index: number, style: React.CSSProperties) => {
    return (
      <div style={style} className="virtual-table-row">
        {/* Your table row content here */}
        <div className="flex items-center p-2 border-b">
          <div className="w-[30%] p-2">
            <p className="text-sm font-medium">{item.original_description}</p>
            <p className="text-xs text-muted-foreground">Row {item.row_number}</p>
          </div>
          <div className="w-[30%] p-2">
            <p className="text-sm">{item.matched_description}</p>
          </div>
          <div className="p-2">{item.quantity || 0}</div>
          <div className="p-2">{item.unit || 'N/A'}</div>
          <div className="p-2">{item.matched_rate || 0}</div>
          <div className="p-2">{Math.round((item.similarity_score || 0) * 100)}%</div>
          <div className="p-2">{(item.total_amount || 0).toFixed(2)}</div>
          <div className="p-2">
            <button 
              onClick={() => onDeleteResult(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }, [onDeleteResult])

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No results to display
      </div>
    )
  }

  return (
    <VirtualTable
      items={items}
      height={600} // Fixed height for virtualization
      itemHeight={80} // Height per row
      renderHeader={renderHeader}
      renderItem={renderItem}
      className="border rounded-lg"
    />
  )
}