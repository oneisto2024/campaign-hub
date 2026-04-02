import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Upload, Plus, Check, X, Send, FileUp, ShieldCheck, Filter, Eye, Play, BarChart3, Loader2, Copy, Pencil } from 'lucide-react';
import { ScopeData } from './CreateCampaign';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useResizableColumns, ColumnDef } from '@/hooks/useResizableColumns';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';
import HolidayBanner from '@/components/HolidayBanner';

// Default contact properties for field mapping (left column)
const DEFAULT_CONTACT_PROPERTIES = [
  'Email', 'First Name', 'Last Name', 'Company', 'Job Title', 'Phone',
  'Address', 'City', 'State', 'Country', 'Zip Code', 'Industry',
  'Revenue', 'Employee Size', 'Website', 'LinkedIn URL',
];

interface ImportProject {
  id: string;
  projectName: string;
  batchName: string;
  clientId: string;
  uniqueId: string;
  projectSummary: string;
  hasScopeDocument: boolean;
  scopeData?: ScopeData;
  publishedAt: Date;
  importStatus: 'pending' | 'data-uploaded' | 'validated' | 'suppressed' | 'ready';
  dataUploaded: boolean;
  validationDone: boolean;
  suppressionDone: boolean;
  validationRunStatus: 'pending' | 'in-progress' | 'completed' | 'error';
  validationStats?: { total: number; valid: number; catchAll: number; unknown: number; invalid: number };
}

interface FieldMapping {
  propertyName: string;
  mappedTo: string;
  isMergeTag: boolean;
  isCustom?: boolean;
}

interface ValidationTerms {
  valid: string;
  catchAll: string;
  unknown: string;
  invalid: string;
}

// Mock data
const MOCK_IMPORT_PROJECTS: ImportProject[] = [
  {
    id: '1', projectName: 'Q1 Lead Generation Campaign', batchName: 'Batch 1', clientId: 'ACME001',
    uniqueId: 'PRJ-2026-001', projectSummary: 'MQL campaign targeting enterprise clients in APAC region',
    hasScopeDocument: true, publishedAt: new Date('2026-01-12'),
    importStatus: 'pending', dataUploaded: false, validationDone: false, suppressionDone: false,
    validationRunStatus: 'pending',
  },
  {
    id: '3', projectName: 'ABM Campaign - Fortune 500', batchName: 'Batch 1', clientId: 'GLOB003',
    uniqueId: 'PRJ-2026-003', projectSummary: 'Account-based marketing for top enterprise accounts',
    hasScopeDocument: false,
    scopeData: {
      countries: ['United States', 'Japan', 'Australia', 'Singapore'],
      leadsPerRegion: { 'United States': '5000', 'Japan': '2000', 'Australia': '1500', 'Singapore': '1500' },
      hasCustomQuestions: false, customQuestionsCount: 0, customQuestions: [],
      targetAudience: 'C-Suite executives at Fortune 500 companies',
      jobTitles: 'CEO, CFO, CTO, COO',
      employeeSizeRanges: ['10,000+'],
      industry: 'All industries', revenue: '$1B+',
      installedTechBase: 'SAP, Oracle, Salesforce',
      contactPerCompany: '5', hasSuppressionList: 'no', suppressionEmails: '', suppressionDomains: '', suppressionCompanies: '',
      hasAcceptedCompanyList: 'yes', acceptedCompanyFile: null, isTelemarketing: 'yes',
    },
    publishedAt: new Date('2026-01-19'),
    importStatus: 'pending', dataUploaded: false, validationDone: false, suppressionDone: false,
    validationRunStatus: 'pending',
  },
];

const DB_IMPORT_COLUMNS: ColumnDef[] = [
  { key: 'sNo', label: 'S.No', visible: true, minWidth: 50, width: 60 },
  { key: 'projectName', label: 'Project Name', visible: true, minWidth: 120, width: 200 },
  { key: 'batchName', label: 'Batch Name', visible: true, minWidth: 100, width: 130 },
  { key: 'projectSummary', label: 'Project Summary', visible: true, minWidth: 120, width: 200 },
  { key: 'clientId', label: 'Client ID', visible: true, minWidth: 90, width: 110 },
  { key: 'uniqueId', label: 'Unique ID', visible: true, minWidth: 100, width: 130 },
  { key: 'publishedAt', label: 'Published At', visible: true, minWidth: 100, width: 120 },
  { key: 'dataUpload', label: 'Data Upload', visible: true, minWidth: 100, width: 110 },
  { key: 'validatedData', label: 'Validated Data', visible: true, minWidth: 120, width: 180 },
  { key: 'icpCheck', label: 'ICP Check', visible: true, minWidth: 100, width: 130 },
  { key: 'suppression', label: 'Suppression', visible: true, minWidth: 100, width: 110 },
  { key: 'status', label: 'Status', visible: true, minWidth: 90, width: 120 },
  { key: 'actions', label: 'Actions', visible: true, minWidth: 130, width: 160 },
  { key: 'publish', label: 'Publish', visible: true, minWidth: 80, width: 100 },
];

const DBImport = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ImportProject[]>(MOCK_IMPORT_PROJECTS);
  const { columns: tableColumns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(DB_IMPORT_COLUMNS);
  const [scopeProject, setScopeProject] = useState<ImportProject | null>(null);
  const [isScopeDialogOpen, setIsScopeDialogOpen] = useState(false);
  // Import dialog state
  const [activeProject, setActiveProject] = useState<ImportProject | null>(null);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);

  // Step 1: Data Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectedFields, setDetectedFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isValidationDone, setIsValidationDone] = useState<'yes' | 'no' | ''>('');
  const [customFieldName, setCustomFieldName] = useState('');

  // Step 1: Validation status field + term mapping
  const [validationStatusField, setValidationStatusField] = useState('');
  const [validationTerms, setValidationTerms] = useState<ValidationTerms>({
    valid: '',
    catchAll: '',
    unknown: '',
    invalid: '',
  });
  const [statusColumnValues, setStatusColumnValues] = useState<string[]>([]);

  // ICP Check state
  const [icpRunStatus, setIcpRunStatus] = useState<Record<string, 'pending' | 'in-progress' | 'completed' | 'error'>>({});

  // Step 3: Suppression
  const [suppressionType, setSuppressionType] = useState<'domain' | 'email' | ''>('');
  const [suppressionFile, setSuppressionFile] = useState<File | null>(null);
  const [suppressionDetectedFields, setSuppressionDetectedFields] = useState<string[]>([]);
  const [suppressionFieldMapping, setSuppressionFieldMapping] = useState('');

  // Publish confirmation
  const [publishConfirm, setPublishConfirm] = useState<ImportProject | null>(null);

  // Validation run & stats
  const [statsProject, setStatsProject] = useState<ImportProject | null>(null);

  // Store full CSV data for column value extraction
  const [csvData, setCsvData] = useState<string[][]>([]);

  // Inline editing state
  const [editingField, setEditingField] = useState<{ id: string; field: 'projectName' | 'batchName' } | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEditing = (project: ImportProject, field: 'projectName' | 'batchName') => {
    setEditingField({ id: project.id, field });
    setEditValue(project[field]);
  };

  const saveEditing = () => {
    if (!editingField || !editValue.trim()) return;
    setProjects(prev => prev.map(p =>
      p.id === editingField.id ? { ...p, [editingField.field]: editValue.trim() } : p
    ));
    toast({ title: `${editingField.field === 'projectName' ? 'Project' : 'Batch'} name updated` });
    setEditingField(null);
    setEditValue('');
  };

  const cancelEditing = () => { setEditingField(null); setEditValue(''); };

  const duplicateProject = (project: ImportProject) => {
    const batchCount = projects.filter(p => p.projectName === project.projectName).length + 1;
    const newProject: ImportProject = {
      ...project,
      id: Date.now().toString(),
      batchName: `Batch ${batchCount}`,
      uniqueId: `PRJ-2026-${String(projects.length + 1).padStart(3, '0')}`,
      importStatus: 'pending',
      dataUploaded: false,
      validationDone: false,
      suppressionDone: false,
      validationRunStatus: 'pending',
      validationStats: undefined,
    };
    setProjects(prev => [...prev, newProject]);
    toast({ title: `Duplicated "${project.projectName}" as "${newProject.batchName}"` });
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.projectName.toLowerCase().includes(q) ||
      p.clientId.toLowerCase().includes(q) ||
      p.uniqueId.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const parseCSV = (file: File): Promise<{ headers: string[]; rows: string[][] }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) { resolve({ headers: [], rows: [] }); return; }
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        const rows = lines.slice(1).map(line =>
          line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
        );
        resolve({ headers, rows });
      };
      reader.onerror = () => resolve({ headers: [], rows: [] });
      reader.readAsText(file);
    });
  };

  const getUniqueColumnValues = (columnName: string): string[] => {
    const colIndex = detectedFields.indexOf(columnName);
    if (colIndex === -1) return [];
    const values = new Set<string>();
    csvData.forEach(row => {
      if (row[colIndex] && row[colIndex].trim()) {
        values.add(row[colIndex].trim());
      }
    });
    return Array.from(values).sort();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const { headers, rows } = await parseCSV(file);
    if (headers.length === 0) {
      toast({ title: 'Could not detect headers from file', variant: 'destructive' });
      return;
    }
    setDetectedFields(headers);
    setCsvData(rows);
    // Initialize mappings: default properties on left, empty mapping on right
    setFieldMappings(DEFAULT_CONTACT_PROPERTIES.map(prop => ({ propertyName: prop, mappedTo: '', isMergeTag: false })));
  };

  const updateFieldMapping = (index: number, value: string) => {
    const updated = [...fieldMappings];
    updated[index] = { ...updated[index], mappedTo: value, isMergeTag: false };
    setFieldMappings(updated);
  };

  const createMergeTag = (index: number) => {
    const updated = [...fieldMappings];
    updated[index] = { ...updated[index], isMergeTag: true };
    setFieldMappings(updated);
    toast({ title: `Merge tag created for "${updated[index].propertyName}"` });
  };

  const addCustomField = () => {
    if (!customFieldName.trim()) return;
    if (fieldMappings.some(m => m.propertyName === customFieldName.trim())) {
      toast({ title: 'Field already exists', variant: 'destructive' });
      return;
    }
    setFieldMappings([...fieldMappings, { propertyName: customFieldName.trim(), mappedTo: '', isMergeTag: false, isCustom: true }]);
    setCustomFieldName('');
    toast({ title: `Custom field "${customFieldName.trim()}" added` });
  };

  const removeCustomField = (index: number) => {
    setFieldMappings(fieldMappings.filter((_, i) => i !== index));
  };

  const hasEmailMapping = fieldMappings.some(m => m.propertyName === 'Email' && m.mappedTo);

  const handleValidationStatusFieldChange = (field: string) => {
    setValidationStatusField(field);
    setValidationTerms({ valid: '', catchAll: '', unknown: '', invalid: '' });
    // Extract unique values from that column
    const colIndex = detectedFields.indexOf(field);
    if (colIndex === -1) { setStatusColumnValues([]); return; }
    const values = new Set<string>();
    csvData.forEach(row => {
      if (row[colIndex] && row[colIndex].trim()) {
        values.add(row[colIndex].trim());
      }
    });
    setStatusColumnValues(Array.from(values).sort());
  };

  const openImportDialog = (project: ImportProject) => {
    setActiveProject(project);
    setImportStep(project.dataUploaded ? (project.validationDone || isValidationDone === 'no' ? 3 : 2) : 1);
    // Reset state
    setUploadedFile(null);
    setDetectedFields([]);
    setFieldMappings([]);
    setCsvData([]);
    setIsValidationDone('');
    setValidationStatusField('');
    setValidationTerms({ valid: '', catchAll: '', unknown: '', invalid: '' });
    setStatusColumnValues([]);
    setSuppressionType('');
    setSuppressionFile(null);
    setSuppressionDetectedFields([]);
    setSuppressionFieldMapping('');
    setCustomFieldName('');
  };

  const completeStep1 = () => {
    if (!uploadedFile) {
      toast({ title: 'Please upload a file', variant: 'destructive' });
      return;
    }
    if (!hasEmailMapping) {
      toast({ title: '"Email" must be mapped to a field from your file', variant: 'destructive' });
      return;
    }
    setProjects(projects.map(p =>
      p.id === activeProject?.id ? { ...p, dataUploaded: true, importStatus: 'data-uploaded' as const } : p
    ));
    setImportStep(2);
  };

  const handleSuppressionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSuppressionFile(file);
    const { headers } = await parseCSV(file);
    if (headers.length === 0) {
      toast({ title: 'Could not detect headers from suppression file', variant: 'destructive' });
      return;
    }
    setSuppressionDetectedFields(headers);
    setSuppressionFieldMapping('');
  };

  const completeStep2 = () => {
    if (isValidationDone === 'yes') {
      if (!validationStatusField) {
        toast({ title: 'Select the status field', variant: 'destructive' });
        return;
      }
      if (!validationTerms.valid || !validationTerms.catchAll || !validationTerms.unknown || !validationTerms.invalid) {
        toast({ title: 'Map all validation status terms', variant: 'destructive' });
        return;
      }
    }
    setProjects(projects.map(p =>
      p.id === activeProject?.id ? { ...p, validationDone: isValidationDone === 'yes', importStatus: 'validated' as const } : p
    ));
    setImportStep(3);
  };

  const completeStep3 = () => {
    // Suppression is optional - if file is uploaded, validate mappings
    if (suppressionFile) {
      if (!suppressionType) {
        toast({ title: 'Select suppression type', variant: 'destructive' });
        return;
      }
      if (!suppressionFieldMapping) {
        toast({ title: 'Map the suppression field', variant: 'destructive' });
        return;
      }
    }
    setProjects(projects.map(p =>
      p.id === activeProject?.id ? { ...p, suppressionDone: !!suppressionFile, importStatus: 'suppressed' as const } : p
    ));
    setActiveProject(null);
    toast({ title: 'Import steps completed! Ready to publish.' });
  };

  const triggerIcpCheck = (project: ImportProject) => {
    if (!project.dataUploaded) {
      toast({ title: 'Upload data first before running ICP check', variant: 'destructive' });
      return;
    }
    setIcpRunStatus(prev => ({ ...prev, [project.id]: 'in-progress' }));
    setTimeout(() => {
      setIcpRunStatus(prev => ({ ...prev, [project.id]: 'error' }));
      toast({
        title: 'ICP Check API Error',
        description: 'Could not connect to ICP validation service. Please reach out to admin to configure the ICP Validation API under Email Config.',
        variant: 'destructive',
      });
    }, 2000);
  };

  const handlePublish = () => {
    if (publishConfirm) {
      setProjects(projects.map(p =>
        p.id === publishConfirm.id ? { ...p, importStatus: 'ready' as const } : p
      ));
      setPublishConfirm(null);
      toast({ title: 'Published to Email Draft!' });
      navigate('/email-data/all-content');
    }
  };

  const triggerValidation = (project: ImportProject) => {
    if (!project.dataUploaded) {
      toast({ title: 'Upload data first before running validation', variant: 'destructive' });
      return;
    }
    // Set to in-progress
    setProjects(prev => prev.map(p =>
      p.id === project.id ? { ...p, validationRunStatus: 'in-progress' as const } : p
    ));
    // Simulate API call - show error since API is not configured
    setTimeout(() => {
      setProjects(prev => prev.map(p =>
        p.id === project.id ? { ...p, validationRunStatus: 'error' as const } : p
      ));
      toast({
        title: 'Validation API Error',
        description: 'Could not connect to validation service. Please reach out to the admin to configure the Email Validation API under Email Config.',
        variant: 'destructive',
      });
    }, 2000);
  };

  const getValidationRunIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Play className="h-4 w-4" />;
      case 'in-progress': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed': return <Check className="h-4 w-4" />;
      case 'error': return <X className="h-4 w-4" />;
      default: return <Play className="h-4 w-4" />;
    }
  };

  const getValidationRunBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string }> = {
      'pending': { variant: 'outline', label: 'Pending' },
      'in-progress': { variant: 'secondary', label: 'In Progress' },
      'completed': { variant: 'default', label: 'Completed' },
      'error': { variant: 'destructive', label: 'Error' },
    };
    const s = map[status] || map['pending'];
    return <Badge variant={s.variant} className="text-[10px] px-1.5 py-0">{s.label}</Badge>;
  };

  const getStatusBadge = (project: ImportProject) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
      'pending': { variant: 'outline', label: 'Pending' },
      'data-uploaded': { variant: 'secondary', label: 'Data Uploaded' },
      'validated': { variant: 'secondary', label: 'Validated' },
      'suppressed': { variant: 'default', label: 'Ready to Publish' },
      'ready': { variant: 'default', label: 'Published' },
    };
    const s = map[project.importStatus];
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getPublishStatus = (project: ImportProject) => {
    if (project.importStatus === 'ready') return 'Completed';
    return 'Pending';
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">DB Import</p>
        <h1 className="text-2xl font-semibold text-foreground">All Campaigns</h1>
      </div>

      <HolidayBanner />

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-medium">Import Queue</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <ManageColumnsButton columns={tableColumns} toggleColumn={toggleColumn} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={filteredProjects.map((p, i) => ({ ...p, _sNo: i + 1 }))}
            rowKey={(p) => p.id}
            emptyMessage="No campaigns in import queue"
            renderCell={(project: ImportProject & { _sNo: number }, key: string) => {
              switch (key) {
                case 'sNo': return project._sNo;
                case 'projectName': return editingField?.id === project.id && editingField.field === 'projectName' ? (
                  <div className="flex items-center gap-1">
                    <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-7 text-sm" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing(); }} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEditing}><Check className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEditing}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group">
                    <span className="font-medium">{project.projectName}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => startEditing(project, 'projectName')}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                );
                case 'batchName': return editingField?.id === project.id && editingField.field === 'batchName' ? (
                  <div className="flex items-center gap-1">
                    <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="h-7 text-sm" autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') saveEditing(); if (e.key === 'Escape') cancelEditing(); }} />
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEditing}><Check className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEditing}><X className="h-3 w-3" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group">
                    <span className="text-sm">{project.batchName}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => startEditing(project, 'batchName')}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                );
                case 'projectSummary': return (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {project.projectSummary}
                    </span>
                    {!project.hasScopeDocument && project.scopeData && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
                        onClick={() => { setScopeProject(project); setIsScopeDialogOpen(true); }} title="View scope details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
                case 'clientId': return <span className="font-mono text-sm">{project.clientId}</span>;
                case 'uniqueId': return <span className="font-mono text-sm text-muted-foreground">{project.uniqueId}</span>;
                case 'publishedAt': return format(project.publishedAt, 'MMM dd, yyyy');
                case 'dataUpload': return project.dataUploaded
                  ? <Badge variant="default"><Check className="h-3 w-3 mr-1" />Done</Badge>
                  : <Badge variant="outline">Pending</Badge>;
                case 'validatedData': {
                  if (isValidationDone === 'yes' && project.validationDone && project.validationStats) {
                    return (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="default" className="text-[10px]">V:{project.validationStats.valid}</Badge>
                        <Badge variant="secondary" className="text-[10px]">CA:{project.validationStats.catchAll}</Badge>
                        <Badge variant="outline" className="text-[10px]">Inv:{project.validationStats.invalid}</Badge>
                        <Badge variant="outline" className="text-[10px]">Unk:{project.validationStats.unknown}</Badge>
                      </div>
                    );
                  }
                  if (project.validationRunStatus === 'completed' && project.validationStats) {
                    return (
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge variant="default" className="text-[10px]">V:{project.validationStats.valid}</Badge>
                        <Badge variant="secondary" className="text-[10px]">CA:{project.validationStats.catchAll}</Badge>
                        <Badge variant="outline" className="text-[10px]">Inv:{project.validationStats.invalid}</Badge>
                        <Badge variant="outline" className="text-[10px]">Unk:{project.validationStats.unknown}</Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6"
                          onClick={() => setStatsProject(project)} title="View details">
                          <BarChart3 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  }
                  // Not done yet - show 0 with run button
                  return (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground font-mono">0</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => triggerValidation(project)}
                        disabled={!project.dataUploaded || project.validationRunStatus === 'in-progress'}
                        title="Run validation">
                        {getValidationRunIcon(project.validationRunStatus)}
                      </Button>
                      {getValidationRunBadge(project.validationRunStatus)}
                    </div>
                  );
                }
                case 'icpCheck': {
                  const status = icpRunStatus[project.id] || 'pending';
                  return (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => triggerIcpCheck(project)}
                        disabled={!project.dataUploaded || status === 'in-progress' || status === 'completed'}
                        title="Run ICP check">
                        {status === 'in-progress' ? <Loader2 className="h-4 w-4 animate-spin" /> : status === 'completed' ? <Check className="h-4 w-4" /> : status === 'error' ? <X className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      {getValidationRunBadge(status)}
                    </div>
                  );
                }
                case 'suppression': return project.suppressionDone
                  ? <Badge variant="default"><Check className="h-3 w-3 mr-1" />Done</Badge>
                  : <Badge variant="outline">Optional</Badge>;
                case 'status': return getStatusBadge(project);
                case 'actions': return (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => openImportDialog(project)} disabled={project.importStatus === 'ready'}>
                      <FileUp className="h-4 w-4 mr-1" /> Import
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateProject(project)} title="Duplicate project">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                );
                case 'publish': return (
                  <div className="flex flex-col items-center gap-1">
                    <Button variant="ghost" size="icon"
                      className={`h-8 w-8 ${project.importStatus === 'ready' ? 'text-muted-foreground' : project.importStatus === 'suppressed' ? 'text-primary hover:text-primary' : 'text-muted-foreground'}`}
                      onClick={() => { if (project.importStatus === 'suppressed') setPublishConfirm(project); }}
                      disabled={project.importStatus !== 'suppressed'} title="Publish to Email Data">
                      <Send className="h-4 w-4" />
                    </Button>
                    <Badge variant={project.importStatus === 'ready' ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                      {getPublishStatus(project)}
                    </Badge>
                  </div>
                );
                default: return '-';
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <Dialog open={!!activeProject} onOpenChange={(open) => !open && setActiveProject(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              DB Import — {activeProject?.projectName}
            </DialogTitle>
          </DialogHeader>

          {/* Step indicators */}
          <div className="flex items-center gap-0 justify-center mb-4">
            {[
              { step: 1, label: 'Data Upload', icon: FileUp },
              { step: 2, label: 'Validation', icon: ShieldCheck },
              { step: 3, label: 'Suppression', icon: Filter },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    importStep === step ? 'bg-primary text-primary-foreground border-primary'
                      : importStep > step ? 'bg-primary/20 text-primary border-primary'
                      : 'bg-background text-muted-foreground border-border'
                  }`}>
                    {importStep > step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                {index < 2 && <div className={`w-16 h-0.5 mb-5 mx-1 ${importStep > step ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          <ScrollArea className="h-[55vh] pr-4">
            {/* Step 1: Data Upload */}
            {importStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Upload Contact List</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload CSV or Excel file</p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto"
                    />
                    {uploadedFile && (
                      <Badge variant="secondary" className="mt-2">{uploadedFile.name}</Badge>
                    )}
                  </div>
                </div>

                {detectedFields.length > 0 && (
                  <div className="space-y-5">
                    {/* Section 1: Detected fields */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-base">Fields Detected From Your File</h4>
                      <div className="flex flex-wrap gap-2">
                        {detectedFields.map((field) => (
                          <Badge key={field} variant="secondary" className="font-mono text-xs">{field}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Section 2: Map fields - Default properties on left, CSV dropdown on right */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-base">Map Fields to Contact Properties</h4>
                        <p className="text-sm text-muted-foreground">Map each contact property to a field from your uploaded file. "Email" is required.</p>
                      </div>
                      <div className="space-y-2">
                        {fieldMappings.map((mapping, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                            <span className="text-sm font-medium w-40 truncate">{mapping.propertyName}</span>
                            <span className="text-muted-foreground">→</span>
                            <Select
                              value={mapping.mappedTo && !mapping.isMergeTag ? mapping.mappedTo : ''}
                              onValueChange={(v) => updateFieldMapping(index, v)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {detectedFields.map((f) => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className="text-muted-foreground text-xs">or</span>
                            <Button
                              variant={mapping.isMergeTag ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => createMergeTag(index)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Merge Tag
                            </Button>
                            {mapping.isMergeTag && (
                              <Badge variant="secondary" className="text-xs">
                                {`{{${mapping.propertyName}}}`}
                              </Badge>
                            )}
                            {mapping.isCustom && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCustomField(index)}>
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add custom field */}
                      <div className="flex items-center gap-2 pt-2">
                        <Input
                          value={customFieldName}
                          onChange={(e) => setCustomFieldName(e.target.value)}
                          placeholder="Add custom field name..."
                          className="w-48 h-8 text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && addCustomField()}
                        />
                        <Button variant="outline" size="sm" onClick={addCustomField} disabled={!customFieldName.trim()}>
                          <Plus className="h-3 w-3 mr-1" />
                          Add Field
                        </Button>
                      </div>

                    {/* Validation question */}
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-semibold text-base">Validation Status</h4>
                      <Label>Is the validation already done for this data?</Label>
                      <RadioGroup value={isValidationDone} onValueChange={(v) => setIsValidationDone(v as 'yes' | 'no')}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="yes" id="val-yes" />
                            <Label htmlFor="val-yes">Yes</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="no" id="val-no" />
                            <Label htmlFor="val-no">No</Label>
                          </div>
                        </div>
                      </RadioGroup>

                      {isValidationDone === 'yes' && (
                        <div className="space-y-4 pl-4 border-l-2 border-primary/30 mt-3">
                          {/* Step A: Pick the status column */}
                          <div className="space-y-2">
                            <Label className="font-medium">Which field/column contains the validation status?</Label>
                            <Select value={validationStatusField} onValueChange={handleValidationStatusFieldChange}>
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select status field" />
                              </SelectTrigger>
                              <SelectContent>
                                {detectedFields.map((f) => (
                                  <SelectItem key={f} value={f}>{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Step B: Map terms from that column to our categories using dropdowns */}
                          {validationStatusField && statusColumnValues.length > 0 && (
                            <div className="space-y-3">
                              <div>
                                <Label className="font-medium">Map status terms to validation categories</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Select which value in your "{validationStatusField}" column corresponds to each category.
                                </p>
                              </div>
                              <div className="grid gap-3">
                                {[
                                  { key: 'valid' as const, label: 'Valid' },
                                  { key: 'catchAll' as const, label: 'Catch-All' },
                                  { key: 'unknown' as const, label: 'Unknown' },
                                  { key: 'invalid' as const, label: 'Invalid' },
                                ].map(({ key, label }) => (
                                  <div key={key} className="flex items-center gap-3 p-3 bg-muted/30 rounded">
                                    <div className="w-28 shrink-0">
                                      <span className="text-sm font-medium">{label}</span>
                                    </div>
                                    <Select
                                      value={validationTerms[key]}
                                      onValueChange={(v) => setValidationTerms({ ...validationTerms, [key]: v })}
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue placeholder={`Select value for ${label}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {statusColumnValues.map((val) => (
                                          <SelectItem key={val} value={val}>{val}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {validationStatusField && statusColumnValues.length === 0 && (
                            <p className="text-sm text-muted-foreground">No values found in the "{validationStatusField}" column.</p>
                          )}
                        </div>
                      )}

                      {isValidationDone === 'no' && (
                        <div className="space-y-4 pl-4">
                          <p className="text-sm text-muted-foreground">
                            Data will be accepted without validation. Automatic validation will run after upload.
                          </p>
                          <div className="space-y-2 border-t pt-4">
                            <Label className="font-medium">Select Validation API Account</Label>
                            <p className="text-xs text-muted-foreground">Choose which API key to use for automatic validation.</p>
                            <Select value={selectedValidationApi} onValueChange={setSelectedValidationApi}>
                              <SelectTrigger className="w-72">
                                <SelectValue placeholder="Select API account" />
                              </SelectTrigger>
                              <SelectContent>
                                {validationApiAccounts.map(api => (
                                  <SelectItem key={api.id} value={api.id}>
                                    {api.name} {api.isLive ? '(Live — Default)' : '(On Hold)'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!selectedValidationApi && (
                              <p className="text-xs text-chart-4">
                                The default live API account will be used if none is selected.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Validation (blocked if already validated) */}
            {importStep === 2 && (
              <div className="space-y-6">
                {isValidationDone === 'yes' ? (
                  <div className="text-center py-8">
                    <ShieldCheck className="h-12 w-12 mx-auto text-primary mb-3" />
                    <h4 className="font-medium">Validation Already Completed</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Validation was confirmed during data upload. Proceed to suppression.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                     <h4 className="font-medium">Validation Skipped</h4>
                     <p className="text-sm text-muted-foreground mt-1">
                       Validation was skipped, so the data was accepted as-is. Once the file upload is completed, validation will automatically take place.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Suppression */}
            {importStep === 3 && (
              <div className="space-y-6">
                {/* Upload suppression file */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-base">Upload Suppression File</h4>
                  <p className="text-sm text-muted-foreground">Upload a separate file containing your suppression list.</p>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">Upload CSV or Excel file</p>
                    <Input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleSuppressionFileUpload}
                      className="max-w-xs mx-auto"
                    />
                    {suppressionFile && (
                      <Badge variant="secondary" className="mt-2">{suppressionFile.name}</Badge>
                    )}
                  </div>
                </div>

                {suppressionDetectedFields.length > 0 && (
                  <>
                    {/* Show detected fields */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-base">Fields Detected From Suppression File</h4>
                      <div className="flex flex-wrap gap-2">
                        {suppressionDetectedFields.map((field) => (
                          <Badge key={field} variant="secondary" className="font-mono text-xs">{field}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Suppression type */}
                    <div className="space-y-2">
                      <Label className="font-medium">Suppress by Domain or Email?</Label>
                      <RadioGroup value={suppressionType} onValueChange={(v) => setSuppressionType(v as 'domain' | 'email')}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="domain" id="supp-domain" />
                            <Label htmlFor="supp-domain">By Domain</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="email" id="supp-email" />
                            <Label htmlFor="supp-email">By Email</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Map field */}
                    {suppressionType && (
                      <div className="space-y-3">
                        <Label>Map the {suppressionType} field from your suppression file</Label>
                        <Select value={suppressionFieldMapping} onValueChange={setSuppressionFieldMapping}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder={`Select ${suppressionType} field`} />
                          </SelectTrigger>
                          <SelectContent>
                            {suppressionDetectedFields.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            {importStep > 1 && (
              <Button variant="outline" onClick={() => setImportStep((importStep - 1) as 1 | 2 | 3)}>
                Back
              </Button>
            )}
            {importStep === 1 && (
              <Button onClick={completeStep1} disabled={!uploadedFile || !hasEmailMapping}>
                Next: Validation
              </Button>
            )}
            {importStep === 2 && (
              <Button onClick={completeStep2}>
                Next: Suppression
              </Button>
            )}
            {importStep === 3 && (
              <Button onClick={completeStep3}>
                Complete Import
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation */}
      <AlertDialog open={!!publishConfirm} onOpenChange={(open) => !open && setPublishConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish to Email Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will move <strong>{publishConfirm?.projectName}</strong> to the Email Data module (All Content). Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Scope Data Dialog */}
      <Dialog open={isScopeDialogOpen} onOpenChange={setIsScopeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Project Scope Details</DialogTitle>
          </DialogHeader>
          {scopeProject?.scopeData && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Target Countries</h4>
                  <div className="flex flex-wrap gap-2">
                    {scopeProject.scopeData.countries.map((country) => (
                      <Badge key={country} variant="secondary">{country}</Badge>
                    ))}
                  </div>
                </div>

                {Object.keys(scopeProject.scopeData.leadsPerRegion).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Leads Per Region</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(scopeProject.scopeData.leadsPerRegion).map(([country, leads]) => (
                        <div key={country} className="flex justify-between p-2 bg-muted/50 rounded text-sm">
                          <span>{country}:</span>
                          <span className="font-medium">{leads}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scopeProject.scopeData.hasCustomQuestions && scopeProject.scopeData.customQuestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Custom Questions</h4>
                    {scopeProject.scopeData.customQuestions.map((cq, index) => (
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
                    <p className="text-sm text-muted-foreground">{scopeProject.scopeData.targetAudience || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Job Titles</h4>
                    <p className="text-sm text-muted-foreground">{scopeProject.scopeData.jobTitles || '-'}</p>
                  </div>
                </div>

                {scopeProject.scopeData.employeeSizeRanges.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Employee Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {scopeProject.scopeData.employeeSizeRanges.map((size) => (
                        <Badge key={size} variant="secondary">{size}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Industry</h4>
                    <p className="text-sm text-muted-foreground">{scopeProject.scopeData.industry || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Revenue</h4>
                    <p className="text-sm text-muted-foreground">{scopeProject.scopeData.revenue || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Installed Technology Base</h4>
                    <p className="text-sm text-muted-foreground">{scopeProject.scopeData.installedTechBase || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">Contact Per Company</h4>
                    <p className="text-sm text-muted-foreground">{scopeProject.scopeData.contactPerCompany || '-'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Suppression List</h4>
                  {scopeProject.scopeData.hasSuppressionList === 'yes' ? (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {scopeProject.scopeData.suppressionEmails && <p>Emails: {scopeProject.scopeData.suppressionEmails}</p>}
                      {scopeProject.scopeData.suppressionDomains && <p>Domains: {scopeProject.scopeData.suppressionDomains}</p>}
                      {scopeProject.scopeData.suppressionCompanies && <p>Companies: {scopeProject.scopeData.suppressionCompanies}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Accepted Company List</h4>
                  <Badge variant={scopeProject.scopeData.hasAcceptedCompanyList === 'yes' ? 'default' : 'outline'}>
                    {scopeProject.scopeData.hasAcceptedCompanyList === 'yes' ? 'Yes' : scopeProject.scopeData.hasAcceptedCompanyList === 'no' ? 'No' : 'None'}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Telemarketing Project</h4>
                  <Badge variant={scopeProject.scopeData.isTelemarketing === 'yes' ? 'default' : 'outline'}>
                    {scopeProject.scopeData.isTelemarketing === 'yes' ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Validation Stats Dialog */}
      <Dialog open={!!statsProject} onOpenChange={(open) => !open && setStatsProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation Results</DialogTitle>
            <DialogDescription>{statsProject?.projectName}</DialogDescription>
          </DialogHeader>
          {statsProject?.validationStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/50 rounded text-center">
                  <p className="text-2xl font-bold">{statsProject.validationStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
                <div className="p-3 bg-primary/10 rounded text-center">
                  <p className="text-2xl font-bold text-primary">{statsProject.validationStats.valid}</p>
                  <p className="text-xs text-muted-foreground">Valid</p>
                </div>
                <div className="p-3 bg-secondary rounded text-center">
                  <p className="text-2xl font-bold text-secondary-foreground">{statsProject.validationStats.catchAll}</p>
                  <p className="text-xs text-muted-foreground">Catch-All</p>
                </div>
                <div className="p-3 bg-accent rounded text-center">
                  <p className="text-2xl font-bold text-accent-foreground">{statsProject.validationStats.unknown}</p>
                  <p className="text-xs text-muted-foreground">Unknown</p>
                </div>
              </div>
              <div className="p-3 bg-destructive/10 rounded text-center">
                <p className="text-2xl font-bold text-destructive">{statsProject.validationStats.invalid}</p>
                <p className="text-xs text-muted-foreground">Invalid</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DBImport;
