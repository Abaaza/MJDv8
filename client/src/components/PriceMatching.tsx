import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExcelUpload } from "./ExcelUpload"
import { ClientForm } from "./ClientForm"
import { EditableMatchResultsTable } from "./EditableMatchResultsTable"
import { Download, Play, Zap, AlertCircle, CheckCircle, Edit, FileSpreadsheet, Plus, Trash2, Square, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useClients } from "@/hooks/useClients"
import { toast } from "sonner"
import { Tables } from "@/integrations/supabase/types"
import { notificationService } from "@/services/notificationService"
import { apiEndpoint } from '@/config/api'
import { PerformanceMonitor, usePerformanceMetrics } from './PerformanceMonitor'
import { useOptimizedMatchingJobs } from '@/hooks/useOptimizedQueries'
import { useOptimizedEventHandlers, useMemoryMonitor, useBackgroundTasks } from '@/hooks/usePerformanceOptimizations'


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
  match_mode?: string
}

export function PriceMatching() {
  const { user } = useAuth()
  const { clients, createClient } = useClients()
  const { logPerformance } = usePerformanceMetrics('PriceMatching')
  const { debounce, throttle } = useOptimizedEventHandlers()
  const memoryInfo = useMemoryMonitor('PriceMatching')
  const { addTask } = useBackgroundTasks()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clientNameInput, setClientNameInput] = useState('')
  const [showClientSuggestions, setShowClientSuggestions] = useState(false)
  const [showClientForm, setShowClientForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentJob, setCurrentJob] = useState<MatchingJob | null>(null)
  const [log, setLog] = useState<string[]>([])
  const [logs, setLogs] = useState<
    Array<{ message: string; timestamp: string; icon: string }>
  >([])
  const [displayedMessages, setDisplayedMessages] = useState<Set<string>>(
    new Set()
  )
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [matchingMethod, setMatchingMethod] = useState<'hybrid' | 'openai' | 'cohere' | 'local' | 'hybrid2'>('hybrid')
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Memoized filtered clients to prevent unnecessary re-renders
  const filteredClients = useMemo(() => {
    const startTime = performance.now()
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(clientNameInput.toLowerCase())
    )
    logPerformance('Client filtering', startTime)
    return filtered
  }, [clients, clientNameInput, logPerformance])


  // Auto-scroll log to bottom when new entries are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [log, logs])

  const addLogMessage = useCallback((message: string) => {
    console.log(`🟢 [addLogMessage] Adding message: "${message}"`);
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = { message, timestamp, icon: "" };

    setLogs((prev) => {
      console.log(`🟢 [addLogMessage] Current logs count: ${prev.length}`);
      
      // Prevent duplicate consecutive messages
      if (prev.length > 0 && prev[prev.length - 1].message === message) {
        console.log(`🟡 [addLogMessage] Duplicate message ignored: "${message}"`);
        return prev;
      }
      
      const newLogs = [...prev, logEntry];
      console.log(`🟢 [addLogMessage] New logs count: ${newLogs.length}`);
      return newLogs;
    });
  }, []);

  // Filter clients based on input
  const handleClientNameChange = useCallback((value: string) => {
    setClientNameInput(value)
    
    if (value.trim() === '') {
      setSelectedClientId('')
      setShowClientSuggestions(false)
      return
    }

    setShowClientSuggestions(filteredClients.length > 0)
    
    // Check if exact match exists
    const exactMatch = clients.find(client => 
      client.name.toLowerCase() === value.toLowerCase()
    )
    setSelectedClientId(exactMatch?.id || '')
  }, [clients, filteredClients.length])

  const handleClientSelect = useCallback((client: any) => {
    setClientNameInput(client.name)
    setSelectedClientId(client.id)
    setShowClientSuggestions(false)
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    if (!projectName) {
      const name = file.name.replace(/\.(xlsx|xls)$/i, '')
      setProjectName(name)
    }
  }, [projectName])

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
        
        // Refresh clients list to include the new client
        // filteredClients is computed from clients, so we don't need to update it directly
        
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
          // Create update object with only defined values
          const updateData: any = {}
          
          if (updates.matched_description !== undefined) {
            updateData.matched_description = updates.matched_description
          }
          if (updates.matched_rate !== undefined) {
            updateData.matched_rate = updates.matched_rate
          }
          if (updates.quantity !== undefined) {
            updateData.quantity = updates.quantity
          }
          if (updates.similarity_score !== undefined) {
            updateData.similarity_score = updates.similarity_score
          }
          if (updates.match_mode !== undefined) {
            updateData.match_mode = updates.match_mode
          }
          if (updates.matched_price_item_id !== undefined) {
            updateData.matched_price_item_id = updates.matched_price_item_id
          }
          if (updates.total_amount !== undefined) {
            updateData.total_amount = updates.total_amount
          }

          console.log(`🔄 [PRICE MATCH UPDATE] Updating result ${id}:`, updateData)

          const { error } = await supabase
            .from('match_results')
            .update(updateData)
            .eq('id', id)

          if (error) {
            console.error('Error updating result in database:', error)
          } else {
            console.log(`✅ [PRICE MATCH UPDATE] Successfully updated result ${id}`)
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

    setIsExporting(true)
    try {
      toast.info('Preparing Excel export...')
      
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
    } finally {
      setIsExporting(false)
    }
  }

  const clearPollInterval = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
      console.log('🧹 Cleared polling interval')
    }
  }, [])

  const handleStartMatching = async () => {
    console.log('🚀🚀🚀 UPDATED VERSION - handleStartMatching called, isProcessingRef.current:', isProcessingRef.current)
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
    console.log(`🧹 [DEBUG] Clearing all logs and state at job start`)
    setLog([])
    setLogs([])
    setDisplayedMessages(new Set())
    setMatchResults([])
    
    addLogMessage("Starting AI-powered price matching process...")

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
          client_id: clientId,
          // Initialize these fields to prevent null issues
          progress: 0,
          matched_items: 0,
          total_items: 0,
          confidence_score: 0,
          error_message: null
        })
        .select()
        .single()

      if (jobError) {
        throw new Error(`Failed to create job: ${jobError.message}`)
      }

      console.log('Job created successfully:', jobData.id)
      console.log('Job data received:', jobData)
      setCurrentJob(jobData)
      addLogMessage(`Created AI matching job: ${jobData.id}`)
      
      // Log the current job state for debugging
      console.log('Current job state after creation:', {
        id: jobData.id,
        status: jobData.status,
        progress: jobData.progress,
        created_at: jobData.created_at
      })

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

      addLogMessage(`Uploading ${selectedFile.name} to Vercel serverless...`)

      console.log('Calling Node.js backend...')
      console.log('API Endpoint:', apiEndpoint('/price-matching/process-base64'))
      console.log('Request payload size:', JSON.stringify({
        jobId: jobData.id,
        fileName: selectedFile.name,
        fileData: base64File.substring(0, 100) + '...[truncated]',
        matchingMethod: matchingMethod
      }).length, 'characters')

      console.log('🔄 [FETCH] About to start fetch call...')
      
      let response;
      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('🔄 [FETCH] Fetch timeout reached, aborting...')
          controller.abort();
        }, 30000); // 30 second timeout
        
        response = await fetch(apiEndpoint('/price-matching/process-base64'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId: jobData.id,
            fileName: selectedFile.name,
            fileData: base64File,
            matchingMethod: matchingMethod
          }),
          signal: controller.signal
        })
        
        clearTimeout(timeoutId);
        console.log('🔄 [FETCH] Fetch call completed successfully!')
      } catch (fetchError) {
        console.error('🔄 [FETCH] Fetch call failed with error:', fetchError)
        if (fetchError.name === 'AbortError') {
          addLogMessage('Request timed out after 30 seconds - starting polling anyway...')
          console.log('🔄 [FETCH] Starting polling despite timeout...')
          
          // Start polling immediately even if the initial request timed out
          console.log('Starting immediate polling after timeout for job:', jobData.id)
          startPolling(jobData.id)
          
          return; // Don't throw, just continue
        }
        throw fetchError
      }

      console.log('Backend response status:', response.status)
      console.log('Backend response statusText:', response.statusText)
      console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error('Backend response not OK, attempting to get error details...')
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const errorData = await response.json()
          console.error('Backend error data:', errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (parseError) {
          console.error('Could not parse error response as JSON:', parseError)
          const errorText = await response.text()
          console.error('Error response text:', errorText)
          errorMessage = errorText || errorMessage
        }
        throw new Error(`Backend processing failed: ${errorMessage}`)
      }

      console.log('Response OK, parsing JSON...')
      const processData = await response.json()
      console.log('Backend response data:', processData)

      console.log('Processing started successfully')
      const methodLabels = {
        'hybrid': 'hybrid AI matching (Cohere + OpenAI)',
        'openai': 'OpenAI matching',
        'cohere': 'Cohere matching', 
        'local': 'local string matching',
        'hybrid2': 'advanced hybrid matching'
      }
      addLogMessage(`Processing started on Vercel serverless (300s max) with ${methodLabels[matchingMethod]}`)
      addLogMessage("Waiting for server progress updates...")
      
      console.log('About to start polling for job:', jobData.id)
      console.log('Current environment - API URL:', apiEndpoint(''))
      console.log('Full polling URL will be:', apiEndpoint(`/price-matching/status/${jobData.id}`))
      
      // Start polling IMMEDIATELY for faster progress updates
      console.log('Starting immediate polling for job:', jobData.id)
      startPolling(jobData.id)
      console.log('Polling started successfully for job:', jobData.id)

    } catch (error) {
      console.error('Matching error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLogMessage(`Error: ${errorMessage}`)
      
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
      addLogMessage("Stopping job...")
      
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

      // Update job state to show stopped
      setCurrentJob(prev => prev ? { ...prev, status: 'stopped' } : null)

      addLogMessage("Job stopped by user")
      
      console.log(`🔍 [STOP DEBUG] Job ${currentJob.id} stopped, current status in state:`, currentJob?.status)
      
      toast.success('Job stopped successfully')

    } catch (error) {
      console.error('Stop error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLogMessage(`Stop error: ${errorMessage}`)
      toast.error(`Failed to stop job: ${errorMessage}`)
    }
  }

  const startPolling = useCallback((jobId: string) => {
    console.log(`🔄 Starting live polling for job: ${jobId}`)
    console.log(`🔄 API Base URL: ${apiEndpoint('')}`)
    console.log(`🔄 Full status URL: ${apiEndpoint(`/price-matching/status/${jobId}`)}`)
    
    // Clear any existing interval first
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    
    // Add initial immediate poll to test connectivity
    // Immediate first poll - no delay, and update the UI
    (async () => {
      console.log(`🔄 IMMEDIATE poll for job: ${jobId}`)
      try {
        const response = await fetch(apiEndpoint(`/price-matching/status/${jobId}`));
        console.log(`🔄 Immediate poll response: ${response.status} ${response.statusText}`);
        if (response.ok) {
          const job = await response.json();
          console.log(`🔄 Immediate poll data:`, job);
          
          // Update UI immediately
          setCurrentJob(job);
          
          // Add initial progress message
          if (job.progress > 0 && !displayedMessages.has(`Progress: ${job.progress}%`)) {
            addLogMessage(`Progress: ${job.progress}%`);
            setDisplayedMessages((prev) => new Set([...prev, `Progress: ${job.progress}%`]));
          }
        }
      } catch (error) {
        console.error(`🔄 Immediate poll error:`, error);
      }
    })();
    
    const intervalId = setInterval(async () => {
      try {
        const apiUrl = apiEndpoint(`/price-matching/status/${jobId}`);
        console.log(`🔗 [POLLING] Calling API:`, apiUrl);
        
        const response = await fetch(apiUrl);
        
        console.log(`📡 [POLLING] Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          console.error(`❌ Polling failed: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error(`❌ Error response body:`, errorText);
          
          if (response.status === 404) {
            addLogMessage(`Job ${jobId} not found in database - may have been deleted`);
            clearPollInterval();
            setIsProcessing(false);
            isProcessingRef.current = false;
          }
          return;
        }
        
        const job = await response.json();

        // ENHANCED DEBUG LOGGING
        console.log(`📊 RAW API Response:`, job);
        console.log(`📊 Polling update for job ${jobId}:`, {
          status: job?.status,
          progress: job?.progress,
          message: job?.error_message,
          matched: job?.matched_items,
          total: job?.total_items,
          response_keys: Object.keys(job || {}),
          created_at: job?.created_at,
          updated_at: job?.updated_at
        });

        if (!job) {
          console.error(`❌ No job data received for ${jobId}`);
          addLogMessage(`Error: No job data found for job ${jobId}`);
          return;
        }

        if (job.error) {
          console.error(`❌ API returned error:`, job.error);
          addLogMessage(`API Error: ${job.error}`);
          return;
        }

        // Update progress counters - this should trigger UI updates
        setCurrentJob(job);
        console.log(`📊 Updated currentJob state with:`, {
          progress: job.progress,
          matched_items: job.matched_items,
          total_items: job.total_items,
          status: job.status
        });

        // Add server message to logs (with simple deduplication)
        const serverMessage = job.error_message;
        console.log(`🔍 [DEBUG] Server message received: "${serverMessage}"`);
        console.log(`🔍 [DEBUG] Current displayed messages:`, Array.from(displayedMessages));
        
        if (serverMessage && 
            serverMessage !== 'null' && 
            serverMessage.trim() &&
            !displayedMessages.has(serverMessage)) {
          
          console.log(`✅ [DEBUG] Adding server message to logs: "${serverMessage}"`);
          addLogMessage(serverMessage);
          setDisplayedMessages((prev) => {
            const newSet = new Set([...prev, serverMessage]);
            console.log(`🔍 [DEBUG] Updated displayed messages:`, Array.from(newSet));
            return newSet;
          });
        } else {
          console.log(`❌ [DEBUG] Message filtered out. Reasons:`);
          console.log(`   - Empty/null: ${!serverMessage || serverMessage === 'null'}`);
          console.log(`   - Already displayed: ${displayedMessages.has(serverMessage)}`);
        }

        // Handle final states
        if (job.status === 'completed') {
          const successRate = job.total_items > 0 
            ? Math.round((job.matched_items / job.total_items) * 100)
            : 0;
          
          addLogMessage("Processing completed successfully!");
          addLogMessage(`Final Results: ${job.matched_items}/${job.total_items} items matched (${successRate}% success rate)`);
          addLogMessage(`Average confidence score: ${job.confidence_score || 0}%`);
          
          setIsProcessing(false);
          isProcessingRef.current = false;
          clearPollInterval();
          
          await loadMatchResults(jobId);
          
          if (job.matched_items > 0) {
            toast.success(`Processing completed! Matched ${job.matched_items} items with ${successRate}% success rate.`);
          } else {
            toast.info(`Processing completed with AI matching.`);
          }
        } else if (job.status === 'failed') {
          const errorDetails = job.error_message || 'Unknown error';
          addLogMessage(`Failed: ${errorDetails}`);
          setIsProcessing(false);
          isProcessingRef.current = false;
          clearPollInterval();
          
          toast.error(`Processing failed: ${errorDetails}`);
        } else if (job.status === 'cancelled' || job.status === 'stopped') {
          addLogMessage(`Job was ${job.status}`);
          setIsProcessing(false);
          isProcessingRef.current = false;
          clearPollInterval();
          
          toast.info(`Job was ${job.status}`);
        } else if (job.status === 'processing') {
          console.log(`🔄 Job processing - Progress: ${job.progress}%, Message: "${job.error_message}"`);
          // Add progress message to logs for processing status
          if (job.progress > 0 && !displayedMessages.has(`Progress: ${job.progress}%`)) {
            addLogMessage(`Progress: ${job.progress}%`);
            setDisplayedMessages((prev) => new Set([...prev, `Progress: ${job.progress}%`]));
          }
        } else if (job.status === 'pending') {
          console.log(`⏳ Job pending - waiting to start`);
        } else {
          console.log(`🔄 Job status: ${job.status}`);
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        addLogMessage(`Polling error: ${error.message}`);
      }
    }, 1000); // Poll every 1 second for Vercel optimization
    
    pollIntervalRef.current = intervalId;
    console.log(`🔄 Polling interval set with ID:`, intervalId);
    console.log(`🔄 pollIntervalRef.current is now:`, pollIntervalRef.current);
  }, [addLogMessage, setCurrentJob, setDisplayedMessages, displayedMessages, clearPollInterval])

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
        addLogMessage(`Could not load results from database: ${error.message}`)
        
        // Show a message that results need to be downloaded
        toast.info('Results processing completed! Use the download button to get your Excel file with matched results.')
        return
      }

      console.log('Match results loaded:', data?.length || 0, 'results')

      if (!data || data.length === 0) {
        addLogMessage("No results in database - Excel file is ready for download")
        
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
        section_header: result.section_header || null,
        match_mode: result.match_mode || 'ai'
      })) || []

      console.log('Transformed results:', resultsWithUnits.length)
      setMatchResults(resultsWithUnits)
      
      addLogMessage(`Loaded ${resultsWithUnits.length} results for review`)
      
    } catch (error) {
      console.error('Error loading match results:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLogMessage(`Error loading results: ${errorMessage}`)
      
      // Show a message that results need to be downloaded
      toast.info('Results processing completed! Use the download button to get your Excel file with matched results.')
    }
  }

  const downloadResults = async () => {
    if (!currentJob || currentJob.status !== 'completed') {
      toast.error('No completed results to download')
      return
    }

    setIsExporting(true)
    try {
      addLogMessage("Downloading results...")
      
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

      addLogMessage("Results downloaded successfully")
      toast.success('Results downloaded successfully')

    } catch (error) {
      console.error('Download error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addLogMessage(`Download error: ${errorMessage}`)
      toast.error('Failed to download results')
    } finally {
      setIsExporting(false)
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
    <>
      <PerformanceMonitor componentName="PriceMatching" />
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
            <Label>Matching Method</Label>
            <Select 
              value={matchingMethod} 
              onValueChange={(value: 'hybrid' | 'openai' | 'cohere' | 'local' | 'hybrid2') => setMatchingMethod(value)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select matching method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hybrid">Hybrid AI (Cohere + OpenAI)</SelectItem>
                <SelectItem value="openai">OpenAI Only</SelectItem>
                <SelectItem value="cohere">Cohere Only</SelectItem>
                <SelectItem value="local">Local Matching</SelectItem>
                <SelectItem value="hybrid2">Advanced Hybrid (Multi-Technique)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>BoQ File</Label>
            <ExcelUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
          </div>
          <Button onClick={handleStartMatching} disabled={!selectedFile || !projectName.trim() || !clientNameInput.trim() || isProcessing} size="lg">
            <Play className="h-5 w-5 mr-2" />
            {isProcessing ? 'Processing...' : matchingMethod === 'local' ? 'Start Local Matching' : 'Start AI Matching'}
          </Button>
        </CardContent>
      </Card>

      {(isProcessing || (currentJob && (currentJob.status === 'cancelled' || currentJob.status === 'stopped' || currentJob.status === 'failed'))) && currentJob && (
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
            <div className="flex items-center gap-4 mb-4">
              {getStatusIcon(currentJob.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-lg capitalize">{currentJob.status}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                      {currentJob.progress || 0}%
                    </Badge>
                    {currentJob.progress >= 100 ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Complete</span>
                      </div>
                    ) : currentJob.status === 'processing' ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Processing</span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="relative">
                  <Progress value={currentJob.progress || 0} className="h-3 bg-slate-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {currentJob.progress >= 25 ? `${currentJob.progress}%` : ''}
                    </span>
                  </div>
                </div>
                {/* Progress phase indicator */}
                <div className="mt-2 text-sm text-muted-foreground">
                  {currentJob.progress >= 95 ? '🚀 Finalizing results...' :
                   currentJob.progress >= 85 ? '⚡ Generating output...' :
                   currentJob.progress >= 70 ? '🔄 Processing matches...' :
                   currentJob.progress >= 50 ? '🧠 Analyzing embeddings...' :
                   currentJob.progress >= 30 ? '🔍 Computing similarities...' :
                   currentJob.progress >= 15 ? '📊 Loading price list...' :
                   currentJob.progress >= 5 ? '📄 Parsing input file...' :
                   '🎯 Initializing...'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Items</p>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">{currentJob.total_items || 0}</p>
                  <div className="text-xs text-blue-600 mt-1">
                    {currentJob.total_items > 0 ? 'Ready for processing' : 'Awaiting data'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Matched</p>
                  </div>
                  <p className="text-3xl font-bold text-green-900">{currentJob.matched_items || 0}</p>
                  <div className="text-xs text-green-600 mt-1">
                    {currentJob.matched_items > 0 ? 'Successful matches' : 'Processing...'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-purple-600" />
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Success Rate</p>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {currentJob.total_items > 0 ? Math.round(((currentJob.matched_items || 0) / currentJob.total_items) * 100) : 0}%
                  </p>
                  <div className="text-xs text-purple-600 mt-1">
                    {currentJob.total_items > 0 ? 
                      (Math.round(((currentJob.matched_items || 0) / currentJob.total_items) * 100) >= 80 ? 'Excellent!' :
                       Math.round(((currentJob.matched_items || 0) / currentJob.total_items) * 100) >= 60 ? 'Good' :
                       Math.round(((currentJob.matched_items || 0) / currentJob.total_items) * 100) >= 40 ? 'Fair' : 'Processing...') 
                      : 'Calculating...'}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div ref={logContainerRef} className="bg-gradient-to-b from-slate-900 to-slate-800 p-4 rounded-lg h-64 overflow-y-auto font-mono text-xs space-y-2 border border-slate-600 shadow-inner">
              {(() => {
                console.log(`🎨 [RENDER] Rendering ${logs.length} log entries:`, logs.map(l => l.message));
                return null;
              })()}
              
              {/* Enhanced log header */}
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold text-xs">LIVE PROCESSING LOG</span>
                </div>
                <div className="text-slate-400 text-xs">
                  {logs.length} entries
                </div>
              </div>

              {/* Enhanced log entries */}
              {logs.map((logEntry, index) => {
                const getModelColor = (message) => {
                  if (message.includes('🧠') || message.includes('COHERE')) return 'text-purple-400'
                  if (message.includes('🤖') || message.includes('OPENAI')) return 'text-blue-400'
                  if (message.includes('💻') || message.includes('LOCAL')) return 'text-green-400'
                  if (message.includes('🌟') || message.includes('HYBRID')) return 'text-yellow-400'
                  if (message.includes('⚡') || message.includes('ADVANCED')) return 'text-red-400'
                  return 'text-slate-300'
                }

                const getProgressBar = (message) => {
                  const match = message.match(/\[(\d+)%\]/)
                  if (match) {
                    const progress = parseInt(match[1])
                    const filled = Math.round((progress / 100) * 20)
                    const empty = 20 - filled
                    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${progress}%`
                  }
                  return null
                }

                const modelColor = getModelColor(logEntry.message)
                const progressBar = getProgressBar(logEntry.message)
                const isImportant = logEntry.message.includes('***') || logEntry.message.includes('COMPLETE') || logEntry.message.includes('ERROR')
                
                return (
                  <div 
                    key={index} 
                    className={`transition-all duration-300 ${
                      isImportant ? 'bg-slate-700/50 border-l-2 border-yellow-400 pl-2' : ''
                    } ${index === logs.length - 1 ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 text-[10px] mt-0.5 font-mono min-w-[60px]">
                        {logEntry.timestamp}
                      </span>
                      <div className="flex-1">
                        <div className={`${modelColor} font-medium leading-relaxed`}>
                          {logEntry.message}
                        </div>
                        {progressBar && (
                          <div className="text-slate-400 text-[10px] mt-1 font-mono">
                            {progressBar}
                          </div>
                        )}
                      </div>
                      {/* Status indicator */}
                      <div className="w-1 h-1 rounded-full bg-slate-500 mt-2 flex-shrink-0"></div>
                    </div>
                  </div>
                )
              })}
              
              {logs.length === 0 && (
                <div className="text-slate-400 text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-slate-600 rounded-full animate-spin border-t-blue-400"></div>
                    <span>Initializing AI processing engines...</span>
                    <div className="text-[10px] text-slate-500">Waiting for log messages</div>
                  </div>
                </div>
              )}
              
              {/* Scroll indicator */}
              {logs.length > 10 && (
                <div className="absolute bottom-2 right-2 text-slate-500 text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-600">
                  Scroll for more ↓
                </div>
              )}
            </div>
            
          </CardContent>
        </Card>
      )}

      {matchResults.length > 0 && (
        <Dialog open={true} onOpenChange={() => setMatchResults([])}>
          <DialogContent className="max-w-7xl max-h-[90vh]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>Match Results</DialogTitle>
                  <DialogDescription>Review and edit the matches. Changes are saved automatically.</DialogDescription>
                </div>
                <Button onClick={exportToExcel} size="sm" variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Results
                    </>
                  )}
                </Button>
              </div>
            </DialogHeader>
            <div className="overflow-auto max-h-[70vh]">
              <EditableMatchResultsTable
                matchResults={matchResults}
                onUpdateResult={handleUpdateResult}
                onDeleteResult={handleDeleteResult}
                currency="GBP"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ClientForm isOpen={showClientForm} onClose={() => setShowClientForm(false)} onSave={createClient} />
      </div>
    </>
  )
}
