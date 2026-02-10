import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Settings2, Eye, Trash2, Edit, Plus, Check, X, Send } from 'lucide-react';
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
import { format } from 'date-fns';
import { ScopeData } from './CreateCampaign';

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
  status: 'active' | 'completed' | 'paused' | 'draft';
  deleteFile: boolean;
  createdAt: Date;
  publishedAt: Date | null;
}

// Mock data for demonstration
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    sNo: 1,
    clientId: 'ACME001',
    projectName: 'Q1 Lead Generation Campaign',
    uniqueId: 'PRJ-2026-001',
    projectSummary: 'MQL campaign targeting enterprise clients in APAC region',
    hasScopeDocument: true,
    milestones: 4,
    startDate: new Date('2026-01-15'),
    projectAllocation: 5000,
    assetUrls: ['https://example.com/asset1.pdf'],
    apiDoc: true,
    projectDocument: true,
    deliveryFormat: 'CSV',
    status: 'active',
    deleteFile: false,
    createdAt: new Date('2026-01-10'),
    publishedAt: new Date('2026-01-12'),
  },
  {
    id: '2',
    sNo: 2,
    clientId: 'TECH002',
    projectName: 'Webinar Series - Cloud Solutions',
    uniqueId: 'PRJ-2026-002',
    projectSummary: 'Webinar campaign for cloud product launch',
    hasScopeDocument: false,
    scopeData: {
      countries: ['United States', 'Canada', 'United Kingdom', 'Germany'],
      leadsPerRegion: { 'United States': '1500', 'Canada': '500', 'United Kingdom': '600', 'Germany': '400' },
      hasCustomQuestions: true,
      customQuestionsCount: 2,
      customQuestions: [
        { question: 'What cloud platform do you currently use?', options: ['AWS', 'Azure', 'GCP', 'None', 'Other'] },
        { question: 'What is your main pain point with current solution?', options: ['Cost', 'Performance', 'Security', 'Support'] }
      ],
      targetAudience: 'IT Managers and CTOs at mid-market technology companies',
      jobTitles: 'CTO, IT Director, VP Engineering, Cloud Architect',
      employeeSizeRanges: ['250-1,000', '1,000-5,000', '5,000-10,000'],
      industry: 'Technology, Finance, Healthcare',
      revenue: '$50M-$500M',
      installedTechBase: 'AWS, Microsoft 365, Salesforce',
      contactPerCompany: '3',
      suppressionList: 'competitor1.com, competitor2.com',
      hasAcceptedCompanyList: 'yes',
      acceptedCompanyFile: null,
      isTelemarketing: 'no',
    },
    milestones: 6,
    startDate: new Date('2026-02-01'),
    projectAllocation: 3000,
    assetUrls: ['https://example.com/asset2.pdf', 'https://example.com/asset3.pdf'],
    apiDoc: false,
    projectDocument: true,
    deliveryFormat: 'Excel',
    status: 'draft',
    deleteFile: false,
    createdAt: new Date('2026-01-20'),
    publishedAt: null,
  },
  {
    id: '3',
    sNo: 3,
    clientId: 'GLOB003',
    projectName: 'ABM Campaign - Fortune 500',
    uniqueId: 'PRJ-2026-003',
    projectSummary: 'Account-based marketing for top enterprise accounts',
    hasScopeDocument: false,
    scopeData: {
      countries: ['United States', 'Japan', 'Australia', 'Singapore'],
      leadsPerRegion: { 'United States': '5000', 'Japan': '2000', 'Australia': '1500', 'Singapore': '1500' },
      hasCustomQuestions: false,
      customQuestionsCount: 0,
      customQuestions: [],
      targetAudience: 'C-Suite executives at Fortune 500 companies',
      jobTitles: 'CEO, CFO, CTO, COO',
      employeeSizeRanges: ['10,000+'],
      industry: 'All industries',
      revenue: '$1B+',
      installedTechBase: 'SAP, Oracle, Salesforce',
      contactPerCompany: '5',
      suppressionList: '',
      hasAcceptedCompanyList: 'yes',
      acceptedCompanyFile: null,
      isTelemarketing: 'yes',
    },
    milestones: 8,
    startDate: new Date('2026-01-20'),
    projectAllocation: 10000,
    assetUrls: [],
    apiDoc: true,
    projectDocument: true,
    deliveryFormat: 'API',
    status: 'active',
    deleteFile: false,
    createdAt: new Date('2026-01-18'),
    publishedAt: new Date('2026-01-19'),
  },
  {
    id: '4',
    sNo: 4,
    clientId: 'START004',
    projectName: 'SQL Double-Touch Campaign',
    uniqueId: 'PRJ-2026-004',
    projectSummary: 'SQL campaign with email and phone touch points',
    hasScopeDocument: true,
    milestones: 3,
    startDate: new Date('2025-11-01'),
    projectAllocation: 2000,
    assetUrls: ['https://example.com/asset4.pdf'],
    apiDoc: false,
    projectDocument: false,
    deliveryFormat: 'CSV',
    status: 'completed',
    deleteFile: true,
    createdAt: new Date('2025-10-25'),
    publishedAt: new Date('2025-10-28'),
  },
];

interface ColumnConfig {
  key: keyof Project | 'actions';
  label: string;
  visible: boolean;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'sNo', label: 'S.No', visible: true },
  { key: 'clientId', label: 'Client ID', visible: true },
  { key: 'projectName', label: 'Project Name', visible: true },
  { key: 'uniqueId', label: 'Unique ID', visible: true },
  { key: 'projectSummary', label: 'Project Summary', visible: true },
  { key: 'milestones', label: 'Milestones', visible: true },
  { key: 'startDate', label: 'Start Date', visible: true },
  { key: 'projectAllocation', label: 'Project Allocation', visible: true },
  { key: 'assetUrls', label: 'Asset URLs', visible: false },
  { key: 'apiDoc', label: 'API Doc', visible: false },
  { key: 'projectDocument', label: 'Project Document', visible: false },
  { key: 'deliveryFormat', label: 'Delivery Format', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'deleteFile', label: 'Delete File', visible: false },
  { key: 'createdAt', label: 'Created At', visible: false },
  { key: 'publishedAt', label: 'Published At', visible: false },
  { key: 'actions', label: 'Actions', visible: true },
];

const AllProjects = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  const [publishProject, setPublishProject] = useState<Project | null>(null);

  const toggleColumn = (key: string) => {
    setColumns(columns.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const visibleColumns = useMemo(() => columns.filter(col => col.visible), [columns]);

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
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const openScopeDialog = (project: Project) => {
    setSelectedProject(project);
    setIsScopeDialogOpen(true);
  };

  const renderCellValue = (project: Project, columnKey: keyof Project | 'actions') => {
    switch (columnKey) {
      case 'sNo':
        return project.sNo;
      case 'clientId':
        return <span className="font-mono text-sm">{project.clientId}</span>;
      case 'projectName':
        return <span className="font-medium">{project.projectName}</span>;
      case 'uniqueId':
        return <span className="font-mono text-sm text-muted-foreground">{project.uniqueId}</span>;
      case 'projectSummary':
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
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
        return format(project.startDate, 'MMM dd, yyyy');
      case 'projectAllocation':
        return project.projectAllocation.toLocaleString();
      case 'assetUrls':
        return project.assetUrls.length > 0 ? (
          <Badge variant="secondary">{project.assetUrls.length} files</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      case 'apiDoc':
        return project.apiDoc ? (
          <Badge variant="default">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        );
      case 'projectDocument':
        return project.projectDocument ? (
          <Badge variant="default">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        );
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
      case 'actions':
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            {project.status !== 'completed' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:text-primary"
                onClick={() => setPublishProject(project)}
                title="Publish to DB Import"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Projects</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Manage Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumn(column.key)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead key={column.key} className="whitespace-nowrap">
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length} className="text-center py-12">
                      <p className="text-muted-foreground">No projects found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      {visibleColumns.map((column) => (
                        <TableCell key={column.key} className="whitespace-nowrap">
                          {renderCellValue(project, column.key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={!!publishProject} onOpenChange={(open) => !open && setPublishProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish to DB Import</AlertDialogTitle>
            <AlertDialogDescription>
              This will publish <strong>{publishProject?.projectName}</strong> to the DB Import module. The project's basic info will be locked and it will move to the data import stage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (publishProject) {
                setProjects(projects.map(p => 
                  p.id === publishProject.id 
                    ? { ...p, status: 'active' as const, publishedAt: new Date() } 
                    : p
                ));
                navigate('/db-import/all-campaigns');
              }
              setPublishProject(null);
            }}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scope Data Dialog */}
      <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Project Scope Details</DialogTitle>
          </DialogHeader>
          {selectedProject?.scopeData && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Countries */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Target Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.scopeData.countries.map((country) => (
                      <Badge key={country} variant="secondary">{country}</Badge>
                    ))}
                  </div>
                </div>

                {/* Leads Per Region */}
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

                {/* Custom Questions */}
                {selectedProject.scopeData.hasCustomQuestions && selectedProject.scopeData.customQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Custom Questions</h4>
                    {selectedProject.scopeData.customQuestions.map((cq, index) => (
                      <div key={index} className="p-3 bg-muted/50 rounded space-y-2">
                        <p className="font-medium text-sm">Q{index + 1}: {cq.question}</p>
                        <div className="flex flex-wrap gap-1">
                          {cq.options.map((opt, optIndex) => (
                            <Badge key={optIndex} variant="outline" className="text-xs">
                              {opt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Target Audience */}
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

                {/* Employee Size */}
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

                {/* Industry & Revenue */}
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

                {/* Technology & Contacts */}
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
                  <h4 className="font-medium text-sm">Suppression List (Email/Domain/Company)</h4>
                  <p className="text-sm text-muted-foreground">{selectedProject.scopeData.suppressionList || 'None'}</p>
                </div>

                {/* Accepted Company List */}
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

                {/* Telemarketing */}
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
