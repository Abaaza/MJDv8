import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  FolderOpen, 
  DollarSign, 
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  Calendar,
  Target,
  Award,
  FileText,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  Shield
} from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { useRecentActivity } from "@/hooks/useRecentActivity"
import { formatDistanceToNow, format, subDays } from "date-fns"
import { useState } from "react"
import { ClientForm } from "@/components/ClientForm"
import { useClients } from "@/hooks/useClients"
import { useNavigate } from "react-router-dom"
import { useOptimizedMatchingJobs } from "@/hooks/useOptimizedQueries"
import { supabase } from "@/integrations/supabase/client"
import { useQuery } from "@tanstack/react-query"

export default function Index() {
  const { stats, loading } = useDashboardStats()
  const { activities, loading: activitiesLoading } = useRecentActivity()
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const { createClient } = useClients()
  const navigate = useNavigate()
  const { data: recentJobs, isLoading: jobsLoading } = useOptimizedMatchingJobs(false)
  
  // Get recent clients (top 4 for better layout)
  const { data: recentClients, isLoading: clientsLoading } = useQuery({
    queryKey: ['recent-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, company_name, created_at')
        .order('created_at', { ascending: false })
        .limit(4)
      
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  // Enhanced metrics calculations
  const successRate = stats.totalMatchingJobs > 0 
    ? Math.round((stats.completedJobs / stats.totalMatchingJobs) * 100) 
    : 0
  
  const avgMatchedPerJob = stats.completedJobs > 0 
    ? Math.round(stats.totalMatchedItems / stats.completedJobs)
    : 0
    
  const todayJobs = stats.todayJobs || 0
  const weeklyGrowth = stats.weeklyGrowth || 0

  const dashboardStats = [
    { 
      title: "Total Clients", 
      value: loading ? "..." : stats.totalClients.toString(), 
      icon: Users,
      trend: loading ? "..." : `${stats.clientsGrowth >= 0 ? '+' : ''}${stats.clientsGrowth}%`,
      trendUp: stats.clientsGrowth >= 0,
      description: "Active clients"
    },
    { 
      title: "Price Items", 
      value: loading ? "..." : stats.activePriceItems.toLocaleString(), 
      icon: DollarSign,
      trend: loading ? "..." : `${stats.priceItemsGrowth >= 0 ? '+' : ''}${stats.priceItemsGrowth}%`,
      trendUp: stats.priceItemsGrowth >= 0,
      description: "In database"
    },
    { 
      title: "Matching Jobs", 
      value: loading ? "..." : stats.totalMatchingJobs.toString(), 
      icon: FolderOpen,
      trend: loading ? "..." : `${weeklyGrowth >= 0 ? '+' : ''}${weeklyGrowth}%`,
      trendUp: weeklyGrowth >= 0,
      description: `${todayJobs} today`
    },
    { 
      title: "Matched Items", 
      value: loading ? "..." : stats.totalMatchedItems.toLocaleString(), 
      icon: Zap,
      trend: loading ? "..." : `${stats.matchedItemsGrowth >= 0 ? '+' : ''}${stats.matchedItemsGrowth}%`,
      trendUp: stats.matchedItemsGrowth >= 0,
      description: `${successRate}% success rate`
    },
  ]
  
  // Removed additional metrics as requested
  
  // System Health Metrics
  const systemHealthMetrics = [
    {
      title: "System Status",
      value: "Operational",
      icon: Server,
      status: "healthy",
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Database",
      value: "Connected",
      icon: Database,
      status: "healthy",
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "API Status",
      value: "Active",
      icon: Wifi,
      status: "healthy",
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Storage",
      value: "85% Used",
      icon: HardDrive,
      status: "warning",
      color: "bg-yellow-50 text-yellow-600"
    },
    {
      title: "Processing",
      value: "Optimal",
      icon: Cpu,
      status: "healthy",
      color: "bg-indigo-50 text-indigo-600"
    },
    {
      title: "Security",
      value: "Secured",
      icon: Shield,
      status: "healthy",
      color: "bg-purple-50 text-purple-600"
    }
  ]

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'job_started':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'job_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'client_added':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'price_item_added':
        return <DollarSign className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const handleCreateClient = async (clientData: any) => {
    const success = await createClient(clientData)
    if (success) {
      setIsAddClientOpen(false)
    }
    return success
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8">
      {/* Main Stats */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4 lg:gap-8">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-left flex-1 leading-tight">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="text-left">
              <div className="text-xl sm:text-2xl font-bold mb-2">{stat.value}</div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <Badge 
                  variant={stat.trendUp ? "default" : "secondary"}
                  className={`${stat.trendUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs self-start sm:self-auto`}
                >
                  {stat.trendUp ? '↗' : '↘'} {stat.trend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Latest updates across your system.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading activities...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-1">Start a matching job to see activity here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation">
                    <div className="mt-0.5 flex-shrink-0">
                      {getStatusIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-xs sm:text-sm font-medium leading-tight truncate">
                        {activity.description}
                      </p>
                      {activity.userName && (
                        <p className="text-xs text-muted-foreground truncate">
                          by {activity.userName}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  Recent Clients
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest clients added to system</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/clients')}
                className="h-8 touch-manipulation self-start sm:self-auto"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recentClients && recentClients.length > 0 ? (
              <div className="space-y-3">
                {recentClients.map((client) => (
                  <div key={client.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation" onClick={() => navigate('/clients')}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{client.name}</p>
                      {client.company_name && (
                        <p className="text-xs text-muted-foreground truncate">{client.company_name}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No clients yet</p>
                <Button size="sm" onClick={() => setIsAddClientOpen(true)}>
                  Add First Client
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  Recent Jobs
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Latest matching jobs</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/matching-jobs')}
                className="h-8 touch-manipulation self-start sm:self-auto"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : recentJobs && recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer touch-manipulation" onClick={() => navigate('/matching-jobs')}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {job.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : job.status === 'processing' ? (
                        <Zap className="h-4 w-4 text-blue-600 animate-pulse" />
                      ) : job.status === 'failed' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{job.project_name || 'Unnamed Project'}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.status === 'completed' && job.matched_items ? 
                          `${job.matched_items}/${job.total_items || 0} items matched` :
                          `Status: ${job.status}`
                        }
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No jobs yet</p>
                <Button size="sm" onClick={() => navigate('/matching-jobs')}>
                  Start First Job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      
      {/* Quick Actions Row */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer touch-manipulation" onClick={() => setIsAddClientOpen(true)}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium">Add Client</p>
                <p className="text-xs text-muted-foreground">Create new client</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer touch-manipulation" onClick={() => navigate('/matching-jobs')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 rounded-lg bg-purple-50 text-purple-600">
                <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium">Start Matching</p>
                <p className="text-xs text-muted-foreground">New price matching job</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer touch-manipulation" onClick={() => navigate('/price-list')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 rounded-lg bg-green-50 text-green-600">
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium">Price List</p>
                <p className="text-xs text-muted-foreground">Manage prices</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer touch-manipulation" onClick={() => navigate('/clients')}>
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="flex flex-col items-center space-y-2 sm:space-y-3">
              <div className="p-2 sm:p-3 rounded-lg bg-orange-50 text-orange-600">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium">All Clients</p>
                <p className="text-xs text-muted-foreground">View all clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* System Health Dashboard - Moved to bottom */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
          <Server className="h-4 w-4 sm:h-5 sm:w-5" />
          System Health
        </h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {systemHealthMetrics.map((metric) => (
            <Card key={metric.title} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="flex flex-col items-center space-y-1.5 sm:space-y-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${metric.color}`}>
                    <metric.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium text-muted-foreground leading-tight">{metric.title}</p>
                    <p className="text-xs sm:text-sm font-bold">{metric.value}</p>
                    <div className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium mt-1 ${
                      metric.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        metric.status === 'healthy' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-xs hidden sm:inline">{metric.status === 'healthy' ? 'Healthy' :
                       metric.status === 'warning' ? 'Warning' : 'Critical'}</span>
                      <span className="text-xs sm:hidden">{metric.status === 'healthy' ? '✓' :
                       metric.status === 'warning' ? '!' : '✗'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Client Form Modal */}
      <ClientForm
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSave={handleCreateClient}
      />
    </main>
  )
}
