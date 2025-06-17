import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Download, RefreshCw, Clock, CheckCircle, AlertCircle, Zap, FileSpreadsheet, Edit } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Tables } from "@/integrations/supabase/types"
import { toast } from "sonner"
import { EditableMatchResultsTable } from "@/components/EditableMatchResultsTable"

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

export default function Projects() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<MatchingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingJob, setEditingJob] = useState<MatchingJob | null>(null)
  const [matchResults, setMatchResults] = useState<MatchResult[]>([])
  const [loadingResults, setLoadingResults] = useState(false)

  useEffect(() => {
    if (user) {
      fetchJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_matching_jobs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching jobs:', error)
        return
      }

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
        matched_price_item_id: result.matched_price_item_id
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
          const { error } = await supabase
            .from('match_results')
            .update({
              matched_description: updates.matched_description || result.matched_description,
              matched_rate: updates.matched_rate || result.matched_rate,
              quantity: updates.quantity || result.quantity,
              similarity_score: updates.similarity_score || result.similarity_score
            })
            .eq('job_id', editingJob.id)
            .eq('row_number', result.row_number)

          if (error) {
            console.error('Error updating result in database:', error)
            toast.error('Failed to update result')
          } else {
            toast.success('Result updated successfully')
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
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing": return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case "failed": return <AlertCircle className="h-4 w-4 text-red-600" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const downloadJobResults = async (jobId: string, projectName: string) => {
    try {
      // Download from Node.js backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/price-matching/download/${jobId}`)
      
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
        : `${projectName}_Results.xlsx`
      
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Results downloaded successfully!')

    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download results')
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Project</TableHead>
                  <TableHead className="text-left">File</TableHead>
                  <TableHead className="text-left">Status</TableHead>
                  <TableHead className="text-left">Progress</TableHead>
                  <TableHead className="text-left">Created</TableHead>
                  <TableHead className="text-left">Confidence</TableHead>
                  <TableHead className="text-left">Matches</TableHead>
                  <TableHead className="text-left w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium text-left">{job.project_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground text-left">
                      {job.original_filename}
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
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="sm" onClick={fetchJobs} title="Refresh">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Results Modal */}
      <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Match Results - {editingJob?.project_name}</DialogTitle>
            <DialogDescription>
              Review and edit the AI matches. Use radio buttons to switch between Cohere AI matches and manual search.
            </DialogDescription>
          </DialogHeader>
          {loadingResults ? (
            <div className="text-center py-8">Loading results...</div>
          ) : (
            <EditableMatchResultsTable
              matchResults={matchResults}
              onUpdateResult={handleUpdateResult}
              onDeleteResult={handleDeleteResult}
              currency="GBP"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
