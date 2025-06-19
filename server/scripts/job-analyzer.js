import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('📊 AI Matching Jobs Analyzer');
console.log('============================');

async function analyzeJobPerformance() {
  try {
    // Get all matching jobs with detailed data
    const { data: jobs, error } = await supabase
      .from('ai_matching_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching jobs:', error);
      return;
    }

    console.log(`\n📋 Total Jobs: ${jobs.length}`);

    // Status breakdown
    const statusCounts = {};
    jobs.forEach(job => {
      statusCounts[job.status] = (statusCounts[job.status] || 0) + 1;
    });

    console.log('\n📊 Status Breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      const percentage = ((count / jobs.length) * 100).toFixed(1);
      console.log(`  ${getStatusEmoji(status)} ${status}: ${count} (${percentage}%)`);
    });

    // Performance metrics for completed jobs
    const completedJobs = jobs.filter(job => 
      job.status === 'completed' && 
      job.matched_items !== null && 
      job.total_items !== null &&
      job.total_items > 0
    );

    if (completedJobs.length > 0) {
      console.log(`\n🎯 Performance Metrics (${completedJobs.length} completed jobs):`);
      
      const matchRates = completedJobs.map(job => (job.matched_items / job.total_items) * 100);
      const avgMatchRate = matchRates.reduce((a, b) => a + b, 0) / matchRates.length;
      const minMatchRate = Math.min(...matchRates);
      const maxMatchRate = Math.max(...matchRates);
      
      console.log(`  📈 Average Match Rate: ${avgMatchRate.toFixed(1)}%`);
      console.log(`  📉 Minimum Match Rate: ${minMatchRate.toFixed(1)}%`);
      console.log(`  📊 Maximum Match Rate: ${maxMatchRate.toFixed(1)}%`);

      // Confidence scores
      const jobsWithConfidence = completedJobs.filter(job => job.confidence_score !== null);
      if (jobsWithConfidence.length > 0) {
        const avgConfidence = jobsWithConfidence.reduce((sum, job) => sum + job.confidence_score, 0) / jobsWithConfidence.length;
        console.log(`  🎯 Average Confidence: ${avgConfidence.toFixed(1)}%`);
      }

      // Total items processed
      const totalItemsProcessed = completedJobs.reduce((sum, job) => sum + job.total_items, 0);
      const totalItemsMatched = completedJobs.reduce((sum, job) => sum + job.matched_items, 0);
      console.log(`  📦 Total Items Processed: ${totalItemsProcessed.toLocaleString()}`);
      console.log(`  ✅ Total Items Matched: ${totalItemsMatched.toLocaleString()}`);
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentJobs = jobs.filter(job => new Date(job.created_at) > sevenDaysAgo);
    console.log(`\n📅 Recent Activity (Last 7 days): ${recentJobs.length} jobs`);

    // Project name analysis
    const projectCounts = {};
    jobs.forEach(job => {
      if (job.project_name) {
        projectCounts[job.project_name] = (projectCounts[job.project_name] || 0) + 1;
      }
    });

    console.log('\n🏗️ Top Projects:');
    const sortedProjects = Object.entries(projectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedProjects.forEach(([project, count], index) => {
      console.log(`  ${index + 1}. ${project}: ${count} jobs`);
    });

    // Failed jobs analysis
    const failedJobs = jobs.filter(job => job.status === 'failed' || job.error_message !== null);
    if (failedJobs.length > 0) {
      console.log(`\n❌ Failed Jobs Analysis (${failedJobs.length} failures):`);
      
      const errorTypes = {};
      failedJobs.forEach(job => {
        if (job.error_message) {
          // Extract error type from message
          const errorType = job.error_message.split(':')[0] || 'Unknown Error';
          errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
        }
      });

      Object.entries(errorTypes).forEach(([error, count]) => {
        console.log(`  🔍 ${error}: ${count} occurrences`);
      });
    }

    // Performance trends
    console.log('\n📈 Performance Trends:');
    const monthlyStats = getMonthlyStats(completedJobs);
    monthlyStats.forEach(month => {
      console.log(`  📅 ${month.period}: ${month.jobCount} jobs, ${month.avgMatchRate.toFixed(1)}% avg match rate`);
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
  }
}

function getStatusEmoji(status) {
  const emojis = {
    'completed': '✅',
    'pending': '⏳',
    'in_progress': '🔄',
    'failed': '❌',
    'cancelled': '🚫'
  };
  return emojis[status] || '📋';
}

function getMonthlyStats(jobs) {
  const monthly = {};
  
  jobs.forEach(job => {
    const date = new Date(job.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthly[key]) {
      monthly[key] = { jobs: [], totalItems: 0, matchedItems: 0 };
    }
    
    monthly[key].jobs.push(job);
    if (job.total_items && job.matched_items) {
      monthly[key].totalItems += job.total_items;
      monthly[key].matchedItems += job.matched_items;
    }
  });

  return Object.entries(monthly)
    .map(([period, data]) => ({
      period,
      jobCount: data.jobs.length,
      avgMatchRate: data.totalItems > 0 ? (data.matchedItems / data.totalItems) * 100 : 0
    }))
    .sort((a, b) => b.period.localeCompare(a.period))
    .slice(0, 6); // Last 6 months
}

// Export for use in other scripts
export { analyzeJobPerformance };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeJobPerformance();
} 