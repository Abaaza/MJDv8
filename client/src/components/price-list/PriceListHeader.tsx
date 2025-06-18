import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MoreVertical, Trash2, Settings } from "lucide-react"
import { PriceItemForm } from "@/components/PriceItemForm"
import { CSVExport } from "@/components/CSVExport"
import { CSVImport } from "@/components/CSVImport"
import { useState } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

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

interface PriceListHeaderProps {
  totalItems: number
  priceItems: PriceItem[]
  onDeleteAll: () => void
  onRefresh: () => void
  onFixOrphaned?: () => void
}

export function PriceListHeader({ totalItems, priceItems, onDeleteAll, onRefresh, onFixOrphaned }: PriceListHeaderProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="flex items-center justify-between">
      <div className="text-left">
        <h1 className="text-3xl font-bold mt-0">Price List</h1>
        <p className="text-muted-foreground">
          Manage your construction pricing database • {totalItems.toLocaleString()} items total
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {onFixOrphaned && (
              <DropdownMenuItem onClick={onFixOrphaned}>
                <Settings className="mr-2 h-4 w-4" />
                Fix Orphaned Items
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onDeleteAll} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete All Items
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CSVExport priceItems={priceItems} />
        <CSVImport onImportComplete={onRefresh} />
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Price Item</DialogTitle>
              <DialogDescription>Add a new item to your price database</DialogDescription>
            </DialogHeader>
            <PriceItemForm 
              onSuccess={() => {
                setIsAddDialogOpen(false)
                onRefresh()
              }}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
