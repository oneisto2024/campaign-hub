import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from
'@/components/ui/dialog';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger } from
'@/components/ui/collapsible';
import {
    Search, ChevronDown, ChevronRight, Mail, Upload, Clock, Send, Plus, Trash2, CalendarIcon, MoreVertical,
    ThumbsUp, Eye, Copy, ExternalLink, TestTube, Info, Tags } from
'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import HolidayBanner from '@/components/HolidayBanner';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import { format, addDays, addHours } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useSeedLists } from '@/contexts/SeedListContext';

// Mock email accounts from Email Config
const MOCK_EMAIL_ACCOUNTS = [
{ id: '1', accountName: 'AWS SES Production', email: 'noreply@company.com' },
{ id: '2', accountName: 'SendGrid Backup', email: 'outreach@company.com' }];


const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PROJECT_TYPES = [
'MQL Campaign', 'Click Campaign', 'ABM Campaign', 'Webinar', 'Appointment Setting', 'API Project', 'Double Touch'];


interface FunnelStep {
  id: string;
  delayDays: number;
  delayHours: number;
  subject: string;
  previewText: string;
  htmlContent: string;
  sendDays: string[];
}

interface Funnel {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  steps: FunnelStep[];
}

interface EmailTemplate {
  htmlCode: string;
  subjectLine: string;
  emailAccountId: string;
  sendType: 'now' | 'schedule';
  scheduledDate?: Date;
  scheduledTime?: string;
}

interface BatchRecord {
  id: string;
  batchName: string;
  validCount: number;
  catchAllCount: number;
  totalCount: number;
  publishedAt: Date;
  template?: EmailTemplate;
  funnels: Funnel[];
  status: 'active' | 'paused' | 'scheduled' | 'draft';
  countries: string[];
}

interface EmailDraftProject {
  id: string;
  clientId: string;
  projectName: string;
  uniqueId: string;
  projectType?: string;
  batches: BatchRecord[];
}

// Mock data
const MOCK_PROJECTS: EmailDraftProject[] = [
{
  id: '1', clientId: 'ACME001', projectName: 'Q1 Appointment Setting Campaign', uniqueId: 'PRJ-2026-001',
  batches: [
  { id: 'b1', batchName: 'Batch 1', validCount: 3200, catchAllCount: 800, totalCount: 4000, publishedAt: new Date('2026-01-15'), funnels: [], status: 'active', countries: ['United States', 'Canada'] },
  { id: 'b2', batchName: 'Batch 2', validCount: 1500, catchAllCount: 300, totalCount: 1800, publishedAt: new Date('2026-01-20'), funnels: [], status: 'draft', countries: ['Germany'] }]

},
{
  id: '2', clientId: 'ACME001', projectName: 'Q2 Webinar Follow-up', uniqueId: 'PRJ-2026-005',
  batches: [
  { id: 'b3', batchName: 'Batch 1', validCount: 2100, catchAllCount: 400, totalCount: 2500, publishedAt: new Date('2026-02-01'), funnels: [], status: 'paused', countries: ['United States', 'Japan', 'Australia', 'Singapore'] }]

},
{
  id: '3', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003',
  batches: [
  { id: 'b4', batchName: 'Batch 1', validCount: 8000, catchAllCount: 2000, totalCount: 10000, publishedAt: new Date('2026-01-25'), funnels: [], status: 'scheduled', countries: ['India'] }]

}];


const EmailDraft = () => {
  const navigate = useNavigate();
  const { seedLists } = useSeedLists();
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<EmailDraftProject[]>(MOCK_PROJECTS);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  // Template dialog
  const [templateDialog, setTemplateDialog] = useState<{projectId: string;batchId: string;} | null>(null);
  const [template, setTemplate] = useState<EmailTemplate>({
    htmlCode: '', subjectLine: '', emailAccountId: '', sendType: 'now'
  });

  // Funnel dialog
  const [funnelDialog, setFunnelDialog] = useState<{projectId: string;batchId: string;} | null>(null);
  const [newFunnelName, setNewFunnelName] = useState('');

  // Funnel step editor
  const [editingFunnel, setEditingFunnel] = useState<{projectId: string;batchId: string;funnelId: string;} | null>(null);

  // HTML Preview dialog
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null);

  // Send Test dialog
  const [sendTestDialog, setSendTestDialog] = useState<{stepId: string;} | null>(null);
  const [testEmail, setTestEmail] = useState({ name: '', email: '', fromAccountId: '', seedListId: '' });

  // Publish dialog
  const [publishDialog, setPublishDialog] = useState<{projectId: string;} | null>(null);
  const [selectedProjectType, setSelectedProjectType] = useState('');

  // Group projects by clientId
  const groupedProjects = useMemo(() => {
    const filtered = searchQuery ?
    projects.filter((p) =>
    p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    ) :
    projects;
    const groups: Record<string, EmailDraftProject[]> = {};
    filtered.forEach((p) => {
      if (!groups[p.clientId]) groups[p.clientId] = [];
      groups[p.clientId].push(p);
    });
    return groups;
  }, [projects, searchQuery]);

  const toggleClient = (clientId: string) => {
    const next = new Set(expandedClients);
    next.has(clientId) ? next.delete(clientId) : next.add(clientId);
    setExpandedClients(next);
  };

  const getClientTotals = (clientProjects: EmailDraftProject[]) => {
    let valid = 0,catchAll = 0,total = 0;
    clientProjects.forEach((p) => p.batches.forEach((b) => {
      valid += b.validCount;catchAll += b.catchAllCount;total += b.totalCount;
    }));
    return { valid, catchAll, total };
  };

  const openTemplateDialog = (projectId: string, batchId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const batch = project?.batches.find((b) => b.id === batchId);
    if (batch?.template) setTemplate(batch.template);else
    setTemplate({ htmlCode: '', subjectLine: '', emailAccountId: '', sendType: 'now' });
    setTemplateDialog({ projectId, batchId });
  };

  const saveTemplate = () => {
    if (!template.subjectLine.trim()) {toast({ title: 'Subject line is required', variant: 'destructive' });return;}
    if (!template.emailAccountId) {toast({ title: 'Select an email account', variant: 'destructive' });return;}
    if (template.sendType === 'schedule' && !template.scheduledDate) {toast({ title: 'Select a schedule date', variant: 'destructive' });return;}
    if (templateDialog) {
      setProjects((prev) => prev.map((p) =>
      p.id === templateDialog.projectId ?
      { ...p, batches: p.batches.map((b) => b.id === templateDialog.batchId ? { ...b, template: { ...template } } : b) } :
      p
      ));
      toast({ title: 'Template saved successfully' });
    }
    setTemplateDialog(null);
  };

  const createFunnel = (projectId: string, batchId: string) => {
    if (!newFunnelName.trim()) {toast({ title: 'Enter a funnel name', variant: 'destructive' });return;}
    const newFunnel: Funnel = {
      id: Date.now().toString(), name: newFunnelName.trim(), status: 'draft',
      steps: [{ id: '1', delayDays: 0, delayHours: 1, subject: '', previewText: '', htmlContent: '', sendDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }]
    };
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ? { ...p, batches: p.batches.map((b) => b.id === batchId ? { ...b, funnels: [...b.funnels, newFunnel] } : b) } : p
    ));
    setNewFunnelName('');
    setFunnelDialog(null);
    toast({ title: `Funnel "${newFunnel.name}" created` });
  };

  const toggleFunnelStatus = (projectId: string, batchId: string, funnelId: string) => {
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ?
    { ...p, batches: p.batches.map((b) => b.id === batchId ? { ...b, funnels: b.funnels.map((f) => f.id === funnelId ? { ...f, status: f.status === 'active' ? 'paused' : 'active' } : f) } : b) } :
    p
    ));
  };

  const cycleBatchStatus = (projectId: string, batchId: string) => {
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ?
    { ...p, batches: p.batches.map((b) => {
      if (b.id !== batchId) return b;
      const next: Record<string, 'active' | 'paused' | 'scheduled' | 'draft'> = { draft: 'active', active: 'paused', paused: 'scheduled', scheduled: 'active' };
      const newStatus = next[b.status] || 'active';
      toast({ title: `Batch "${b.batchName}" → ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}` });
      return { ...b, status: newStatus };
    }) } : p
    ));
  };

  const getBatchStatusBadge = (status: string) => {
    const map: Record<string, { className: string; label: string }> = {
      active: { className: 'bg-chart-1 text-chart-1-foreground hover:bg-chart-1/90', label: '● Active' },
      paused: { className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', label: '● Paused' },
      scheduled: { className: 'bg-chart-4 text-chart-4-foreground hover:bg-chart-4/90', label: '● Scheduled' },
      draft: { className: '', label: '● Draft' },
    };
    const s = map[status] || map.draft;
    return { className: s.className, label: s.label, variant: status === 'draft' ? 'outline' as const : 'default' as const };
  };

  const renderCountryCell = (countries: string[]) => {
    if (!countries || countries.length === 0) return <span className="text-muted-foreground">-</span>;
    if (countries.length === 1) return <span className="text-xs">{countries[0]}</span>;
    if (countries.length === 2) return <span className="text-xs">{countries.join(', ')}</span>;
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs">Multiple Countries</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5"><Info className="h-3 w-3" /></Button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">{countries.join(', ')}</p></TooltipContent>
        </Tooltip>
      </div>
    );
  };

  const deleteFunnel = (projectId: string, batchId: string, funnelId: string) => {
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ? { ...p, batches: p.batches.map((b) => b.id === batchId ? { ...b, funnels: b.funnels.filter((f) => f.id !== funnelId) } : b) } : p
    ));
    toast({ title: 'Funnel deleted' });
  };

  const addFunnelStep = (projectId: string, batchId: string, funnelId: string) => {
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ?
    { ...p, batches: p.batches.map((b) => b.id === batchId ? { ...b, funnels: b.funnels.map((f) => f.id === funnelId ? { ...f, steps: [...f.steps, { id: Date.now().toString(), delayDays: 1, delayHours: 0, subject: '', previewText: '', htmlContent: '', sendDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }] } : f) } : b) } :
    p
    ));
  };

  const duplicateFunnelStep = (projectId: string, batchId: string, funnelId: string, stepId: string) => {
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ?
    {
      ...p, batches: p.batches.map((b) => b.id === batchId ? {
        ...b, funnels: b.funnels.map((f) => {
          if (f.id !== funnelId) return f;
          const idx = f.steps.findIndex((s) => s.id === stepId);
          if (idx === -1) return f;
          const clone = { ...f.steps[idx], id: Date.now().toString() };
          const newSteps = [...f.steps];
          newSteps.splice(idx + 1, 0, clone);
          return { ...f, steps: newSteps };
        })
      } : b)
    } :
    p
    ));
    toast({ title: 'Step duplicated' });
  };

  const updateFunnelStep = (projectId: string, batchId: string, funnelId: string, stepId: string, updates: Partial<FunnelStep>) => {
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ?
    { ...p, batches: p.batches.map((b) => b.id === batchId ? { ...b, funnels: b.funnels.map((f) => f.id === funnelId ? { ...f, steps: f.steps.map((s) => s.id === stepId ? { ...s, ...updates } : s) } : f) } : b) } :
    p
    ));
  };

  const removeFunnelStep = (projectId: string, batchId: string, funnelId: string, stepId: string) => {
    setProjects((prev) => prev.map((p) =>
    p.id === projectId ?
    { ...p, batches: p.batches.map((b) => b.id === batchId ? { ...b, funnels: b.funnels.map((f) => f.id === funnelId ? { ...f, steps: f.steps.filter((s) => s.id !== stepId) } : f) } : b) } :
    p
    ));
  };

  const getEditingFunnelData = () => {
    if (!editingFunnel) return null;
    const project = projects.find((p) => p.id === editingFunnel.projectId);
    const batch = project?.batches.find((b) => b.id === editingFunnel.batchId);
    return batch?.funnels.find((f) => f.id === editingFunnel.funnelId) || null;
  };

  const currentFunnel = getEditingFunnelData();

  // Calculate next funnel trigger
  const getNextTriggerText = (funnel: Funnel): string => {
    if (funnel.status !== 'active') return '';
    const now = new Date();
    let totalDelay = 0;
    for (const step of funnel.steps) {
      totalDelay += step.delayDays * 24 + step.delayHours;
    }
    // Find next applicable day
    const nextTrigger = addHours(addDays(now, funnel.steps[0]?.delayDays || 0), funnel.steps[0]?.delayHours || 0);
    return `Next step triggers ~${format(nextTrigger, 'MMM dd, HH:mm')}`;
  };

  const openHtmlInBrowser = (html: string) => {
    const blob = new Blob([html || '<p>No HTML content</p>'], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleSendTest = () => {
    const hasSeedList = !!testEmail.seedListId;
    const hasManual = testEmail.email.trim();
    if (!testEmail.fromAccountId) {
      toast({ title: 'Select a send-from account', variant: 'destructive' });
      return;
    }
    if (!hasSeedList && !hasManual) {
      toast({ title: 'Enter at least one recipient email or select a seed list', variant: 'destructive' });
      return;
    }
    const seedList = seedLists.find((l) => l.id === testEmail.seedListId);
    const recipients = seedList
      ? seedList.contacts.map((c) => c.email).join(', ')
      : testEmail.email;
    toast({ title: `Test email sent to ${recipients}` });
    setSendTestDialog(null);
    setTestEmail({ name: '', email: '', fromAccountId: '', seedListId: '' });
  };

  const handlePublish = (projectId: string) => {
    if (!selectedProjectType) {toast({ title: 'Select a project type', variant: 'destructive' });return;}
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, projectType: selectedProjectType } : p));
    toast({ title: `Project published as "${selectedProjectType}"` });
    setPublishDialog(null);
    setSelectedProjectType('');
    // Navigate to email sending page based on type
    const typeSlug = selectedProjectType.toLowerCase().replace(/\s+/g, '-');
    navigate(`/campaign/${typeSlug}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-light text-muted-foreground">Email Draft</p>
          <h1 className="text-2xl font-semibold text-foreground">All Content</h1>
        </div>
          <Button variant="outline" onClick={() => window.open('/merge-tags', '_blank')}>
            <Tags className="h-4 w-4 mr-2" /> Merge Tags
          </Button>
      </div>

      <HolidayBanner />

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Projects by Client
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {Object.keys(groupedProjects).length === 0 ?
          <div className="p-8 text-center text-muted-foreground">No projects found</div> :

          <div className="divide-y divide-border">
              {Object.entries(groupedProjects).map(([clientId, clientProjects]) => {
              const totals = getClientTotals(clientProjects);
              const isExpanded = expandedClients.has(clientId);

              return (
                <Collapsible key={clientId} open={isExpanded} onOpenChange={() => toggleClient(clientId)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <span className="font-mono font-semibold text-sm">{clientId}</span>
                          <Badge variant="secondary">{clientProjects.length} project{clientProjects.length > 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Total:</span>
                            <Badge variant="outline">{totals.total.toLocaleString()}</Badge>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="bg-muted/20">
                        {clientProjects.map((project) =>
                      <div key={project.id} className="border-t border-border/50">
                            <div className="px-6 py-3 flex items-center justify-between shadow-none bg-purple-50">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-sm">{project.projectName}</span>
                                <span className="font-mono text-xs text-muted-foreground">{project.uniqueId}</span>
                                {project.projectType && <Badge variant="outline" className="text-xs">{project.projectType}</Badge>}
                              </div>
                              <Button size="sm" variant={project.projectType ? 'secondary' : 'default'} onClick={() => {setPublishDialog({ projectId: project.id });setSelectedProjectType(project.projectType || '');}}>
                                <Send className="h-3 w-3 mr-1" /> {project.projectType ? 'Re-publish' : 'Publish'}
                              </Button>
                            </div>

                            <div className="px-6 pb-4 bg-secondary-foreground">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border/50">
                                    <th className="text-left py-2 font-medium text-muted-foreground w-8">S.No</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">Batch</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">Total</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">Country</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">Template</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">Status</th>
                                    <th className="text-left py-2 font-medium text-muted-foreground">Funnels</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {project.batches.map((batch, bIdx) =>
                              <tr key={batch.id} className="border-b border-border/30 last:border-0">
                                      <td className="py-3 text-muted-foreground text-xs">{bIdx + 1}</td>
                                      <td className="py-3 font-medium">{batch.batchName}</td>
                                      <td className="py-3">{batch.totalCount.toLocaleString()}</td>
                                      <td className="py-3">{renderCountryCell(batch.countries)}</td>
                                      <td className="py-3">
                                        <Button variant={batch.template ? 'secondary' : 'outline'} size="sm" onClick={() => openTemplateDialog(project.id, batch.id)}>
                                          <Upload className="h-3 w-3 mr-1" /> {batch.template ? 'Edit Template' : 'Upload Template'}
                                        </Button>
                                      </td>
                                      <td className="py-3">
                                        {(() => {
                                          const s = getBatchStatusBadge(batch.status);
                                          return (
                                            <Badge
                                              variant={s.variant}
                                              className={`cursor-pointer text-xs ${s.className}`}
                                              onClick={() => cycleBatchStatus(project.id, batch.id)}
                                            >
                                              {s.label}
                                            </Badge>
                                          );
                                        })()}
                                      </td>
                                      <td className="py-3">
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline">{batch.funnels.length} funnel{batch.funnels.length !== 1 ? 's' : ''}</Badge>
                                          <Button variant="outline" size="sm" onClick={() => setFunnelDialog({ projectId: project.id, batchId: batch.id })}>
                                            <Plus className="h-3 w-3 mr-1" /> Funnel
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                              )}
                                </tbody>
                              </table>

                              {/* Funnels display per batch */}
                              {project.batches.map((batch) =>
                          batch.funnels.length > 0 &&
                          <div key={`funnels-${batch.id}`} className="mt-3 space-y-2">
                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                      {batch.batchName} — Funnels
                                    </h5>
                                    <div className="flex flex-wrap gap-3">
                                      {batch.funnels.map((funnel) =>
                              <div key={funnel.id} className="space-y-1">
                                          <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 shadow-sm">
                                            <span className="text-sm font-medium">{funnel.name}</span>
                                            <Badge
                                    variant={funnel.status === 'draft' ? 'outline' : 'default'}
                                    className={`text-xs gap-1 ${funnel.status === 'active' ? 'bg-chart-1 text-chart-1-foreground hover:bg-chart-1/90' : funnel.status === 'paused' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}`}>
                                    
                                              {funnel.status === 'active' && <ThumbsUp className="h-3 w-3" />}
                                              {funnel.status === 'active' ? 'Active' : funnel.status === 'paused' ? 'Paused' : 'Draft'}
                                            </Badge>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="h-4 w-4" /></Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingFunnel({ projectId: project.id, batchId: batch.id, funnelId: funnel.id })}>Edit Steps</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => toggleFunnelStatus(project.id, batch.id, funnel.id)}>{funnel.status === 'active' ? 'Pause' : 'Activate'}</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteFunnel(project.id, batch.id, funnel.id)}>Delete</DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                          {/* Next trigger note */}
                                          {funnel.status === 'active' &&
                                <p className="text-[11px] text-muted-foreground pl-1">
                                              {getNextTriggerText(funnel)}
                                            </p>
                                }
                                        </div>
                              )}
                                    </div>
                                  </div>

                          )}
                            </div>
                          </div>
                      )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>);

            })}
            </div>
          }
        </CardContent>
      </Card>

      {/* Upload Template Dialog */}
      <Dialog open={!!templateDialog} onOpenChange={(open) => !open && setTemplateDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Email Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Line *</Label>
              <Input value={template.subjectLine} onChange={(e) => setTemplate({ ...template, subjectLine: e.target.value })} placeholder="Enter email subject line" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>HTML Code *</Label>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setHtmlPreview(template.htmlCode)} disabled={!template.htmlCode}>
                    <Eye className="h-3 w-3 mr-1" /> Preview
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openHtmlInBrowser(template.htmlCode)} disabled={!template.htmlCode}>
                    <ExternalLink className="h-3 w-3 mr-1" /> Browser
                  </Button>
                </div>
              </div>
              <Textarea value={template.htmlCode} onChange={(e) => setTemplate({ ...template, htmlCode: e.target.value })} placeholder="Paste your HTML email template here..." className="min-h-[200px] font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>Send From (Email Account) *</Label>
              <Select value={template.emailAccountId} onValueChange={(v) => setTemplate({ ...template, emailAccountId: v })}>
                <SelectTrigger><SelectValue placeholder="Select email account" /></SelectTrigger>
                <SelectContent>
                  {MOCK_EMAIL_ACCOUNTS.map((acc) =>
                  <SelectItem key={acc.id} value={acc.id}>{acc.accountName} ({acc.email})</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Send Option</Label>
              <div className="flex items-center gap-4">
                <Button variant={template.sendType === 'now' ? 'default' : 'outline'} size="sm" onClick={() => setTemplate({ ...template, sendType: 'now', scheduledDate: undefined, scheduledTime: undefined })}>
                  <Send className="h-3 w-3 mr-1" /> Send Now
                </Button>
                <Button variant={template.sendType === 'schedule' ? 'default' : 'outline'} size="sm" onClick={() => setTemplate({ ...template, sendType: 'schedule' })}>
                  <Clock className="h-3 w-3 mr-1" /> Schedule
                </Button>
              </div>
              {template.sendType === 'schedule' &&
              <div className="flex items-center gap-4 mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {template.scheduledDate ? format(template.scheduledDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={template.scheduledDate} onSelect={(d) => setTemplate({ ...template, scheduledDate: d })} disabled={(date) => date < new Date()} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <Input type="time" value={template.scheduledTime || ''} onChange={(e) => setTemplate({ ...template, scheduledTime: e.target.value })} className="w-[140px]" />
                </div>
              }
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateDialog(null)}>Cancel</Button>
            <Button onClick={saveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Funnel Dialog */}
      <Dialog open={!!funnelDialog} onOpenChange={(open) => !open && setFunnelDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Funnel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Funnel Name *</Label>
              <Input value={newFunnelName} onChange={(e) => setNewFunnelName(e.target.value)} placeholder="e.g. Open-Follow-ups" />
            </div>
            <p className="text-sm text-muted-foreground">
              How soon do you want the first message sent when someone enters this funnel?
              You can configure delays and content for each step after creation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFunnelDialog(null)}>Cancel</Button>
            <Button onClick={() => funnelDialog && createFunnel(funnelDialog.projectId, funnelDialog.batchId)}>Create Funnel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Funnel Steps Editor Dialog */}
      <Dialog open={!!editingFunnel} onOpenChange={(open) => !open && setEditingFunnel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Funnel Steps — {currentFunnel?.name}</DialogTitle>
          </DialogHeader>
          {currentFunnel && editingFunnel &&
          <ScrollArea className="h-[65vh] pr-4">
              <div className="space-y-4">
                {currentFunnel.steps.map((step, index) =>
              <Card key={step.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Step {index + 1}</CardTitle>
                        <div className="flex items-center gap-1">
                          {/* HTML Preview */}
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Preview HTML" onClick={() => setHtmlPreview(step.htmlContent)} disabled={!step.htmlContent}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          {/* Open in Browser */}
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="View in browser" onClick={() => openHtmlInBrowser(step.htmlContent)} disabled={!step.htmlContent}>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                          {/* Send Test */}
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Send test email" onClick={() => setSendTestDialog({ stepId: step.id })}>
                            <TestTube className="h-3 w-3" />
                          </Button>
                          {/* Duplicate */}
                          <Button variant="ghost" size="icon" className="h-7 w-7" title="Duplicate step" onClick={() => duplicateFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          {/* Delete */}
                          {currentFunnel.steps.length > 1 &&
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                      }
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs">{index === 0 ? 'Send first message after:' : 'Wait before sending:'}</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" min={0} className="w-20" value={step.delayDays} onChange={(e) => updateFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id, { delayDays: parseInt(e.target.value) || 0 })} />
                          <span className="text-sm text-muted-foreground">days</span>
                          <Input type="number" min={0} max={23} className="w-20" value={step.delayHours} onChange={(e) => updateFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id, { delayHours: parseInt(e.target.value) || 0 })} />
                          <span className="text-sm text-muted-foreground">hours</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Subject Line</Label>
                          <Input value={step.subject} onChange={(e) => updateFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id, { subject: e.target.value })} placeholder="Email subject" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Preview Text</Label>
                          <Input value={step.previewText} onChange={(e) => updateFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id, { previewText: e.target.value })} placeholder="Preview text" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email Content (HTML)</Label>
                        <Textarea value={step.htmlContent} onChange={(e) => updateFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id, { htmlContent: e.target.value })} placeholder="Paste HTML content..." className="min-h-[100px] font-mono text-xs" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Send on these days</Label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map((day) => {
                        const isChecked = step.sendDays.includes(day);
                        return (
                          <div key={day} className="flex items-center gap-1.5">
                                <Checkbox id={`${step.id}-${day}`} checked={isChecked} onCheckedChange={(checked) => {
                              const newDays = checked ? [...step.sendDays, day] : step.sendDays.filter((d) => d !== day);
                              updateFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId, step.id, { sendDays: newDays });
                            }} />
                                <label htmlFor={`${step.id}-${day}`} className="text-xs">{day.slice(0, 3)}</label>
                              </div>);

                      })}
                        </div>
                      </div>
                    </CardContent>
                    {index < currentFunnel.steps.length - 1 &&
                <div className="flex justify-center py-1 text-muted-foreground"><ChevronDown className="h-5 w-5" /></div>
                }
                  </Card>
              )}
                <Button variant="outline" className="w-full" onClick={() => addFunnelStep(editingFunnel.projectId, editingFunnel.batchId, editingFunnel.funnelId)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Step
                </Button>
              </div>
            </ScrollArea>
          }
          <DialogFooter>
            <Button onClick={() => {setEditingFunnel(null);toast({ title: 'Funnel steps saved' });}}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HTML Preview Dialog */}
      <Dialog open={!!htmlPreview} onOpenChange={(open) => !open && setHtmlPreview(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>HTML Preview</DialogTitle>
          </DialogHeader>
          <div className="border rounded-md overflow-hidden bg-background">
            <iframe srcDoc={htmlPreview || ''} className="w-full h-[60vh] border-0" title="Email Preview" sandbox="allow-same-origin" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => htmlPreview && openHtmlInBrowser(htmlPreview)}>
              <ExternalLink className="h-4 w-4 mr-2" /> Open in Browser
            </Button>
            <Button onClick={() => setHtmlPreview(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Test Email Dialog */}
      <Dialog open={!!sendTestDialog} onOpenChange={(open) => !open && setSendTestDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Send a test version of this step to verify the template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient Name</Label>
              <Input value={testEmail.name} onChange={(e) => setTestEmail({ ...testEmail, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Recipient Email(s)</Label>
              <Input
                value={testEmail.email}
                onChange={(e) => setTestEmail({ ...testEmail, email: e.target.value, seedListId: '' })}
                placeholder="test@example.com, another@example.com"
                disabled={!!testEmail.seedListId}
              />
              <p className="text-[11px] text-muted-foreground">Comma-separated for multiple recipients</p>
            </div>

            {seedLists.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-border" />
                  <span className="text-xs text-muted-foreground px-2">or use a seed list</span>
                  <div className="flex-1 border-t border-border" />
                </div>
                <Label>Select Seed List</Label>
                <Select
                  value={testEmail.seedListId}
                  onValueChange={(v) => setTestEmail({ ...testEmail, seedListId: v, email: v ? '' : testEmail.email })}
                >
                  <SelectTrigger><SelectValue placeholder="Choose a seed list..." /></SelectTrigger>
                  <SelectContent>
                    {seedLists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name} ({list.contacts.length} contact{list.contacts.length !== 1 ? 's' : ''})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {testEmail.seedListId && (
                  <div className="rounded-md bg-muted/50 border border-border p-2 text-xs space-y-1">
                    {seedLists.find((l) => l.id === testEmail.seedListId)?.contacts.map((c) => (
                      <div key={c.id} className="font-mono text-muted-foreground">{c.email}{c.firstName ? ` — ${c.firstName} ${c.lastName}`.trim() : ''}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Send From</Label>
              <Select value={testEmail.fromAccountId} onValueChange={(v) => setTestEmail({ ...testEmail, fromAccountId: v })}>
                <SelectTrigger><SelectValue placeholder="Select email account" /></SelectTrigger>
                <SelectContent>
                  {MOCK_EMAIL_ACCOUNTS.map((acc) =>
                  <SelectItem key={acc.id} value={acc.id}>{acc.accountName} ({acc.email})</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendTestDialog(null)}>Cancel</Button>
            <Button onClick={handleSendTest}><Send className="h-4 w-4 mr-2" /> Send Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Dialog - Project Type Selection */}
      <Dialog open={!!publishDialog} onOpenChange={(open) => !open && setPublishDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Publish to Email Sending</DialogTitle>
            <DialogDescription>Select the project type to categorize this project in Email Sending.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Type *</Label>
              <Select value={selectedProjectType} onValueChange={setSelectedProjectType}>
                <SelectTrigger><SelectValue placeholder="Select project type" /></SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((type) =>
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialog(null)}>Cancel</Button>
            <Button onClick={() => publishDialog && handlePublish(publishDialog.projectId)}>
              <Send className="h-4 w-4 mr-2" /> Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);

};

export default EmailDraft;