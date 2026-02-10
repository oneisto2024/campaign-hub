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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Upload, Plus, Check, X, Send, FileUp, ShieldCheck, Filter, Eye } from 'lucide-react';
import { ScopeData } from './CreateCampaign';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Contact list property options for field mapping
const CONTACT_PROPERTIES = [
  'Email', 'First Name', 'Last Name', 'Company', 'Job Title', 'Phone',
  'Address', 'City', 'State', 'Country', 'Zip Code', 'Industry',
  'Revenue', 'Employee Size', 'Website', 'LinkedIn URL',
];

interface ImportProject {
  id: string;
  projectName: string;
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
}

interface FieldMapping {
  sourceField: string;
  mappedTo: string;
  isMergeTag: boolean;
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
    id: '1', projectName: 'Q1 Lead Generation Campaign', clientId: 'ACME001',
    uniqueId: 'PRJ-2026-001', projectSummary: 'MQL campaign targeting enterprise clients in APAC region',
    hasScopeDocument: true, publishedAt: new Date('2026-01-12'),
    importStatus: 'pending', dataUploaded: false, validationDone: false, suppressionDone: false,
  },
  {
    id: '3', projectName: 'ABM Campaign - Fortune 500', clientId: 'GLOB003',
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
      contactPerCompany: '5', suppressionList: '',
      hasAcceptedCompanyList: 'yes', acceptedCompanyFile: null, isTelemarketing: 'yes',
    },
    publishedAt: new Date('2026-01-19'),
    importStatus: 'pending', dataUploaded: false, validationDone: false, suppressionDone: false,
  },
];

const DBImport = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ImportProject[]>(MOCK_IMPORT_PROJECTS);
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

  // Step 1: Validation status field + term mapping
  const [validationStatusField, setValidationStatusField] = useState('');
  const [validationTerms, setValidationTerms] = useState({
    valid: '',
    catchAll: '',
    unknown: '',
    invalid: '',
  });

  // Step 3: Suppression
  const [suppressionType, setSuppressionType] = useState<'domain' | 'email' | ''>('');
  const [suppressionFile, setSuppressionFile] = useState<File | null>(null);
  const [suppressionDetectedFields, setSuppressionDetectedFields] = useState<string[]>([]);
  const [suppressionFieldMapping, setSuppressionFieldMapping] = useState('');

  // Publish confirmation
  const [publishConfirm, setPublishConfirm] = useState<ImportProject | null>(null);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p =>
      p.projectName.toLowerCase().includes(q) ||
      p.clientId.toLowerCase().includes(q) ||
      p.uniqueId.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  const parseCSVHeaders = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) { resolve([]); return; }
        const firstLine = text.split(/\r?\n/)[0];
        const headers = firstLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
        resolve(headers);
      };
      reader.onerror = () => resolve([]);
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const headers = await parseCSVHeaders(file);
    if (headers.length === 0) {
      toast({ title: 'Could not detect headers from file', variant: 'destructive' });
      return;
    }
    setDetectedFields(headers);
    setFieldMappings(headers.map(f => ({ sourceField: f, mappedTo: '', isMergeTag: false })));
  };

  const updateFieldMapping = (index: number, value: string) => {
    const updated = [...fieldMappings];
    updated[index] = { ...updated[index], mappedTo: value, isMergeTag: false };
    setFieldMappings(updated);
  };

  const createMergeTag = (index: number) => {
    const updated = [...fieldMappings];
    updated[index] = { ...updated[index], mappedTo: updated[index].sourceField, isMergeTag: true };
    setFieldMappings(updated);
    toast({ title: `Merge tag created for "${updated[index].sourceField}"` });
  };

  const hasEmailMapping = fieldMappings.some(m => m.mappedTo === 'Email');

  const openImportDialog = (project: ImportProject) => {
    setActiveProject(project);
    setImportStep(project.dataUploaded ? (project.validationDone || isValidationDone === 'no' ? 3 : 2) : 1);
    // Reset state
    setUploadedFile(null);
    setDetectedFields([]);
    setFieldMappings([]);
    setIsValidationDone('');
    setValidationStatusField('');
    setValidationTerms({ valid: '', catchAll: '', unknown: '', invalid: '' });
    setSuppressionType('');
    setSuppressionFile(null);
    setSuppressionDetectedFields([]);
    setSuppressionFieldMapping('');
  };

  const completeStep1 = () => {
    if (!uploadedFile) {
      toast({ title: 'Please upload a file', variant: 'destructive' });
      return;
    }
    if (!hasEmailMapping) {
      toast({ title: 'One field must be mapped to "Email"', variant: 'destructive' });
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
    const headers = await parseCSVHeaders(file);
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
    if (!suppressionFile) {
      toast({ title: 'Please upload a suppression file', variant: 'destructive' });
      return;
    }
    if (!suppressionType) {
      toast({ title: 'Select suppression type', variant: 'destructive' });
      return;
    }
    if (!suppressionFieldMapping) {
      toast({ title: 'Map the suppression field', variant: 'destructive' });
      return;
    }
    setProjects(projects.map(p =>
      p.id === activeProject?.id ? { ...p, suppressionDone: true, importStatus: 'suppressed' as const } : p
    ));
    setActiveProject(null);
    toast({ title: 'Import steps completed! Ready to publish.' });
  };

  const handlePublish = () => {
    if (publishConfirm) {
      setProjects(projects.map(p =>
        p.id === publishConfirm.id ? { ...p, importStatus: 'ready' as const } : p
      ));
      setPublishConfirm(null);
      toast({ title: 'Published to Email Data!' });
      navigate('/email-data/all-content');
    }
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">DB Import</p>
        <h1 className="text-2xl font-semibold text-foreground">All Campaigns</h1>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Import Queue</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Project Summary</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Unique ID</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Data Upload</TableHead>
                <TableHead>Validation</TableHead>
                <TableHead>Suppression</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No campaigns in import queue
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.projectName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                          {project.projectSummary}
                        </span>
                        {!project.hasScopeDocument && project.scopeData && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => { setScopeProject(project); setIsScopeDialogOpen(true); }}
                            title="View scope details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{project.clientId}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{project.uniqueId}</TableCell>
                    <TableCell>{format(project.publishedAt, 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {project.dataUploaded
                        ? <Badge variant="default"><Check className="h-3 w-3 mr-1" />Done</Badge>
                        : <Badge variant="outline">Pending</Badge>}
                    </TableCell>
                    <TableCell>
                      {project.validationDone
                        ? <Badge variant="default"><Check className="h-3 w-3 mr-1" />Done</Badge>
                        : <Badge variant="outline">Pending</Badge>}
                    </TableCell>
                    <TableCell>
                      {project.suppressionDone
                        ? <Badge variant="default"><Check className="h-3 w-3 mr-1" />Done</Badge>
                        : <Badge variant="outline">Pending</Badge>}
                    </TableCell>
                    <TableCell>{getStatusBadge(project)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openImportDialog(project)}
                          disabled={project.importStatus === 'ready'}
                        >
                          <FileUp className="h-4 w-4 mr-1" />
                          Import
                        </Button>
                        {project.importStatus === 'suppressed' && (
                          <Button
                            size="sm"
                            onClick={() => setPublishConfirm(project)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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

                    {/* Section 2: Map fields */}
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-base">Map Fields to Contact Properties</h4>
                        <p className="text-sm text-muted-foreground">Choose a contact list property for each field. One field must be mapped to "Email" to proceed.</p>
                      </div>
                      <div className="space-y-2">
                        {fieldMappings.map((mapping, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                            <span className="text-sm font-mono w-40 truncate">{mapping.sourceField}</span>
                            <span className="text-muted-foreground">→</span>
                          <Select
                            value={mapping.mappedTo && !mapping.isMergeTag ? mapping.mappedTo : ''}
                            onValueChange={(v) => updateFieldMapping(index, v)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select property" />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTACT_PROPERTIES.map((prop) => (
                                <SelectItem key={prop} value={prop}>{prop}</SelectItem>
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
                              {`{{${mapping.sourceField}}}`}
                            </Badge>
                          )}
                        </div>
                      ))}
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
                            <Select value={validationStatusField} onValueChange={setValidationStatusField}>
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

                          {/* Step B: Map terms from that column to our categories */}
                          {validationStatusField && (
                            <div className="space-y-3">
                              <div>
                                <Label className="font-medium">Map status terms to validation categories</Label>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Tell us which value in your "{validationStatusField}" column corresponds to each category.
                                </p>
                              </div>
                              <div className="grid gap-3">
                                {[
                                  { key: 'valid' as const, label: 'Valid', hint: 'e.g. "safe", "deliverable", "valid"' },
                                  { key: 'catchAll' as const, label: 'Catch-All', hint: 'e.g. "catch-all", "accept-all"' },
                                  { key: 'unknown' as const, label: 'Unknown', hint: 'e.g. "unknown", "unverifiable"' },
                                  { key: 'invalid' as const, label: 'Invalid', hint: 'e.g. "disposable", "undeliverable", "invalid"' },
                                ].map(({ key, label, hint }) => (
                                  <div key={key} className="flex items-start gap-3 p-3 bg-muted/30 rounded">
                                    <div className="w-28 shrink-0">
                                      <span className="text-sm font-medium">{label}</span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                      <Input
                                        value={validationTerms[key]}
                                        onChange={(e) => setValidationTerms({ ...validationTerms, [key]: e.target.value })}
                                        placeholder={hint}
                                        className="h-8 text-sm"
                                      />
                                      <p className="text-xs text-muted-foreground">{hint}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {isValidationDone === 'no' && (
                        <p className="text-sm text-muted-foreground pl-4">
                          Data will be accepted without validation.
                        </p>
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
                    <h4 className="font-medium">No Validation Required</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You opted to skip validation. Data was accepted as-is.
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
                  <p className="text-sm text-muted-foreground">{scopeProject.scopeData.suppressionList || 'None'}</p>
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
    </div>
  );
};

export default DBImport;
