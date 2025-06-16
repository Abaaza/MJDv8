
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

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

interface CSVExportProps {
  priceItems: PriceItem[]
}

export function CSVExport({ priceItems }: CSVExportProps) {
  const exportToCSV = async () => {
    try {
      toast.info('Fetching all price items for export...')
      
      // Fetch ALL price items from the database in batches to avoid limits
      let allPriceItems: PriceItem[] = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data: batch, error } = await supabase
          .from('price_items')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, from + batchSize - 1)

        if (error) {
          console.error('Error fetching price items batch:', error)
          toast.error('Failed to fetch price items for export')
          return
        }

        if (batch && batch.length > 0) {
          allPriceItems = [...allPriceItems, ...batch]
          from += batchSize
          
          // Update progress
          toast.info(`Fetched ${allPriceItems.length} items...`)
          
          // If we got less than batchSize, we've reached the end
          if (batch.length < batchSize) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      if (allPriceItems.length === 0) {
        toast.error('No price items found to export')
        return
      }

      console.log(`Exporting ${allPriceItems.length} price items`)

      // Define CSV headers matching your schema
      const headers = [
        '_id', 'Code', 'Ref', 'Description', 'Category', 'SubCategory', 'Unit', 'Rate',
        'keywords[0]', 'keywords[1]', 'keywords[2]', 'keywords[3]', 'keywords[4]',
        'keywords[5]', 'keywords[6]', 'keywords[7]', 'keywords[8]', 'keywords[9]',
        'keywords[10]', 'keywords[11]', 'keywords[12]', 'keywords[13]', 'keywords[14]',
        'keywords[15]', 'keywords[16]', 'keywords[17]', 'keywords[18]', 'keywords[19]',
        'keywords[20]', 'keywords[21]', 'keywords[22]',
        'phrases[0]', 'phrases[1]', 'phrases[2]', 'phrases[3]', 'phrases[4]',
        'phrases[5]', 'phrases[6]', 'phrases[7]', 'phrases[8]', 'phrases[9]', 'phrases[10]',
        'CreatedAt', 'UpdatedAt', '__v', 'FullContext'
      ]

      // Convert data to CSV format
      const csvContent = [
        headers.join(','),
        ...allPriceItems.map(item => [
          item.id,
          item.code || '',
          item.ref || '',
          `"${(item.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
          item.category || '',
          item.subcategory || '',
          item.unit || '',
          item.rate || '',
          item.keyword_0 || '', item.keyword_1 || '', item.keyword_2 || '', item.keyword_3 || '',
          item.keyword_4 || '', item.keyword_5 || '', item.keyword_6 || '', item.keyword_7 || '',
          item.keyword_8 || '', item.keyword_9 || '', item.keyword_10 || '', item.keyword_11 || '',
          item.keyword_12 || '', item.keyword_13 || '', item.keyword_14 || '', item.keyword_15 || '',
          item.keyword_16 || '', item.keyword_17 || '', item.keyword_18 || '', item.keyword_19 || '',
          item.keyword_20 || '', item.keyword_21 || '', item.keyword_22 || '',
          item.phrase_0 || '', item.phrase_1 || '', item.phrase_2 || '', item.phrase_3 || '',
          item.phrase_4 || '', item.phrase_5 || '', item.phrase_6 || '', item.phrase_7 || '',
          item.phrase_8 || '', item.phrase_9 || '', item.phrase_10 || '',
          item.created_at,
          item.updated_at,
          item.version || 0,
          `"${(item.full_context || '').replace(/"/g, '""')}"` // Escape quotes in full_context
        ].join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `price_list_complete_${allPriceItems.length}_items_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success(`CSV file exported successfully with ${allPriceItems.length} items`)
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error('Failed to export CSV file')
    }
  }

  return (
    <Button variant="outline" onClick={exportToCSV}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}
