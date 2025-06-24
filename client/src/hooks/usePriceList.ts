import { useState, useEffect, useMemo, useCallback } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

interface PriceItem {
  id: string
  code?: string
  ref?: string
  description: string
  category?: string
  subcategory?: string
  unit?: string
  rate?: number
  keyword_0?: string
  keyword_1?: string
  keyword_2?: string
  keyword_3?: string
  keyword_4?: string
  keyword_5?: string
  keyword_6?: string
  keyword_7?: string
  keyword_8?: string
  keyword_9?: string
  keyword_10?: string
  keyword_11?: string
  keyword_12?: string
  keyword_13?: string
  keyword_14?: string
  keyword_15?: string
  keyword_16?: string
  keyword_17?: string
  keyword_18?: string
  keyword_19?: string
  keyword_20?: string
  keyword_21?: string
  keyword_22?: string
  phrase_0?: string
  phrase_1?: string
  phrase_2?: string
  phrase_3?: string
  phrase_4?: string
  phrase_5?: string
  phrase_6?: string
  phrase_7?: string
  phrase_8?: string
  phrase_9?: string
  phrase_10?: string
  full_context?: string
  version?: number
  created_at: string
  updated_at: string
}

type SortField = 'created_at' | 'description' | 'category' | 'rate'
type SortDirection = 'asc' | 'desc'

const ITEMS_PER_PAGE_OPTIONS = [50, 100, 200]

export function usePriceList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0])
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // Debounce search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch currency setting
  const { data: currency = "USD" } = useQuery({
    queryKey: ['app-settings', 'currency'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('currency')
        .eq('id', 1)
        .single()

      if (error) throw error
      return data?.currency || "USD"
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Fetch available categories
  const { data: availableCategories = [] } = useQuery({
    queryKey: ['price-items-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_items')
        .select('category')
        .not('category', 'is', null)

      if (error) throw error

      const uniqueCategories = Array.from(
        new Set(data?.map(item => item.category?.toLowerCase()).filter(Boolean))
      ) as string[]
      
      return uniqueCategories
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  })

  // Build query parameters
  const queryParams = useMemo(() => ({
    searchTerm: debouncedSearchTerm,
    categoryFilter,
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
  }), [debouncedSearchTerm, categoryFilter, currentPage, itemsPerPage, sortField, sortDirection])

  // Fetch total count
  const { data: totalCount = 0 } = useQuery({
    queryKey: ['price-items-count', queryParams],
    queryFn: async () => {
      let query = supabase
        .from('price_items')
        .select('*', { count: 'exact', head: true })

      if (debouncedSearchTerm) {
        query = query.or(`description.ilike.%${debouncedSearchTerm}%,category.ilike.%${debouncedSearchTerm}%,subcategory.ilike.%${debouncedSearchTerm}%,code.ilike.%${debouncedSearchTerm}%`)
      }
      
      if (categoryFilter !== "all") {
        query = query.ilike('category', categoryFilter)
      }

      const { count, error } = await query
      if (error) throw error

      return count || 0
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
  })

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Fetch price items
  const { 
    data: priceItems = [], 
    isLoading: loading,
    error 
  } = useQuery({
    queryKey: ['price-items', queryParams],
    queryFn: async () => {
      const offset = (currentPage - 1) * itemsPerPage
      
      let query = supabase
        .from('price_items')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' })
        .range(offset, offset + itemsPerPage - 1)

      if (debouncedSearchTerm) {
        query = query.or(`description.ilike.%${debouncedSearchTerm}%,category.ilike.%${debouncedSearchTerm}%,subcategory.ilike.%${debouncedSearchTerm}%,code.ilike.%${debouncedSearchTerm}%`)
      }
      
      if (categoryFilter !== "all") {
        query = query.ilike('category', categoryFilter)
      }

      const { data, error } = await query
      if (error) throw error

      return data || []
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
    enabled: !!user,
  })

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('price_items')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-items'] })
      queryClient.invalidateQueries({ queryKey: ['price-items-count'] })
      toast.success('Price item deleted successfully')
    },
    onError: (error) => {
      console.error('Error deleting price item:', error)
      toast.error('Failed to delete price item')
    },
  })

  // Delete all mutation
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      if (!confirm('Are you sure you want to delete ALL price items? This action cannot be undone.')) {
        throw new Error('User cancelled')
      }

      const { error } = await supabase
        .from('price_items')
        .delete()
        .not('id', 'is', null)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-items'] })
      queryClient.invalidateQueries({ queryKey: ['price-items-count'] })
      queryClient.invalidateQueries({ queryKey: ['price-items-categories'] })
      toast.success('All price items deleted successfully')
    },
    onError: (error: any) => {
      if (error.message !== 'User cancelled') {
        console.error('Error deleting all price items:', error)
        toast.error('Failed to delete all price items')
      }
    },
  })

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }, [sortField])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
  }, [])

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['price-items'] })
    queryClient.invalidateQueries({ queryKey: ['price-items-count'] })
    queryClient.invalidateQueries({ queryKey: ['price-items-categories'] })
    queryClient.invalidateQueries({ queryKey: ['app-settings'] })
  }, [queryClient])

  useEffect(() => {
    if (error) {
      console.error('Error fetching price items:', error)
      toast.error('Failed to load price items')
    }
  }, [error])

  return {
    priceItems,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    loading,
    currentPage,
    setCurrentPage,
    totalItems: totalCount,
    totalPages,
    availableCategories,
    currency,
    itemsPerPage,
    setItemsPerPage,
    sortField,
    sortDirection,
    handleSort,
    handleItemsPerPageChange,
    handleDeleteItem: (id: string) => deleteItemMutation.mutate(id),
    handleDeleteAll: () => deleteAllMutation.mutate(),
    refreshData,
    ITEMS_PER_PAGE_OPTIONS
  }
}
