import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Plus, Search, Edit, Trash2, Phone, Mail, Building, ExternalLink, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { useClients, Client } from "@/hooks/useClients"
import { ClientForm } from "@/components/ClientForm"

type SortField = 'name' | 'email' | 'company_name' | 'created_at' | 'projects_count'
type SortDirection = 'asc' | 'desc'

export default function Clients() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredAndSortedClients = useMemo(() => {
    let filtered = clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortField] || ''
      let bValue = b[sortField] || ''
      
      // Handle date sorting
      if (sortField === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (sortField === 'projects_count') {
        aValue = a.projects_count || 0
        bValue = b.projects_count || 0
      } else {
        aValue = aValue.toString().toLowerCase()
        bValue = bValue.toString().toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [clients, searchTerm, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleCreateClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    return await createClient(clientData)
  }

  const handleUpdateClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!editingClient) return false
    return await updateClient(editingClient.id, clientData)
  }

  const handleDeleteClient = async (id: string) => {
    return await deleteClient(id)
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[10px] px-3 sm:px-4 md:px-6 pb-6 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0">Clients</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your client relationships</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="w-full sm:w-auto h-10 sm:h-11 text-base touch-manipulation"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-left">
              <CardTitle>Client Directory</CardTitle>
              <CardDescription>All your clients and prospects ({filteredAndSortedClients.length} total)</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex gap-2">
                <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="projects_count">Matched Jobs</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="company_name">Company</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="created_at">Date Added</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  title={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[200px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedClients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? 'No clients found matching your search.' : 'No clients yet. Add your first client to get started.'}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Client
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="text-left cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Client Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-left cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center gap-2">
                      Contact
                      {getSortIcon('email')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-left cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('projects_count')}
                  >
                    <div className="flex items-center gap-2">
                      Matched Jobs
                      {getSortIcon('projects_count')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-left cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {getSortIcon('created_at')}
                    </div>
                  </TableHead>
                  <TableHead className="text-left w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium text-left min-w-[200px]">
                      <div>
                        <div className="font-medium truncate max-w-[180px]">{client.name}</div>
                        {client.company_name && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{client.company_name}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-left min-w-[200px]">
                      <div className="space-y-1">
                        {client.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[180px]">{client.email}</span>
                          </div>
                        )}
                        {client.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                            <span className="truncate max-w-[160px]">{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-left">
                      {client.projects_count && client.projects_count > 0 ? (
                        <span className="flex items-center">
                          {client.projects_count}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-left min-w-[120px]">
                      <span className="text-sm">{new Date(client.created_at).toLocaleDateString()}</span>
                    </TableCell>
                    <TableCell className="min-w-[100px]">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingClient(client)}
                          className="h-8 w-8 p-0 touch-manipulation"
                          aria-label="Edit client"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 touch-manipulation"
                              aria-label="Delete client"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Client</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{client.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClient(client.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

      <ClientForm
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSave={handleCreateClient}
      />

      <ClientForm
        client={editingClient}
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSave={handleUpdateClient}
      />
    </div>
  )
}
