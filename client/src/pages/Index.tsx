import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  FolderOpen, 
  DollarSign, 
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { useRecentActivity } from "@/hooks/useRecentActivity"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { ClientForm } from "@/components/ClientForm"
import { useClients } from "@/hooks/useClients"
import { useNavigate } from "react-router-dom"

export default function Index() {
  const { stats, loading } = useDashboardStats()
  const { activities, loading: activitiesLoading } = useRecentActivity()
  const [isAddClientOpen, setIsAddClientOpen] = useState(false)
  const { createClient } = useClients()
  const navigate = useNavigate()

  const dashboardStats = [
    { 
      title: "Total Clients", 
      value: loading ? "..." : stats.totalClients.toString(), 
      change: "+2", 
      icon: Users, 
      color: "text-blue-600" 
    },
    { 
      title: "Price Items", 
      value: loading ? "..." : stats.activePriceItems.toLocaleString(), 
      change: "+156", 
      icon: DollarSign, 
      color: "text-yellow-600" 
    },
    { 
      title: "Matching Jobs", 
      value: loading ? "..." : stats.totalMatchingJobs.toString(), 
      change: "+3", 
      icon: FolderOpen, 
      color: "text-green-600" 
    },
    { 
      title: "Matched Items", 
      value: loading ? "..." : stats.totalMatchedItems.toLocaleString(), 
      change: "+12", 
      icon: Zap, 
      color: "text-purple-600" 
    },
  ]

  const getStatusIcon = (type: string) => {
    if (type === 'job_started') {
      return <Zap className="h-4 w-4 text-blue-600" />
    }
    if (type === 'job_completed' || type === 'client_added' || type === 'price_item_added') {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    }
    return <Clock className="h-4 w-4 text-yellow-600" />
  }

  const handleCreateClient = async (clientData: any) => {
    const success = await createClient(clientData)
    if (success) {
      setIsAddClientOpen(false)
    }
    return success
  }

  return (
    <div className="pt-[10px] px-6 pb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold mt-0">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your construction CRM</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activitiesLoading ? (
              <div className="text-center text-muted-foreground py-4">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No recent activity</div>
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col space-y-2"
              onClick={() => setIsAddClientOpen(true)}
            >
              <Users className="h-6 w-6" />
              <span>Add Client</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col space-y-2"
              onClick={() => navigate('/matching-jobs')}
            >
              <Zap className="h-6 w-6" />
              <span>Upload BOQ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Client Form Modal */}
      <ClientForm
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSave={handleCreateClient}
      />
    </div>
  )
}
