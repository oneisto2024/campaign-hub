import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, Info, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EmailResult {
  email: string;
  projectName: string;
  batchName: string;
  status: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'blacklisted' | 'dnc' | 'not_found';
  importedAt: string;
  sentAt: string | null;
  lastActivity: string | null;
  urlSent: string | null;
  campaign: string | null;
  country: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  delivered: { label: 'Delivered', className: 'bg-blue-500/15 text-blue-700 border-blue-300' },
  opened: { label: 'Opened', className: 'bg-emerald-500/15 text-emerald-700 border-emerald-300' },
  clicked: { label: 'Clicked', className: 'bg-green-500/15 text-green-700 border-green-300' },
  bounced: { label: 'Bounced', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  unsubscribed: { label: 'Unsubscribed', className: 'bg-orange-500/15 text-orange-700 border-orange-300' },
  blacklisted: { label: 'Blacklisted', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  dnc: { label: 'Do Not Contact', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  not_found: { label: 'Not Found', className: 'bg-muted text-muted-foreground border-border' },
};

// Mock lookup
const mockLookup = (email: string): EmailResult => {
  const statuses: EmailResult['status'][] = ['delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'blacklisted', 'dnc'];
  const hash = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const status = statuses[hash % statuses.length];
  const projects = ['Q1 US Outreach', 'UK Lead Gen', 'EMEA Webinar', 'APAC ABM Campaign'];
  const campaigns = ['Welcome Series', 'Product Launch', 'Newsletter #12', 'Re-engagement'];
  const countries = ['United States', 'United Kingdom', 'Germany', 'France', 'India'];
  const urls = ['https://company.com/offer', 'https://company.com/webinar', 'https://company.com/demo', 'https://company.com/whitepaper'];

  return {
    email,
    projectName: projects[hash % projects.length],
    batchName: `Batch ${(hash % 5) + 1}`,
    status,
    importedAt: new Date(2025, (hash % 6), (hash % 28) + 1).toLocaleDateString(),
    sentAt: ['delivered', 'opened', 'clicked', 'bounced'].includes(status)
      ? new Date(2025, (hash % 6) + 1, (hash % 28) + 1).toLocaleDateString()
      : null,
    lastActivity: ['opened', 'clicked'].includes(status)
      ? new Date(2025, (hash % 6) + 2, (hash % 28) + 1).toLocaleDateString()
      : null,
    urlSent: ['delivered', 'opened', 'clicked'].includes(status) ? urls[hash % urls.length] : null,
    campaign: status !== 'not_found' ? campaigns[hash % campaigns.length] : null,
    country: countries[hash % countries.length],
  };
};

const EmailSearch = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<EmailResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [detailEmail, setDetailEmail] = useState<EmailResult | null>(null);

  const handleSearch = () => {
    const emails = input
      .split(/[\n,;]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => e && e.includes('@'));

    if (emails.length === 0) return;

    const found = emails.map(email => {
      // Random chance of not_found
      if (email.charCodeAt(0) % 7 === 0) {
        return { email, projectName: '-', batchName: '-', status: 'not_found' as const, importedAt: '-', sentAt: null, lastActivity: null, urlSent: null, campaign: null, country: '-' };
      }
      return mockLookup(email);
    });

    setResults(found);
    setSearched(true);
  };

  const handleExport = () => {
    const headers = ['Email', 'Project', 'Batch', 'Status', 'Campaign', 'Imported', 'Sent', 'Last Activity', 'URL', 'Country'];
    const rows = results.map(r => [r.email, r.projectName, r.batchName, STATUS_CONFIG[r.status]?.label, r.campaign || '-', r.importedAt, r.sentAt || '-', r.lastActivity || '-', r.urlSent || '-', r.country]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-search-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = searched ? {
    total: results.length,
    found: results.filter(r => r.status !== 'not_found').length,
    notFound: results.filter(r => r.status === 'not_found').length,
    opened: results.filter(r => r.status === 'opened').length,
    clicked: results.filter(r => r.status === 'clicked').length,
    bounced: results.filter(r => r.status === 'bounced').length,
    unsubscribed: results.filter(r => ['unsubscribed', 'blacklisted', 'dnc'].includes(r.status)).length,
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Ops Management</p>
        <h1 className="text-2xl font-semibold text-foreground">Search Email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Look up one or multiple emails to find their project, status, send history, and more.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Email Lookup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste emails here — one per line, or separated by commas...&#10;example@company.com&#10;john@domain.com, jane@domain.com"
              className="min-h-[120px] font-mono text-sm"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Supports single or bulk lookup. Separate emails by new line, comma, or semicolon.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSearch} disabled={!input.trim()}>
              <Search className="mr-2 h-4 w-4" />
              Search Emails
            </Button>
            {results.length > 0 && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {[
            { label: 'Total Searched', value: summary.total, color: 'bg-primary/10 text-primary' },
            { label: 'Found', value: summary.found, color: 'bg-emerald-500/10 text-emerald-700' },
            { label: 'Not Found', value: summary.notFound, color: 'bg-muted text-muted-foreground' },
            { label: 'Opened', value: summary.opened, color: 'bg-emerald-500/10 text-emerald-700' },
            { label: 'Clicked', value: summary.clicked, color: 'bg-green-500/10 text-green-700' },
            { label: 'Bounced', value: summary.bounced, color: 'bg-destructive/10 text-destructive' },
            { label: 'Unsub/Blocked', value: summary.unsubscribed, color: 'bg-orange-500/10 text-orange-700' },
          ].map(s => (
            <Card key={s.label} className="p-3">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`mt-1 text-xl font-semibold rounded-md inline-block px-2 py-0.5 ${s.color}`}>{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Email</TableHead>
                    <TableHead className="w-[150px]">Project</TableHead>
                    <TableHead className="w-[100px]">Batch</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[130px]">Campaign</TableHead>
                    <TableHead className="w-[100px]">Imported</TableHead>
                    <TableHead className="w-[100px]">Sent</TableHead>
                    <TableHead className="w-[100px]">Country</TableHead>
                    <TableHead className="w-[60px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, i) => {
                    const cfg = STATUS_CONFIG[r.status];
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs truncate max-w-[220px]">{r.email}</TableCell>
                        <TableCell className="text-sm">{r.projectName}</TableCell>
                        <TableCell className="text-sm">{r.batchName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{r.campaign || '-'}</TableCell>
                        <TableCell className="text-sm">{r.importedAt}</TableCell>
                        <TableCell className="text-sm">{r.sentAt || '-'}</TableCell>
                        <TableCell className="text-sm">{r.country}</TableCell>
                        <TableCell>
                          {r.status !== 'not_found' && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetailEmail(r)}>
                                  <Info className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View full details</TooltipContent>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {searched && results.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No valid email addresses found in your input.</p>
        </Card>
      )}

      <Dialog open={!!detailEmail} onOpenChange={() => setDetailEmail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{detailEmail?.email}</DialogTitle>
          </DialogHeader>
          {detailEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className="font-medium">{detailEmail.projectName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Batch</p>
                  <p className="font-medium">{detailEmail.batchName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Campaign</p>
                  <p className="font-medium">{detailEmail.campaign || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={STATUS_CONFIG[detailEmail.status].className}>
                    {STATUS_CONFIG[detailEmail.status].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Country</p>
                  <p className="font-medium">{detailEmail.country}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Imported On</p>
                  <p className="font-medium">{detailEmail.importedAt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sent On</p>
                  <p className="font-medium">{detailEmail.sentAt || 'Not sent'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Activity</p>
                  <p className="font-medium">{detailEmail.lastActivity || 'None'}</p>
                </div>
              </div>
              {detailEmail.urlSent && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">URL Sent</p>
                  <a href={detailEmail.urlSent} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {detailEmail.urlSent}
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailSearch;
