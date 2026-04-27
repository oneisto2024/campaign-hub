import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, MousePointerClick } from 'lucide-react';

// Mock click data sourced from Email Sending projects
interface ClickRow {
  id: string;
  email: string;
  clientId: string;
  projectName: string;
  uniqueId: string;
  projectType: string;
  linkLabel: string;
  linkUrl: string;
  clickedAt: Date;
  country: string;
}

const MOCK_CLICKS: ClickRow[] = [
  { id: 'c1', email: 'john.smith@gmail.com', clientId: 'ACME001', projectName: 'Q1 Appointment Setting Campaign', uniqueId: 'PRJ-2026-001', projectType: 'Appointment Setting', linkLabel: 'Special Offer', linkUrl: 'https://example.com/offer', clickedAt: new Date('2026-01-20T10:32:00'), country: 'United States' },
  { id: 'c2', email: 'jane.doe@outlook.com', clientId: 'ACME001', projectName: 'Q1 Appointment Setting Campaign', uniqueId: 'PRJ-2026-001', projectType: 'Appointment Setting', linkLabel: 'Book Demo', linkUrl: 'https://example.com/demo', clickedAt: new Date('2026-01-20T11:18:00'), country: 'Canada' },
  { id: 'c3', email: 'bob@company.com', clientId: 'ACME001', projectName: 'Q1 Appointment Setting Campaign', uniqueId: 'PRJ-2026-001', projectType: 'Appointment Setting', linkLabel: 'Special Offer', linkUrl: 'https://example.com/offer', clickedAt: new Date('2026-01-21T09:05:00'), country: 'United States' },
  { id: 'c4', email: 'sarah@gmail.com', clientId: 'ACME001', projectName: 'Q2 Webinar Follow-up', uniqueId: 'PRJ-2026-005', projectType: 'Webinar', linkLabel: 'Register Now', linkUrl: 'https://example.com/register', clickedAt: new Date('2026-02-05T09:05:00'), country: 'Germany' },
  { id: 'c5', email: 'cto@fortune500.com', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003', projectType: 'ABM Campaign', linkLabel: 'Case Study', linkUrl: 'https://example.com/case-study', clickedAt: new Date('2026-01-28T08:05:00'), country: 'United States' },
  { id: 'c6', email: 'vp@bigcorp.com', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003', projectType: 'ABM Campaign', linkLabel: 'Contact Us', linkUrl: 'https://example.com/contact', clickedAt: new Date('2026-01-29T07:20:00'), country: 'Japan' },
  { id: 'c7', email: 'cfo@enterprise.com', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003', projectType: 'ABM Campaign', linkLabel: 'Whitepaper', linkUrl: 'https://example.com/whitepaper', clickedAt: new Date('2026-01-30T11:15:00'), country: 'Australia' },
];

const PROJECT_TYPES = ['MQL Campaign', 'Click Campaign', 'ABM Campaign', 'Webinar', 'Appointment Setting', 'API Project', 'Double Touch'];

const exportClicks = (rows: ClickRow[]) => {
  if (!rows.length) return;
  const headers = ['Email', 'Client ID', 'Project', 'Unique ID', 'Project Type', 'Link', 'URL', 'Country', 'Clicked At'];
  const data = rows.map(r => [r.email, r.clientId, r.projectName, r.uniqueId, r.projectType, r.linkLabel, r.linkUrl, r.country, r.clickedAt.toISOString()]);
  const csv = [headers, ...data].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `lead-discovery-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const LeadDiscovery = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterClient, setFilterClient] = useState('all');

  const allClients = useMemo(() => [...new Set(MOCK_CLICKS.map(c => c.clientId))], []);

  const filtered = useMemo(() => {
    return MOCK_CLICKS.filter(c => {
      if (filterType !== 'all' && c.projectType !== filterType) return false;
      if (filterClient !== 'all' && c.clientId !== filterClient) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !c.email.toLowerCase().includes(s) &&
          !c.projectName.toLowerCase().includes(s) &&
          !c.linkLabel.toLowerCase().includes(s) &&
          !c.linkUrl.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [search, filterType, filterClient]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <MousePointerClick className="h-6 w-6 text-primary" /> Lead Discovery
          </h1>
          <p className="text-sm font-light text-muted-foreground">
            All clicks captured across Email Sending projects
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => exportClicks(filtered)}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search email, project, link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger><SelectValue placeholder="Client" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {allClients.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger><SelectValue placeholder="Project Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground mb-2">
          Showing {filtered.length} click{filtered.length !== 1 ? 's' : ''}
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12">#</TableHead>
                <TableHead className="min-w-[200px]">Email</TableHead>
                <TableHead className="w-[110px]">Client ID</TableHead>
                <TableHead className="min-w-[220px]">Project</TableHead>
                <TableHead className="w-[150px]">Type</TableHead>
                <TableHead className="min-w-[160px]">Link Clicked</TableHead>
                <TableHead className="w-[140px]">Country</TableHead>
                <TableHead className="w-[160px]">Clicked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No clicks found
                  </TableCell>
                </TableRow>
              ) : filtered.map((c, idx) => (
                <TableRow key={c.id}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{c.email}</TableCell>
                  <TableCell className="font-mono text-xs">{c.clientId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{c.projectName}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{c.uniqueId}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{c.projectType}</Badge></TableCell>
                  <TableCell>
                    <a href={c.linkUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm" title={c.linkUrl}>
                      {c.linkLabel}
                    </a>
                  </TableCell>
                  <TableCell className="text-sm">{c.country}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {c.clickedAt.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default LeadDiscovery;
