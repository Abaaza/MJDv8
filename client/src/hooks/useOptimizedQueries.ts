import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'

// Optimized hook for fetching clients with caching and pagination
export function useOptimizedClients(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['clients', page, pageSize],
    queryFn: async () => {
      const startTime = performance.now()
      
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      const { data, error, count } = await supabase
        .from('clients')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log(`[Performance] Clients query took ${(performance.now() - startTime).toFixed(2)}ms`)
      
      return {
        data: data || [],
        count: count || 0,
        hasMore: (count || 0) > end + 1
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    keepPreviousData: true,
  })
}

// Optimized hook for fetching price items with search and filtering
export function useOptimizedPriceItems(filters: {
  search?: string
  category?: string
  page?: number
  pageSize?: number
} = {}) {
  const { search = '', category = '', page = 1, pageSize = 100 } = filters

  return useQuery({
    queryKey: ['price-items', search, category, page, pageSize],
    queryFn: async () => {
      const startTime = performance.now()
      
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1

      let query = supabase
        .from('price_items')
        .select('*', { count: 'exact' })
        .range(start, end)
        .order('description', { ascending: true })

      if (search) {
        query = query.ilike('description', `%${search}%`)
      }

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error, count } = await query

      if (error) throw error

      console.log(`[Performance] Price items query took ${(performance.now() - startTime).toFixed(2)}ms`)
      
      return {
        data: data || [],
        count: count || 0,
        hasMore: (count || 0) > end + 1
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    enabled: true, // Always enabled but will use cache when appropriate
  })
}

// Optimized hook for matching jobs with real-time updates
export function useOptimizedMatchingJobs(autoRefresh = true) {
  const [refreshInterval, setRefreshInterval] = useState<number | false>(
    autoRefresh ? 2000 : false
  )

  const queryResult = useQuery({
    queryKey: ['matching-jobs'],
    queryFn: async () => {
      const startTime = performance.now()
      
      const { data, error } = await supabase
        .from('ai_matching_jobs')
        .select(`
          *,
          clients:client_id (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50) // Limit to recent jobs for performance

      if (error) throw error

      console.log(`[Performance] Matching jobs query took ${(performance.now() - startTime).toFixed(2)}ms`)
      
      // Stop auto-refresh if no processing jobs
      const hasProcessingJobs = data?.some(job => 
        ['pending', 'processing'].includes(job.status)
      )
      
      if (!hasProcessingJobs && autoRefresh) {
        setRefreshInterval(false)
      } else if (hasProcessingJobs && !refreshInterval) {
        setRefreshInterval(2000)
      }

      return data || []
    },
    refetchInterval: refreshInterval,
    staleTime: 1000, // Very short stale time for real-time updates
    cacheTime: 2 * 60 * 1000,
  })

  // Manual refresh function
  const refresh = useCallback(() => {
    queryResult.refetch()
    if (autoRefresh) {
      setRefreshInterval(2000)
    }
  }, [queryResult, autoRefresh])

  return {
    ...queryResult,
    refresh,
    isAutoRefreshing: !!refreshInterval
  }
}

// Optimized mutation hook for updating match results in batches
export function useOptimizedMatchResultUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Array<{ id: string; data: any }>) => {
      const startTime = performance.now()
      
      // Batch updates for better performance
      const promises = updates.map(({ id, data }) =>
        supabase
          .from('match_results')
          .update(data)
          .eq('id', id)
      )

      const results = await Promise.all(promises)
      
      // Check for errors
      const errors = results.filter(result => result.error)
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} items`)
      }

      console.log(`[Performance] Batch update of ${updates.length} items took ${(performance.now() - startTime).toFixed(2)}ms`)
      
      return results
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['match-results'] })
      toast.success('Updates saved successfully')
    },
    onError: (error) => {
      console.error('Batch update error:', error)
      toast.error('Failed to save updates')
    }
  })
}

// Hook for debounced search
export function useDebouncedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue)

  const updateSearchTerm = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  // Debounce the search term
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, delay)

    return () => clearTimeout(timer)
  })

  return {
    searchTerm,
    debouncedSearchTerm,
    updateSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm
  }
}

// Optimized hook for infinite scrolling/pagination
export function useInfiniteScroll<T>(
  queryFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>,
  pageSize = 50,
  enabled = true
) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const startTime = performance.now()
      const result = await queryFn(page, pageSize)
      
      console.log(`[Performance] Infinite scroll page ${page} took ${(performance.now() - startTime).toFixed(2)}ms`)
      
      if (page === 1) {
        setItems(result.data)
      } else {
        setItems(prev => [...prev, ...result.data])
      }
      
      setHasMore(result.hasMore)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'))
    } finally {
      setIsLoading(false)
    }
  }, [queryFn, page, pageSize, isLoading, hasMore, enabled])

  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setError(null)
  }, [])

  // Load initial data
  useState(() => {
    if (enabled && items.length === 0 && page === 1) {
      loadMore()
    }
  })

  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset
  }
}

// Hook for optimized real-time subscriptions
export function useOptimizedSubscription(
  table: string,
  filter?: any,
  enabled = true
) {
  const queryClient = useQueryClient()
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')

  useState(() => {
    if (!enabled) return

    setConnectionStatus('connecting')

    let subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter: filter ? `${filter.column}=eq.${filter.value}` : undefined
        }, 
        (payload) => {
          console.log(`[Real-time] ${table} change:`, payload)
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: [table] })
          
          // Optionally update cache directly for better UX
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            queryClient.setQueryData([table], (oldData: any) => {
              if (!oldData) return oldData
              
              if (Array.isArray(oldData)) {
                const index = oldData.findIndex(item => item.id === payload.new?.id)
                if (index >= 0) {
                  const newData = [...oldData]
                  newData[index] = payload.new
                  return newData
                } else if (payload.eventType === 'INSERT') {
                  return [payload.new, ...oldData]
                }
              }
              
              return oldData
            })
          }
        }
      )
      .subscribe((status) => {
        console.log(`[Real-time] ${table} subscription status:`, status)
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected')
      })

    return () => {
      subscription.unsubscribe()
      setConnectionStatus('disconnected')
    }
  })

  return { connectionStatus }
}