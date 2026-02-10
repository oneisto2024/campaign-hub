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
import { Search, Upload, Plus, Check, X, Send, FileUp, ShieldCheck, Filter } from 'lucide-react';
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

interface ValidationMerge {
  valid: string;
  catchAll: string;
  unknown: string;
  invalid: string;
}

// Mock data
const MOCK_IMPORT_PROJECTS: ImportProject[] = [
  {
    id: '1', projectName: 'Q1 Lead Generation Campaign', clientId: 'ACME001',
    uniqueId: 'PRJ-2026-001', publishedAt: new Date('2026-01-12'),
    importStatus: 'pending', dataUploaded: false, validationDone: false, suppressionDone: false,
  },
  {
    id: '3', projectName: 'ABM Campaign - Fortune 500', clientId: 'GLOB003',
    uniqueId: 'PRJ-2026-003', publishedAt: new Date('2026-01-19'),
    importStatus: 'pending', dataUploaded: false, validationDone: false, suppressionDone: false,
  },
];

const DBImport = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<ImportProject[]>(MOCK_IMPORT_PROJECTS);

  // Import dialog state
  const [activeProject, setActiveProject] = useState<ImportProject | null>(null);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);

  // Step 1: Data Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectedFields, setDetectedFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [isValidationDone, setIsValidationDone] = useState<'yes' | 'no' | ''>('');
  const [validationMerge, setValidationMerge] = useState<ValidationMerge>({
    valid: '', catchAll: '', unknown: '', invalid: '',
  });

  // Step 3: Suppression
  const [suppressionType, setSuppressionType] = useState<'domain' | 'email' | ''>('');
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    // Simulate detecting CSV/Excel headers
    const mockFields = ['email_address', 'first_name', 'last_name', 'company_name', 'title', 'phone_number', 'country', 'industry_type', 'linkedin'];
    setDetectedFields(mockFields);
    setFieldMappings(mockFields.map(f => ({ sourceField: f, mappedTo: '', isMergeTag: false })));
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
    setValidationMerge({ valid: '', catchAll: '', unknown: '', invalid: '' });
    setSuppressionType('');
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

  const completeStep2 = () => {
    if (isValidationDone === 'yes') {
      // Check all merge fields are mapped
      if (!validationMerge.valid || !validationMerge.catchAll || !validationMerge.unknown || !validationMerge.invalid) {
        toast({ title: 'Map all validation categories', variant: 'destructive' });
        return;
      }
    }
    setProjects(projects.map(p =>
      p.id === activeProject?.id ? { ...p, validationDone: isValidationDone === 'yes', importStatus: 'validated' as const } : p
    ));
    setImportStep(3);
  };

  const completeStep3 = () => {
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
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm">Map Fields to Contact Properties</h4>
                      <p className="text-xs text-destructive">One field must be mapped to "Email" to proceed.</p>
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
                    <div className="space-y-2 pt-4 border-t">
                      <Label>Is the validation done?</Label>
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
                        <div className="space-y-3 pl-4 border-l-2 border-primary/30 mt-3">
                          <p className="text-sm text-muted-foreground">
                            Merge the validation status fields from your list:
                          </p>
                          {(['valid', 'catchAll', 'unknown', 'invalid'] as const).map((category) => (
                            <div key={category} className="flex items-center gap-3">
                              <span className="text-sm w-24 capitalize">{category === 'catchAll' ? 'Catch-All' : category}:</span>
                              <Select
                                value={validationMerge[category]}
                                onValueChange={(v) => setValidationMerge({ ...validationMerge, [category]: v })}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Map field" />
                                </SelectTrigger>
                                <SelectContent>
                                  {detectedFields.map((f) => (
                                    <SelectItem key={f} value={f}>{f}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      )}

                      {isValidationDone === 'no' && (
                        <p className="text-sm text-muted-foreground pl-4">
                          Data will be accepted without validation.
                        </p>
                      )}
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
                <div className="space-y-2">
                  <Label>Suppression Type</Label>
                  <p className="text-sm text-muted-foreground">How do you want to apply suppression?</p>
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

                {suppressionType && (
                  <div className="space-y-3">
                    <Label>Map the {suppressionType} field from your list</Label>
                    <Select value={suppressionFieldMapping} onValueChange={setSuppressionFieldMapping}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder={`Select ${suppressionType} field`} />
                      </SelectTrigger>
                      <SelectContent>
                        {detectedFields.length > 0
                          ? detectedFields.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))
                          : CONTACT_PROPERTIES.map((f) => (
                              <SelectItem key={f} value={f}>{f}</SelectItem>
                            ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
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
    </div>
  );
};

export default DBImport;
