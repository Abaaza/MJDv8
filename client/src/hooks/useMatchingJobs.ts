
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { Tables } from "@/integrations/supabase/types"

type MatchingJob = Tables<'ai_matching_jobs'> & {
  client_name?: string
}

export function useMatchingJobs() {
  const [jobs, setJobs] = useState<MatchingJob[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchJobs = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Get all matching jobs for the user with client information
      const { data: jobsData, error: jobsError } = await supabase
        .from('ai_matching_jobs')
        .select(`
          *,
          clients!client_id(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (jobsError) {
        console.error('Error fetching matching jobs:', jobsError)
        toast.error('Failed to fetch matching jobs')
        return
      }

      // Map jobs with client names
      const jobsWithClients = jobsData.map((job) => ({
        ...job,
        client_name: job.clients?.name || 'Unknown Client'
      }))

      setJobs(jobsWithClients)
    } catch (error) {
      console.error('Error fetching matching jobs:', error)
      toast.error('Failed to fetch matching jobs')
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_matching_jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id)

      if (error) {
        console.error('Error deleting job:', error)
        toast.error('Failed to delete job')
        return false
      }

      toast.success('Job deleted successfully')
      await fetchJobs()
      return true
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error('Failed to delete job')
      return false
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [user])

  return {
    jobs,
    loading,
    deleteJob,
    refreshJobs: fetchJobs
  }
}
