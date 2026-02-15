import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search, ChevronDown, ChevronRight, Mail, Eye, BarChart3, Globe, Settings, Activity,
  MousePointerClick, Users, ArrowUpRight, ArrowDownRight, TrendingUp,
} from 'lucide-react';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

const PROJECT_TYPES = ['ABM Campaign', 'Webinar', 'Click Campaign', 'MQL Campaign', 'Lead Generation', 'Funnel Set'];

interface SendingProject {
  id: string;
  clientId: string;
  projectName: string;
  uniqueId: string;
  projectType: string;
  sentAt: Date;
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
  funnelCount: number;
  templateHtml: string;
  domains: { domain: string; count: number }[];
  dailyStats: { date: string; opens: number; clicks: number; bounces: number }[];
}

const MOCK_DATA: SendingProject[] = [
  {
    id: '1', clientId: 'ACME001', projectName: 'Q1 Lead Generation Campaign', uniqueId: 'PRJ-2026-001',
    projectType: 'Lead Generation', sentAt: new Date('2026-01-20'), totalDB: 4000, sent: 3800, delivered: 3650,
    opens: 1825, uniqueOpens: 1200, clicks: 456, uniqueClicks: 320, bounced: 80, softBounced: 70,
    unsubscribed: 23, complained: 2, funnelCount: 2,
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
  },
  {
    id: '2', clientId: 'ACME001', projectName: 'Q2 Webinar Follow-up', uniqueId: 'PRJ-2026-005',
    projectType: 'Webinar', sentAt: new Date('2026-02-05'), totalDB: 2500, sent: 2400, delivered: 2350,
    opens: 1410, uniqueOpens: 950, clicks: 380, uniqueClicks: 280, bounced: 30, softBounced: 20,
    unsubscribed: 8, complained: 1, funnelCount: 1,
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
  },
  {
    id: '3', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003',
    projectType: 'ABM Campaign', sentAt: new Date('2026-01-28'), totalDB: 10000, sent: 9500, delivered: 9200,
    opens: 4600, uniqueOpens: 3200, clicks: 1380, uniqueClicks: 980, bounced: 180, softBounced: 120,
    unsubscribed: 45, complained: 5, funnelCount: 3,
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
  },
];

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))'];

const StatBox = ({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: React.ElementType; trend?: 'up' | 'down' }) => (
  <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
    <div className="rounded-md bg-muted p-2"><Icon className="h-4 w-4 text-muted-foreground" /></div>
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-lg font-semibold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        {trend === 'up' && <ArrowUpRight className="h-3 w-3 text-primary" />}
        {trend === 'down' && <ArrowDownRight className="h-3 w-3 text-destructive" />}
      </div>
    </div>
  </div>
);

const EmailSending = () => {
  const { type } = useParams<{ type?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  const [detailProject, setDetailProject] = useState<SendingProject | null>(null);
  const [detailTab, setDetailTab] = useState('summary');
  const [activeTypeTab, setActiveTypeTab] = useState(type ? type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'all');

  const filteredProjects = useMemo(() => {
    let data = MOCK_DATA;
    if (activeTypeTab !== 'all') {
      data = data.filter(p => p.projectType === activeTypeTab);
    }
    if (searchQuery) {
      data = data.filter(p =>
        p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  }, [activeTypeTab, searchQuery]);

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

  const chartConfig = { opens: { label: 'Opens', color: 'hsl(var(--primary))' }, clicks: { label: 'Clicks', color: 'hsl(var(--chart-2))' }, bounces: { label: 'Bounces', color: 'hsl(var(--destructive))' } };
  const domainConfig = { count: { label: 'Emails', color: 'hsl(var(--primary))' } };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Email Sending</p>
        <h1 className="text-2xl font-semibold text-foreground">Campaign Stats</h1>
      </div>

      {/* Type Tabs */}
      <Tabs value={activeTypeTab} onValueChange={setActiveTypeTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {PROJECT_TYPES.map(t => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      {/* CID Grouped Projects */}
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
                        {projs.map(project => (
                          <div key={project.id} className="border-t border-border/50 px-6 py-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-sm">{project.projectName}</span>
                                <span className="font-mono text-xs text-muted-foreground">{project.uniqueId}</span>
                                <Badge variant="outline" className="text-xs">{project.projectType}</Badge>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => { setDetailProject(project); setDetailTab('summary'); }}>
                                <Eye className="h-3 w-3 mr-1" /> Details
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                              <StatBox label="Sent" value={project.sent} icon={Mail} />
                              <StatBox label="Delivered" value={project.delivered} icon={Activity} />
                              <StatBox label="Open Rate" value={`${openRate(project)}%`} icon={Eye} trend="up" />
                              <StatBox label="Click Rate" value={`${clickRate(project)}%`} icon={MousePointerClick} trend="up" />
                              <StatBox label="Bounced" value={project.bounced + project.softBounced} icon={ArrowDownRight} trend="down" />
                              <StatBox label="Unsubs" value={project.unsubscribed} icon={Users} />
                              <StatBox label="Funnels" value={project.funnelCount} icon={TrendingUp} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

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
                    <StatBox label="Complaints" value={detailProject.complained} icon={Users} />
                  </div>

                  {/* Daily Trend Chart */}
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

                  {/* Delivery Breakdown */}
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

                {/* Heatmap - Template preview with links */}
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
                  {/* Domain Table */}
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b"><th className="text-left p-3 font-medium text-muted-foreground">Domain</th><th className="text-left p-3 font-medium text-muted-foreground">Email Count</th><th className="text-left p-3 font-medium text-muted-foreground">% Share</th></tr>
                        </thead>
                        <tbody>
                          {detailProject.domains.map((d, i) => {
                            const total = detailProject.domains.reduce((s, x) => s + x.count, 0);
                            return (
                              <tr key={i} className="border-b border-border/30">
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
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Engagement Metrics</CardTitle></CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Open Rate</span><Badge variant="default">{openRate(detailProject)}%</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Click Rate</span><Badge variant="default">{clickRate(detailProject)}%</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Bounce Rate</span><Badge variant="destructive">{bounceRate(detailProject)}%</Badge></div>
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
                        <div><span className="text-muted-foreground block text-xs">Unsubscribed</span><span className="font-semibold">{detailProject.unsubscribed.toLocaleString()}</span></div>
                        <div><span className="text-muted-foreground block text-xs">Complaints</span><span className="font-semibold">{detailProject.complained.toLocaleString()}</span></div>
                      </div>
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
