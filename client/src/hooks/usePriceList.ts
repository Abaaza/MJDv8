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
  const { user } = useAuth()

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
        console.error('Error fetching total count:', error)
        return
      }

      setTotalItems(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error) {
      console.error('Error fetching total count:', error)
    }
  }

  const fetchPriceItems = async () => {
    try {
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      
      let query = supabase
        .from('price_items')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      if (searchTerm) {
        query = query.or(`description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,subcategory.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%`)
      }
      
      if (categoryFilter !== "all") {
        query = query.ilike('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching price items:', error)
        toast.error('Failed to load price items')
        return
      }

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
      const { error } = await supabase
        .from('price_items')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting price item:', error)
        toast.error('Failed to delete price item')
        return
      }

      toast.success('Price item deleted successfully')
      fetchPriceItems()
      fetchTotalCount()
    } catch (error) {
      console.error('Error deleting price item:', error)
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

  const refreshData = () => {
    fetchPriceItems()
    fetchTotalCount()
    fetchAvailableCategories()
    fetchCurrency()
  }

  useEffect(() => {
    if (user) {
      fetchAvailableCategories()
      fetchPriceItems()
      fetchTotalCount()
      fetchCurrency()
    }
  }, [user, currentPage, searchTerm, categoryFilter])

  useEffect(() => {
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
    handleDeleteItem,
    handleDeleteAll,
    refreshData
  }
}
