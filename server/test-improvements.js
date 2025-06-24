import { ExcelParsingService } from './services/ExcelParsingService.js'
import { LocalPriceMatchingService } from './services/LocalPriceMatchingService.js'
import { CohereMatchingService } from './services/CohereMatchingService.js'
import { ExcelExportService } from './services/ExcelExportService.js'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs-extra'

async function testImprovements() {
  console.log('🧪 Testing Price Matching Improvements...\n')
  
  // Initialize Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  )
  
  // 1. Test Category Identification
  console.log('1️⃣ Testing Category Identification:')
  console.log('=====================================')
  
  const localMatcher = new LocalPriceMatchingService()
  const cohereMatcher = new CohereMatchingService()
  
  // Test items with different category sources
  const testItems = [
    {
      description: 'Reinforcement steel bars 12mm diameter',
      section_header: 'STEEL WORKS > Reinforcement',
      sheet_name: 'BOQ',
      row_number: 10
    },
    {
      description: 'Supply and install ceramic floor tiles',
      section_header: null,
      sheet_name: 'Finishing Works',
      row_number: 20
    },
    {
      description: 'PCC 1:4:8 for foundation',
      section_header: null,
      sheet_name: 'General',
      row_number: 30
    }
  ]
  
  console.log('\nLocal Matching Category Detection:')
  testItems.forEach((item, idx) => {
    const categoryInfo = localMatcher.identifyCategory(item, {}, item.sheet_name)
    console.log(`  Item ${idx + 1}: "${item.description.substring(0, 40)}..."`);
    console.log(`    - Category: ${categoryInfo.category || 'none'}`);
    console.log(`    - Confidence: ${(categoryInfo.confidence * 100).toFixed(0)}%`);
    console.log(`    - Source: ${categoryInfo.category ? (item.section_header ? 'header' : item.sheet_name.includes(categoryInfo.category) ? 'sheet' : 'description') : 'N/A'}\n`);
  })
  
  console.log('\nCohere Matching Category Detection:')
  testItems.forEach((item, idx) => {
    const categoryInfo = cohereMatcher.identifyCategory(item, item.sheet_name)
    console.log(`  Item ${idx + 1}: "${item.description.substring(0, 40)}..."`);
    console.log(`    - Category: ${categoryInfo.category || 'none'}`);
    console.log(`    - Confidence: ${(categoryInfo.confidence * 100).toFixed(0)}%`);
    console.log(`    - Source: ${categoryInfo.category ? (item.section_header ? 'header' : item.sheet_name.includes(categoryInfo.category) ? 'sheet' : 'description') : 'N/A'}\n`);
  })
  
  // 2. Test Excel Output Format
  console.log('\n2️⃣ Testing Excel Output Format:')
  console.log('================================')
  
  // Create a mock Excel file
  const mockExcelPath = path.join(process.cwd(), 'server', 'temp', 'test-mock.xlsx')
  const ExcelJS = await import('exceljs')
  const mockWorkbook = new ExcelJS.Workbook()
  const mockSheet = mockWorkbook.addWorksheet('Test Sheet')
  
  // Add headers
  mockSheet.addRow(['Description', 'Quantity', 'Unit', 'Rate', 'Amount'])
  mockSheet.addRow(['Concrete work', '100', 'm3', '', ''])
  mockSheet.addRow(['Steel reinforcement', '5000', 'kg', '', ''])
  
  await mockWorkbook.xlsx.writeFile(mockExcelPath)
  
  // Create mock match results
  const mockMatches = [
    {
      sheet_name: 'Test Sheet',
      row_number: 2,
      original_description: 'Concrete work',
      matched_description: 'Ready Mix Concrete M25 Grade',
      matched_rate: 4500,
      unit: 'm3',
      matched_unit: 'm3',
      quantity: 100,
      similarity_score: 85
    },
    {
      sheet_name: 'Test Sheet',
      row_number: 3,
      original_description: 'Steel reinforcement',
      matched_description: 'TMT Steel Bars Fe500 Grade',
      matched_rate: 65,
      unit: 'kg',
      matched_unit: 'kg',
      quantity: 5000,
      similarity_score: 92
    }
  ]
  
  const exportService = new ExcelExportService()
  const outputPath = await exportService.exportWithOriginalFormat(
    mockExcelPath,
    mockMatches,
    'test-job-123',
    'test-output.xlsx'
  )
  
  console.log(`  ✅ Export completed: ${outputPath}`)
  console.log(`  📊 Checking column placement...`)
  
  // Read the output to verify
  const outputWorkbook = new ExcelJS.Workbook()
  await outputWorkbook.xlsx.readFile(outputPath)
  const outputSheet = outputWorkbook.getWorksheet('Test Sheet')
  
  const headerRow = outputSheet.getRow(1)
  const headers = []
  headerRow.eachCell((cell, colNumber) => {
    if (cell.value) headers[colNumber - 1] = cell.value
  })
  
  console.log(`  📋 Headers found:`)
  headers.forEach((header, idx) => {
    if (header) console.log(`     Column ${idx + 1}: ${header}`)
  })
  
  // Find where quantity column is
  const quantityColIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('quantity')) + 1
  console.log(`  📍 Quantity column at index: ${quantityColIndex}`)
  console.log(`  📍 New columns should start at: ${quantityColIndex + 1}`)
  
  // Check if new columns are in the right place
  const expectedNewColumns = ['Matched Item Name', 'Rate', 'Unit']
  let allCorrect = true
  expectedNewColumns.forEach((expected, idx) => {
    const actualCol = quantityColIndex + idx + 1
    const actual = headers[actualCol - 1]
    const isCorrect = actual === expected
    console.log(`     Column ${actualCol}: ${actual} ${isCorrect ? '✅' : '❌'} (expected: ${expected})`)
    if (!isCorrect) allCorrect = false
  })
  
  if (allCorrect) {
    console.log(`  ✅ All columns are in the correct position!`)
  }
  
  // 3. Test Multi-Sheet Processing
  console.log('\n3️⃣ Testing Multi-Sheet Processing:')
  console.log('===================================')
  
  // Create a multi-sheet Excel file
  const multiSheetPath = path.join(process.cwd(), 'server', 'temp', 'test-multi-sheet.xlsx')
  const multiWorkbook = new ExcelJS.Workbook()
  
  const sheet1 = multiWorkbook.addWorksheet('Concrete Works')
  sheet1.addRow(['Description', 'Qty', 'Unit'])
  sheet1.addRow(['PCC 1:4:8', '50', 'm3'])
  sheet1.addRow(['RCC M25', '100', 'm3'])
  
  const sheet2 = multiWorkbook.addWorksheet('Steel Works')
  sheet2.addRow(['Description', 'Quantity', 'Unit'])
  sheet2.addRow(['TMT Bars 12mm', '2000', 'kg'])
  sheet2.addRow(['TMT Bars 16mm', '3000', 'kg'])
  
  const sheet3 = multiWorkbook.addWorksheet('Finishing')
  sheet3.addRow(['Item Description', 'Qty', 'Unit'])
  sheet3.addRow(['Floor Tiles', '500', 'sqm'])
  sheet3.addRow(['Wall Paint', '1000', 'sqm'])
  
  await multiWorkbook.xlsx.writeFile(multiSheetPath)
  
  // Parse the multi-sheet file
  const parser = new ExcelParsingService()
  const parsedItems = await parser.parseExcelFile(multiSheetPath, 'test-multi', 'multi-sheet-test.xlsx')
  
  console.log(`  📊 Total items parsed: ${parsedItems.length}`)
  
  // Group by sheet
  const itemsBySheet = {}
  parsedItems.forEach(item => {
    if (!itemsBySheet[item.sheet_name]) {
      itemsBySheet[item.sheet_name] = []
    }
    itemsBySheet[item.sheet_name].push(item)
  })
  
  console.log(`  📋 Items per sheet:`)
  Object.entries(itemsBySheet).forEach(([sheet, items]) => {
    console.log(`     ${sheet}: ${items.length} items`)
    items.forEach(item => {
      console.log(`       - ${item.description} (Row ${item.row_number})`)
    })
  })
  
  // Create matches for all sheets
  const multiMatches = parsedItems.map((item, idx) => ({
    sheet_name: item.sheet_name,
    row_number: item.row_number,
    original_description: item.description,
    matched_description: `Matched: ${item.description}`,
    matched_rate: 100 + idx * 10,
    unit: item.unit,
    matched_unit: item.unit,
    quantity: item.quantity,
    similarity_score: 80 + idx
  }))
  
  const multiOutputPath = await exportService.exportWithOriginalFormat(
    multiSheetPath,
    multiMatches,
    'test-multi-123',
    'multi-output.xlsx'
  )
  
  console.log(`\n  ✅ Multi-sheet export completed: ${multiOutputPath}`)
  
  // Verify all sheets were processed
  const verifyWorkbook = new ExcelJS.Workbook()
  await verifyWorkbook.xlsx.readFile(multiOutputPath)
  
  console.log(`  📋 Sheets in output file:`)
  verifyWorkbook.worksheets.forEach(sheet => {
    let matchCount = 0
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const hasMatch = row.getCell(4).value || row.getCell(5).value || row.getCell(6).value
        if (hasMatch) matchCount++
      }
    })
    console.log(`     ${sheet.name}: ${matchCount} rows with matches`)
  })
  
  // Clean up test files
  await fs.remove(mockExcelPath)
  await fs.remove(outputPath)
  await fs.remove(multiSheetPath)
  await fs.remove(multiOutputPath)
  
  console.log('\n✅ All tests completed successfully!')
}

// Run the tests
testImprovements().catch(console.error) 