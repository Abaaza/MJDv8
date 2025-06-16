import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

export interface Client {
  id: string
  name: string
  company_name?: string
  email?: string
  phone?: string
  address?: string
  created_at: string
  updated_at: string
  user_id: string
  projects_count?: number
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchClients = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // First get all clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (clientsError) {
        console.error('Error fetching clients:', clientsError)
        toast.error('Failed to load clients')
        return
      }

      // Get all matching jobs for this user grouped by client_id
      const { data: allJobs, error: jobsError } = await supabase
        .from('ai_matching_jobs')
        .select('client_id')
        .eq('user_id', user.id)
        .not('client_id', 'is', null)

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError)
        return
      }

      // Count jobs for each client based on client_id
      const clientsWithProjectCount = (clientsData || []).map(client => {
        const jobCount = allJobs?.filter(job => job.client_id === client.id).length || 0
        return { ...client, projects_count: jobCount }
      })

      setClients(clientsWithProjectCount)
    } catch (error) {
      console.error('Error in fetchClients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast.error('Please log in to create a client')
      return false
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating client:', error)
        toast.error('Failed to create client')
        return false
      }

      await fetchClients() // Refresh the list
      toast.success('Client created successfully')
      return true
    } catch (error) {
      console.error('Error creating client:', error)
      toast.error('Failed to create client')
      return false
    }
  }

  const updateClient = async (id: string, clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      toast.error('Please log in to update a client')
      return false
    }

    try {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error updating client:', error)
        toast.error('Failed to update client')
        return false
      }

      await fetchClients() // Refresh the list
      toast.success('Client updated successfully')
      return true
    } catch (error) {
      console.error('Error updating client:', error)
      toast.error('Failed to update client')
      return false
    }
  }

  const deleteClient = async (id: string) => {
    if (!user) {
      toast.error('Please log in to delete a client')
      return false
    }

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting client:', error)
        toast.error('Failed to delete client')
        return false
      }

      await fetchClients() // Refresh the list
      toast.success('Client deleted successfully')
      return true
    } catch (error) {
      console.error('Error deleting client:', error)
      toast.error('Failed to delete client')
      return false
    }
  }

  useEffect(() => {
    fetchClients()
  }, [user])

  return {
    clients,
    loading,
    createClient,
    updateClient,
    deleteClient,
    refreshClients: fetchClients
  }
}
