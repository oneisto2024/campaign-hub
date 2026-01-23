import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Upload, X, Check, Link, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const CAMPAIGN_TYPES = [
  { id: 'mql', label: 'MQL (Single-Touch)' },
  { id: 'semi-bant', label: 'Semi-Bant (Open-Clicks)' },
  { id: 'sql', label: 'SQL (Double-Touch)' },
  { id: 'webinar', label: 'Webinar/Events' },
  { id: 'bant-abm', label: 'BANT/ABM' },
  { id: 'api-project', label: 'API Project' },
  { id: 'appointment', label: 'Appointment Setting' },
];

// Mock data - replace with actual data from backend
const MOCK_PROJECT_MANAGERS = [
  { id: '1', name: 'John Doe', email: 'john@company.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com' },
  { id: '3', name: 'Mike Johnson', email: 'mike@company.com' },
];

const MOCK_CLIENTS = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com' },
  { id: '2', name: 'TechStart Inc', email: 'hello@techstart.io' },
  { id: '3', name: 'Global Solutions', email: 'info@globalsolutions.com' },
];

const SCOPE_QUESTIONS = [
  'What is the target audience for this campaign?',
  'What are the key deliverables expected?',
  'What is the expected timeline?',
  'Are there any specific compliance requirements?',
  'What are the success metrics?',
];

interface MilestoneDate {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

const CreateCampaign = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Tab 1 - Mandate
  const [campaignName, setCampaignName] = useState('');
  const [clientId, setClientId] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [projectClientEmail, setProjectClientEmail] = useState('');

  // Tab 2 - Campaign Type
  const [campaignType, setCampaignType] = useState('');

  // Tab 3 - Scope Document
  const [hasScopeDocument, setHasScopeDocument] = useState<'yes' | 'no' | ''>('');
  const [scopeFiles, setScopeFiles] = useState<File[]>([]);
  const [scopeAnswers, setScopeAnswers] = useState<Record<number, string>>({});
  const [hasDeliveryFile, setHasDeliveryFile] = useState<'yes' | 'no' | ''>('');
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);

  // Tab 4 - Assets
  const [assetType, setAssetType] = useState<'file' | 'link' | 'not-received'>('link');
  const [assetFiles, setAssetFiles] = useState<File[]>([]);
  const [assetLinks, setAssetLinks] = useState<string[]>(['']);

  // Tab 5 - Allocation
  const [leadsRequired, setLeadsRequired] = useState('');
  const [campaignStartDate, setCampaignStartDate] = useState<Date | undefined>();
  const [campaignEndDate, setCampaignEndDate] = useState<Date | undefined>();
  const [milestonesCount, setMilestonesCount] = useState('');
  const [milestoneDates, setMilestoneDates] = useState<MilestoneDate[]>([]);

  const handleClientIdChange = (value: string) => {
    // Limit to 10 characters
    if (value.length <= 10) {
      setClientId(value.toUpperCase());
    }
  };

  const handleScopeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (scopeFiles.length + files.length > 2) {
      toast({ title: 'Maximum 2 files allowed', variant: 'destructive' });
      return;
    }
    setScopeFiles([...scopeFiles, ...files]);
  };

  const handleDeliveryFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDeliveryFiles([...deliveryFiles, ...files]);
  };

  const handleAssetFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfFiles = files.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length !== files.length) {
      toast({ title: 'Only PDF files are allowed', variant: 'destructive' });
    }
    setAssetFiles([...assetFiles, ...pdfFiles]);
  };

  const validateUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/|www\.)/i;
    return pattern.test(url);
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...assetLinks];
    newLinks[index] = value;
    setAssetLinks(newLinks);
  };

  const addLinkField = () => {
    setAssetLinks([...assetLinks, '']);
  };

  const removeLinkField = (index: number) => {
    setAssetLinks(assetLinks.filter((_, i) => i !== index));
  };

  const handleMilestonesCountChange = (value: string) => {
    const count = parseInt(value) || 0;
    if (count <= 12) {
      setMilestonesCount(value);
      setMilestoneDates(Array(count).fill({ startDate: undefined, endDate: undefined }));
    }
  };

  const updateMilestoneDate = (index: number, field: 'startDate' | 'endDate', date: Date | undefined) => {
    const newDates = [...milestoneDates];
    newDates[index] = { ...newDates[index], [field]: date };
    setMilestoneDates(newDates);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(campaignName && clientId && projectManager && projectClientEmail);
      case 2:
        return !!campaignType;
      case 3:
        if (hasScopeDocument === 'yes') {
          return scopeFiles.length > 0;
        } else if (hasScopeDocument === 'no') {
          return Object.keys(scopeAnswers).length === SCOPE_QUESTIONS.length;
        }
        return !!hasScopeDocument;
      case 4:
        if (assetType === 'file') {
          return assetFiles.length > 0;
        } else if (assetType === 'link') {
          return assetLinks.some(link => validateUrl(link));
        }
        return true; // 'not-received' is valid
      case 5:
        return !!(leadsRequired && campaignStartDate && campaignEndDate && milestonesCount && parseInt(milestonesCount) > 0);
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleReset = () => {
    setCampaignName('');
    setClientId('');
    setProjectManager('');
    setProjectClientEmail('');
    setCampaignType('');
    setHasScopeDocument('');
    setScopeFiles([]);
    setScopeAnswers({});
    setHasDeliveryFile('');
    setDeliveryFiles([]);
    setAssetType('link');
    setAssetFiles([]);
    setAssetLinks(['']);
    setLeadsRequired('');
    setCampaignStartDate(undefined);
    setCampaignEndDate(undefined);
    setMilestonesCount('');
    setMilestoneDates([]);
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    // Collect all form data
    const formData = {
      campaignName,
      clientId,
      projectManager,
      projectClientEmail,
      campaignType,
      hasScopeDocument,
      scopeFiles,
      scopeAnswers,
      hasDeliveryFile,
      deliveryFiles,
      assetType,
      assetFiles,
      assetLinks: assetLinks.filter(l => validateUrl(l)),
      leadsRequired,
      campaignStartDate,
      campaignEndDate,
      milestonesCount,
      milestoneDates,
    };

    console.log('Campaign Data:', formData);
    toast({ title: 'Campaign created successfully!' });
    handleReset();
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all',
              currentStep === step
                ? 'bg-primary text-primary-foreground border-primary'
                : currentStep > step
                ? 'bg-primary/20 text-primary border-primary'
                : 'bg-background text-muted-foreground border-border'
            )}
          >
            {currentStep > step ? <Check className="h-5 w-5" /> : step}
          </div>
          {index < totalSteps - 1 && (
            <div
              className={cn(
                'w-20 h-0.5 transition-all',
                currentStep > step ? 'bg-primary' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderTab1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-foreground">Campaign Details</h3>
        <p className="text-sm text-destructive">(*) All are required fields.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="campaignName">
            Campaign Name<span className="text-destructive">*</span>
          </Label>
          <Input
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="Enter campaign name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="clientId">
            Client_ID<span className="text-destructive">*</span>
            <span className="text-muted-foreground text-xs ml-2">(10 Character Max)</span>
          </Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => handleClientIdChange(e.target.value)}
            placeholder="Enter client ID"
            maxLength={10}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="projectManager">
            Project Manager Name<span className="text-destructive">*</span>
          </Label>
          <Select value={projectManager} onValueChange={setProjectManager}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="--- Choose Project Manager ---" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_PROJECT_MANAGERS.map((pm) => (
                <SelectItem key={pm.id} value={pm.id}>
                  {pm.name} ({pm.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="projectClientEmail">
            Project Client Email<span className="text-destructive">*</span>
          </Label>
          <Select value={projectClientEmail} onValueChange={setProjectClientEmail}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="--- Choose Client Email ---" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CLIENTS.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderTab2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-foreground">Campaign Type</h3>
        <p className="text-sm text-destructive">(*) Select one campaign type.</p>
      </div>

      <RadioGroup value={campaignType} onValueChange={setCampaignType} className="space-y-3">
        {CAMPAIGN_TYPES.map((type) => (
          <div
            key={type.id}
            className={cn(
              'flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer',
              campaignType === type.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
            onClick={() => setCampaignType(type.id)}
          >
            <RadioGroupItem value={type.id} id={type.id} />
            <Label htmlFor={type.id} className="cursor-pointer flex-1 font-normal">
              {type.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );

  const renderTab3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-foreground">Scope Document</h3>
        <p className="text-sm text-destructive">(*) Required field.</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base">
            Do you have a Campaign Scope Document?<span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={hasScopeDocument}
            onValueChange={(v) => setHasScopeDocument(v as 'yes' | 'no')}
            className="flex gap-6 mt-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="scope-yes" />
              <Label htmlFor="scope-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="scope-no" />
              <Label htmlFor="scope-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>
        </div>

        {hasScopeDocument === 'yes' && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <Label>Upload Scope Document (Max 2 files)</Label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                onChange={handleScopeFileUpload}
                className="flex-1"
                disabled={scopeFiles.length >= 2}
              />
            </div>
            {scopeFiles.length > 0 && (
              <div className="space-y-2">
                {scopeFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-background p-2 rounded">
                    <FileText className="h-4 w-4" />
                    <span className="flex-1">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setScopeFiles(scopeFiles.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {hasScopeDocument === 'no' && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <Label>Please answer the following questions:</Label>
            {SCOPE_QUESTIONS.map((question, index) => (
              <div key={index} className="space-y-2">
                <Label className="text-sm font-normal">{index + 1}. {question}</Label>
                <Input
                  value={scopeAnswers[index] || ''}
                  onChange={(e) => setScopeAnswers({ ...scopeAnswers, [index]: e.target.value })}
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-6">
          <Label className="text-base">Delivery File (Optional)</Label>
          <RadioGroup
            value={hasDeliveryFile}
            onValueChange={(v) => setHasDeliveryFile(v as 'yes' | 'no')}
            className="flex gap-6 mt-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="delivery-yes" />
              <Label htmlFor="delivery-yes" className="font-normal">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="delivery-no" />
              <Label htmlFor="delivery-no" className="font-normal">No</Label>
            </div>
          </RadioGroup>

          {hasDeliveryFile === 'yes' && (
            <div className="mt-4 space-y-4 p-4 bg-muted/50 rounded-lg">
              <Input type="file" onChange={handleDeliveryFileUpload} />
              {deliveryFiles.length > 0 && (
                <div className="space-y-2">
                  {deliveryFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-background p-2 rounded">
                      <FileText className="h-4 w-4" />
                      <span className="flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setDeliveryFiles(deliveryFiles.filter((_, i) => i !== index))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTab4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-foreground">Asset/Resources URLs</h3>
        <p className="text-sm text-destructive">(*) Select asset type.</p>
      </div>

      <RadioGroup
        value={assetType}
        onValueChange={(v) => setAssetType(v as 'file' | 'link' | 'not-received')}
        className="flex flex-wrap gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="file" id="asset-file" />
          <Label htmlFor="asset-file" className="font-normal">Upload File (PDF only)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="link" id="asset-link" />
          <Label htmlFor="asset-link" className="font-normal">Provide Links</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="not-received" id="asset-not-received" />
          <Label htmlFor="asset-not-received" className="font-normal">Not Received Yet</Label>
        </div>
      </RadioGroup>

      {assetType === 'file' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Label>Upload PDF Files</Label>
          <Input type="file" accept=".pdf" onChange={handleAssetFileUpload} />
          {assetFiles.length > 0 && (
            <div className="space-y-2">
              {assetFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-sm bg-background p-2 rounded">
                  <FileText className="h-4 w-4" />
                  <span className="flex-1">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setAssetFiles(assetFiles.filter((_, i) => i !== index))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {assetType === 'link' && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Label>Enter Asset URLs (must start with https:// or www.)</Label>
          {assetLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1 relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={link}
                  onChange={(e) => handleLinkChange(index, e.target.value)}
                  placeholder="https://example.com/asset"
                  className="pl-10"
                />
              </div>
              {assetLinks.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeLinkField(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLinkField}>
            + Add Another Link
          </Button>
        </div>
      )}

      {assetType === 'not-received' && (
        <div className="p-4 bg-muted/50 rounded-lg text-center">
          <p className="text-muted-foreground">Assets will be collected later. You can proceed to the next step.</p>
        </div>
      )}
    </div>
  );

  const renderTab5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-foreground">Client Allocation & Milestones</h3>
        <p className="text-sm text-destructive">(*) All are required fields.</p>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="leadsRequired">
            No. of Leads Required<span className="text-destructive">*</span>
          </Label>
          <Input
            id="leadsRequired"
            type="number"
            value={leadsRequired}
            onChange={(e) => setLeadsRequired(e.target.value)}
            placeholder="Enter number of leads"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>
              Start Date<span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1',
                    !campaignStartDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {campaignStartDate ? format(campaignStartDate, 'PPP') : 'Select start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={campaignStartDate}
                  onSelect={setCampaignStartDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>
              End Date<span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal mt-1',
                    !campaignEndDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {campaignEndDate ? format(campaignEndDate, 'PPP') : 'Select end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={campaignEndDate}
                  onSelect={setCampaignEndDate}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (campaignStartDate) {
                      return date < campaignStartDate;
                    }
                    return date < today;
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label htmlFor="milestonesCount">
            How many milestones?<span className="text-destructive">*</span>
            <span className="text-muted-foreground text-xs ml-2">(Max 12)</span>
          </Label>
          <Input
            id="milestonesCount"
            type="number"
            min="1"
            max="12"
            value={milestonesCount}
            onChange={(e) => handleMilestonesCountChange(e.target.value)}
            placeholder="Enter number of milestones"
            className="mt-1"
          />
        </div>

        {parseInt(milestonesCount) > 0 && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg max-h-80 overflow-y-auto">
            <Label>Milestone Dates</Label>
            {milestoneDates.map((milestone, index) => (
              <div key={index} className="p-3 bg-background rounded border">
                <Label className="text-sm font-medium">Milestone {index + 1}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'w-full justify-start text-left font-normal mt-1',
                            !milestone.startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {milestone.startDate ? format(milestone.startDate, 'PP') : 'Start date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={milestone.startDate}
                          onSelect={(date) => updateMilestoneDate(index, 'startDate', date)}
                          disabled={(date) => {
                            if (campaignStartDate && date < campaignStartDate) return true;
                            if (campaignEndDate && date > campaignEndDate) return true;
                            return false;
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            'w-full justify-start text-left font-normal mt-1',
                            !milestone.endDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-3 w-3" />
                          {milestone.endDate ? format(milestone.endDate, 'PP') : 'End date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={milestone.endDate}
                          onSelect={(date) => updateMilestoneDate(index, 'endDate', date)}
                          disabled={(date) => {
                            if (milestone.startDate && date < milestone.startDate) return true;
                            if (campaignEndDate && date > campaignEndDate) return true;
                            return false;
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Project Initiator</p>
        <h1 className="text-2xl font-semibold text-foreground">Create Campaign</h1>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-medium">CREATE CAMPAIGN</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStepIndicator()}

          <div className="min-h-[400px]">
            {currentStep === 1 && renderTab1()}
            {currentStep === 2 && renderTab2()}
            {currentStep === 3 && renderTab3()}
            {currentStep === 4 && renderTab4()}
            {currentStep === 5 && renderTab5()}
          </div>

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>Next</Button>
              ) : (
                <Button onClick={handleSubmit}>Submit</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCampaign;
