import { ExcelParsingService } from './services/ExcelParsingService.js'
import path from 'path'
import XLSX from 'xlsx'

// Test Excel parsing directly
async function testExcelParsing() {
  console.log('🧪 Testing Excel Parsing...')
  
  // Get the most recent temp file
  const tempDir = path.join(process.cwd(), 'server', 'temp')
  const fs = await import('fs/promises')
  
  try {
    const files = await fs.readdir(tempDir)
    const excelFiles = files.filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'))
    
    if (excelFiles.length === 0) {
      console.log('❌ No Excel files found in temp directory')
      return
    }
    
    // Get most recent file
    const stats = await Promise.all(
      excelFiles.map(async f => ({
        file: f,
        mtime: (await fs.stat(path.join(tempDir, f))).mtime
      }))
    )
    
    const mostRecent = stats.sort((a, b) => b.mtime - a.mtime)[0]
    const filePath = path.join(tempDir, mostRecent.file)
    
    console.log(`📄 Testing with file: ${mostRecent.file}`)
    
    // First, let's see the raw Excel structure
    console.log('\n📊 RAW EXCEL STRUCTURE:')
    const workbook = XLSX.readFile(filePath)
    
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n📋 Sheet: ${sheetName}`)
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })
      
      // Show first 10 rows
      console.log(`   Total rows: ${jsonData.length}`)
      for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i]
        if (row && row.some(cell => cell !== null)) {
          console.log(`   Row ${i + 1}:`)
          row.forEach((cell, idx) => {
            if (cell !== null && cell !== '') {
              console.log(`      Col ${idx + 1}: "${String(cell).substring(0, 50)}${String(cell).length > 50 ? '...' : ''}"`)
            }
          })
        }
      }
    }
    
    // Now test the parser
    console.log('\n\n🔧 TESTING EXCEL PARSER:')
    const parser = new ExcelParsingService()
    const items = await parser.parseExcelFile(filePath, 'test-job', mostRecent.file)
    
    console.log(`\n✅ Parser extracted ${items.length} items`)
    
    // Show first 5 items
    console.log('\n📋 First 5 items:')
    items.slice(0, 5).forEach((item, idx) => {
      console.log(`\nItem ${idx + 1}:`)
      console.log(`   Description: "${item.description}"`)
      console.log(`   Quantity: ${item.quantity}`)
      console.log(`   Unit: ${item.unit || 'N/A'}`)
      console.log(`   Row: ${item.row_number}`)
      console.log(`   Section: ${item.section_header || 'N/A'}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the test
testExcelParsing() 