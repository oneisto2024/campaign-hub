import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, ChevronDown, ChevronRight, Mail, Eye, BarChart3, Globe, Settings, Activity,
  MousePointerClick, Users, ArrowUpRight, ArrowDownRight, TrendingUp, Reply, GitBranch, Download,
  Webhook, Link2, FileJson, Server, Filter, Info,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import HolidayBanner from '@/components/HolidayBanner';

const PROJECT_TYPES = ['ABM Campaign', 'Webinar', 'Click Campaign', 'MQL Campaign', 'Lead Generation', 'Funnel Set'];

interface EmailDetail {
  email: string;
  timestamp: Date;
  action: string;
}

interface FunnelStepStat {
  stepName: string;
  sent: number;
  opens: number;
  clicks: number;
  bounced: number;
}

interface SendingProject {
  id: string;
  clientId: string;
  projectName: string;
  uniqueId: string;
  projectType: string;
  sentAt: Date;
  sentFromEmail: string;
  countries: string[];
  totalDB: number;
  sent: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounced: number;
  softBounced: number;
  unsubscribed: number;
  complained: number;
  replied: number;
  funnelCount: number;
  hasFunnel: boolean;
  funnelStats: FunnelStepStat[];
  templateHtml: string;
  domains: { domain: string; count: number }[];
  dailyStats: { date: string; opens: number; clicks: number; bounces: number }[];
  emailDetails: {
    opens: EmailDetail[];
    clicks: EmailDetail[];
    bounces: EmailDetail[];
    unsubs: EmailDetail[];
    replies: EmailDetail[];
  };
  webhookUrl?: string;
  webhookEvents?: string[];
  apiKey?: string;
}

const MOCK_DATA: SendingProject[] = [
  {
    id: '1', clientId: 'ACME001', projectName: 'Q1 Lead Generation Campaign', uniqueId: 'PRJ-2026-001',
    projectType: 'Lead Generation', sentAt: new Date('2026-01-20'), sentFromEmail: 'outreach@acme-campaigns.com', countries: ['United States', 'Canada'], totalDB: 4000, sent: 3800, delivered: 3650,
    opens: 1825, uniqueOpens: 1200, clicks: 456, uniqueClicks: 320, bounced: 80, softBounced: 70,
    unsubscribed: 23, complained: 2, replied: 45, funnelCount: 2, hasFunnel: true,
    funnelStats: [
      { stepName: 'Step 1 - Initial Outreach', sent: 3800, opens: 1200, clicks: 320, bounced: 80 },
      { stepName: 'Step 2 - Follow-up', sent: 2800, opens: 850, clicks: 200, bounced: 30 },
    ],
    templateHtml: '<html><body><h1>Hello {{name}}</h1><p>Check out our <a href="https://example.com/offer">special offer</a></p><a href="https://example.com/demo">Book a demo</a></body></html>',
    domains: [
      { domain: 'gmail.com', count: 1200 }, { domain: 'outlook.com', count: 800 }, { domain: 'yahoo.com', count: 450 },
      { domain: 'company.com', count: 350 }, { domain: 'hotmail.com', count: 200 }, { domain: 'other', count: 800 },
    ],
    dailyStats: [
      { date: 'Jan 20', opens: 450, clicks: 120, bounces: 30 }, { date: 'Jan 21', opens: 380, clicks: 95, bounces: 20 },
      { date: 'Jan 22', opens: 300, clicks: 80, bounces: 10 }, { date: 'Jan 23', opens: 250, clicks: 60, bounces: 8 },
      { date: 'Jan 24', opens: 200, clicks: 50, bounces: 5 }, { date: 'Jan 25', opens: 145, clicks: 31, bounces: 4 },
      { date: 'Jan 26', opens: 100, clicks: 20, bounces: 3 },
    ],
    emailDetails: {
      opens: [
        { email: 'john.smith@gmail.com', timestamp: new Date('2026-01-20T10:30:00'), action: 'Opened' },
        { email: 'jane.doe@outlook.com', timestamp: new Date('2026-01-20T11:15:00'), action: 'Opened' },
        { email: 'bob@company.com', timestamp: new Date('2026-01-21T09:00:00'), action: 'Opened' },
        { email: 'alice@yahoo.com', timestamp: new Date('2026-01-21T14:22:00'), action: 'Opened' },
        { email: 'mike@hotmail.com', timestamp: new Date('2026-01-22T08:45:00'), action: 'Opened' },
      ],
      clicks: [
        { email: 'john.smith@gmail.com', timestamp: new Date('2026-01-20T10:32:00'), action: 'Clicked - special offer' },
        { email: 'jane.doe@outlook.com', timestamp: new Date('2026-01-20T11:18:00'), action: 'Clicked - demo' },
        { email: 'bob@company.com', timestamp: new Date('2026-01-21T09:05:00'), action: 'Clicked - special offer' },
      ],
      bounces: [
        { email: 'invalid@fake.com', timestamp: new Date('2026-01-20T10:01:00'), action: 'Hard Bounce' },
        { email: 'temp@expired.com', timestamp: new Date('2026-01-20T10:02:00'), action: 'Soft Bounce' },
      ],
      unsubs: [
        { email: 'nomore@gmail.com', timestamp: new Date('2026-01-21T16:00:00'), action: 'Unsubscribed' },
      ],
      replies: [
        { email: 'john.smith@gmail.com', timestamp: new Date('2026-01-20T12:00:00'), action: 'Reply - Interested' },
        { email: 'bob@company.com', timestamp: new Date('2026-01-21T10:30:00'), action: 'Reply - Schedule call' },
      ],
    },
    webhookUrl: 'https://api.acme.com/webhooks/email-events',
    webhookEvents: ['delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained'],
    apiKey: 'ak_live_xxxx...xxxx',
  },
  {
    id: '2', clientId: 'ACME001', projectName: 'Q2 Webinar Follow-up', uniqueId: 'PRJ-2026-005',
    projectType: 'Webinar', sentAt: new Date('2026-02-05'), sentFromEmail: 'events@acme-marketing.com', countries: ['Germany'], totalDB: 2500, sent: 2400, delivered: 2350,
    opens: 1410, uniqueOpens: 950, clicks: 380, uniqueClicks: 280, bounced: 30, softBounced: 20,
    unsubscribed: 8, complained: 1, replied: 22, funnelCount: 0, hasFunnel: false, funnelStats: [],
    templateHtml: '<html><body><h1>Webinar Invite</h1><a href="https://example.com/register">Register Now</a></body></html>',
    domains: [
      { domain: 'gmail.com', count: 900 }, { domain: 'outlook.com', count: 600 }, { domain: 'company.com', count: 500 },
      { domain: 'yahoo.com', count: 250 }, { domain: 'other', count: 250 },
    ],
    dailyStats: [
      { date: 'Feb 5', opens: 500, clicks: 150, bounces: 15 }, { date: 'Feb 6', opens: 350, clicks: 90, bounces: 8 },
      { date: 'Feb 7', opens: 280, clicks: 70, bounces: 4 }, { date: 'Feb 8', opens: 180, clicks: 40, bounces: 2 },
      { date: 'Feb 9', opens: 100, clicks: 30, bounces: 1 },
    ],
    emailDetails: {
      opens: [
        { email: 'sarah@gmail.com', timestamp: new Date('2026-02-05T09:00:00'), action: 'Opened' },
        { email: 'tom@outlook.com', timestamp: new Date('2026-02-05T10:30:00'), action: 'Opened' },
      ],
      clicks: [
        { email: 'sarah@gmail.com', timestamp: new Date('2026-02-05T09:05:00'), action: 'Clicked - Register' },
      ],
      bounces: [{ email: 'bad@invalid.com', timestamp: new Date('2026-02-05T09:01:00'), action: 'Hard Bounce' }],
      unsubs: [],
      replies: [{ email: 'tom@outlook.com', timestamp: new Date('2026-02-05T11:00:00'), action: 'Reply - Question about webinar' }],
    },
    webhookUrl: '',
    webhookEvents: [],
  },
  {
    id: '3', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003',
    projectType: 'ABM Campaign', sentAt: new Date('2026-01-28'), sentFromEmail: 'sales@globex-outreach.com', countries: ['United States', 'Japan', 'Australia', 'Singapore'], totalDB: 10000, sent: 9500, delivered: 9200,
    opens: 4600, uniqueOpens: 3200, clicks: 1380, uniqueClicks: 980, bounced: 180, softBounced: 120,
    unsubscribed: 45, complained: 5, replied: 120, funnelCount: 3, hasFunnel: true,
    funnelStats: [
      { stepName: 'Step 1 - Intro Email', sent: 9500, opens: 3200, clicks: 980, bounced: 180 },
      { stepName: 'Step 2 - Case Study', sent: 7000, opens: 2100, clicks: 650, bounced: 50 },
      { stepName: 'Step 3 - Final CTA', sent: 5500, opens: 1500, clicks: 400, bounced: 20 },
    ],
    templateHtml: '<html><body><h1>ABM Outreach</h1><a href="https://example.com/case-study">Case Study</a><a href="https://example.com/whitepaper">Whitepaper</a><a href="https://example.com/contact">Contact Us</a></body></html>',
    domains: [
      { domain: 'gmail.com', count: 3000 }, { domain: 'outlook.com', count: 2500 }, { domain: 'yahoo.com', count: 1500 },
      { domain: 'company.com', count: 1200 }, { domain: 'hotmail.com', count: 500 }, { domain: 'other', count: 1300 },
    ],
    dailyStats: [
      { date: 'Jan 28', opens: 1200, clicks: 400, bounces: 60 }, { date: 'Jan 29', opens: 900, clicks: 300, bounces: 40 },
      { date: 'Jan 30', opens: 750, clicks: 250, bounces: 30 }, { date: 'Jan 31', opens: 600, clicks: 180, bounces: 20 },
      { date: 'Feb 1', opens: 500, clicks: 130, bounces: 15 }, { date: 'Feb 2', opens: 400, clicks: 80, bounces: 10 },
      { date: 'Feb 3', opens: 250, clicks: 40, bounces: 5 },
    ],
    emailDetails: {
      opens: [
        { email: 'cto@fortune500.com', timestamp: new Date('2026-01-28T08:00:00'), action: 'Opened' },
        { email: 'cfo@enterprise.com', timestamp: new Date('2026-01-28T09:30:00'), action: 'Opened' },
        { email: 'vp@bigcorp.com', timestamp: new Date('2026-01-29T07:15:00'), action: 'Opened' },
      ],
      clicks: [
        { email: 'cto@fortune500.com', timestamp: new Date('2026-01-28T08:05:00'), action: 'Clicked - Case Study' },
        { email: 'vp@bigcorp.com', timestamp: new Date('2026-01-29T07:20:00'), action: 'Clicked - Contact Us' },
      ],
      bounces: [{ email: 'old@defunct.com', timestamp: new Date('2026-01-28T08:01:00'), action: 'Hard Bounce' }],
      unsubs: [{ email: 'nope@corp.com', timestamp: new Date('2026-01-30T12:00:00'), action: 'Unsubscribed' }],
      replies: [
        { email: 'cto@fortune500.com', timestamp: new Date('2026-01-28T14:00:00'), action: 'Reply - Let\'s talk' },
        { email: 'vp@bigcorp.com', timestamp: new Date('2026-01-29T16:00:00'), action: 'Reply - Send more info' },
      ],
    },
    webhookUrl: 'https://api.globex.com/hooks/campaigns',
    webhookEvents: ['delivered', 'opened', 'clicked', 'bounced'],
    apiKey: 'ak_live_yyyy...yyyy',
  },
];

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))'];

type StatType = 'opens' | 'clicks' | 'bounces' | 'unsubs' | 'replies' | null;

const statIconColors: Record<string, string> = {
  Sent: 'bg-chart-4/15 text-chart-4',
  Delivered: 'bg-primary/15 text-primary',
  'Open Rate': 'bg-chart-2/15 text-chart-2',
  'Click Rate': 'bg-chart-1/15 text-chart-1',
  Bounced: 'bg-destructive/15 text-destructive',
  Unsubs: 'bg-destructive/10 text-destructive/70',
  Replied: 'bg-chart-3/15 text-chart-3',
  Funnels: 'bg-chart-5/15 text-chart-5',
  'Total DB': 'bg-muted text-muted-foreground',
  'Unique Opens': 'bg-chart-2/10 text-chart-2',
  'Total Opens': 'bg-chart-2/10 text-chart-2',
  'Unique Clicks': 'bg-chart-1/10 text-chart-1',
  'Hard Bounced': 'bg-destructive/15 text-destructive',
  'Soft Bounced': 'bg-destructive/10 text-destructive/60',
  Unsubscribed: 'bg-destructive/10 text-destructive/70',
  'Complaint Rate': 'bg-destructive/10 text-destructive/60',
};

const StatBox = ({ label, value, icon: Icon, trend, onClick }: {
  label: string; value: string | number; icon: React.ElementType; trend?: 'up' | 'down'; onClick?: () => void;
}) => {
  const colorClass = statIconColors[label] || 'bg-muted text-muted-foreground';
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-border bg-background p-3 ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className={`rounded-md p-2 ${colorClass}`}><Icon className="h-4 w-4" /></div>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className="flex items-center gap-1">
          <p className="text-lg font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-chart-1" />}
          {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-destructive" />}
        </div>
      </div>
    </div>
  );
};

const exportToCsv = (data: EmailDetail[], filename: string) => {
  if (!data.length) return;
  const headers = ['Email', 'Timestamp', 'Action'];
  const rows = data.map(d => [d.email, d.timestamp.toISOString(), d.action]);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const WEBHOOK_EVENTS = ['delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained', 'deferred', 'dropped', 'spam_report'];

const EmailSending = () => {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [detailProject, setDetailProject] = useState<SendingProject | null>(null);
  const [detailTab, setDetailTab] = useState('summary');

  // Derive activeTypeTab from URL param
  const activeTypeTab = useMemo(() => {
    if (!type) return 'all';
    const decoded = type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return PROJECT_TYPES.includes(decoded) ? decoded : 'all';
  }, [type]);

  // When tab changes, navigate to the correct URL
  const handleTabChange = (val: string) => {
    if (val === 'all') {
      navigate('/campaign/all');
    } else {
      const slug = val.toLowerCase().replace(/\s+/g, '-');
      navigate(`/campaign/${slug}`);
    }
  };

  const [drillDown, setDrillDown] = useState<{ project: SendingProject; type: StatType } | null>(null);
  // Funnel step drilldown
  const [funnelDrillDown, setFunnelDrillDown] = useState<{ project: SendingProject; step: FunnelStepStat; statKey: string } | null>(null);

  // Filters
  const [filterCid, setFilterCid] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const allCids = useMemo(() => [...new Set(MOCK_DATA.map(p => p.clientId))], []);

  const filteredProjects = useMemo(() => {
    let data = MOCK_DATA;
    if (activeTypeTab !== 'all') {
      data = data.filter(p => p.projectType === activeTypeTab);
    }
    if (filterCid !== 'all') {
      data = data.filter(p => p.clientId === filterCid);
    }
    if (filterType !== 'all') {
      data = data.filter(p => p.projectType === filterType);
    }
    if (searchQuery) {
      data = data.filter(p =>
        p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  }, [activeTypeTab, searchQuery, filterCid, filterType]);

  const groupedByCid = useMemo(() => {
    const groups: Record<string, SendingProject[]> = {};
    filteredProjects.forEach(p => {
      if (!groups[p.clientId]) groups[p.clientId] = [];
      groups[p.clientId].push(p);
    });
    return groups;
  }, [filteredProjects]);

  const toggleClient = (cid: string) => {
    const next = new Set(expandedClients);
    next.has(cid) ? next.delete(cid) : next.add(cid);
    setExpandedClients(next);
  };

  const getGroupTotals = (projs: SendingProject[]) => {
    return projs.reduce((acc, p) => ({
      sent: acc.sent + p.sent, delivered: acc.delivered + p.delivered, opens: acc.opens + p.opens,
      clicks: acc.clicks + p.clicks, bounced: acc.bounced + p.bounced, unsub: acc.unsub + p.unsubscribed,
    }), { sent: 0, delivered: 0, opens: 0, clicks: 0, bounced: 0, unsub: 0 });
  };

  const extractLinks = (html: string) => {
    const regex = /href="([^"]+)"/g;
    const links: string[] = [];
    let match;
    while ((match = regex.exec(html)) !== null) links.push(match[1]);
    return links;
  };

  const openRate = (p: SendingProject) => p.delivered > 0 ? ((p.uniqueOpens / p.delivered) * 100).toFixed(1) : '0';
  const clickRate = (p: SendingProject) => p.delivered > 0 ? ((p.uniqueClicks / p.delivered) * 100).toFixed(1) : '0';
  const bounceRate = (p: SendingProject) => p.sent > 0 ? (((p.bounced + p.softBounced) / p.sent) * 100).toFixed(1) : '0';

  const renderCountryCell = (countries: string[]) => {
    if (!countries || countries.length === 0) return <span className="text-muted-foreground text-xs">-</span>;
    if (countries.length === 1) return <Badge variant="outline" className="text-xs">{countries[0]}</Badge>;
    if (countries.length === 2) return <Badge variant="outline" className="text-xs">{countries.join(', ')}</Badge>;
    return (
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="text-xs">Multiple Countries</Badge>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-5 w-5"><Info className="h-3 w-3" /></Button>
          </TooltipTrigger>
          <TooltipContent><p className="text-xs">{countries.join(', ')}</p></TooltipContent>
        </Tooltip>
      </div>
    );
  };

  const chartConfig = { opens: { label: 'Opens', color: 'hsl(var(--primary))' }, clicks: { label: 'Clicks', color: 'hsl(var(--chart-2))' }, bounces: { label: 'Bounces', color: 'hsl(var(--destructive))' } };
  const domainConfig = { count: { label: 'Emails', color: 'hsl(var(--primary))' } };

  const getDrillDownData = () => {
    if (!drillDown) return [];
    const { project, type } = drillDown;
    if (!type) return [];
    return project.emailDetails[type] || [];
  };

  const getDrillDownDailyChart = () => {
    if (!drillDown?.type || !drillDown.project) return [];
    const details = drillDown.project.emailDetails[drillDown.type] || [];
    const dayMap: Record<string, number> = {};
    details.forEach(d => {
      const day = d.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    return Object.entries(dayMap).map(([date, count]) => ({ date, count }));
  };

  const drillDownLabel: Record<string, string> = {
    opens: 'Opens', clicks: 'Clicks', bounces: 'Bounces', unsubs: 'Unsubscribes', replies: 'Replies',
  };

  // Generate mock funnel step email details
  const getFunnelStepEmails = (step: FunnelStepStat, statKey: string): EmailDetail[] => {
    const count = statKey === 'opens' ? step.opens : statKey === 'clicks' ? step.clicks : statKey === 'bounced' ? step.bounced : step.sent;
    const mockEmails: EmailDetail[] = [];
    const domains = ['gmail.com', 'outlook.com', 'company.com', 'yahoo.com'];
    for (let i = 0; i < Math.min(count, 10); i++) {
      mockEmails.push({
        email: `user${i + 1}@${domains[i % domains.length]}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        action: statKey === 'opens' ? 'Opened' : statKey === 'clicks' ? 'Clicked' : statKey === 'bounced' ? 'Bounced' : 'Sent',
      });
    }
    return mockEmails;
  };

  let globalSno = 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Email Sending</p>
        <h1 className="text-2xl font-semibold text-foreground">Campaign Stats</h1>
      </div>

      <HolidayBanner />

      <Tabs value={activeTypeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {PROJECT_TYPES.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCid} onValueChange={setFilterCid}>
            <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Client ID" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {allCids.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Project Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {Object.keys(groupedByCid).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No projects found</div>
          ) : (
            <div className="divide-y divide-border">
              {Object.entries(groupedByCid).map(([cid, projs]) => {
                const totals = getGroupTotals(projs);
                const isExpanded = expandedClients.has(cid);

                return (
                  <Collapsible key={cid} open={isExpanded} onOpenChange={() => toggleClient(cid)}>
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <span className="font-mono font-semibold text-sm">{cid}</span>
                          <Badge variant="secondary">{projs.length} project{projs.length > 1 ? 's' : ''}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground">Sent: <strong>{totals.sent.toLocaleString()}</strong></span>
                          <span className="text-muted-foreground">Opens: <strong>{totals.opens.toLocaleString()}</strong></span>
                          <span className="text-muted-foreground">Clicks: <strong>{totals.clicks.toLocaleString()}</strong></span>
                          <span className="text-muted-foreground">Bounced: <strong>{totals.bounced.toLocaleString()}</strong></span>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="bg-muted/20">
                        {projs.map((project) => {
                          globalSno++;
                          return (
                          <div key={project.id} className="border-t border-border/50 px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-muted-foreground w-6">{globalSno}.</span>
                                <span className="font-medium text-sm">{project.projectName}</span>
                                <span className="font-mono text-xs text-muted-foreground">{project.uniqueId}</span>
                                <Badge variant="outline" className="text-xs">{project.projectType}</Badge>
                                {renderCountryCell(project.countries)}
                              </div>
                              <Button size="sm" variant="outline" onClick={() => { setDetailProject(project); setDetailTab('summary'); }}>
                                <Eye className="h-3 w-3 mr-1" /> Details
                              </Button>
                            </div>

                            {/* Section 1: Main Stats */}
                            <div className="mb-3">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">Campaign Stats</p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                                <StatBox label="Sent" value={project.sent} icon={Mail} />
                                <StatBox label="Delivered" value={project.delivered} icon={Activity} />
                                <StatBox label="Open Rate" value={`${openRate(project)}%`} icon={Eye} trend="up"
                                  onClick={() => setDrillDown({ project, type: 'opens' })} />
                                <StatBox label="Click Rate" value={`${clickRate(project)}%`} icon={MousePointerClick} trend="up"
                                  onClick={() => setDrillDown({ project, type: 'clicks' })} />
                                <StatBox label="Bounced" value={project.bounced + project.softBounced} icon={ArrowDownRight} trend="down"
                                  onClick={() => setDrillDown({ project, type: 'bounces' })} />
                                <StatBox label="Unsubs" value={project.unsubscribed} icon={Users}
                                  onClick={() => setDrillDown({ project, type: 'unsubs' })} />
                                <StatBox label="Replied" value={project.replied} icon={Reply}
                                  onClick={() => setDrillDown({ project, type: 'replies' })} />
                                <StatBox label="Funnels" value={project.funnelCount} icon={TrendingUp} />
                              </div>
                            </div>

                            {/* Section 2: Funnel Stats with clickable detail */}
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5 font-medium flex items-center gap-1">
                                <GitBranch className="h-3 w-3" /> Funnel Performance
                              </p>
                              {project.hasFunnel ? (
                                <div className="space-y-1.5">
                                  {project.funnelStats.map((step, i) => (
                                    <div key={i} className="flex items-center gap-3 rounded border border-border/50 bg-background px-3 py-2 text-xs">
                                      <span className="font-medium text-muted-foreground w-48 truncate">{step.stepName}</span>
                                      <span
                                        className="cursor-pointer hover:text-chart-4 transition-colors"
                                        onClick={() => setFunnelDrillDown({ project, step, statKey: 'sent' })}
                                      >Sent: <strong>{step.sent.toLocaleString()}</strong></span>
                                      <span
                                        className="cursor-pointer hover:text-chart-2 transition-colors"
                                        onClick={() => setFunnelDrillDown({ project, step, statKey: 'opens' })}
                                      >Opens: <strong>{step.opens.toLocaleString()}</strong></span>
                                      <span
                                        className="cursor-pointer hover:text-chart-1 transition-colors"
                                        onClick={() => setFunnelDrillDown({ project, step, statKey: 'clicks' })}
                                      >Clicks: <strong>{step.clicks.toLocaleString()}</strong></span>
                                      <span
                                        className="cursor-pointer hover:text-destructive transition-colors"
                                        onClick={() => setFunnelDrillDown({ project, step, statKey: 'bounced' })}
                                      >Bounced: <strong>{step.bounced.toLocaleString()}</strong></span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-[10px] ml-auto"
                                        onClick={() => setFunnelDrillDown({ project, step, statKey: 'opens' })}
                                      >
                                        <Eye className="h-3 w-3 mr-1" /> Detail
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No funnel was created for this project</p>
                              )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funnel Step Drill-Down Dialog */}
      <Dialog open={!!funnelDrillDown} onOpenChange={(open) => !open && setFunnelDrillDown(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base">
                {funnelDrillDown?.step.stepName} — {funnelDrillDown?.statKey === 'sent' ? 'Sent' : funnelDrillDown?.statKey === 'opens' ? 'Opens' : funnelDrillDown?.statKey === 'clicks' ? 'Clicks' : 'Bounced'}
              </DialogTitle>
              {funnelDrillDown && (
                <Button size="sm" variant="outline" onClick={() => {
                  const emails = getFunnelStepEmails(funnelDrillDown.step, funnelDrillDown.statKey);
                  exportToCsv(emails, `${funnelDrillDown.project.uniqueId}_funnel_${funnelDrillDown.statKey}`);
                }}>
                  <Download className="h-3 w-3 mr-1" /> Export CSV
                </Button>
              )}
            </div>
          </DialogHeader>
          {funnelDrillDown && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  {(['sent', 'opens', 'clicks', 'bounced'] as const).map(key => (
                    <div
                      key={key}
                      className={`rounded-lg border p-3 text-center cursor-pointer transition-colors ${funnelDrillDown.statKey === key ? 'border-primary bg-primary/5' : 'bg-muted/30'}`}
                      onClick={() => setFunnelDrillDown({ ...funnelDrillDown, statKey: key })}
                    >
                      <p className="text-2xl font-bold">{funnelDrillDown.step[key].toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                    </div>
                  ))}
                </div>

                <Card>
                  <CardHeader><CardTitle className="text-sm">Email Details</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">When</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFunnelStepEmails(funnelDrillDown.step, funnelDrillDown.statKey).map((detail, i) => (
                          <tr key={i} className="border-b border-border/30">
                            <td className="p-3 text-muted-foreground">{i + 1}</td>
                            <td className="p-3 font-mono text-xs">{detail.email}</td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {detail.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {detail.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3"><Badge variant="outline" className="text-xs">{detail.action}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Stat Drill-Down Dialog */}
      <Dialog open={!!drillDown} onOpenChange={(open) => !open && setDrillDown(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {drillDown?.type && drillDownLabel[drillDown.type]} — {drillDown?.project.projectName}
              </DialogTitle>
              {drillDown && getDrillDownData().length > 0 && (
                <Button size="sm" variant="outline" onClick={() => exportToCsv(getDrillDownData(), `${drillDown.project.uniqueId}_${drillDown.type}`)}>
                  <Download className="h-3 w-3 mr-1" /> Export CSV
                </Button>
              )}
            </div>
          </DialogHeader>
          {drillDown && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border bg-muted/30 p-3 text-center">
                    <p className="text-2xl font-bold">{getDrillDownData().length}</p>
                    <p className="text-xs text-muted-foreground">Total {drillDown.type && drillDownLabel[drillDown.type]}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-center">
                    <p className="text-2xl font-bold">{getDrillDownData().length > 0 ? new Set(getDrillDownData().map(d => d.email)).size : 0}</p>
                    <p className="text-xs text-muted-foreground">Unique Contacts</p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-3 text-center">
                    <p className="text-2xl font-bold">{getDrillDownData().length > 0 ? getDrillDownData()[0].timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</p>
                    <p className="text-xs text-muted-foreground">Peak Activity Day</p>
                  </div>
                </div>
                {getDrillDownDailyChart().length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Activity Over Time</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={{ count: { label: 'Count', color: 'hsl(var(--primary))' } }} className="h-[150px] w-full">
                        <BarChart data={getDrillDownDailyChart()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Email Details</CardTitle>
                      {getDrillDownData().length > 0 && (
                        <Button size="sm" variant="ghost" className="text-xs" onClick={() => exportToCsv(getDrillDownData(), `${drillDown.project.uniqueId}_${drillDown.type}_details`)}>
                          <Download className="h-3 w-3 mr-1" /> CSV
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">When</th>
                          <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getDrillDownData().map((detail, i) => (
                          <tr key={i} className="border-b border-border/30">
                            <td className="p-3 text-muted-foreground">{i + 1}</td>
                            <td className="p-3 font-mono text-xs">{detail.email}</td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {detail.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {detail.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3"><Badge variant="outline" className="text-xs">{detail.action}</Badge></td>
                          </tr>
                        ))}
                        {getDrillDownData().length === 0 && (
                          <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No data available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailProject} onOpenChange={(open) => !open && setDetailProject(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{detailProject?.projectName} — {detailProject?.uniqueId}</DialogTitle>
          </DialogHeader>
          {detailProject && (
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList>
                <TabsTrigger value="summary"><BarChart3 className="h-3 w-3 mr-1" /> Summary</TabsTrigger>
                <TabsTrigger value="heatmap"><MousePointerClick className="h-3 w-3 mr-1" /> Heatmap</TabsTrigger>
                <TabsTrigger value="domains"><Globe className="h-3 w-3 mr-1" /> Domains</TabsTrigger>
                <TabsTrigger value="settings"><Settings className="h-3 w-3 mr-1" /> Settings</TabsTrigger>
                <TabsTrigger value="webhook"><Webhook className="h-3 w-3 mr-1" /> Webhook</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[65vh] mt-4">
                {/* Summary */}
                <TabsContent value="summary" className="space-y-6 mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatBox label="Total DB" value={detailProject.totalDB} icon={Users} />
                    <StatBox label="Sent" value={detailProject.sent} icon={Mail} />
                    <StatBox label="Delivered" value={detailProject.delivered} icon={Activity} />
                    <StatBox label="Open Rate" value={`${openRate(detailProject)}%`} icon={Eye} trend="up" />
                    <StatBox label="Unique Opens" value={detailProject.uniqueOpens} icon={Eye} />
                    <StatBox label="Total Opens" value={detailProject.opens} icon={Eye} />
                    <StatBox label="Click Rate" value={`${clickRate(detailProject)}%`} icon={MousePointerClick} trend="up" />
                    <StatBox label="Unique Clicks" value={detailProject.uniqueClicks} icon={MousePointerClick} />
                    <StatBox label="Hard Bounced" value={detailProject.bounced} icon={ArrowDownRight} trend="down" />
                    <StatBox label="Soft Bounced" value={detailProject.softBounced} icon={ArrowDownRight} />
                    <StatBox label="Unsubscribed" value={detailProject.unsubscribed} icon={Users} trend="down" />
                    <StatBox label="Replied" value={detailProject.replied} icon={Reply} />
                  </div>

                  <Card>
                    <CardHeader><CardTitle className="text-sm">Daily Engagement Trend</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[250px] w-full">
                        <LineChart data={detailProject.dailyStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="opens" stroke="var(--color-opens)" strokeWidth={2} />
                          <Line type="monotone" dataKey="clicks" stroke="var(--color-clicks)" strokeWidth={2} />
                          <Line type="monotone" dataKey="bounces" stroke="var(--color-bounces)" strokeWidth={2} />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle className="text-sm">Delivery Breakdown</CardTitle></CardHeader>
                    <CardContent>
                      <ChartContainer config={{ count: { label: 'Count', color: 'hsl(var(--primary))' } }} className="h-[200px] w-full">
                        <BarChart data={[
                          { name: 'Delivered', count: detailProject.delivered },
                          { name: 'Opened', count: detailProject.uniqueOpens },
                          { name: 'Clicked', count: detailProject.uniqueClicks },
                          { name: 'Bounced', count: detailProject.bounced + detailProject.softBounced },
                          { name: 'Unsubs', count: detailProject.unsubscribed },
                          { name: 'Replied', count: detailProject.replied },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Heatmap */}
                <TabsContent value="heatmap" className="space-y-4 mt-0">
                  <p className="text-sm text-muted-foreground">CTA links detected in the template with simulated click counts:</p>
                  <div className="space-y-2">
                    {extractLinks(detailProject.templateHtml).map((link, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono truncate max-w-[400px]">{link}</span>
                        </div>
                        <Badge variant="default">{Math.floor(Math.random() * 200 + 50)} clicks</Badge>
                      </div>
                    ))}
                  </div>
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Template Preview</CardTitle></CardHeader>
                    <CardContent>
                      <div className="border rounded-md overflow-hidden">
                        <iframe srcDoc={detailProject.templateHtml} className="w-full h-[400px] border-0" title="Template Heatmap" sandbox="allow-same-origin" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Domains */}
                <TabsContent value="domains" className="space-y-4 mt-0">
                  <p className="text-sm text-muted-foreground">Email distribution across domains</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Domain Breakdown</CardTitle></CardHeader>
                      <CardContent>
                        <ChartContainer config={domainConfig} className="h-[300px] w-full">
                          <BarChart data={detailProject.domains} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="domain" type="category" width={100} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Distribution</CardTitle></CardHeader>
                      <CardContent>
                        <ChartContainer config={domainConfig} className="h-[300px] w-full">
                          <PieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Pie data={detailProject.domains} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={100} label>
                              {detailProject.domains.map((_, i) => (
                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Domain</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">Email Count</th>
                            <th className="text-left p-3 font-medium text-muted-foreground">% Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailProject.domains.map((d, i) => {
                            const total = detailProject.domains.reduce((s, x) => s + x.count, 0);
                            return (
                              <tr key={i} className="border-b border-border/30">
                                <td className="p-3 text-muted-foreground">{i + 1}</td>
                                <td className="p-3 font-mono">{d.domain}</td>
                                <td className="p-3">{d.count.toLocaleString()}</td>
                                <td className="p-3">{((d.count / total) * 100).toFixed(1)}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Settings */}
                <TabsContent value="settings" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Campaign Info</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Project Type</span><span className="font-medium">{detailProject.projectType}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Client ID</span><span className="font-mono">{detailProject.clientId}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Sent On</span><span>{detailProject.sentAt.toLocaleDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Total Database</span><span>{detailProject.totalDB.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Funnel Steps</span><span>{detailProject.funnelCount}</span></div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Sent From</span>
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{detailProject.sentFromEmail}</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Engagement Metrics</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Open Rate</span><Badge variant="default">{openRate(detailProject)}%</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Click Rate</span><Badge variant="default">{clickRate(detailProject)}%</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Bounce Rate</span><Badge variant="destructive">{bounceRate(detailProject)}%</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Reply Rate</span><Badge variant="secondary">{detailProject.delivered > 0 ? ((detailProject.replied / detailProject.delivered) * 100).toFixed(2) : 0}%</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Unsubscribe Rate</span><span>{detailProject.delivered > 0 ? ((detailProject.unsubscribed / detailProject.delivered) * 100).toFixed(2) : 0}%</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Complaint Rate</span><span>{detailProject.delivered > 0 ? ((detailProject.complained / detailProject.delivered) * 100).toFixed(3) : 0}%</span></div>
                      </CardContent>
                    </Card>
                  </div>
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Detailed Breakdown</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div><span className="text-muted-foreground block text-xs">Total Sent</span><span className="font-semibold">{detailProject.sent.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Delivered</span><span className="font-semibold">{detailProject.delivered.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Total Opens</span><span className="font-semibold">{detailProject.opens.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Unique Opens</span><span className="font-semibold">{detailProject.uniqueOpens.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Total Clicks</span><span className="font-semibold">{detailProject.clicks.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Unique Clicks</span><span className="font-semibold">{detailProject.uniqueClicks.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Hard Bounced</span><span className="font-semibold">{detailProject.bounced.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Soft Bounced</span><span className="font-semibold">{detailProject.softBounced.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Replied</span><span className="font-semibold">{detailProject.replied.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Unsubscribed</span><span className="font-semibold">{detailProject.unsubscribed.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Complaints</span><span className="font-semibold">{detailProject.complained.toLocaleString()}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Webhook & API Config */}
                <TabsContent value="webhook" className="space-y-4 mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Webhook className="h-4 w-4" /> Webhook Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Configure webhooks to receive real-time email event notifications for transactional and API-based sending.</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">Webhook Endpoint URL</span>
                          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                            <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-xs truncate">{detailProject.webhookUrl || 'Not configured'}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">Subscribed Events</span>
                          <div className="flex flex-wrap gap-1.5">
                            {WEBHOOK_EVENTS.map(event => {
                              const active = detailProject.webhookEvents?.includes(event);
                              return (
                                <Badge key={event} variant={active ? 'default' : 'outline'} className="text-xs capitalize">
                                  {event.replace('_', ' ')}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><FileJson className="h-4 w-4" /> API / Transactional Mail</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Use the API key to send transactional emails and fetch real-time stats programmatically.</p>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">API Key</span>
                          <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2">
                            <Server className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-mono text-xs">{detailProject.apiKey || 'No API key assigned'}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-muted-foreground">Available Endpoints</span>
                          <div className="space-y-1.5 text-xs">
                            {[
                              { method: 'POST', path: '/api/v1/send', desc: 'Send transactional email' },
                              { method: 'GET', path: '/api/v1/stats/{campaign_id}', desc: 'Fetch campaign stats' },
                              { method: 'GET', path: '/api/v1/events/{campaign_id}', desc: 'Stream event webhooks' },
                              { method: 'GET', path: '/api/v1/bounces', desc: 'List all bounce events' },
                              { method: 'GET', path: '/api/v1/unsubscribes', desc: 'List unsubscribe events' },
                              { method: 'POST', path: '/api/v1/webhook/test', desc: 'Test webhook delivery' },
                            ].map((ep, i) => (
                              <div key={i} className="flex items-center gap-2 rounded border border-border/50 bg-background px-3 py-1.5">
                                <Badge variant={ep.method === 'POST' ? 'default' : 'secondary'} className="text-[10px] font-mono">{ep.method}</Badge>
                                <span className="font-mono text-muted-foreground">{ep.path}</span>
                                <span className="ml-auto text-muted-foreground">{ep.desc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2"><Activity className="h-4 w-4" /> Event Payload Sample</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-x-auto">
{`{
  "event": "opened",
  "campaign_id": "${detailProject.uniqueId}",
  "email": "user@example.com",
  "timestamp": "${new Date().toISOString()}",
  "ip": "203.0.113.42",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "client_id": "${detailProject.clientId}",
    "project_type": "${detailProject.projectType}"
  }
}`}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSending;
