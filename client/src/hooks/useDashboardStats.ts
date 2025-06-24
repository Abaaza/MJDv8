import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardStats {
  totalClients: number
  activePriceItems: number
  totalMatchingJobs: number
  totalMatchedItems: number
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
        matchedItemsResult
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
          .eq('status', 'completed')
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

      return {
        totalClients: clientsCount,
        activePriceItems: priceItemsCount,
        totalMatchingJobs: matchingJobsCount,
        totalMatchedItems
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
      totalMatchedItems: 0
    },
    loading,
    refreshStats
  }
}
