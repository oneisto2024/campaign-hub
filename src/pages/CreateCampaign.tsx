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
import { CalendarIcon, Upload, X, Check, Link, FileText, Plus, Minus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const CAMPAIGN_TYPES = [
  { id: 'mql', label: 'MQL (Single-Touch)' },
  { id: 'semi-bant', label: 'Semi-Bant (Open-Clicks)' },
  { id: 'sql', label: 'SQL (Double-Touch)' },
  { id: 'webinar', label: 'Webinar/Events' },
  { id: 'bant-abm', label: 'BANT/ABM' },
  { id: 'api-project', label: 'API Project' },
  { id: 'appointment', label: 'Appointment Setting' },
];

// Pull project managers from ManageUsers data (users with isProjectManager=true)
const getProjectManagers = () => {
  // In a real app this would come from an API/context. For now, hardcoded list matching ManageUsers.
  return [
    { id: '1', name: 'John Doe', email: 'john@company.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@company.com' },
    { id: '5', name: 'Mike Johnson', email: 'mike@company.com' },
  ];
};

const MOCK_PROJECT_MANAGERS = getProjectManagers();

const MOCK_CLIENTS = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com' },
  { id: '2', name: 'TechStart Inc', email: 'hello@techstart.io' },
  { id: '3', name: 'Global Solutions', email: 'info@globalsolutions.com' },
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands',
  'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Australia', 'New Zealand', 'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Hong Kong',
  'Taiwan', 'Indonesia', 'Thailand', 'Malaysia', 'Philippines', 'Vietnam', 'Brazil', 'Mexico',
  'Argentina', 'Chile', 'Colombia', 'Peru', 'United Arab Emirates', 'Saudi Arabia', 'Israel',
  'South Africa', 'Nigeria', 'Kenya', 'Egypt', 'Poland', 'Czech Republic', 'Romania', 'Hungary',
  'Greece', 'Portugal', 'Turkey', 'Russia', 'Ukraine'
];

const EMPLOYEE_SIZE_RANGES = [
  '1-10',
  '10-50',
  '50-250',
  '250-1,000',
  '1,000-5,000',
  '5,000-10,000',
  '10,000+'
];

interface CustomQuestion {
  question: string;
  options: string[];
}

interface MilestoneDate {
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export interface ScopeData {
  countries: string[];
  leadsPerRegion: Record<string, string>;
  hasCustomQuestions: boolean;
  customQuestionsCount: number;
  customQuestions: CustomQuestion[];
  targetAudience: string;
  jobTitles: string;
  employeeSizeRanges: string[];
  industry: string;
  revenue: string;
  installedTechBase: string;
  contactPerCompany: string;
  hasSuppressionList: 'yes' | 'no';
  suppressionEmails: string;
  suppressionDomains: string;
  suppressionCompanies: string;
  hasAcceptedCompanyList: 'yes' | 'no' | 'none';
  acceptedCompanyFile: File | null;
  isTelemarketing: 'yes' | 'no';
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
  const [hasDeliveryFile, setHasDeliveryFile] = useState<'yes' | 'no' | ''>('');
  const [deliveryFiles, setDeliveryFiles] = useState<File[]>([]);

  // Scope Questions (when no document)
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [leadsPerRegion, setLeadsPerRegion] = useState<Record<string, string>>({});
  const [hasCustomQuestions, setHasCustomQuestions] = useState(false);
  const [customQuestionsCount, setCustomQuestionsCount] = useState(0);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [targetAudience, setTargetAudience] = useState('');
  const [jobTitles, setJobTitles] = useState('');
  const [employeeSizeRanges, setEmployeeSizeRanges] = useState<string[]>([]);
  const [industry, setIndustry] = useState('');
  const [revenue, setRevenue] = useState('');
  const [installedTechBase, setInstalledTechBase] = useState('');
  const [contactPerCompany, setContactPerCompany] = useState('');
  const [hasSuppressionList, setHasSuppressionList] = useState<'yes' | 'no'>('no');
  const [suppressionEmails, setSuppressionEmails] = useState('');
  const [suppressionDomains, setSuppressionDomains] = useState('');
  const [suppressionCompanies, setSuppressionCompanies] = useState('');
  const [hasAcceptedCompanyList, setHasAcceptedCompanyList] = useState<'yes' | 'no' | 'none'>('none');
  const [acceptedCompanyFile, setAcceptedCompanyFile] = useState<File | null>(null);
  const [isTelemarketing, setIsTelemarketing] = useState<'yes' | 'no'>('no');

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

  const handleAcceptedCompanyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAcceptedCompanyFile(file);
    }
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

  // Country selection
  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter(c => c !== country));
      const newLeadsPerRegion = { ...leadsPerRegion };
      delete newLeadsPerRegion[country];
      setLeadsPerRegion(newLeadsPerRegion);
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const filteredCountries = COUNTRIES.filter(c => 
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Custom questions
  const handleCustomQuestionsCountChange = (value: string) => {
    const count = Math.min(Math.max(0, parseInt(value) || 0), 15);
    setCustomQuestionsCount(count);
    setCustomQuestions(
      Array(count).fill(null).map((_, i) => customQuestions[i] || { question: '', options: [''] })
    );
  };

  const updateCustomQuestion = (index: number, question: string) => {
    const newQuestions = [...customQuestions];
    newQuestions[index] = { ...newQuestions[index], question };
    setCustomQuestions(newQuestions);
  };

  const addOptionToQuestion = (questionIndex: number) => {
    if (customQuestions[questionIndex].options.length >= 25) {
      toast({ title: 'Maximum 25 options allowed', variant: 'destructive' });
      return;
    }
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options.push('');
    setCustomQuestions(newQuestions);
  };

  const removeOptionFromQuestion = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    setCustomQuestions(newQuestions);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...customQuestions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setCustomQuestions(newQuestions);
  };

  const toggleEmployeeSize = (size: string) => {
    if (employeeSizeRanges.includes(size)) {
      setEmployeeSizeRanges(employeeSizeRanges.filter(s => s !== size));
    } else {
      setEmployeeSizeRanges([...employeeSizeRanges, size]);
    }
  };

  const getValidationErrors = (step: number): string[] => {
    const errors: string[] = [];
    switch (step) {
      case 1:
        if (!campaignName) errors.push('Campaign Name');
        if (!clientId) errors.push('Client ID');
        if (!projectManager) errors.push('Project Manager');
        if (!projectClientEmail) errors.push('Project Client Email');
        break;
      case 2:
        if (!campaignType) errors.push('Campaign Type');
        break;
      case 3:
        if (!hasScopeDocument) { errors.push('Scope Document selection'); break; }
        if (hasScopeDocument === 'yes' && scopeFiles.length === 0) errors.push('Scope Document file upload');
        if (hasScopeDocument === 'no') {
          if (selectedCountries.length === 0) errors.push('Countries');
          if (!targetAudience) errors.push('Target Audience');
        }
        break;
      case 4:
        if (assetType === 'file' && assetFiles.length === 0) errors.push('Asset file upload');
        if (assetType === 'link' && !assetLinks.some(link => validateUrl(link))) errors.push('At least one valid Asset URL');
        break;
      case 5:
        if (!leadsRequired) errors.push('No. of Leads Required');
        if (!campaignStartDate) errors.push('Start Date');
        if (!campaignEndDate) errors.push('End Date');
        if (!milestonesCount || parseInt(milestonesCount) <= 0) errors.push('Milestones count');
        break;
    }
    return errors;
  };

  const validateStep = (step: number): boolean => getValidationErrors(step).length === 0;

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      const errors = getValidationErrors(currentStep);
      toast({ 
        title: 'Missing required fields', 
        description: `Please fill: ${errors.join(', ')}`,
        variant: 'destructive' 
      });
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
    setHasDeliveryFile('');
    setDeliveryFiles([]);
    setSelectedCountries([]);
    setLeadsPerRegion({});
    setHasCustomQuestions(false);
    setCustomQuestionsCount(0);
    setCustomQuestions([]);
    setTargetAudience('');
    setJobTitles('');
    setEmployeeSizeRanges([]);
    setIndustry('');
    setRevenue('');
    setInstalledTechBase('');
    setContactPerCompany('');
    setHasSuppressionList('no');
    setSuppressionEmails('');
    setSuppressionDomains('');
    setSuppressionCompanies('');
    setHasAcceptedCompanyList('none');
    setAcceptedCompanyFile(null);
    setIsTelemarketing('no');
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

  const getScopeData = (): ScopeData => ({
    countries: selectedCountries,
    leadsPerRegion,
    hasCustomQuestions,
    customQuestionsCount,
    customQuestions,
    targetAudience,
    jobTitles,
    employeeSizeRanges,
    industry,
    revenue,
    installedTechBase,
    contactPerCompany,
    hasSuppressionList,
    suppressionEmails,
    suppressionDomains,
    suppressionCompanies,
    hasAcceptedCompanyList,
    acceptedCompanyFile,
    isTelemarketing,
  });

  const handleSubmit = () => {
    const errors = getValidationErrors(currentStep);
    if (errors.length > 0) {
      toast({ title: 'Missing required fields', description: `Please fill: ${errors.join(', ')}`, variant: 'destructive' });
      return;
    }

    const formData = {
      campaignName,
      clientId,
      projectManager,
      projectClientEmail,
      campaignType,
      hasScopeDocument,
      scopeFiles,
      scopeData: hasScopeDocument === 'no' ? getScopeData() : null,
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
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6 p-4 bg-muted/50 rounded-lg">
              {/* Countries Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Countries<span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                />
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 bg-background">
                  <div className="flex flex-wrap gap-2">
                    {filteredCountries.map((country) => (
                      <Badge
                        key={country}
                        variant={selectedCountries.includes(country) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleCountry(country)}
                      >
                        {country}
                        {selectedCountries.includes(country) && <X className="h-3 w-3 ml-1" />}
                      </Badge>
                    ))}
                  </div>
                </div>
                {selectedCountries.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedCountries.length} countries
                  </p>
                )}
              </div>

              {/* Leads Per Region */}
              {selectedCountries.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Leads Per Region</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCountries.map((country) => (
                      <div key={country} className="flex items-center gap-2">
                        <span className="text-sm min-w-[120px]">{country}:</span>
                        <Input
                          type="number"
                          placeholder="Leads count"
                          value={leadsPerRegion[country] || ''}
                          onChange={(e) => setLeadsPerRegion({ ...leadsPerRegion, [country]: e.target.value })}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Questions */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="hasCustomQuestions"
                    checked={hasCustomQuestions}
                    onCheckedChange={(checked) => setHasCustomQuestions(checked === true)}
                  />
                  <Label htmlFor="hasCustomQuestions">
                    Do you have any Custom Questions to be asked to potential customers? (CQ)
                  </Label>
                </div>

                {hasCustomQuestions && (
                  <div className="space-y-4 p-3 bg-background rounded border">
                    <div>
                      <Label>Number of Questions (Max 15)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="15"
                        value={customQuestionsCount}
                        onChange={(e) => handleCustomQuestionsCountChange(e.target.value)}
                        className="mt-1 w-32"
                      />
                    </div>

                    {customQuestions.map((cq, qIndex) => (
                      <div key={qIndex} className="p-3 bg-muted/50 rounded border">
                        <Label className="text-sm font-medium">Question {qIndex + 1}</Label>
                        <Input
                          value={cq.question}
                          onChange={(e) => updateCustomQuestion(qIndex, e.target.value)}
                          placeholder="Enter your question..."
                          className="mt-1"
                        />
                        <div className="mt-3 space-y-2">
                          <Label className="text-xs text-muted-foreground">Options (Max 25)</Label>
                          {cq.options.map((opt, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <Input
                                value={opt}
                                onChange={(e) => updateQuestionOption(qIndex, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="flex-1"
                              />
                              {cq.options.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9"
                                  onClick={() => removeOptionFromQuestion(qIndex, optIndex)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOptionToQuestion(qIndex)}
                            disabled={cq.options.length >= 25}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Option
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <Label htmlFor="targetAudience">
                  Target Audience<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Describe target audience..."
                  className="mt-1"
                />
              </div>

              {/* Job Titles */}
              <div>
                <Label htmlFor="jobTitles">Job Titles</Label>
                <Input
                  id="jobTitles"
                  value={jobTitles}
                  onChange={(e) => setJobTitles(e.target.value)}
                  placeholder="e.g., CTO, VP Engineering, IT Director..."
                  className="mt-1"
                />
              </div>

              {/* Employee Size */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Employee Size</Label>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYEE_SIZE_RANGES.map((size) => (
                    <Badge
                      key={size}
                      variant={employeeSizeRanges.includes(size) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleEmployeeSize(size)}
                    >
                      {size}
                      {employeeSizeRanges.includes(size) && <Check className="h-3 w-3 ml-1" />}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g., Technology, Healthcare, Finance..."
                  className="mt-1"
                />
              </div>

              {/* Revenue */}
              <div>
                <Label htmlFor="revenue">Revenue</Label>
                <Input
                  id="revenue"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="e.g., $10M-$50M, $100M+..."
                  className="mt-1"
                />
              </div>

              {/* Installed Technology Base */}
              <div>
                <Label htmlFor="installedTechBase">Installed Technology Base</Label>
                <Input
                  id="installedTechBase"
                  value={installedTechBase}
                  onChange={(e) => setInstalledTechBase(e.target.value)}
                  placeholder="e.g., Salesforce, AWS, Microsoft 365..."
                  className="mt-1"
                />
              </div>

              {/* Contact Per Company */}
              <div>
                <Label htmlFor="contactPerCompany">Contact Per Company</Label>
                <Input
                  id="contactPerCompany"
                  type="number"
                  value={contactPerCompany}
                  onChange={(e) => setContactPerCompany(e.target.value)}
                  placeholder="Number of contacts per company"
                  className="mt-1"
                />
              </div>

              {/* Suppression List */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Suppression List (Email/Domain/Company)</Label>
                <RadioGroup
                  value={hasSuppressionList}
                  onValueChange={(v) => setHasSuppressionList(v as 'yes' | 'no')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="supp-yes" />
                    <Label htmlFor="supp-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="supp-no" />
                    <Label htmlFor="supp-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>

                {hasSuppressionList === 'yes' && (
                  <div className="space-y-3 p-3 bg-background rounded border">
                    <div>
                      <Label htmlFor="suppressionEmails" className="text-sm">Suppression Emails</Label>
                      <Input
                        id="suppressionEmails"
                        value={suppressionEmails}
                        onChange={(e) => setSuppressionEmails(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="suppressionDomains" className="text-sm">Suppression Domains</Label>
                      <Input
                        id="suppressionDomains"
                        value={suppressionDomains}
                        onChange={(e) => setSuppressionDomains(e.target.value)}
                        placeholder="competitor1.com, competitor2.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="suppressionCompanies" className="text-sm">Suppression Companies</Label>
                      <Input
                        id="suppressionCompanies"
                        value={suppressionCompanies}
                        onChange={(e) => setSuppressionCompanies(e.target.value)}
                        placeholder="Company A, Company B"
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accepted Company List */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Accepted Company List</Label>
                <RadioGroup
                  value={hasAcceptedCompanyList}
                  onValueChange={(v) => setHasAcceptedCompanyList(v as 'yes' | 'no' | 'none')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="accepted-yes" />
                    <Label htmlFor="accepted-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="accepted-no" />
                    <Label htmlFor="accepted-no" className="font-normal">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="accepted-none" />
                    <Label htmlFor="accepted-none" className="font-normal">None</Label>
                  </div>
                </RadioGroup>

                {hasAcceptedCompanyList === 'yes' && (
                  <div className="p-3 bg-background rounded border">
                    <Label>Upload Accepted Company List</Label>
                    <Input
                      type="file"
                      onChange={handleAcceptedCompanyFileUpload}
                      className="mt-1"
                    />
                    {acceptedCompanyFile && (
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <FileText className="h-4 w-4" />
                        <span>{acceptedCompanyFile.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setAcceptedCompanyFile(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Is Telemarketing */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Is this a Telemarketing Project?</Label>
                <RadioGroup
                  value={isTelemarketing}
                  onValueChange={(v) => setIsTelemarketing(v as 'yes' | 'no')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="tele-yes" />
                    <Label htmlFor="tele-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="tele-no" />
                    <Label htmlFor="tele-no" className="font-normal">No</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </ScrollArea>
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
