import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, Settings2 } from 'lucide-react';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';
import { useResizableColumns, type ColumnDef } from '@/hooks/useResizableColumns';
import HolidayBanner from '@/components/HolidayBanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'sno', label: 'S.No', visible: true, width: 70, minWidth: 50 },
  { key: 'companyName', label: 'Company Name', visible: true, width: 200, minWidth: 120 },
  { key: 'contactName', label: 'Contact', visible: true, width: 160, minWidth: 100 },
  { key: 'email', label: 'Email', visible: true, width: 220, minWidth: 140 },
  { key: 'modulesCount', label: 'Modules', visible: true, width: 100, minWidth: 70 },
  { key: 'projectsCount', label: 'Projects', visible: true, width: 100, minWidth: 70 },
  { key: 'createdOn', label: 'Created On', visible: true, width: 140, minWidth: 100 },
  { key: 'actions', label: 'Actions', visible: true, width: 120, minWidth: 90 },
];

// Sample project list (would come from DB later)
const ALL_PROJECTS = [
  { id: 'p1', name: 'ABM Campaign Q1 2025', client: 'Acme Corp' },
  { id: 'p2', name: 'Webinar Series Spring', client: 'Acme Corp' },
  { id: 'p3', name: 'Lead Gen APAC', client: 'TechStart Inc' },
  { id: 'p4', name: 'MQL Nurture EU', client: 'TechStart Inc' },
  { id: 'p5', name: 'Click Campaign Summer', client: 'Global Media' },
  { id: 'p6', name: 'Funnel Set Enterprise', client: 'Global Media' },
  { id: 'p7', name: 'ABM Campaign Healthcare', client: 'HealthPlus' },
  { id: 'p8', name: 'Webinar Product Launch', client: 'HealthPlus' },
];

interface ClientEntry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  modules: string[];
  assignedProjects: string[];
  createdOn: string;
}

const SAMPLE_CLIENTS: ClientEntry[] = [
  { id: '1', companyName: 'Acme Corp', contactName: 'John Doe', email: 'john@acme.com', modules: ['project-initiator', 'email-sending', 'metrics'], assignedProjects: ['p1', 'p2'], createdOn: '2025-01-10' },
  { id: '2', companyName: 'TechStart Inc', contactName: 'Jane Smith', email: 'jane@techstart.com', modules: ['project-initiator', 'db-import', 'lead-discovery'], assignedProjects: ['p3', 'p4'], createdOn: '2025-01-20' },
  { id: '3', companyName: 'Global Media', contactName: 'Bob Wilson', email: 'bob@globalmedia.com', modules: ['email-sending', 'metrics', 'reconnect'], assignedProjects: ['p5'], createdOn: '2025-02-01' },
  { id: '4', companyName: 'HealthPlus', contactName: 'Alice Brown', email: 'alice@healthplus.com', modules: ['project-initiator', 'email-draft'], assignedProjects: [], createdOn: '2025-02-10' },
];

const AllClients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<ClientEntry[]>(SAMPLE_CLIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempProjects, setTempProjects] = useState<string[]>([]);
  const { columns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(DEFAULT_COLUMNS);

  const openProjectAccess = (client: ClientEntry) => {
    setSelectedClient(client);
    setTempProjects([...client.assignedProjects]);
    setDialogOpen(true);
  };

  const toggleProject = (projectId: string) => {
    setTempProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const saveProjectAccess = () => {
    if (!selectedClient) return;
    setClients(prev => prev.map(c =>
      c.id === selectedClient.id ? { ...c, assignedProjects: tempProjects } : c
    ));
    toast({
      title: 'Access Updated',
      description: `${selectedClient.companyName} now has access to ${tempProjects.length} project(s).`,
    });
    setDialogOpen(false);
    setSelectedClient(null);
  };

  const filtered = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return !q || c.companyName.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const renderCell = (item: ClientEntry & { sno: number }, columnKey: string) => {
    switch (columnKey) {
      case 'sno': return item.sno;
      case 'companyName': return item.companyName;
      case 'contactName': return item.contactName;
      case 'email': return item.email;
      case 'modulesCount': return `${item.modules.length} modules`;
      case 'projectsCount':
        return (
          <Badge variant={item.assignedProjects.length > 0 ? 'default' : 'outline'}>
            {item.assignedProjects.length} projects
          </Badge>
        );
      case 'createdOn': return item.createdOn;
      case 'actions':
        return (
          <Button variant="outline" size="sm" onClick={() => openProjectAccess(item)}>
            <Settings2 className="h-4 w-4 mr-1" />
            Projects
          </Button>
        );
      default: return '';
    }
  };

  const tableData = filtered.map((c, idx) => ({ ...c, sno: idx + 1 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-light text-muted-foreground">Client Management</p>
          <h1 className="text-2xl font-semibold text-foreground">All Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage clients and assign project access</p>
        </div>
        <ManageColumnsButton columns={columns} toggleColumn={toggleColumn} />
      </div>

      <HolidayBanner />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={tableData}
            renderCell={renderCell}
            rowKey={(item) => item.id}
            emptyMessage="No clients found"
          />
        </CardContent>
      </Card>

      {/* Project Access Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Project Access — {selectedClient?.companyName}</DialogTitle>
            <DialogDescription>
              Select which projects this client can see. They will only see their assigned projects when they log in.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-2 py-2">
              {ALL_PROJECTS.map((project) => {
                const isSelected = tempProjects.includes(project.id);
                return (
                  <div
                    key={project.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleProject(project.id)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleProject(project.id)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProjectAccess}>
              Save ({tempProjects.length} selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllClients;
