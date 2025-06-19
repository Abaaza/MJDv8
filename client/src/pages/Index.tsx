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
      icon: Users,
    },
    { 
      title: "Price Items", 
      value: loading ? "..." : stats.activePriceItems.toLocaleString(), 
      icon: DollarSign,
    },
    { 
      title: "Matching Jobs", 
      value: loading ? "..." : stats.totalMatchingJobs.toString(), 
      icon: FolderOpen,
    },
    { 
      title: "Matched Items", 
      value: loading ? "..." : stats.totalMatchedItems.toLocaleString(), 
      icon: Zap,
    },
  ]

  const getStatusIcon = (type: string) => {
    if (type === 'job_started') {
      return <Zap className="h-4 w-4 text-blue-500" />
    }
    if (type === 'job_completed' || type === 'client_added' || type === 'price_item_added') {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  const handleCreateClient = async (clientData: any) => {
    const success = await createClient(clientData)
    if (success) {
      setIsAddClientOpen(false)
    }
    return success
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates across your system.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <div className="text-center text-muted-foreground py-4">Loading activities...</div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No recent activity</div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="grid grid-cols-[25px_1fr_auto] items-start gap-4">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              variant="outline" 
              className="w-full justify-start gap-4"
              onClick={() => setIsAddClientOpen(true)}
            >
              <Users className="h-5 w-5" />
              <span>Add New Client</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-4"
              onClick={() => navigate('/matching-jobs')}
            >
              <Zap className="h-5 w-5" />
              <span>Start New Matching Job</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-4"
              onClick={() => navigate('/price-list')}
            >
              <DollarSign className="h-5 w-5" />
              <span>Manage Price List</span>
            </Button>
          </CardContent>
        </Card>
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
