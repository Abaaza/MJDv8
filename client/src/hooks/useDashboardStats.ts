
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardStats {
  totalClients: number
  activePriceItems: number
  totalMatchingJobs: number
  totalMatchedItems: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activePriceItems: 0,
    totalMatchingJobs: 0,
    totalMatchedItems: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchStats = async () => {
    if (!user) return

    try {
      // Fetch total clients for the current user
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (clientsError) {
        console.error('Error fetching clients count:', clientsError)
      }

      // Fetch total price items for the current user
      const { count: priceItemsCount, error: priceItemsError } = await supabase
        .from('price_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (priceItemsError) {
        console.error('Error fetching price items count:', priceItemsError)
      }

      // Fetch total matching jobs for the current user
      const { count: matchingJobsCount, error: matchingJobsError } = await supabase
        .from('ai_matching_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (matchingJobsError) {
        console.error('Error fetching matching jobs count:', matchingJobsError)
      }

      // Fetch total matched items from match_results table for the current user
      const { data: matchResultsData, error: matchResultsError } = await supabase
        .from('match_results')
        .select('id')
        .in('job_id', 
          // Get job IDs for current user
          await supabase
            .from('ai_matching_jobs')
            .select('id')
            .eq('user_id', user.id)
            .then(({ data }) => data ? data.map(job => job.id) : [])
        )

      if (matchResultsError) {
        console.error('Error fetching match results:', matchResultsError)
      }

      const totalMatchedItems = matchResultsData?.length || 0

      setStats({
        totalClients: clientsCount || 0,
        activePriceItems: priceItemsCount || 0,
        totalMatchingJobs: matchingJobsCount || 0,
        totalMatchedItems
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [user])

  return { stats, loading, refreshStats: fetchStats }
}
