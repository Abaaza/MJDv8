import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ExcelUpload } from "./ExcelUpload"
import { EditableMatchResultsTable } from "./EditableMatchResultsTable"
import { ClientForm } from "./ClientForm"
import { Download, Play, Zap, AlertCircle, CheckCircle, Edit, FileSpreadsheet, Save, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useClients } from "@/hooks/useClients"
import { toast } from "sonner"
import { Tables } from "@/integrations/supabase/types"
import { notificationService } from "@/services/notificationService"

type MatchingJob = Tables<'ai_matching_jobs'>

interface MatchResult {
  id: string
  original_description: string
  matched_description: string
  matched_rate: number
  similarity_score: number
  row_number: number
  sheet_name: string
  quantity?: number
  unit?: string
  total_amount?: number
  matched_price_item_id?: string
}

export function PriceMatching() {
  const { user } = useAuth()
  const { clients, createClient } = useClients()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientNameInput, setClientNameInput] = useState('')
  const [filteredClients, setFilteredClients] = useState(clients)
  const [showClientSuggestions, setShowClientSuggestions] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentJob, setCurrentJob] = useState<MatchingJob | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)

  // Filter clients based on input
  const handleClientNameChange = (value: string) => {
    setClientNameInput(value)
    
    if (value.trim() === '') {
      setFilteredClients([])
      setSelectedClientId('')
      setShowClientSuggestions(false)
      return
    }

    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(value.toLowerCase()) ||
      (client.company_name && client.company_name.toLowerCase().includes(value.toLowerCase()))
    )
    
    setFilteredClients(filtered)
    setShowClientSuggestions(filtered.length > 0)
    
    // Check if exact match exists
    const exactMatch = clients.find(client => 
      client.name.toLowerCase() === value.toLowerCase()
    )
    setSelectedClientId(exactMatch?.id || '')
  }

  const handleClientSelect = (client: any) => {
    setClientNameInput(client.name)
    setSelectedClientId(client.id)
    setShowClientSuggestions(false)
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    if (!projectName) {
      const name = file.name.replace(/\.(xlsx|xls)$/i, '')
      setProjectName(name)
    }
  }

  const createOrGetClient = async () => {
    if (!user) return null

    // First, try to find the client by the selected ID
    if (selectedClientId) {
      try {
        const { data: existingClient, error: searchError } = await supabase
          .from('clients')
          .select('id, name')
          .eq('id', selectedClientId)
          .eq('user_id', user.id)
          .single()

        if (!searchError && existingClient) {
          console.log('Found existing client:', existingClient.id)
          return existingClient.id
        }
      } catch (error) {
        console.log('Client not found by ID, will try by name')
      }
    }

    // If no ID match, try to find by name
    if (clientNameInput.trim()) {
      try {
        const { data: clientByName, error: nameError } = await supabase
          .from('clients')
          .select('id, name')
          .eq('name', clientNameInput.trim())
          .eq('user_id', user.id)
          .single()

        if (!nameError && clientByName) {
          console.log('Found client by name:', clientByName.id)
          setSelectedClientId(clientByName.id)
          return clientByName.id
        }
      } catch (error) {
        console.log('Client not found by name either')
      }
    }

    console.error('No client found')
    return null
  }

  const handleSaveForLater = async () => {
    if (!currentJob) {
      toast.error('No job to save - please generate results first')
      return
    }

    if (matchResults.length === 0) {
      toast.error('No results to save')
      return
    }

    try {
      // Update the job status to indicate it's been saved
      const { error: jobError } = await supabase
        .from('ai_matching_jobs')
        .update({
          status: 'completed',
          matched_items: matchResults.length,
          total_items: matchResults.length,
          confidence_score: Math.round(matchResults.reduce((sum, r) => sum + r.similarity_score, 0) / matchResults.length * 100)
        })
        .eq('id', currentJob.id)

      if (jobError) {
        console.error('Error updating job:', jobError)
        toast.error('Failed to save job status')
        return
      }

      // First, delete existing results for this job to avoid conflicts
      const { error: deleteError } = await supabase
        .from('match_results')
        .delete()
        .eq('job_id', currentJob.id)

      if (deleteError) {
        console.error('Error deleting existing results:', deleteError)
      }

      // Save all match results in the database with individual inserts
      for (const result of matchResults) {
        const { error: resultError } = await supabase
          .from('match_results')
          .insert({
            job_id: currentJob.id,
            sheet_name: result.sheet_name,
            row_number: result.row_number,
            original_description: result.original_description,
            preprocessed_description: result.original_description.toLowerCase(),
            matched_description: result.matched_description,
            matched_rate: result.matched_rate,
            similarity_score: result.similarity_score,
            jaccard_score: 0.5,
            combined_score: result.similarity_score,
            quantity: result.quantity,
            matched_price_item_id: result.matched_price_item_id
          })

        if (resultError) {
          console.error('Error saving result:', resultError)
          toast.error('Failed to save some results')
          return
        }
      }

      toast.success('Results saved successfully!')
    } catch (error) {
      console.error('Error saving results:', error)
      toast.error('Failed to save results')
    }
  }

  const handleUpdateResult = async (id: string, updates: Partial<MatchResult>) => {
    // Update local state
    setMatchResults(prev => prev.map(result => 
      result.id === id ? { ...result, ...updates } : result
    ))

    // If we have a current job, also update the database
    if (currentJob && currentJob.id) {
      try {
        const result = matchResults.find(r => r.id === id)
        if (result) {
          const { error } = await supabase
            .from('match_results')
            .update({
              matched_description: updates.matched_description || result.matched_description,
              matched_rate: updates.matched_rate || result.matched_rate,
              quantity: updates.quantity || result.quantity,
              similarity_score: updates.similarity_score || result.similarity_score
            })
            .eq('job_id', currentJob.id)
            .eq('row_number', result.row_number)

          if (error) {
            console.error('Error updating result in database:', error)
          } else {
            console.log('Result updated in database')
          }
        }
      } catch (error) {
        console.error('Error updating result:', error)
      }
    }
  }

  const handleDeleteResult = async (id: string) => {
    const result = matchResults.find(r => r.id === id)
    
    // Update local state
    setMatchResults(prev => prev.filter(result => result.id !== id))

    // If we have a current job, also delete from database
    if (currentJob && currentJob.id && result) {
      try {
        const { error } = await supabase
          .from('match_results')
          .delete()
          .eq('job_id', currentJob.id)
          .eq('row_number', result.row_number)

        if (error) {
          console.error('Error deleting result from database:', error)
        } else {
          console.log('Result deleted from database')
        }
      } catch (error) {
        console.error('Error deleting result:', error)
      }
    }
    
    toast.success('Result deleted')
  }

  // Add function to clear test data
  const clearTestData = async () => {
    if (!confirm('Are you sure you want to delete all matching results? This action cannot be undone.')) {
      return
    }

    try {
      toast.info('Clearing test data...')
      
      // Delete all match results
      const { error: resultsError } = await supabase
        .from('match_results')
        .delete()
        .not('id', 'is', null)

      if (resultsError) {
        console.error('Error deleting match results:', resultsError)
      }

      // Delete all AI matching jobs
      const { error: jobsError } = await supabase
        .from('ai_matching_jobs')
        .delete()
        .not('id', 'is', null)

      if (jobsError) {
        console.error('Error deleting AI matching jobs:', jobsError)
      }

      toast.success('Test data cleared successfully!')
      setMatchResults([])
      setCurrentJob(null)
      setLog([])
      
    } catch (error) {
      console.error('Error clearing test data:', error)
      toast.error('Failed to clear test data')
    }
  }

  const exportToExcel = async () => {
    if (matchResults.length === 0) {
      toast.error('No results to export')
      return
    }

    try {
      toast.info('Exporting all results...')
      
      // Get ALL match results for the current job, not just the displayed ones
      let allResults = matchResults
      
      if (currentJob) {
        const { data: allMatchResults, error } = await supabase
          .from('match_results')
          .select(`
            *,
            price_items:matched_price_item_id(unit, rate, description)
          `)
          .eq('job_id', currentJob.id)
          .order('row_number')

        if (!error && allMatchResults) {
          allResults = allMatchResults.map(result => ({
            id: result.id,
            original_description: result.original_description,
            matched_description: result.matched_description || '',
            matched_rate: result.matched_rate || 0,
            similarity_score: result.similarity_score || 0,
            row_number: result.row_number,
            sheet_name: result.sheet_name,
            quantity: result.quantity || 0,
            unit: result.price_items?.unit || '',
            total_amount: (result.quantity || 0) * (result.matched_rate || 0),
            matched_price_item_id: result.matched_price_item_id
          }))
        }
      }

      const headers = [
        'Row Number',
        'Sheet Name', 
        'Original Description',
        'Matched Description',
        'Quantity',
        'Unit',
        'Rate',
        'Total Amount',
        'Confidence Score'
      ]

      const csvData = [
        headers.join(','),
        ...allResults.map(result => [
          result.row_number,
          `"${result.sheet_name}"`,
          `"${result.original_description}"`,
          `"${result.matched_description}"`,
          result.quantity || '',
          result.unit || '',
          result.matched_rate,
          result.total_amount || '',
          `${Math.round(result.similarity_score * 100)}%`
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${projectName || 'matching-results'}_all_${allResults.length}_items.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        
        toast.success(`All ${allResults.length} results exported successfully!`)
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export results')
    }
  }

  const clearPollInterval = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  const handleStartMatching = async () => {
    console.log('handleStartMatching called, isProcessingRef.current:', isProcessingRef.current)
    console.log('selectedFile:', selectedFile?.name)
    console.log('projectName:', projectName)
    console.log('selectedClientId:', selectedClientId)
    console.log('clientNameInput:', clientNameInput)
    
    if (isProcessingRef.current) {
      console.log('Already processing, ignoring additional start request')
      return
    }

    if (!selectedFile) {
      toast.error('Please select an Excel file')
      return
    }

    if (!projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    if (!clientNameInput.trim()) {
      toast.error('Please select or enter a client name')
      return
    }

    if (!user) {
      toast.error('Please log in to continue')
      return
    }

    console.log('Setting processing flag and starting matching...')
    isProcessingRef.current = true
    clearPollInterval()
    setIsProcessing(true)
    setLog([])
    setMatchResults([])
    
    const timestamp1 = new Date().toLocaleTimeString()
    setLog([`[${timestamp1}] Starting price matching process...`])

    try {
      const clientId = await createOrGetClient()
      if (!clientId) {
        throw new Error('Please select a valid client or create a new one')
      }

      console.log('Creating job record with client ID:', clientId)
      const { data: jobData, error: jobError } = await supabase
        .from('ai_matching_jobs')
        .insert({
          user_id: user.id,
          project_name: projectName.trim(),
          original_filename: selectedFile.name,
          status: 'pending',
          client_id: clientId
        })
        .select()
        .single()

      if (jobError) {
        throw new Error(`Failed to create job: ${jobError.message}`)
      }

      console.log('Job created successfully:', jobData.id)
      setCurrentJob(jobData)
      const timestamp2 = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp2}] Created matching job: ${jobData.id}`])

      console.log('Converting file to base64...')
      
      const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            try {
              const result = reader.result as string
              const base64Data = result.split(',')[1]
              resolve(base64Data)
            } catch (error) {
              reject(error)
            }
          }
          reader.onerror = () => reject(new Error('Failed to read file'))
          reader.readAsDataURL(file)
        })
      }

      const base64File = await convertFileToBase64(selectedFile)

      const timestamp3 = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp3}] Uploading file and starting processing...`])

      console.log('Calling Node.js backend...')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/price-matching/process-base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobData.id,
          fileName: selectedFile.name,
          fileData: base64File
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Processing failed: ${errorData.message || errorData.error}`)
      }

      const processData = await response.json()

      console.log('Processing started successfully')
      const timestamp4 = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp4}] Processing started successfully`])
      startPolling(jobData.id)

    } catch (error) {
      console.error('Matching error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const timestamp5 = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp5}] Error: ${errorMessage}`])
      
      setIsProcessing(false)
      isProcessingRef.current = false
      clearPollInterval()
      
      toast.error(`Matching failed: ${errorMessage}`)
    }
  }

  const startPolling = (jobId: string) => {
    clearPollInterval()
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        console.log('Polling job status for:', jobId)
        
        // Use backend API instead of direct Supabase query
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/price-matching/status/${jobId}`)
        
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`)
        }
        
        const data = await response.json()

        console.log('Job data received:', {
          id: data.id,
          status: data.status,
          progress: data.progress,
          matched_items: data.matched_items,
          confidence_score: data.confidence_score
        })

        setCurrentJob(data)

        if (data.status === 'processing') {
          const timestamp = new Date().toLocaleTimeString()
          const progressMessage = data.error_message 
            ? `${data.progress}% - ${data.error_message}`
            : `${data.progress}% - Processing items...`
          setLog(prev => [...prev, `[${timestamp}] Progress: ${progressMessage}`])
        } else if (data.status === 'completed') {
          console.log('Job completed! Stopping polling and loading results')
          const timestamp = new Date().toLocaleTimeString()
          setLog(prev => [...prev, `[${timestamp}] ✅ Completed! Matched ${data.matched_items} items with ${data.confidence_score}% average confidence`])
          setIsProcessing(false)
          isProcessingRef.current = false
          clearPollInterval()
          
          console.log('Job completed, loading match results for job:', jobId)
          await loadMatchResults(jobId)
          toast.success(`Processing completed successfully! Matched ${data.matched_items} items.`)
          
        } else if (data.status === 'failed') {
          console.log('Job failed!')
          const timestamp = new Date().toLocaleTimeString()
          const errorDetails = data.error_message || 'Unknown error'
          setLog(prev => [...prev, `[${timestamp}] ❌ Failed: ${errorDetails}`])
          setIsProcessing(false)
          isProcessingRef.current = false
          clearPollInterval()
          
          // Show detailed error to user
          toast.error(`Processing failed: ${errorDetails.split('\n')[0]}`, {
            description: errorDetails.length > 100 ? `${errorDetails.substring(0, 100)}...` : errorDetails
          })
        } else if (data.status === 'pending') {
          const timestamp = new Date().toLocaleTimeString()
          setLog(prev => [...prev, `[${timestamp}] Waiting to start processing...`])
        } else {
          console.log('Unknown job status:', data.status)
          const timestamp = new Date().toLocaleTimeString()
          setLog(prev => [...prev, `[${timestamp}] Unknown status: ${data.status}`])
        }
      } catch (error) {
        console.error('Polling error:', error)
        const timestamp = new Date().toLocaleTimeString()
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        setLog(prev => [...prev, `[${timestamp}] ⚠️ Polling error: ${errorMessage}`])
      }
    }, 2000)
  }

  const loadMatchResults = async (jobId: string) => {
    try {
      console.log('Loading match results for job:', jobId)
      
      const { data, error } = await supabase
        .from('match_results')
        .select(`
          *,
          price_items:matched_price_item_id(unit, rate, description)
        `)
        .eq('job_id', jobId)
        .order('row_number')

      if (error) {
        console.error('Error loading match results:', error)
        const timestamp = new Date().toLocaleTimeString()
        setLog(prev => [...prev, `[${timestamp}] ⚠️ Could not load results from database: ${error.message}`])
        
        // Show a message that results need to be downloaded
        toast.info('Results processing completed! Use the download button to get your Excel file with matched results.')
        return
      }

      console.log('Match results loaded:', data?.length || 0, 'results')

      if (!data || data.length === 0) {
        const timestamp = new Date().toLocaleTimeString()
        setLog(prev => [...prev, `[${timestamp}] ℹ️ No results in database - Excel file is ready for download`])
        
        // Show a message that results need to be downloaded
        toast.info('Results processing completed! Use the download button to get your Excel file with matched results.')
        return
      }

      // Transform the data to include units from price_items
      const resultsWithUnits = data?.map(result => ({
        id: result.id,
        original_description: result.original_description,
        matched_description: result.matched_description || '',
        matched_rate: result.matched_rate || 0,
        similarity_score: result.similarity_score || 0,
        row_number: result.row_number,
        sheet_name: result.sheet_name,
        quantity: result.quantity || 0,
        unit: result.price_items?.unit || '',
        total_amount: (result.quantity || 0) * (result.matched_rate || 0),
        matched_price_item_id: result.matched_price_item_id
      })) || []

      console.log('Transformed results:', resultsWithUnits.length)
      setMatchResults(resultsWithUnits)
      
      const timestamp = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp}] ✅ Loaded ${resultsWithUnits.length} results for review`])
      
    } catch (error) {
      console.error('Error loading match results:', error)
      const timestamp = new Date().toLocaleTimeString()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setLog(prev => [...prev, `[${timestamp}] ⚠️ Error loading results: ${errorMessage}`])
      
      // Show a message that results need to be downloaded
      toast.info('Results processing completed! Use the download button to get your Excel file with matched results.')
    }
  }

  const downloadResults = async () => {
    if (!currentJob || currentJob.status !== 'completed') {
      toast.error('No completed results to download')
      return
    }

    try {
      const timestamp = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp}] Downloading results...`])
      
      // Download from Node.js backend
              const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/price-matching/download/${currentJob.id}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Download failed: ${errorData.message || errorData.error}`)
      }

      // Get the file blob
      const blob = await response.blob()
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileName = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${currentJob.project_name}_Results.xlsx`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      const timestamp2 = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp2}] Results downloaded successfully`])
      toast.success('Results downloaded successfully')

    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const timestamp = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp}] Download error: ${errorMessage}`])
      toast.error('Failed to download results')
    }
  }

  React.useEffect(() => {
    if (clientNameInput) {
      handleClientNameChange(clientNameInput)
    }
  }, [clients])

  React.useEffect(() => {
    return () => {
      clearPollInterval()
      isProcessingRef.current = false
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing': return <Zap className="h-4 w-4 text-blue-600" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-3">
      {/* Main Price Matching Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span>AI Price Matching</span>
              </CardTitle>
              <CardDescription>
                Upload your Excel inquiry file and let AI automatically match items with your price list using Cohere embeddings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-sm font-medium">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  disabled={isProcessing}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-input" className="text-sm font-medium">Client Name</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Input
                      id="client-input"
                      value={clientNameInput}
                      onChange={(e) => handleClientNameChange(e.target.value)}
                      placeholder="Type client name..."
                      disabled={isProcessing}
                      className="w-full"
                      onFocus={() => {
                        if (filteredClients.length > 0) {
                          setShowClientSuggestions(true)
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow click
                        setTimeout(() => setShowClientSuggestions(false), 200)
                      }}
                    />
                    {showClientSuggestions && filteredClients.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-gray-900 dark:text-gray-100"
                            onMouseDown={() => handleClientSelect(client)}
                          >
                            <div className="font-medium">{client.name}</div>
                            {client.company_name && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">{client.company_name}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClientForm(true)}
                    disabled={isProcessing}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Add New
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Inquiry Excel File</Label>
                <ExcelUpload 
                  onFileSelect={handleFileSelect}
                  disabled={isProcessing}
                />
              </div>
            </div>

            {currentJob && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Current Job</h4>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(currentJob.status)}
                    <Badge className={getStatusColor(currentJob.status)}>
                      {currentJob.status}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {currentJob.project_name}
                </p>

                {currentJob.status === 'completed' && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      Matched {currentJob.matched_items} of {currentJob.total_items} items
                    </p>
                    <p className="text-sm">
                      Average confidence: {currentJob.confidence_score}%
                    </p>
                    <Button 
                      onClick={downloadResults} 
                      size="sm" 
                      className="mt-2"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Results
                    </Button>
                  </div>
                )}

                {currentJob.status === 'processing' && currentJob.progress && (
                  <div className="space-y-2">
                    <Progress value={currentJob.progress} className="w-full" />
                    <p className="text-sm text-muted-foreground">
                      {currentJob.progress}% complete
                    </p>
                  </div>
                )}
              </div>
            )}

            {log.length > 0 && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Processing Log</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {log.map((entry, index) => (
                    <p key={index} className="text-xs font-mono text-muted-foreground">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={handleStartMatching}
              disabled={!selectedFile || !projectName.trim() || !clientNameInput.trim() || isProcessing}
              className="px-8"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Start Matching'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {matchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Match Results</CardTitle>
                <CardDescription>
                  Review and edit the AI matches. Use radio buttons to switch between Cohere AI matches and manual search.
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveForLater} size="sm" variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save for Later
                </Button>
                <Button onClick={exportToExcel} size="sm" variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export All Results
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EditableMatchResultsTable
              matchResults={matchResults}
              onUpdateResult={handleUpdateResult}
              onDeleteResult={handleDeleteResult}
              currency="GBP"
            />
          </CardContent>
        </Card>
      )}

      {/* Client Form Modal */}
      <ClientForm
        isOpen={showClientForm}
        onClose={() => setShowClientForm(false)}
        onSave={createClient}
      />
    </div>
  )
}
