import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"

interface RecentActivity {
  id: string
  type: 'job_completed' | 'job_started' | 'client_added' | 'price_item_added'
  description: string
  timestamp: string
  icon?: string
  userName?: string
}

export function useRecentActivity() {
  const { user } = useAuth()

  const { data: activities = [], isLoading: loading } = useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async (): Promise<RecentActivity[]> => {
      if (!user) return []

      // Fetch all data in parallel for better performance
      const [jobsResult, clientsResult, priceItemsResult] = await Promise.all([
        // Get recent matching jobs (limit to 3)
        supabase
          .from('ai_matching_jobs')
          .select('id, project_name, status, created_at, updated_at, user_id')
          .order('created_at', { ascending: false })
          .limit(3),
        
        // Get recent clients (limit to 2)
        supabase
          .from('clients')
          .select('id, name, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(2),
        
        // Get recent price items (limit to 1)
        supabase
          .from('price_items')
          .select('id, description, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(1)
      ])

      // Log errors but don't fail the whole query
      if (jobsResult.error) console.error('Error fetching jobs:', jobsResult.error)
      if (clientsResult.error) console.error('Error fetching clients:', clientsResult.error)
      if (priceItemsResult.error) console.error('Error fetching price items:', priceItemsResult.error)

      const jobs = jobsResult.data || []
      const clients = clientsResult.data || []
      const priceItems = priceItemsResult.data || []

      // Get all unique user IDs
      const userIds = new Set<string>()
      jobs.forEach(job => job.user_id && userIds.add(job.user_id))
      clients.forEach(client => client.user_id && userIds.add(client.user_id))
      priceItems.forEach(item => item.user_id && userIds.add(item.user_id))

      // Fetch user profiles for names (only if we have user IDs)
      let profiles: any[] = []
      if (userIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', Array.from(userIds))

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        } else {
          profiles = profilesData || []
        }
      }

      const profileMap = new Map(profiles.map(p => [p.id, p.name]))

      // Combine all activities
      const allActivities: RecentActivity[] = []

      // Add job activities
      jobs.forEach(job => {
        const activity: RecentActivity = {
          id: job.id,
          type: job.status === 'completed' ? 'job_completed' : 'job_started',
          description: job.status === 'completed' 
            ? `Completed matching job: ${job.project_name || 'Unnamed Project'}`
            : `Started matching job: ${job.project_name || 'Unnamed Project'}`,
          timestamp: job.status === 'completed' && job.updated_at 
            ? job.updated_at 
            : job.created_at,
          userName: job.user_id ? profileMap.get(job.user_id) : undefined
        }
        allActivities.push(activity)
      })

      // Add client activities
      clients.forEach(client => {
        const activity: RecentActivity = {
          id: client.id,
          type: 'client_added',
          description: `Added new client: ${client.name}`,
          timestamp: client.created_at,
          userName: client.user_id ? profileMap.get(client.user_id) : undefined
        }
        allActivities.push(activity)
      })

      // Add price item activities
      priceItems.forEach(item => {
        const activity: RecentActivity = {
          id: item.id,
          type: 'price_item_added',
          description: `Added price item: ${item.description.substring(0, 50)}${item.description.length > 50 ? '...' : ''}`,
          timestamp: item.created_at,
          userName: item.user_id ? profileMap.get(item.user_id) : undefined
        }
        allActivities.push(activity)
      })

      // Sort by timestamp (most recent first)
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      // Return top 5 activities
      return allActivities.slice(0, 5)
    },
    enabled: !!user,
    staleTime: 60 * 1000, // Cache for 1 minute
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
  })

  return { activities, loading }
}
