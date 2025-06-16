
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface ExcelUploadProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export function ExcelUpload({ onFileSelect, disabled = false }: ExcelUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)')
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 50MB')
      return
    }

    setSelectedFile(file)
    onFileSelect(file)
    toast.success('Excel file selected successfully')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Label htmlFor="excel-upload" className="text-sm font-medium">
          Select Inquiry Excel File
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          id="excel-upload"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={disabled}
          className="flex-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('excel-upload')?.click()}
          disabled={disabled}
        >
          <Upload className="h-4 w-4 mr-2" />
          Browse
        </Button>
      </div>

      {selectedFile && (
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
