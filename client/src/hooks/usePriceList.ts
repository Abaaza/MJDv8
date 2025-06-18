import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

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

export type SortField = 'code' | 'description' | 'category' | 'unit' | 'rate' | 'created_at'
export type SortDirection = 'asc' | 'desc'

const ITEMS_PER_PAGE = 50

export function usePriceList() {
  const [priceItems, setPriceItems] = useState<PriceItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [currency, setCurrency] = useState("USD")
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const { user } = useAuth()

  const handleSort = (field: SortField) => {
    console.log('🔍 handleSort called:', { field, currentSortField: sortField, currentDirection: sortDirection })
    
    // Reset to page 1 IMMEDIATELY before updating sort state
    setCurrentPage(1)
    
    if (sortField === field) {
      // If clicking the same field, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
      console.log('🔍 Toggling direction to:', sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // If clicking a different field, set new field and default to ascending
      setSortField(field)
      setSortDirection('asc')
      console.log('🔍 Setting new field:', field, 'direction: asc')
    }
    
    console.log('🔍 Page reset to 1, sort state updated')
  }

  const fetchCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('currency')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Error fetching currency:', error)
        return
      }

      setCurrency(data?.currency || "USD")
    } catch (error) {
      console.error('Error fetching currency:', error)
    }
  }

  const fetchAvailableCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('price_items')
        .select('category')
        .not('category', 'is', null)

      if (error) {
        console.error('Error fetching categories:', error)
        return
      }

      const uniqueCategories = Array.from(new Set(data?.map(item => item.category?.toLowerCase()).filter(Boolean))) as string[]
      setAvailableCategories(uniqueCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTotalCount = async () => {
    try {
      console.log('📊 Fetching total count...')
      let query = supabase
        .from('price_items')
        .select('*', { count: 'exact', head: true })

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,subcategory.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      }
      
      if (categoryFilter !== "all") {
        query = query.ilike('category', categoryFilter)
      }

      const { count, error } = await query

      if (error) {
        console.error('❌ Error fetching total count:', error)
        console.error('❌ Count error details:', {
          message: error.message,
          code: error.code
        })
        
        if (error.message.includes('RLS') || error.code === 'PGRST116') {
          console.log('📊 Count query affected by RLS policies')
        }
        return
      }

      console.log('✅ Total count fetched:', count)
      setTotalItems(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error) {
      console.error('❌ Error fetching total count:', error)
    }
  }

  const fetchPriceItems = async () => {
    try {
      setLoading(true)
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      
      console.log('🔍 fetchPriceItems called with:', {
        currentPage,
        offset,
        sortField,
        sortDirection,
        searchTerm,
        categoryFilter
      })
      
      let query = supabase
        .from('price_items')
        .select('*')

      // Apply filters first
      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,subcategory.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
        console.log('🔍 Applied search filter:', searchTerm)
      }
      
      if (categoryFilter !== "all") {
        query = query.ilike('category', categoryFilter)
        console.log('🔍 Applied category filter:', categoryFilter)
      }

      // Apply sorting to the entire dataset (BEFORE pagination)
      query = query.order(sortField, { ascending: sortDirection === 'asc' })
      console.log('🔍 Applied sorting:', { field: sortField, direction: sortDirection, ascending: sortDirection === 'asc' })

      // Apply pagination last (AFTER sorting the full dataset)
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1)
      console.log('🔍 Applied pagination:', { offset, endRange: offset + ITEMS_PER_PAGE - 1 })

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching price items:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // Check for common RLS policy issues
        if (error.message.includes('RLS') || error.code === 'PGRST116') {
          toast.error('Permission issue: You can only see price items you created. Try using "Fix Orphaned Items" if you have data.')
        } else {
          toast.error('Failed to load price items')
        }
        return
      }

      console.log('✅ Price items query successful:', {
        resultCount: data?.length || 0,
        userID: user?.id,
        hasData: !!(data && data.length > 0)
      })

      if (!data || data.length === 0) {
        console.log('📋 No price items found - this could be due to:')
        console.log('   1. No data in database')
        console.log('   2. RLS policies - items may not have user_id set')
        console.log('   3. Filters excluding all results')
        console.log('   Current filters:', { searchTerm, categoryFilter })
      }

      console.log('🔍 Query results:', {
        resultCount: data?.length,
        firstItem: data?.[0] ? {
          id: data[0].id,
          [sortField]: data[0][sortField]
        } : null,
        lastItem: data?.[data.length - 1] ? {
          id: data[data.length - 1].id,
          [sortField]: data[data.length - 1][sortField]
        } : null
      })

      setPriceItems(data || [])
    } catch (error) {
      console.error('Error fetching price items:', error)
      toast.error('Failed to load price items')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      console.log('🗑️ Attempting to delete price item:', id)
      console.log('🗑️ Current user:', user?.id)
      
      // First, let's check the price item's user_id before attempting deletion
      const { data: itemData, error: fetchError } = await supabase
        .from('price_items')
        .select('id, user_id, description')
        .eq('id', id)
        .single()
      
      if (fetchError) {
        console.error('❌ Error fetching price item for deletion:', fetchError)
        toast.error('Failed to fetch price item details')
        return
      }
      
      console.log('🗑️ Item to delete:', {
        id: itemData.id,
        user_id: itemData.user_id,
        description: itemData.description?.substring(0, 50) + '...',
        currentUserId: user?.id,
        userMatch: itemData.user_id === user?.id
      })
      
      const { error } = await supabase
        .from('price_items')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting price item:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // More specific error messages
        if (error.code === 'PGRST116') {
          toast.error('Permission denied: You can only delete price items you created')
        } else if (error.message.includes('RLS')) {
          toast.error('Permission denied: Row level security policy violation')
        } else {
          toast.error(`Failed to delete price item: ${error.message}`)
        }
        return
      }

      toast.success('Price item deleted successfully')
      fetchPriceItems()
      fetchTotalCount()
    } catch (error) {
      console.error('❌ Error deleting price item:', error)
      toast.error('Failed to delete price item')
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete ALL price items? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('price_items')
        .delete()
        .not('id', 'is', null)

      if (error) {
        console.error('Error deleting all price items:', error)
        toast.error('Failed to delete all price items')
        return
      }

      toast.success('All price items deleted successfully')
      fetchPriceItems()
      fetchTotalCount()
      fetchAvailableCategories()
    } catch (error) {
      console.error('Error deleting all price items:', error)
      toast.error('Failed to delete all price items')
    }
  }

  const fixOrphanedPriceItems = async () => {
    if (!user) {
      toast.error('User not authenticated')
      return
    }

    try {
      console.log('🔧 Fixing orphaned price items...')
      
      // First, check how many items don't have a user_id
      const { data: orphanedItems, error: checkError } = await supabase
        .from('price_items')
        .select('id, description')
        .is('user_id', null)
      
      if (checkError) {
        console.error('❌ Error checking orphaned items:', checkError)
        toast.error('Failed to check orphaned items')
        return
      }
      
      if (!orphanedItems || orphanedItems.length === 0) {
        toast.success('No orphaned price items found')
        return
      }
      
      console.log(`🔧 Found ${orphanedItems.length} orphaned price items`)
      
      // Update all orphaned items to belong to current user
      const { error: updateError } = await supabase
        .from('price_items')
        .update({ user_id: user.id })
        .is('user_id', null)
      
      if (updateError) {
        console.error('❌ Error updating orphaned items:', updateError)
        toast.error('Failed to fix orphaned items')
        return
      }
      
      toast.success(`Fixed ${orphanedItems.length} orphaned price items - they are now owned by you`)
      fetchPriceItems()
    } catch (error) {
      console.error('❌ Error fixing orphaned items:', error)
      toast.error('Failed to fix orphaned items')
    }
  }

  const refreshData = () => {
    fetchPriceItems()
    fetchTotalCount()
    fetchAvailableCategories()
    fetchCurrency()
  }

  useEffect(() => {
    if (user) {
      console.log('👤 User authenticated, loading price list data:', user.id)
      fetchAvailableCategories()
      fetchPriceItems()
      fetchTotalCount()
      fetchCurrency()
    } else {
      console.log('❌ No user authenticated, skipping price list load')
      setLoading(false)
    }
  }, [user, currentPage, searchTerm, categoryFilter, sortField, sortDirection])

  // Reset to page 1 when filters change (but NOT when sorting changes - that's handled in handleSort)
  useEffect(() => {
    console.log('🔍 Filters changed, resetting to page 1:', { searchTerm, categoryFilter })
    setCurrentPage(1)
  }, [searchTerm, categoryFilter])

  return {
    priceItems,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    loading,
    currentPage,
    setCurrentPage,
    totalItems,
    totalPages,
    availableCategories,
    currency,
    sortField,
    sortDirection,
    handleSort,
    handleDeleteItem,
    handleDeleteAll,
    fixOrphanedPriceItems,
    refreshData
  }
}
