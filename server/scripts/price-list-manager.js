import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('💰 Price List Manager');
console.log('=====================');

class PriceListManager {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async analyzePriceList() {
    try {
      console.log('\n🔍 Analyzing price list...');
      
      const { data: items, error } = await supabase
        .from('price_items')
        .select('*');

      if (error) {
        console.error('❌ Error fetching price items:', error);
        return;
      }

      console.log(`📊 Total Price Items: ${items.length}`);

      // Category analysis
      const categories = {};
      const subCategories = {};
      const units = {};
      
      items.forEach(item => {
        if (item.category) {
          categories[item.category] = (categories[item.category] || 0) + 1;
        }
        if (item.sub_category) {
          subCategories[item.sub_category] = (subCategories[item.sub_category] || 0) + 1;
        }
        if (item.unit) {
          units[item.unit] = (units[item.unit] || 0) + 1;
        }
      });

      console.log(`\n📂 Categories (${Object.keys(categories).length}):`);
      Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([cat, count]) => {
          console.log(`  📁 ${cat}: ${count} items`);
        });

      console.log(`\n📋 Most Common Units:`);
      Object.entries(units)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([unit, count]) => {
          console.log(`  📏 ${unit}: ${count} items`);
        });

      // Rate analysis
      const itemsWithRates = items.filter(item => item.rate !== null && item.rate > 0);
      if (itemsWithRates.length > 0) {
        const rates = itemsWithRates.map(item => item.rate);
        const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);

        console.log(`\n💵 Rate Analysis (${itemsWithRates.length} items with rates):`);
        console.log(`  💰 Average Rate: $${avgRate.toFixed(2)}`);
        console.log(`  📈 Highest Rate: $${maxRate.toFixed(2)}`);
        console.log(`  📉 Lowest Rate: $${minRate.toFixed(2)}`);
      }

      // Data quality analysis
      const missingCode = items.filter(item => !item.code || item.code.trim() === '').length;
      const missingDescription = items.filter(item => !item.description || item.description.trim() === '').length;
      const missingRate = items.filter(item => item.rate === null || item.rate <= 0).length;
      const missingCategory = items.filter(item => !item.category || item.category.trim() === '').length;

      console.log(`\n🔍 Data Quality Issues:`);
      console.log(`  📝 Missing Codes: ${missingCode} items`);
      console.log(`  📄 Missing Descriptions: ${missingDescription} items`);
      console.log(`  💰 Missing/Zero Rates: ${missingRate} items`);
      console.log(`  📂 Missing Categories: ${missingCategory} items`);

      return {
        totalItems: items.length,
        categories: Object.keys(categories).length,
        itemsWithRates: itemsWithRates.length,
        dataQuality: {
          missingCode,
          missingDescription,
          missingRate,
          missingCategory
        }
      };

    } catch (error) {
      console.error('❌ Analysis error:', error);
    }
  }

  async exportPriceList(format = 'csv', filter = {}) {
    try {
      console.log(`\n📤 Exporting price list to ${format.toUpperCase()}...`);
      
      let query = supabase.from('price_items').select('*');
      
      // Apply filters
      if (filter.category) {
        query = query.eq('category', filter.category);
      }
      if (filter.minRate) {
        query = query.gte('rate', filter.minRate);
      }
      if (filter.maxRate) {
        query = query.lte('rate', filter.maxRate);
      }

      const { data: items, error } = await query.order('code');

      if (error) {
        console.error('❌ Error fetching items:', error);
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `price-list-export-${timestamp}.${format}`;
      const filepath = path.join(this.outputDir, filename);

      if (format === 'csv') {
        await this.exportToCSV(items, filepath);
      } else if (format === 'json') {
        await this.exportToJSON(items, filepath);
      }

      console.log(`✅ Exported ${items.length} items to: ${filepath}`);
      return filepath;

    } catch (error) {
      console.error('❌ Export error:', error);
    }
  }

  async exportToCSV(items, filepath) {
    const headers = ['Code', 'Description', 'Category', 'Sub Category', 'Unit', 'Rate', 'Keywords', 'Phrases'];
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        this.escapeCsv(item.code || ''),
        this.escapeCsv(item.description || ''),
        this.escapeCsv(item.category || ''),
        this.escapeCsv(item.sub_category || ''),
        this.escapeCsv(item.unit || ''),
        item.rate || '',
        this.escapeCsv(item.keywords ? item.keywords.join('; ') : ''),
        this.escapeCsv(item.phrases ? item.phrases.join('; ') : '')
      ].join(','))
    ].join('\n');

    fs.writeFileSync(filepath, csvContent, 'utf8');
  }

  async exportToJSON(items, filepath) {
    const jsonContent = JSON.stringify(items, null, 2);
    fs.writeFileSync(filepath, jsonContent, 'utf8');
  }

  escapeCsv(value) {
    if (typeof value !== 'string') return value;
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  async optimizePriceList() {
    try {
      console.log('\n🔧 Optimizing price list...');
      
      const { data: items, error } = await supabase
        .from('price_items')
        .select('*');

      if (error) {
        console.error('❌ Error fetching items:', error);
        return;
      }

      let updatedCount = 0;
      const optimizations = [];

      for (const item of items) {
        const updates = {};
        let hasUpdates = false;

        // Normalize categories (title case)
        if (item.category && item.category !== this.toTitleCase(item.category)) {
          updates.category = this.toTitleCase(item.category);
          hasUpdates = true;
        }

        // Clean up codes (uppercase, trim)
        if (item.code && item.code !== item.code.toUpperCase().trim()) {
          updates.code = item.code.toUpperCase().trim();
          hasUpdates = true;
        }

        // Generate keywords from description if missing
        if ((!item.keywords || item.keywords.length === 0) && item.description) {
          updates.keywords = this.extractKeywords(item.description);
          hasUpdates = true;
        }

        if (hasUpdates) {
          const { error: updateError } = await supabase
            .from('price_items')
            .update(updates)
            .eq('id', item.id);

          if (!updateError) {
            updatedCount++;
            optimizations.push({
              id: item.id,
              code: item.code,
              updates: Object.keys(updates)
            });
          }
        }
      }

      console.log(`✅ Optimized ${updatedCount} price items`);
      
      if (optimizations.length > 0) {
        console.log('\n📋 Sample optimizations:');
        optimizations.slice(0, 5).forEach(opt => {
          console.log(`  🔧 ${opt.code}: ${opt.updates.join(', ')}`);
        });
      }

      return { optimizedCount: updatedCount, optimizations };

    } catch (error) {
      console.error('❌ Optimization error:', error);
    }
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  extractKeywords(description) {
    // Simple keyword extraction from description
    const words = description.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['with', 'from', 'this', 'that', 'have', 'will', 'been', 'were'].includes(word));
    
    return [...new Set(words)].slice(0, 10); // Return unique words, max 10
  }

  async searchPriceItems(searchTerm) {
    try {
      console.log(`\n🔍 Searching for: "${searchTerm}"`);
      
      const { data: items, error } = await supabase
        .from('price_items')
        .select('*')
        .or(`description.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) {
        console.error('❌ Search error:', error);
        return;
      }

      console.log(`📋 Found ${items.length} matching items:`);
      items.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.code || 'N/A'}: ${item.description.substring(0, 60)}... - $${item.rate || 'N/A'}`);
      });

      return items;

    } catch (error) {
      console.error('❌ Search error:', error);
    }
  }
}

// Export the class
export default PriceListManager;

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new PriceListManager();
  
  async function runDemo() {
    console.log('\n🧪 Running Price List Manager Demo...\n');
    
    // Run analysis
    await manager.analyzePriceList();
    
    // Search demo
    await manager.searchPriceItems('concrete');
    
    // Export demo
    await manager.exportPriceList('csv');
    
    console.log('\n🎉 Price List Manager Demo Complete!');
    console.log('📋 Available methods:');
    console.log('  - analyzePriceList(): Comprehensive analysis');
    console.log('  - exportPriceList(format, filter): Export to CSV/JSON');
    console.log('  - optimizePriceList(): Clean and optimize data');
    console.log('  - searchPriceItems(term): Search functionality');
  }
  
  runDemo().catch(console.error);
} 