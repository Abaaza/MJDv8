import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PriceItemForm } from "@/components/PriceItemForm"
import { usePriceList } from "@/hooks/usePriceList"
import { PriceListHeader } from "@/components/price-list/PriceListHeader"
import { PriceListFilters } from "@/components/price-list/PriceListFilters"
import { PriceListTable } from "@/components/price-list/PriceListTable"
import { PriceListPagination } from "@/components/price-list/PriceListPagination"

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

export default function PriceList() {
  const {
    priceItems,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    loading,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    availableCategories,
    currency,
    sortField,
    sortDirection,
    handleSort,
    handleDeleteItem,
    handleDeleteAll,
    fixOrphanedPriceItems,
    refreshData
  } = usePriceList()

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null)

  const handleEditItem = (item: PriceItem) => {
    setEditingItem(item)
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return <div className="p-6">Loading price items...</div>
  }

  return (
    <div className="pt-[10px] px-6 pb-6 space-y-3">
      <PriceListHeader 
        totalItems={totalItems}
        priceItems={priceItems}
        onDeleteAll={handleDeleteAll}
        onRefresh={refreshData}
        onFixOrphaned={fixOrphanedPriceItems}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <CardTitle>Construction Price Database</CardTitle>
              <CardDescription>
                Comprehensive pricing for materials, labor, and equipment • 
                Showing {priceItems.length} of {totalItems.toLocaleString()} items
                {searchTerm || categoryFilter !== "all" ? " (filtered)" : ""}
              </CardDescription>
            </div>
            <PriceListFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              availableCategories={availableCategories}
            />
          </div>
        </CardHeader>
        <CardContent>
          <PriceListTable
            priceItems={priceItems}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            totalItems={totalItems}
            currency={currency}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          
          <PriceListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Price Item</DialogTitle>
            <DialogDescription>Update the price item details</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <PriceItemForm 
              initialData={editingItem}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                setEditingItem(null)
                refreshData()
              }}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingItem(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
