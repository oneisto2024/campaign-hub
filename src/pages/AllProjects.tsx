import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Eye, Trash2, Edit, Plus, Check, X, Send, Undo2, PauseCircle, MoreHorizontal } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ScopeData } from './CreateCampaign';
import { useResizableColumns, ColumnDef } from '@/hooks/useResizableColumns';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';
import HolidayBanner from '@/components/HolidayBanner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface CustomQuestion {
  question: string;
  options: string[];
}

interface Project {
  id: string;
  sNo: number;
  clientId: string;
  projectName: string;
  uniqueId: string;
  projectSummary: string;
  hasScopeDocument: boolean;
  scopeData?: ScopeData;
  milestones: number;
  startDate: Date;
  projectAllocation: number;
  assetUrls: string[];
  apiDoc: boolean;
  projectDocument: boolean;
  deliveryFormat: string;
  status: 'active' | 'completed' | 'paused' | 'draft' | 'on-hold';
  deleteFile: boolean;
  createdAt: Date;
  publishedAt: Date | null;
  publishStatus: 'pending' | 'completed';
  campaignType?: string;
  projectManager?: string;
  clientEmail?: string;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1', sNo: 1, clientId: 'ACME001',
    projectName: 'Q1 Lead Generation Campaign',
    uniqueId: 'PRJ-2026-001',
    projectSummary: 'MQL campaign targeting enterprise clients in APAC region',
    hasScopeDocument: true, milestones: 4,
    startDate: new Date('2026-01-15'), projectAllocation: 5000,
    assetUrls: ['https://example.com/asset1.pdf'],
    apiDoc: true, projectDocument: true, deliveryFormat: 'CSV',
    status: 'active', deleteFile: false,
    createdAt: new Date('2026-01-10'), publishedAt: new Date('2026-01-12'),
    publishStatus: 'completed', campaignType: 'MQL', projectManager: 'John Doe', clientEmail: 'contact@acme.com',
  },
  {
    id: '2', sNo: 2, clientId: 'TECH002',
    projectName: 'Webinar Series - Cloud Solutions',
    uniqueId: 'PRJ-2026-002',
    projectSummary: 'Webinar campaign for cloud product launch',
    hasScopeDocument: false,
    scopeData: {
      countries: ['United States', 'Canada', 'United Kingdom', 'Germany'],
      leadsPerRegion: { 'United States': '1500', 'Canada': '500', 'United Kingdom': '600', 'Germany': '400' },
      hasCustomQuestions: true, customQuestionsCount: 2,
      customQuestions: [
        { question: 'What cloud platform do you currently use?', options: ['AWS', 'Azure', 'GCP', 'None', 'Other'] },
        { question: 'What is your main pain point with current solution?', options: ['Cost', 'Performance', 'Security', 'Support'] }
      ],
      targetAudience: 'IT Managers and CTOs at mid-market technology companies',
      jobTitles: 'CTO, IT Director, VP Engineering, Cloud Architect',
      employeeSizeRanges: ['250-1,000', '1,000-5,000', '5,000-10,000'],
      industry: 'Technology, Finance, Healthcare', revenue: '$50M-$500M',
      installedTechBase: 'AWS, Microsoft 365, Salesforce', contactPerCompany: '3',
      hasSuppressionList: 'yes', suppressionEmails: 'competitor1@test.com',
      suppressionDomains: 'competitor1.com, competitor2.com', suppressionCompanies: '',
      hasAcceptedCompanyList: 'yes', acceptedCompanyFile: null, isTelemarketing: 'no',
    },
    milestones: 6, startDate: new Date('2026-02-01'), projectAllocation: 3000,
    assetUrls: ['https://example.com/asset2.pdf', 'https://example.com/asset3.pdf'],
    apiDoc: false, projectDocument: true, deliveryFormat: 'Excel',
    status: 'draft', deleteFile: false,
    createdAt: new Date('2026-01-20'), publishedAt: null,
    publishStatus: 'pending', campaignType: 'Webinar', projectManager: 'Jane Smith', clientEmail: 'hello@techstart.io',
  },
  {
    id: '3', sNo: 3, clientId: 'GLOB003',
    projectName: 'ABM Campaign - Fortune 500',
    uniqueId: 'PRJ-2026-003',
    projectSummary: 'Account-based marketing for top enterprise accounts',
    hasScopeDocument: false,
    scopeData: {
      countries: ['United States', 'Japan', 'Australia', 'Singapore'],
      leadsPerRegion: { 'United States': '5000', 'Japan': '2000', 'Australia': '1500', 'Singapore': '1500' },
      hasCustomQuestions: false, customQuestionsCount: 0, customQuestions: [],
      targetAudience: 'C-Suite executives at Fortune 500 companies',
      jobTitles: 'CEO, CFO, CTO, COO',
      employeeSizeRanges: ['10,000+'],
      industry: 'All industries', revenue: '$1B+',
      installedTechBase: 'SAP, Oracle, Salesforce', contactPerCompany: '5',
      hasSuppressionList: 'no', suppressionEmails: '', suppressionDomains: '', suppressionCompanies: '',
      hasAcceptedCompanyList: 'yes', acceptedCompanyFile: null, isTelemarketing: 'yes',
    },
    milestones: 8, startDate: new Date('2026-01-20'), projectAllocation: 10000,
    assetUrls: [], apiDoc: true, projectDocument: true, deliveryFormat: 'API',
    status: 'active', deleteFile: false,
    createdAt: new Date('2026-01-18'), publishedAt: new Date('2026-01-19'),
    publishStatus: 'completed', campaignType: 'BANT/ABM', projectManager: 'Mike Johnson', clientEmail: 'info@globalsolutions.com',
  },
  {
    id: '4', sNo: 4, clientId: 'START004',
    projectName: 'SQL Double-Touch Campaign',
    uniqueId: 'PRJ-2026-004',
    projectSummary: 'SQL campaign with email and phone touch points',
    hasScopeDocument: true, milestones: 3,
    startDate: new Date('2025-11-01'), projectAllocation: 2000,
    assetUrls: ['https://example.com/asset4.pdf'],
    apiDoc: false, projectDocument: false, deliveryFormat: 'CSV',
    status: 'completed', deleteFile: true,
    createdAt: new Date('2025-10-25'), publishedAt: new Date('2025-10-28'),
    publishStatus: 'completed', campaignType: 'SQL', projectManager: 'John Doe', clientEmail: 'support@start.com',
  },
];

// Column order: S.No, Client ID, Project Name, ... Status, Publish, Actions (last)
const ALL_PROJECTS_COLUMNS: ColumnDef[] = [
  { key: 'sNo', label: 'S.No', visible: true, minWidth: 50, width: 60 },
  { key: 'clientId', label: 'Client ID', visible: true, minWidth: 90, width: 110 },
  { key: 'projectName', label: 'Project Name', visible: true, minWidth: 160, width: 220 },
  { key: 'uniqueId', label: 'Unique ID', visible: true, minWidth: 110, width: 140 },
  { key: 'projectSummary', label: 'Project Summary', visible: true, minWidth: 140, width: 220 },
  { key: 'milestones', label: 'Milestones', visible: true, minWidth: 90, width: 110 },
  { key: 'startDate', label: 'Start Date', visible: true, minWidth: 110, width: 130 },
  { key: 'projectAllocation', label: 'Project Allocation', visible: true, minWidth: 130, width: 160 },
  { key: 'assetUrls', label: 'Asset URLs', visible: false, minWidth: 90, width: 110 },
  { key: 'apiDoc', label: 'API Doc', visible: false, minWidth: 70, width: 90 },
  { key: 'projectDocument', label: 'Project Document', visible: false, minWidth: 120, width: 150 },
  { key: 'deliveryFormat', label: 'Delivery Format', visible: true, minWidth: 120, width: 140 },
  { key: 'status', label: 'Status', visible: true, minWidth: 90, width: 110 },
  { key: 'deleteFile', label: 'Delete File', visible: false, minWidth: 80, width: 100 },
  { key: 'createdAt', label: 'Created At', visible: false, minWidth: 110, width: 130 },
  { key: 'publishedAt', label: 'Published At', visible: false, minWidth: 110, width: 130 },
  { key: 'publishStatus', label: 'Publish', visible: true, minWidth: 90, width: 110 },
  { key: 'actions', label: 'Actions', visible: true, minWidth: 80, width: 90 },
];

const AllProjects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { columns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(ALL_PROJECTS_COLUMNS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  const [publishProject, setPublishProject] = useState<Project | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [revokeProject, setRevokeProject] = useState<Project | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editDeliveryFormat, setEditDeliveryFormat] = useState('');
  const [editAllocation, setEditAllocation] = useState('');

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter(project => 
      project.projectName.toLowerCase().includes(query) ||
      project.clientId.toLowerCase().includes(query) ||
      project.uniqueId.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const getStatusBadge = (status: Project['status']) => {
    const variants: Record<Project['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      completed: { variant: 'secondary', label: 'Completed' },
      paused: { variant: 'outline', label: 'Paused' },
      draft: { variant: 'outline', label: 'Draft' },
      'on-hold': { variant: 'destructive', label: 'On Hold' },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const openScopeDialog = (project: Project) => {
    setSelectedProject(project);
    setIsScopeDialogOpen(true);
  };

  const openViewDialog = (project: Project) => {
    setViewProject(project);
  };

  const openEditDialog = (project: Project) => {
    setEditProject(project);
    setEditName(project.projectName);
    setEditSummary(project.projectSummary);
    setEditStatus(project.status);
    setEditDeliveryFormat(project.deliveryFormat);
    setEditAllocation(project.projectAllocation.toString());
  };

  const handleEditSave = () => {
    if (!editProject) return;
    setProjects(prev => prev.map(p => 
      p.id === editProject.id ? {
        ...p,
        projectName: editName,
        projectSummary: editSummary,
        status: editStatus as Project['status'],
        deliveryFormat: editDeliveryFormat,
        projectAllocation: parseInt(editAllocation) || p.projectAllocation,
      } : p
    ));
    toast({ title: 'Project updated successfully' });
    setEditProject(null);
  };

  const handleDelete = () => {
    if (!deleteProject) return;
    setProjects(prev => prev.filter(p => p.id !== deleteProject.id));
    toast({ title: 'Project deleted' });
    setDeleteProject(null);
  };

  const handleRevokePublish = () => {
    if (!revokeProject) return;
    setProjects(prev => prev.map(p =>
      p.id === revokeProject.id ? { ...p, publishStatus: 'pending' as const, publishedAt: null } : p
    ));
    toast({ title: 'Publish status revoked' });
    setRevokeProject(null);
  };

  const handleHoldProject = (project: Project) => {
    setProjects(prev => prev.map(p =>
      p.id === project.id ? { ...p, status: 'on-hold' as const } : p
    ));
    toast({ title: `${project.projectName} marked as On Hold` });
  };

  const renderCellValue = (project: Project, columnKey: keyof Project | 'actions') => {
    switch (columnKey) {
      case 'sNo':
        return project.sNo;
      case 'clientId':
        return <span className="font-mono text-sm">{project.clientId}</span>;
      case 'projectName':
        return <span className="font-medium text-sm">{project.projectName}</span>;
      case 'uniqueId':
        return <span className="font-mono text-sm text-muted-foreground">{project.uniqueId}</span>;
      case 'projectSummary':
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-clamp-2">
              {project.projectSummary}
            </span>
            {!project.hasScopeDocument && project.scopeData && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => openScopeDialog(project)}
                title="View scope details"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      case 'milestones':
        return <Badge variant="outline">{project.milestones}</Badge>;
      case 'startDate':
        return <span className="text-sm whitespace-nowrap">{format(project.startDate, 'MMM dd, yyyy')}</span>;
      case 'projectAllocation':
        return <span className="text-sm whitespace-nowrap">{project.projectAllocation.toLocaleString()}</span>;
      case 'assetUrls':
        return project.assetUrls.length > 0 ? (
          <Badge variant="secondary">{project.assetUrls.length} files</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      case 'apiDoc':
        return project.apiDoc ? <Badge variant="default">Yes</Badge> : <Badge variant="outline">No</Badge>;
      case 'projectDocument':
        return project.projectDocument ? <Badge variant="default">Yes</Badge> : <Badge variant="outline">No</Badge>;
      case 'deliveryFormat':
        return <Badge variant="secondary">{project.deliveryFormat}</Badge>;
      case 'status':
        return getStatusBadge(project.status);
      case 'deleteFile':
        return project.deleteFile ? 'Yes' : 'No';
      case 'createdAt':
        return format(project.createdAt, 'MMM dd, yyyy');
      case 'publishedAt':
        return project.publishedAt ? format(project.publishedAt, 'MMM dd, yyyy') : '-';
      case 'publishStatus':
        return (
          <div className="flex flex-col items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${project.publishStatus === 'completed' ? 'text-muted-foreground' : 'text-primary hover:text-primary'}`}
              onClick={() => {
                if (project.publishStatus !== 'completed') {
                  setPublishProject(project);
                }
              }}
              disabled={project.publishStatus === 'completed'}
              title="Publish to DB Import"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Badge variant={project.publishStatus === 'completed' ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
              {project.publishStatus === 'completed' ? 'Done' : 'Pending'}
            </Badge>
          </div>
        );
      case 'actions':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openViewDialog(project)}>
                <Eye className="h-4 w-4 mr-2" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(project)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Project
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {project.publishStatus === 'completed' && (
                <DropdownMenuItem onClick={() => setRevokeProject(project)}>
                  <Undo2 className="h-4 w-4 mr-2" /> Revoke Publish
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleHoldProject(project)}>
                <PauseCircle className="h-4 w-4 mr-2" /> Mark as On Hold
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteProject(project)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-light text-muted-foreground">Project Initiator</p>
          <h1 className="text-2xl font-semibold text-foreground">All Projects</h1>
        </div>
        <Button asChild>
          <Link to="/project-initiator/create-campaign">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Link>
        </Button>
      </div>

      <HolidayBanner />

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-medium">Projects</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <ManageColumnsButton columns={columns} toggleColumn={toggleColumn} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={filteredProjects}
            rowKey={(p) => p.id}
            emptyMessage="No projects found"
            renderCell={(project: Project, key: string) => renderCellValue(project, key as keyof Project | 'actions')}
          />
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={!!publishProject} onOpenChange={(open) => !open && setPublishProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish to DB Import</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish <strong>{publishProject?.projectName}</strong> to the DB Import module.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (publishProject) {
                setProjects(projects.map(p => 
                  p.id === publishProject.id 
                    ? { ...p, status: 'active' as const, publishedAt: new Date(), publishStatus: 'completed' as const } 
                    : p
                ));
              }
              setPublishProject(null);
            }}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke Publish Dialog */}
      <AlertDialog open={!!revokeProject} onOpenChange={(open) => !open && setRevokeProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Publish Status</AlertDialogTitle>
            <AlertDialogDescription>
              This will revert <strong>{revokeProject?.projectName}</strong> back to pending publish status. The project will need to be published again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRevokePublish}>
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteProject?.projectName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewProject} onOpenChange={(open) => !open && setViewProject(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Project Details — {viewProject?.projectName}</DialogTitle>
          </DialogHeader>
          {viewProject && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Client ID</h4>
                    <p className="text-sm text-muted-foreground font-mono">{viewProject.clientId}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Unique ID</h4>
                    <p className="text-sm text-muted-foreground font-mono">{viewProject.uniqueId}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Campaign Type</h4>
                    <p className="text-sm text-muted-foreground">{viewProject.campaignType || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Project Manager</h4>
                    <p className="text-sm text-muted-foreground">{viewProject.projectManager || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Client Email</h4>
                    <p className="text-sm text-muted-foreground">{viewProject.clientEmail || '—'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Status</h4>
                    {getStatusBadge(viewProject.status)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Milestones</h4>
                    <p className="text-sm text-muted-foreground">{viewProject.milestones}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Start Date</h4>
                    <p className="text-sm text-muted-foreground">{format(viewProject.startDate, 'PPP')}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Project Allocation</h4>
                    <p className="text-sm text-muted-foreground">{viewProject.projectAllocation.toLocaleString()} leads</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Delivery Format</h4>
                    <p className="text-sm text-muted-foreground">{viewProject.deliveryFormat}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Created At</h4>
                    <p className="text-sm text-muted-foreground">{format(viewProject.createdAt, 'PPP')}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Published At</h4>
                    <p className="text-sm text-muted-foreground">{viewProject.publishedAt ? format(viewProject.publishedAt, 'PPP') : '—'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Project Summary</h4>
                  <p className="text-sm text-muted-foreground">{viewProject.projectSummary}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">API Doc</h4>
                  <Badge variant={viewProject.apiDoc ? 'default' : 'outline'}>{viewProject.apiDoc ? 'Yes' : 'No'}</Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Project Document</h4>
                  <Badge variant={viewProject.projectDocument ? 'default' : 'outline'}>{viewProject.projectDocument ? 'Yes' : 'No'}</Badge>
                </div>

                {viewProject.assetUrls.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Asset URLs</h4>
                    {viewProject.assetUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline block">{url}</a>
                    ))}
                  </div>
                )}

                {viewProject.scopeData && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium text-sm mb-3">Scope Data</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Countries</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {viewProject.scopeData.countries.map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Target Audience</p>
                        <p className="text-sm">{viewProject.scopeData.targetAudience}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Job Titles</p>
                        <p className="text-sm">{viewProject.scopeData.jobTitles}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editProject && (
            <div className="space-y-4">
              <div>
                <Label>Project Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Project Summary</Label>
                <Textarea value={editSummary} onChange={(e) => setEditSummary(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delivery Format</Label>
                <Input value={editDeliveryFormat} onChange={(e) => setEditDeliveryFormat(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>Project Allocation</Label>
                <Input type="number" value={editAllocation} onChange={(e) => setEditAllocation(e.target.value)} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditProject(null)}>Cancel</Button>
                <Button onClick={handleEditSave}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scope Data Dialog */}
      <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Project Scope Details</DialogTitle>
          </DialogHeader>
          {selectedProject?.scopeData && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Target Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.scopeData.countries.map((country) => (
                      <Badge key={country} variant="secondary">{country}</Badge>
                    ))}
                  </div>
                </div>

                {Object.keys(selectedProject.scopeData.leadsPerRegion).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Leads Per Region</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(selectedProject.scopeData.leadsPerRegion).map(([country, leads]) => (
                        <div key={country} className="flex justify-between p-2 bg-muted/50 rounded text-sm">
                          <span>{country}:</span>
                          <span className="font-medium">{leads}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.scopeData.hasCustomQuestions && selectedProject.scopeData.customQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Custom Questions</h4>
                    {selectedProject.scopeData.customQuestions.map((cq, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded space-y-2">
                        <p className="font-medium text-sm">Q{index + 1}: {cq.question}</p>
                        <div className="flex flex-wrap gap-1">
                          {cq.options.map((opt, optIndex) => (
                            <Badge key={optIndex} variant="outline" className="text-xs">{opt}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Target Audience</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.scopeData.targetAudience || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Job Titles</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.scopeData.jobTitles || '-'}</p>
                  </div>
                </div>

                {selectedProject.scopeData.employeeSizeRanges.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Employee Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.scopeData.employeeSizeRanges.map((size) => (
                        <Badge key={size} variant="secondary">{size}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Industry</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.scopeData.industry || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Revenue</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.scopeData.revenue || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Installed Technology Base</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.scopeData.installedTechBase || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Contact Per Company</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.scopeData.contactPerCompany || '-'}</p>
                  </div>
                </div>

                {/* Suppression List */}
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Suppression List</h4>
                  {selectedProject.scopeData.hasSuppressionList === 'yes' ? (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {selectedProject.scopeData.suppressionEmails && <p><span className="font-medium text-foreground">Emails:</span> {selectedProject.scopeData.suppressionEmails}</p>}
                      {selectedProject.scopeData.suppressionDomains && <p><span className="font-medium text-foreground">Domains:</span> {selectedProject.scopeData.suppressionDomains}</p>}
                      {selectedProject.scopeData.suppressionCompanies && <p><span className="font-medium text-foreground">Companies:</span> {selectedProject.scopeData.suppressionCompanies}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Accepted Company List</h4>
                  <div className="flex items-center gap-2">
                    {selectedProject.scopeData.hasAcceptedCompanyList === 'yes' ? (
                      <Badge variant="default"><Check className="h-3 w-3 mr-1" /> Yes</Badge>
                    ) : selectedProject.scopeData.hasAcceptedCompanyList === 'no' ? (
                      <Badge variant="outline"><X className="h-3 w-3 mr-1" /> No</Badge>
                    ) : (
                      <Badge variant="secondary">None</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Is this a Telemarketing Project?</h4>
                  <div className="flex items-center gap-2">
                    {selectedProject.scopeData.isTelemarketing === 'yes' ? (
                      <Badge variant="default"><Check className="h-3 w-3 mr-1" /> Yes</Badge>
                    ) : (
                      <Badge variant="outline"><X className="h-3 w-3 mr-1" /> No</Badge>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllProjects;
