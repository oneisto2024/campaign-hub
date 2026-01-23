import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Badge } from '@/components/ui/badge';
import { Search, Settings2, Eye, Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Project {
  id: string;
  sNo: number;
  clientId: string;
  projectName: string;
  uniqueId: string;
  projectSummary: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [projects] = useState<Project[]>(MOCK_PROJECTS);

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
          <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
            {project.projectSummary}
          </span>
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
    </div>
  );
};

export default AllProjects;
