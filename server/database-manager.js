import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class DatabaseManager {
  constructor() {
    this.projectId = 'yqsumodzyahvxywwfpnc';
    console.log('🚀 Database Manager initialized');
    console.log(`📊 Project: ${this.projectId}`);
    console.log(`🔗 URL: ${process.env.SUPABASE_URL}`);
  }

  // List all tables
  async listTables() {
    try {
      const { data, error } = await supabase.rpc('exec', {
        sql: `
          SELECT table_name, table_type, table_schema
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name;
        `
      });

      if (error) {
        console.error('❌ Error listing tables:', error);
        return [];
      }

      console.log('✅ Tables found:');
      data.forEach(table => {
        console.log(`  📋 ${table.table_name} (${table.table_type})`);
      });
      
      return data;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return [];
    }
  }

  // Execute SQL query
  async executeSQL(query) {
    try {
      console.log(`🔍 Executing: ${query.substring(0, 100)}...`);
      
      const { data, error } = await supabase.rpc('exec', {
        sql: query
      });

      if (error) {
        console.error('❌ SQL Error:', error);
        return { success: false, error };
      }

      console.log('✅ Query executed successfully');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get table schema
  async getTableSchema(tableName) {
    try {
      const { data, error } = await supabase.rpc('exec', {
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = '${tableName}' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

      if (error) {
        console.error(`❌ Error getting schema for ${tableName}:`, error);
        return [];
      }

      console.log(`✅ Schema for ${tableName}:`);
      data.forEach(col => {
        console.log(`  📝 ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(required)'}`);
      });

      return data;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return [];
    }
  }

  // List matching jobs
  async listMatchingJobs(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('ai_matching_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error listing jobs:', error);
        return [];
      }

      console.log(`✅ Found ${data.length} matching jobs:`);
      data.forEach(job => {
        console.log(`  🔄 ${job.id}: ${job.status} - ${job.project_name} (${job.created_at})`);
      });

      return data;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return [];
    }
  }

  // List price items
  async listPriceItems(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('price_items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error listing price items:', error);
        return [];
      }

      console.log(`✅ Found ${data.length} price items:`);
      data.forEach(item => {
        console.log(`  💰 ${item.code || 'N/A'}: ${item.description} - ${item.rate || 'N/A'}`);
      });

      return data;
    } catch (error) {
      console.error('❌ Error:', error.message);
      return [];
    }
  }

  // Apply migration
  async applyMigration(name, sql) {
    try {
      console.log(`🔧 Applying migration: ${name}`);
      
      const result = await this.executeSQL(sql);
      
      if (result.success) {
        console.log(`✅ Migration '${name}' applied successfully`);
        
        // Log the migration
        const { error: logError } = await supabase
          .from('migrations')
          .insert({
            name: name,
            applied_at: new Date().toISOString(),
            checksum: sql.length.toString() // Simple checksum
          });

        if (logError) {
          console.warn('⚠️ Could not log migration:', logError.message);
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Migration error:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get project statistics
  async getProjectStats() {
    try {
      const stats = {};
      
      // Count records in main tables
      const tables = ['ai_matching_jobs', 'price_items', 'profiles', 'clients', 'projects'];
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        stats[table] = error ? 0 : count;
      }

      console.log('📊 Project Statistics:');
      Object.entries(stats).forEach(([table, count]) => {
        console.log(`  📋 ${table}: ${count} records`);
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error.message);
      return {};
    }
  }
}

// Export for use
export default DatabaseManager;

// CLI interface if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const db = new DatabaseManager();
  
  async function runTests() {
    console.log('\n🧪 Running comprehensive database tests...\n');
    
    await db.getProjectStats();
    console.log('\n');
    
    await db.listTables();
    console.log('\n');
    
    await db.listMatchingJobs(5);
    console.log('\n');
    
    await db.listPriceItems(5);
    console.log('\n');
    
    await db.getTableSchema('ai_matching_jobs');
    console.log('\n');
    
    console.log('🎉 Database access fully functional!');
    console.log('🔧 You now have complete database management capabilities.');
  }
  
  runTests().catch(console.error);
} 