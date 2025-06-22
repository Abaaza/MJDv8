
import { useState, useEffect } from "react"
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
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchActivities = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get recent matching jobs (limit to 3) - all users
      const { data: jobs, error: jobsError } = await supabase
        .from('ai_matching_jobs')
        .select('id, project_name, status, created_at, updated_at, user_id')
        .order('created_at', { ascending: false })
        .limit(3)

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError)
      }

      // Get recent clients (limit to 2) - all users
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(2)

      if (clientsError) {
        console.error('Error fetching clients:', clientsError)
      }

      // Get recent price items (limit to 1) - all users
      const { data: priceItems, error: priceItemsError } = await supabase
        .from('price_items')
        .select('id, description, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(1)

      if (priceItemsError) {
        console.error('Error fetching price items:', priceItemsError)
      }

      // Get all unique user IDs
      const userIds = new Set<string>()
      jobs?.forEach(job => userIds.add(job.user_id))
      clients?.forEach(client => userIds.add(client.user_id))
      priceItems?.forEach(item => userIds.add(item.user_id))

      // Fetch user profiles for names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', Array.from(userIds))

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      // Create a map of user IDs to names
      const userNameMap = new Map<string, string>()
      profiles?.forEach(profile => {
        userNameMap.set(profile.id, profile.name || 'Unknown User')
      })

      // Combine all activities
      const allActivities: RecentActivity[] = []

      // Add job activities
      jobs?.forEach(job => {
        const userName = userNameMap.get(job.user_id) || 'Unknown User'
        if (job.status === 'completed') {
          allActivities.push({
            id: `job-completed-${job.id}`,
            type: 'job_completed',
            description: `${userName} completed price matching for "${job.project_name}"`,
            timestamp: job.updated_at,
            icon: 'CheckCircle',
            userName
          })
        } else if (job.status === 'processing' || job.status === 'pending') {
          allActivities.push({
            id: `job-started-${job.id}`,
            type: 'job_started',
            description: `${userName} started price matching for "${job.project_name}"`,
            timestamp: job.created_at,
            icon: 'Play',
            userName
          })
        }
      })

      // Add client activities
      clients?.forEach(client => {
        const userName = userNameMap.get(client.user_id) || 'Unknown User'
        allActivities.push({
          id: `client-added-${client.id}`,
          type: 'client_added',
          description: `${userName} added new client "${client.name}"`,
          timestamp: client.created_at,
          icon: 'User',
          userName
        })
      })

      // Add price item activities
      priceItems?.forEach(item => {
        const userName = userNameMap.get(item.user_id) || 'Unknown User'
        allActivities.push({
          id: `price-item-added-${item.id}`,
          type: 'price_item_added',
          description: `${userName} added new price item`,
          timestamp: item.created_at,
          icon: 'Plus',
          userName
        })
      })

      // Sort by timestamp and limit to 6 total
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(allActivities.slice(0, 6))

    } catch (error) {
      console.error('Error fetching recent activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [user])

  return {
    activities,
    loading,
    refreshActivities: fetchActivities
  }
}
