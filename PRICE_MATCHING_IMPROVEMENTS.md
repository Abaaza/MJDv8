# Price Matching System Improvements

## Overview

This document describes the smart improvements made to the price matching system to enhance accuracy and usability.

## 1. Smart Category Identification

### Description

The system now identifies item categories from multiple sources with a hierarchical approach:

1. **Section Headers** (Highest Priority - 90% confidence)

   - Checks if items have section headers like "STEEL WORKS > Reinforcement"
   - Most reliable source for category identification

2. **Sheet Names** (Medium Priority - 70% confidence)

   - Uses Excel sheet names like "Concrete Works", "Finishing Works"
   - Helpful when sheets are organized by trade/category

3. **Item Descriptions** (Lower Priority - 50-80% confidence)
   - Analyzes the item description text for category keywords
   - Confidence varies based on keyword match strength

### Supported Categories

- **excavation**: earthwork, digging, cut, fill, soil, ground
- **concrete**: concrete, rcc, pcc, cement, mortar, plaster
- **steel**: steel, rebar, reinforcement, tor, tmt, bar, metal
- **masonry**: brick, block, masonry, wall, partition
- **finishing**: paint, painting, tile, tiles, flooring, ceiling
- **doors_windows**: door, window, shutter, frame, glazing
- **plumbing**: pipe, plumbing, water, sanitary, drainage
- **electrical**: wire, cable, electrical, switch, socket, light
- **roofing**: roof, waterproof, insulation, sheet, covering
- **formwork**: formwork, shuttering, centering, staging
- **structural**: beam, column, slab, foundation, footing

### Implementation

Both AI (Cohere) and Local matching services now:

1. Identify the category for each item
2. First search within the identified category
3. If no good match found (< 40% confidence), search all items
4. Always return results, even with low confidence (minimum 1%)

## 2. Enhanced Excel Output Format

### New Column Structure

Instead of just populating the rate column, the system now adds 3 new columns immediately after the Quantity column:

1. **Matched Item Name** - The full description of the matched price item
2. **Rate** - The unit rate from the price database
3. **Unit** - The unit of measurement (m3, kg, sqm, etc.)

### Column Placement Logic

- System automatically detects the Quantity column location
- New columns are inserted right after it
- Original Excel formatting is preserved
- Headers are styled with distinctive colors:
  - Matched Item Name: Blue (#1565C0)
  - Rate: Green (#2E7D32)
  - Unit: Orange (#E65100)

### Benefits

- Clear visibility of what was matched
- Easy to verify match accuracy
- Unit information helps validate the match
- Original layout preserved for familiarity

## 3. Multi-Sheet Excel Processing

### Complete Workbook Processing

- System processes ALL sheets in the Excel file
- Each sheet maintains its own matches
- Sheet names are preserved in the output

### How It Works

1. Parser reads all sheets from the workbook
2. Items are tagged with their source sheet name
3. Matching preserves sheet association
4. Export creates all original sheets with their matches

### Sheet-Aware Features

- Category identification can use sheet names
- Matches are grouped by sheet in the output
- Each sheet gets the same 3-column enhancement
- Progress tracking shows per-sheet statistics

## Usage Example

### Input Excel Structure

```
Sheet: "Concrete Works"
| Description          | Quantity | Unit |
|---------------------|----------|------|
| PCC 1:4:8           | 100      | m3   |
| RCC M25 Grade       | 250      | m3   |

Sheet: "Steel Works"
| Description          | Quantity | Unit |
|---------------------|----------|------|
| TMT Bars 12mm       | 5000     | kg   |
| TMT Bars 16mm       | 3000     | kg   |
```

### Output Excel Structure

```
Sheet: "Concrete Works"
| Description    | Quantity | Unit | Matched Item Name              | Rate | Unit |
|----------------|----------|------|--------------------------------|------|------|
| PCC 1:4:8      | 100      | m3   | Plain Cement Concrete 1:4:8    | 3500 | m3   |
| RCC M25 Grade  | 250      | m3   | Ready Mix Concrete M25         | 4500 | m3   |

Sheet: "Steel Works"
| Description    | Quantity | Unit | Matched Item Name              | Rate | Unit |
|----------------|----------|------|--------------------------------|------|------|
| TMT Bars 12mm  | 5000     | kg   | TMT Steel Bars Fe500 12mm Dia  | 65   | kg   |
| TMT Bars 16mm  | 3000     | kg   | TMT Steel Bars Fe500 16mm Dia  | 63   | kg   |
```

## Technical Implementation

### Files Modified

1. `server/services/LocalPriceMatchingService.js`

   - Added `identifyCategory()` method
   - Added `filterPriceListByCategory()` method
   - Added `findBestMatchWithCategory()` method
   - Enhanced matching logic with category preference

2. `server/services/CohereMatchingService.js`

   - Added `identifyCategory()` method
   - Added category-based embedding storage
   - Added `findBestEmbeddingMatchWithCategory()` method
   - Enhanced embedding search with category filtering

3. `server/services/ExcelExportService.js`
   - Modified `exportWithOriginalFormat()` method
   - Added logic to find quantity column
   - Insert 3 new columns after quantity
   - Removed old rate/unit column addition at end

### Performance Impact

- Category filtering reduces search space
- Faster matching for items with clear categories
- Minimal overhead for category identification
- No impact on items without identifiable categories

## Future Enhancements

1. Machine learning for category identification
2. User-defined category mappings
3. Category confidence thresholds configuration
4. Category-specific matching rules
5. Multi-language category support
