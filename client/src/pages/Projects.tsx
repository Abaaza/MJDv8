import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Download, RefreshCw, Clock, CheckCircle, AlertCircle, Zap, FileSpreadsheet, Edit, Square, Loader2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Tables } from "@/integrations/supabase/types"
import { toast } from "sonner"
import { EditableMatchResultsTable } from "@/components/EditableMatchResultsTable"
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
  match_mode?: string
}

export default function Projects() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<MatchingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingResults, setLoadingResults] = useState(false)
  const [editingJob, setEditingJob] = useState<MatchingJob | null>(null)
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [exportingJobs, setExportingJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchJobs()
  }, [user])

  // Auto-refresh jobs every 3 seconds to stay in sync with processing status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchJobs()
    }, 3000) // Refresh every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_matching_jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching jobs:', error)
        return
      }

      console.log('📊 Fetched jobs:', data?.map(job => ({ id: job.id, status: job.status, project_name: job.project_name })))
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMatchResults = async (jobId: string) => {
    setLoadingResults(true)
    try {
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
        toast.error('Failed to load match results')
        return
      }

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
        match_mode: result.match_mode
      })) || []

      setMatchResults(resultsWithUnits)
    } catch (error) {
      console.error('Error loading match results:', error)
      toast.error('Failed to load match results')
    } finally {
      setLoadingResults(false)
    }
  }

  const handleEditJob = async (job: MatchingJob) => {
    setEditingJob(job)
    await loadMatchResults(job.id)
  }

  const handleUpdateResult = async (id: string, updates: Partial<MatchResult>) => {
    setMatchResults(prev => prev.map(result => 
      result.id === id ? { ...result, ...updates } : result
    ))

    if (editingJob) {
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

          console.log(`🔄 [DATABASE UPDATE] Updating result ${id}:`, updateData)

          const { error } = await supabase
            .from('match_results')
            .update(updateData)
            .eq('id', id)

          if (error) {
            console.error('Error updating result in database:', error)
            toast.error(`Failed to update result: ${error.message}`)
          } else {
            console.log(`✅ [DATABASE UPDATE] Successfully updated result ${id}`)
            // Only show success toast for manual operations, not automatic saves
            if (updates.match_mode || updates.matched_description) {
              toast.success('Result updated successfully')
            }
          }
        }
      } catch (error) {
        console.error('Error updating result:', error)
        toast.error('Failed to update result')
      }
    }
  }

  const handleDeleteResult = async (id: string) => {
    const result = matchResults.find(r => r.id === id)
    
    setMatchResults(prev => prev.filter(result => result.id !== id))

    if (editingJob && result) {
      try {
        const { error } = await supabase
          .from('match_results')
          .delete()
          .eq('job_id', editingJob.id)
          .eq('row_number', result.row_number)

        if (error) {
          console.error('Error deleting result from database:', error)
          toast.error('Failed to delete result')
        } else {
          toast.success('Result deleted successfully')
        }
      } catch (error) {
        console.error('Error deleting result:', error)
        toast.error('Failed to delete result')
      }
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.original_filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "processing": return "bg-blue-100 text-blue-800"
      case "failed": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "stopped": return "bg-orange-100 text-orange-800"
      case "cancelled": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing": return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "failed": return <AlertCircle className="h-4 w-4 text-red-600" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />
      case "stopped": return <Square className="h-4 w-4 text-orange-600" />
      case "cancelled": return <Square className="h-4 w-4 text-orange-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handleStopJob = async (jobId: string, projectName: string) => {
    try {
      const response = await fetch(apiEndpoint(`/price-matching/cancel/${jobId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Stop failed: ${errorData.message || errorData.error}`)
      }

      toast.success(`Job "${projectName}" stopped successfully`)
      
      // Refresh the jobs list to show updated status
      await fetchJobs()

    } catch (error) {
      console.error('Stop error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to stop job: ${errorMessage}`)
    }
  }

  const downloadJobResults = async (jobId: string, projectName: string) => {
    setExportingJobs(prev => new Set(prev).add(jobId))
    try {
      // First, get all match results for this job to send to export endpoint
      const { data: matchResultsData, error: matchError } = await supabase
        .from('match_results')
        .select(`
          *,
          price_items:matched_price_item_id(unit)
        `)
        .eq('job_id', jobId)
        .order('row_number')

      if (matchError) {
        console.error('Error loading match results:', matchError)
        toast.error('Failed to load match results')
        return
      }

      // Transform the results to match the expected format
      const matchResults = matchResultsData?.map(result => ({
        id: result.id,
        job_id: result.job_id,
        sheet_name: result.sheet_name,
        row_number: result.row_number,
        original_description: result.original_description,
        matched_description: result.matched_description,
        matched_rate: result.matched_rate,
        similarity_score: result.similarity_score,
        quantity: result.quantity,
        unit: result.price_items?.unit || '',
        total_amount: (result.quantity || 0) * (result.matched_rate || 0),
        matched_price_item_id: result.matched_price_item_id,
        match_mode: result.match_mode
      })) || []

      // Use the export endpoint which creates a properly formatted Excel file
      const response = await fetch(apiEndpoint(`/price-matching/export/${jobId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          matchResults: []
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
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      const fileName = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `${projectName}_Results.xlsx`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Results exported successfully!')

    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export results')
    } finally {
      setExportingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(jobId)
        return newSet
      })
    }
  }

  return (
    <div className="pt-[10px] px-6 pb-6 space-y-3 w-full">
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold mt-0">Matched Jobs</h1>
          <p className="text-muted-foreground">View and manage your completed price matching jobs</p>
        </div>
        <Button variant="outline" onClick={fetchJobs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground">
              {jobs.filter(j => j.status === 'completed').length} completed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.filter(j => j.confidence_score).length > 0 
                ? Math.round(jobs.filter(j => j.confidence_score).reduce((sum, j) => sum + (j.confidence_score || 0), 0) / jobs.filter(j => j.confidence_score).length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">from completed jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Matched</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.reduce((sum, j) => sum + (j.matched_items || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">total items processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobs.length > 0 
                ? Math.round((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">jobs completed successfully</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <CardTitle>Matching Jobs History</CardTitle>
              <CardDescription>Track and download results from your price matching jobs</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No matching jobs found. Create your first job in the "Price Matcher" section.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left min-w-[150px]">Project</TableHead>
                  <TableHead className="text-left min-w-[120px]">File</TableHead>
                  <TableHead className="text-left min-w-[100px]">Status</TableHead>
                  <TableHead className="text-left min-w-[80px]">Progress</TableHead>
                  <TableHead className="text-left min-w-[100px]">Created</TableHead>
                  <TableHead className="text-left min-w-[100px]">Confidence</TableHead>
                  <TableHead className="text-left min-w-[120px]">Matches</TableHead>
                  <TableHead className="text-left min-w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium text-left min-w-[150px]">
                      <div className="truncate max-w-[140px]" title={job.project_name}>
                        {job.project_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-left min-w-[120px]">
                      <div className="truncate max-w-[110px]" title={job.original_filename}>
                        {job.original_filename}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      <span className="text-xs text-muted-foreground">{job.progress || 0}%</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-left">
                      {formatDate(job.created_at)}
                    </TableCell>
                    <TableCell className="text-left">
                      {job.confidence_score ? (
                        <Badge variant={job.confidence_score > 90 ? "default" : "secondary"}>
                          {job.confidence_score}%
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-left">
                      {job.matched_items ? (
                        <div className="text-sm">
                          <div>{job.matched_items} matched</div>
                          {job.total_items && (
                            <div className="text-muted-foreground">
                              of {job.total_items} total
                            </div>
                          )}
                        </div>
                      ) : "-"}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center space-x-1">
                        {job.status === "completed" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditJob(job)}
                              title="Edit Results"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => downloadJobResults(job.id, job.project_name)}
                              title="Download Results"
                              disabled={exportingJobs.has(job.id)}
                            >
                              {exportingJobs.has(job.id) ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                  Exporting...
                                </div>
                              ) : (
                                <>
                                  <Download className="h-4 w-4" />
                                  Export
                                </>
                              )}
                            </Button>
                          </>
                        )}
                        {(job.status === "processing" || job.status === "pending") && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleStopJob(job.id, job.project_name)}
                            title="Stop Process"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={fetchJobs} 
                          title="Refresh"
                          className="h-8 w-8 p-0 touch-manipulation"
                          aria-label="Refresh jobs"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Results Modal */}
      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="w-full max-w-[95vw] sm:max-w-7xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base sm:text-lg">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">Edit Match Results</span>
              </div>
              <span className="text-sm sm:text-base text-muted-foreground truncate">
                {editingJob?.project_name}
              </span>
            </DialogTitle>
            <DialogDescription className="flex flex-col sm:flex-row sm:items-center gap-2 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Changes are automatically saved as you edit. You can close this dialog anytime.</span>
            </DialogDescription>
          </DialogHeader>
          {loadingResults ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center justify-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin" />
                <span>Loading results...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      How to use this editor:
                    </h4>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                      <ul className="list-disc list-inside space-y-1">
                        <li><strong>AI Match:</strong> Uses the original AI-generated match</li>
                        <li><strong>Local Match:</strong> Searches your price list for better matches</li>
                        <li><strong>Manual Match:</strong> Lets you select any item from your price list</li>
                        <li><strong>Edit fields:</strong> Click any quantity or rate field to modify values</li>
                        <li><strong>All changes save automatically</strong> - no need to click save</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <EditableMatchResultsTable
                matchResults={matchResults}
                onUpdateResult={handleUpdateResult}
                onDeleteResult={handleDeleteResult}
                currency="GBP"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
