import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardStats {
  totalClients: number
  activePriceItems: number
  totalMatchingJobs: number
  totalMatchedItems: number
  completedJobs: number
  todayJobs: number
  weeklyGrowth: number
  avgProcessingTime: number
  successRate: number
  clientsGrowth: number
  priceItemsGrowth: number
  matchedItemsGrowth: number
}

export function useDashboardStats() {
  const { user } = useAuth()

  const { data: stats, isLoading: loading, refetch: refreshStats } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      if (!user) throw new Error('No user')

      // Execute all queries in parallel for better performance
      const [
        clientsResult,
        priceItemsResult,
        matchingJobsResult,
        matchedItemsResult,
        completedJobsResult,
        todayJobsResult,
        weeklyJobsResult,
        completedJobsWithTiming,
        lastWeekClientsResult,
        lastWeekPriceItemsResult,
        lastWeekMatchedItemsResult
      ] = await Promise.all([
        // Fetch total clients
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true }),
        
        // Fetch total price items
        supabase
          .from('price_items')
          .select('*', { count: 'exact', head: true }),
        
        // Fetch total matching jobs
        supabase
          .from('ai_matching_jobs')
          .select('*', { count: 'exact', head: true }),
        
        // Fetch completed jobs for matched items count
        supabase
          .from('ai_matching_jobs')
          .select('matched_items')
          .eq('status', 'completed'),
        
        // Fetch completed jobs count
        supabase
          .from('ai_matching_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        
        // Fetch today's jobs
        supabase
          .from('ai_matching_jobs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        
        // Fetch last week's jobs for growth calculation
        supabase
          .from('ai_matching_jobs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Fetch completed jobs with timing for processing time calculation
        supabase
          .from('ai_matching_jobs')
          .select('created_at, completed_at')
          .eq('status', 'completed')
          .not('completed_at', 'is', null)
          .limit(20), // Get recent 20 completed jobs for average
        
        // Get clients count from last week for growth calculation
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Get price items count from last week for growth calculation
        supabase
          .from('price_items')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Get matched items from last week for growth calculation
        supabase
          .from('ai_matching_jobs')
          .select('matched_items')
          .eq('status', 'completed')
          .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      // Handle errors gracefully
      const clientsCount = clientsResult.error 
        ? (console.error('Error fetching clients:', clientsResult.error), 0)
        : clientsResult.count || 0

      const priceItemsCount = priceItemsResult.error
        ? (console.error('Error fetching price items:', priceItemsResult.error), 0)
        : priceItemsResult.count || 0

      const matchingJobsCount = matchingJobsResult.error
        ? (console.error('Error fetching matching jobs:', matchingJobsResult.error), 0)
        : matchingJobsResult.count || 0

      const totalMatchedItems = matchedItemsResult.error
        ? (console.error('Error fetching matched items:', matchedItemsResult.error), 0)
        : matchedItemsResult.data?.reduce((sum, job) => sum + (job.matched_items || 0), 0) || 0

      const completedJobsCount = completedJobsResult.error
        ? (console.error('Error fetching completed jobs:', completedJobsResult.error), 0)
        : completedJobsResult.count || 0

      const todayJobsCount = todayJobsResult.error
        ? (console.error('Error fetching today jobs:', todayJobsResult.error), 0)
        : todayJobsResult.count || 0

      const weeklyJobsCount = weeklyJobsResult.error
        ? (console.error('Error fetching weekly jobs:', weeklyJobsResult.error), 0)
        : weeklyJobsResult.count || 0

      // Calculate real processing time from completed jobs
      let avgProcessingTime = 0
      if (!completedJobsWithTiming.error && completedJobsWithTiming.data) {
        const timings = completedJobsWithTiming.data
          .filter(job => job.completed_at && job.created_at)
          .map(job => {
            const start = new Date(job.created_at!).getTime()
            const end = new Date(job.completed_at!).getTime()
            return (end - start) / 1000 // Convert to seconds
          })
          .filter(time => time > 0 && time < 3600) // Filter out unrealistic times (0 sec to 1 hour)
        
        if (timings.length > 0) {
          avgProcessingTime = Math.round((timings.reduce((sum, time) => sum + time, 0) / timings.length) * 10) / 10
        }
      }
      
      // Calculate growth rates
      const lastWeekClientsCount = lastWeekClientsResult.count || 0
      const lastWeekPriceItemsCount = lastWeekPriceItemsResult.count || 0
      const lastWeekMatchedItems = lastWeekMatchedItemsResult.error 
        ? 0 
        : lastWeekMatchedItemsResult.data?.reduce((sum, job) => sum + (job.matched_items || 0), 0) || 0
      
      const clientsGrowth = lastWeekClientsCount > 0 
        ? Math.round(((clientsCount - lastWeekClientsCount) / lastWeekClientsCount) * 100)
        : clientsCount > 0 ? 100 : 0
      
      const priceItemsGrowth = lastWeekPriceItemsCount > 0 
        ? Math.round(((priceItemsCount - lastWeekPriceItemsCount) / lastWeekPriceItemsCount) * 100)
        : priceItemsCount > 0 ? 100 : 0
      
      const matchedItemsGrowth = lastWeekMatchedItems > 0 
        ? Math.round(((totalMatchedItems - lastWeekMatchedItems) / lastWeekMatchedItems) * 100)
        : totalMatchedItems > 0 ? 100 : 0
      
      // Calculate weekly growth (simple approximation)
      const weeklyGrowth = weeklyJobsCount > 0 ? Math.round(((todayJobsCount * 7) / weeklyJobsCount - 1) * 100) : 0
      
      // Calculate success rate
      const successRate = matchingJobsCount > 0 ? Math.round((completedJobsCount / matchingJobsCount) * 100) : 0

      return {
        totalClients: clientsCount,
        activePriceItems: priceItemsCount,
        totalMatchingJobs: matchingJobsCount,
        totalMatchedItems,
        completedJobs: completedJobsCount,
        todayJobs: todayJobsCount,
        weeklyGrowth: Math.max(-99, Math.min(999, weeklyGrowth)), // Clamp to reasonable range
        avgProcessingTime,
        clientsGrowth: Math.max(-99, Math.min(999, clientsGrowth)),
        priceItemsGrowth: Math.max(-99, Math.min(999, priceItemsGrowth)),
        matchedItemsGrowth: Math.max(-99, Math.min(999, matchedItemsGrowth)),
        successRate
      }
    },
    enabled: !!user,
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (previously cacheTime)
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  })

  return {
    stats: stats || {
      totalClients: 0,
      activePriceItems: 0,
      totalMatchingJobs: 0,
      totalMatchedItems: 0,
      completedJobs: 0,
      todayJobs: 0,
      weeklyGrowth: 0,
      avgProcessingTime: 0,
      successRate: 0,
      clientsGrowth: 0,
      priceItemsGrowth: 0,
      matchedItemsGrowth: 0
    },
    loading,
    refreshStats
  }
}
