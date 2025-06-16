
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface CSVImportProps {
  onImportComplete: () => void
}

interface ImportStats {
  processed: number
  imported: number
  updated: number
  errors: number
  duplicates: number
}

export function CSVImport({ onImportComplete }: CSVImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const parseCSV = (csvText: string) => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue
      
      const values = []
      let current = ''
      let inQuotes = false
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      
      if (values.length === headers.length) {
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
    }
    
    return data
  }

  const truncateString = (str: string | null, maxLength: number): string | null => {
    if (!str) return null
    return str.length > maxLength ? str.substring(0, maxLength) : str
  }

  const safeParseFloat = (value: string | null): number | null => {
    if (!value || value === '') return null
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  const safeParseInt = (value: string | null): number | null => {
    if (!value || value === '') return null
    const parsed = parseInt(value)
    return isNaN(parsed) ? null : parsed
  }

  const mapCSVToDatabase = (csvRow: any) => {
    const mappedData = {
      code: truncateString(csvRow['Code'], 50),
      ref: truncateString(csvRow['Ref'], 50),
      description: csvRow['Description'] || '',
      category: truncateString(csvRow['Category'], 50),
      subcategory: truncateString(csvRow['SubCategory'], 50),
      unit: truncateString(csvRow['Unit'], 50),
      rate: safeParseFloat(csvRow['Rate']),
      keyword_0: csvRow['keywords[0]'] || null,
      keyword_1: csvRow['keywords[1]'] || null,
      keyword_2: csvRow['keywords[2]'] || null,
      keyword_3: csvRow['keywords[3]'] || null,
      keyword_4: csvRow['keywords[4]'] || null,
      keyword_5: csvRow['keywords[5]'] || null,
      keyword_6: csvRow['keywords[6]'] || null,
      keyword_7: csvRow['keywords[7]'] || null,
      keyword_8: csvRow['keywords[8]'] || null,
      keyword_9: csvRow['keywords[9]'] || null,
      keyword_10: csvRow['keywords[10]'] || null,
      keyword_11: csvRow['keywords[11]'] || null,
      keyword_12: csvRow['keywords[12]'] || null,
      keyword_13: csvRow['keywords[13]'] || null,
      keyword_14: csvRow['keywords[14]'] || null,
      keyword_15: csvRow['keywords[15]'] || null,
      keyword_16: csvRow['keywords[16]'] || null,
      keyword_17: csvRow['keywords[17]'] || null,
      keyword_18: csvRow['keywords[18]'] || null,
      keyword_19: csvRow['keywords[19]'] || null,
      keyword_20: csvRow['keywords[20]'] || null,
      keyword_21: csvRow['keywords[21]'] || null,
      keyword_22: csvRow['keywords[22]'] || null,
      phrase_0: csvRow['phrases[0]'] || null,
      phrase_1: csvRow['phrases[1]'] || null,
      phrase_2: csvRow['phrases[2]'] || null,
      phrase_3: csvRow['phrases[3]'] || null,
      phrase_4: csvRow['phrases[4]'] || null,
      phrase_5: csvRow['phrases[5]'] || null,
      phrase_6: csvRow['phrases[6]'] || null,
      phrase_7: csvRow['phrases[7]'] || null,
      phrase_8: csvRow['phrases[8]'] || null,
      phrase_9: csvRow['phrases[9]'] || null,
      phrase_10: csvRow['phrases[10]'] || null,
      full_context: csvRow['FullContext'] || null,
      version: safeParseInt(csvRow['__v']) || 0,
      user_id: user?.id
    }

    Object.keys(mappedData).forEach(key => {
      if (mappedData[key] === undefined || mappedData[key] === '') {
        if (key !== 'description' && key !== 'user_id') {
          mappedData[key] = null
        }
      }
    })

    return mappedData
  }

  const checkForDuplicate = async (item: any) => {
    const { data } = await supabase
      .from('price_items')
      .select('id')
      .eq('description', item.description)
      .eq('user_id', user?.id)
      .limit(1)

    return data && data.length > 0 ? data[0].id : null
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setLoading(true)
    setProgress(0)
    setImportStats(null)

    try {
      const text = await file.text()
      const csvData = parseCSV(text)
      
      console.log(`Processing ${csvData.length} rows from CSV`)
      
      const stats: ImportStats = {
        processed: 0,
        imported: 0,
        updated: 0,
        errors: 0,
        duplicates: 0
      }

      const batchSize = 50
      const totalBatches = Math.ceil(csvData.length / batchSize)

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const start = batchIndex * batchSize
        const end = Math.min(start + batchSize, csvData.length)
        const batch = csvData.slice(start, end)
        
        for (const csvRow of batch) {
          try {
            stats.processed++
            
            if (!csvRow.Description || csvRow.Description.trim() === '') {
              stats.errors++
              console.log(`Skipping row ${stats.processed}: No description`)
              continue
            }

            const dbItem = mapCSVToDatabase(csvRow)
            
            // Check for existing item by description
            const existingId = await checkForDuplicate(dbItem)
            
            if (existingId) {
              // Update existing item
              const { error } = await supabase
                .from('price_items')
                .update(dbItem)
                .eq('id', existingId)
              
              if (error) {
                console.error('Error updating item:', error, 'Row data:', csvRow)
                stats.errors++
              } else {
                stats.updated++
                console.log(`Updated existing item: ${dbItem.description}`)
              }
            } else {
              // Insert new item
              const { error } = await supabase
                .from('price_items')
                .insert(dbItem)
              
              if (error) {
                console.error('Error inserting item:', error, 'Row data:', csvRow)
                stats.errors++
              } else {
                stats.imported++
                console.log(`Imported new item: ${dbItem.description}`)
              }
            }
          } catch (error) {
            console.error('Error processing item:', error, 'Row data:', csvRow)
            stats.errors++
          }
          
          // Update progress
          const progressPercent = (stats.processed / csvData.length) * 100
          setProgress(progressPercent)
        }
      }

      setImportStats(stats)
      
      const successMessage = `Import completed: ${stats.imported} new items added, ${stats.updated} items updated`
      const errorMessage = stats.errors > 0 ? `, ${stats.errors} errors encountered` : ''
      
      toast.success(successMessage + errorMessage)
      console.log('Final import stats:', stats)
      
      onImportComplete()
      
      // Don't close dialog immediately so user can see the results
      setTimeout(() => {
        setIsOpen(false)
        setImportStats(null)
        setProgress(0)
      }, 3000)
      
    } catch (error) {
      console.error('Error importing CSV:', error)
      toast.error('Failed to import CSV file')
      setImportStats(null)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Price Items from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import price items. Existing items with the same description will be updated.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="w-full"
            />
          </div>
          
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          
          {importStats && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold">Import Results:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Processed: <span className="font-mono">{importStats.processed}</span></div>
                <div>New Items: <span className="font-mono text-green-600">{importStats.imported}</span></div>
                <div>Updated Items: <span className="font-mono text-blue-600">{importStats.updated}</span></div>
                <div>Errors: <span className="font-mono text-red-600">{importStats.errors}</span></div>
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <p>• Items with the same description will be updated rather than duplicated</p>
            <p>• All items will be associated with your user account</p>
            <p>• Long text values will be automatically truncated to fit database constraints</p>
            <p>• Empty values will be stored as NULL where appropriate</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
