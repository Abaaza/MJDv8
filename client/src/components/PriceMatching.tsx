import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ExcelUpload } from "./ExcelUpload"
import { EditableMatchResultsTable } from "./EditableMatchResultsTable"
import { ClientForm } from "./ClientForm"
import { Download, Play, Zap, AlertCircle, CheckCircle, Edit, FileSpreadsheet, Plus, Trash2, Square } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useClients } from "@/hooks/useClients"
import { toast } from "sonner"
import { Tables } from "@/integrations/supabase/types"
import { notificationService } from "@/services/notificationService"
import { apiEndpoint } from '@/config/api'

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
  section_header?: string
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
  // Always use Cohere AI for matching
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll log to bottom when new entries are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [log])

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
        console.log('Client not found by name, creating new client')
      }

      // If client doesn't exist, create a new one
      try {
        const { data: newClient, error: createError } = await supabase
          .from('clients')
          .insert({
            name: clientNameInput.trim(),
            user_id: user.id
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating client:', createError)
          throw new Error(`Failed to create client: ${createError.message}`)
        }

        console.log('Created new client:', newClient.id)
        setSelectedClientId(newClient.id)
        
        // Update filtered clients to include the new client
        setFilteredClients(prev => [...prev, newClient])
        
        toast.success(`New client "${clientNameInput.trim()}" created`)
        return newClient.id
      } catch (error) {
        console.error('Failed to create client:', error)
        throw error
      }
    }

    console.error('No client name provided')
    return null
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
    if (!currentJob || currentJob.status !== 'completed') {
      toast.error('No completed results to export')
      return
    }

    if (!matchResults || matchResults.length === 0) {
      toast.error('No match results to export')
      return
    }

    try {
      toast.info('Exporting filtered Excel results...')
      
      // Export the current edited results
      const response = await fetch(apiEndpoint(`/price-matching/export/${currentJob.id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchResults: matchResults
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Export failed: ${errorData.message || errorData.error}`)
      }

      // Get the file blob
      const blob = await response.blob()
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from Content-Disposition header or use default with "Filtered_" prefix
      const contentDisposition = response.headers.get('Content-Disposition')
      const originalFileName = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${currentJob.project_name}_Filtered_Results.xlsx`
      
      link.download = originalFileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Excel results exported successfully! (${matchResults.length} items)`)

    } catch (error) {
      console.error('Export error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to export results: ${errorMessage}`)
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
        throw new Error('Please enter a client name')
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
      const response = await fetch(apiEndpoint('/price-matching/process-base64'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: jobData.id,
          fileName: selectedFile.name,
          fileData: base64File,
          matchingMethod: 'cohere'
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

  const handleStopMatching = async () => {
    if (!currentJob || !currentJob.id) {
      toast.error('No active job to stop')
      return
    }

    try {
      const timestamp = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp}] Stopping job...`])
      
      const response = await fetch(apiEndpoint(`/price-matching/cancel/${currentJob.id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Cancel failed: ${errorData.message || errorData.error}`)
      }

      const cancelData = await response.json()
      console.log('Job cancelled successfully:', cancelData)

      // Update local state
      setIsProcessing(false)
      isProcessingRef.current = false
      clearPollInterval()

      // Update job state to show cancelled
      setCurrentJob(prev => prev ? { ...prev, status: 'cancelled' } : null)

      const timestamp2 = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp2}] ✋ Job stopped by user`])
      
      toast.success('Job stopped successfully')

    } catch (error) {
      console.error('Stop error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const timestamp = new Date().toLocaleTimeString()
      setLog(prev => [...prev, `[${timestamp}] Stop error: ${errorMessage}`])
      toast.error(`Failed to stop job: ${errorMessage}`)
    }
  }

  const startPolling = (jobId: string) => {
    clearPollInterval()
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('ai_matching_jobs')
          .select('*')
          .eq('id', jobId)
          .single()

        if (error) {
          console.error('Polling error:', error)
          return
        }

        setCurrentJob(data)

        if (data.status === 'processing') {
          const timestamp = new Date().toLocaleTimeString()
          const progressMessage = data.error_message || `${data.progress || 0}% - Processing...`
          
          setLog(prev => {
            const lastMessage = prev[prev.length - 1]
            if (!lastMessage || !lastMessage.includes(progressMessage)) {
              return [...prev, `[${timestamp}] ${progressMessage}`]
            }
            return prev
          })
        } else if (data.status === 'completed') {
          const timestamp = new Date().toLocaleTimeString()
          const successRate = data.total_items > 0 
            ? Math.round((data.matched_items / data.total_items) * 100)
            : 0
          
          setLog(prev => [...prev, 
            `[${timestamp}] ✅ Completed!`,
            `[${timestamp}] 📊 Results: ${data.matched_items}/${data.total_items} items matched (${successRate}% success rate)`,
            `[${timestamp}] 📈 Average confidence: ${data.confidence_score || 0}%`
          ])
          setIsProcessing(false)
          isProcessingRef.current = false
          clearPollInterval()
          
          await loadMatchResults(jobId)
          
          if (data.matched_items > 0) {
            toast.success(`Processing completed! Matched ${data.matched_items} items with ${successRate}% success rate.`)
          } else {
            toast.info(`Processing completed with AI matching.`)
          }
          
        } else if (data.status === 'failed') {
          const timestamp = new Date().toLocaleTimeString()
          const errorDetails = data.error_message || 'Unknown error'
          setLog(prev => [...prev, `[${timestamp}] ❌ Failed: ${errorDetails}`])
          setIsProcessing(false)
          isProcessingRef.current = false
          clearPollInterval()
          
          toast.error(`Processing failed: ${errorDetails}`)
        } else if (data.status === 'cancelled') {
          const timestamp = new Date().toLocaleTimeString()
          setLog(prev => [...prev, `[${timestamp}] ✋ Job was cancelled`])
          setIsProcessing(false)
          isProcessingRef.current = false
          clearPollInterval()
          
          toast.info('Job was cancelled')
        }
      } catch (error) {
        console.error('Polling error:', error)
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
        matched_price_item_id: result.matched_price_item_id,
        section_header: result.section_header || null
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
      const response = await fetch(apiEndpoint(`/price-matching/download/${currentJob.id}`))
      
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
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing': return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <Square className="h-4 w-4 text-orange-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'processing': return 'secondary'
      case 'failed': return 'destructive'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Price Matching</CardTitle>
          <CardDescription>
            Upload your Bill of Quantities (BoQ) and let our AI match it against your price list.1
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="project-name" className="text-left">Project Name</Label>
              <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g., Summerfield Residential" disabled={isProcessing} className="text-left" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="client-input" className="text-left">Client</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="client-input"
                    value={clientNameInput}
                    onChange={(e) => handleClientNameChange(e.target.value)}
                    placeholder="Search or create a client"
                    disabled={isProcessing}
                    onFocus={() => setShowClientSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowClientSuggestions(false), 200)}
                    className="text-left"
                  />
                  {showClientSuggestions && filteredClients.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredClients.map((client) => (
                        <div key={client.id} className="px-3 py-2 cursor-pointer hover:bg-muted" onMouseDown={() => handleClientSelect(client)}>
                          <p className="font-medium">{client.name}</p>
                          {client.company_name && <p className="text-sm text-muted-foreground">{client.company_name}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={() => setShowClientForm(true)} disabled={isProcessing}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>BoQ File</Label>
            <ExcelUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
          </div>
          <div className="grid gap-2">
            <Label>Matching Method</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="matchingMethod" 
                  value="cohere" 
                  checked={true}
                  disabled={isProcessing}
                  className="text-primary"
                />
                <span className="text-sm">
                  <strong>Cohere AI</strong> - Advanced AI matching (high accuracy)
                </span>
              </label>
            </div>
          </div>
          <Button onClick={handleStartMatching} disabled={!selectedFile || !projectName.trim() || !clientNameInput.trim() || isProcessing} size="lg">
            <Play className="h-5 w-5 mr-2" />
            {isProcessing ? 'Processing...' : 'Start AI Matching'}
          </Button>
        </CardContent>
      </Card>

      {(isProcessing || (currentJob && (currentJob.status === 'cancelled' || currentJob.status === 'failed'))) && currentJob && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Processing Job</CardTitle>
                <CardDescription>Job ID: {currentJob.id}</CardDescription>
              </div>
              {(currentJob.status === 'processing' || currentJob.status === 'pending') && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleStopMatching}
                  className="ml-4"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Process
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {getStatusIcon(currentJob.status)}
              <div className="flex-1">
                <p className="font-medium">{currentJob.status}</p>
                <Progress value={currentJob.progress || 0} className="mt-1" />
              </div>
              <Badge variant="outline">{currentJob.progress || 0}%</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">{currentJob.total_items || 0}</p><p className="text-xs text-muted-foreground">Total Items</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">{currentJob.matched_items || 0}</p><p className="text-xs text-muted-foreground">Matched</p></CardContent></Card>
              <Card><CardContent className="p-4"><p className="text-2xl font-bold">{currentJob.total_items > 0 ? Math.round(((currentJob.matched_items || 0) / currentJob.total_items) * 100) : 0}%</p><p className="text-xs text-muted-foreground">Success Rate</p></CardContent></Card>
            </div>
            <div ref={logContainerRef} className="bg-muted/50 p-4 rounded-lg h-48 overflow-y-auto font-mono text-xs space-y-1 border">
              {log.map((entry, index) => (<p key={index} className={entry.includes('✅') ? 'text-green-500' : entry.includes('❌') ? 'text-red-500' : 'text-muted-foreground'}>{entry}</p>))}
            </div>
          </CardContent>
        </Card>
      )}

      {matchResults.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Match Results</CardTitle>
                <CardDescription>Review and edit the matches. Changes are saved automatically.</CardDescription>
              </div>
              <Button onClick={exportToExcel} size="sm" variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EditableMatchResultsTable matchResults={matchResults} onUpdateResult={handleUpdateResult} onDeleteResult={handleDeleteResult} currency="GBP" />
          </CardContent>
        </Card>
      )}

      <ClientForm isOpen={showClientForm} onClose={() => setShowClientForm(false)} onSave={createClient} />
    </div>
  )
}
