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
        weeklyJobsResult
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
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
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
        avgProcessingTime: 2.3, // Placeholder - could be calculated from job timestamps
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
      successRate: 0
    },
    loading,
    refreshStats
  }
}
