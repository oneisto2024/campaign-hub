import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ShieldCheck, Download, Eye, Filter, Check, X, MousePointerClick, Mail } from 'lucide-react';
import HolidayBanner from '@/components/HolidayBanner';
import { useResizableColumns, ColumnDef } from '@/hooks/useResizableColumns';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';

interface GDPRContact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  country: string;
  importedAt: Date;
  source: string;
  consented: boolean;
  consentDate?: Date;
  consentMethod: string;
  unsubscribed: boolean;
  unsubDate?: Date;
  clickedLinks: { url: string; clickedAt: Date }[];
  campaigns: string[];
}

const MOCK_CONTACTS: GDPRContact[] = [
  {
    id: '1', email: 'john.smith@gmail.com', firstName: 'John', lastName: 'Smith',
    company: 'Acme Corp', country: 'United States', importedAt: new Date('2026-01-15'),
    source: 'DB Import - Q1 Lead Gen', consented: true, consentDate: new Date('2026-01-10'),
    consentMethod: 'Double Opt-in', unsubscribed: false,
    clickedLinks: [
      { url: 'https://example.com/offer', clickedAt: new Date('2026-01-20T10:32:00') },
      { url: 'https://example.com/demo', clickedAt: new Date('2026-01-22T14:15:00') },
    ],
    campaigns: ['Q1 Lead Generation Campaign', 'ABM Campaign - Fortune 500'],
  },
  {
    id: '2', email: 'jane.doe@outlook.com', firstName: 'Jane', lastName: 'Doe',
    company: 'Tech Solutions', country: 'United Kingdom', importedAt: new Date('2026-01-18'),
    source: 'DB Import - Webinar', consented: true, consentDate: new Date('2026-01-12'),
    consentMethod: 'Form Submission', unsubscribed: false,
    clickedLinks: [
      { url: 'https://example.com/register', clickedAt: new Date('2026-02-05T09:05:00') },
    ],
    campaigns: ['Q2 Webinar Follow-up'],
  },
  {
    id: '3', email: 'nomore@gmail.com', firstName: 'Mark', lastName: 'Johnson',
    company: 'Old Corp', country: 'Germany', importedAt: new Date('2026-01-10'),
    source: 'DB Import - Q1 Lead Gen', consented: true, consentDate: new Date('2025-12-20'),
    consentMethod: 'Single Opt-in', unsubscribed: true, unsubDate: new Date('2026-01-21T16:00:00'),
    clickedLinks: [],
    campaigns: ['Q1 Lead Generation Campaign'],
  },
  {
    id: '4', email: 'bob@company.com', firstName: 'Bob', lastName: 'Williams',
    company: 'Enterprise Inc', country: 'Australia', importedAt: new Date('2026-01-20'),
    source: 'API Import', consented: false,
    consentMethod: 'Not recorded', unsubscribed: false,
    clickedLinks: [
      { url: 'https://example.com/case-study', clickedAt: new Date('2026-01-28T08:05:00') },
    ],
    campaigns: ['ABM Campaign - Fortune 500'],
  },
  {
    id: '5', email: 'alice@yahoo.com', firstName: 'Alice', lastName: 'Brown',
    company: 'Startup Labs', country: 'Japan', importedAt: new Date('2026-02-01'),
    source: 'DB Import - ABM', consented: true, consentDate: new Date('2026-01-25'),
    consentMethod: 'Double Opt-in', unsubscribed: false,
    clickedLinks: [
      { url: 'https://example.com/whitepaper', clickedAt: new Date('2026-02-02T11:30:00') },
      { url: 'https://example.com/contact', clickedAt: new Date('2026-02-03T09:45:00') },
      { url: 'https://example.com/pricing', clickedAt: new Date('2026-02-04T15:20:00') },
    ],
    campaigns: ['ABM Campaign - Fortune 500', 'Q2 Webinar Follow-up'],
  },
  {
    id: '6', email: 'nope@corp.com', firstName: 'David', lastName: 'Lee',
    company: 'Global Tech', country: 'Singapore', importedAt: new Date('2026-01-25'),
    source: 'DB Import - ABM', consented: true, consentDate: new Date('2026-01-20'),
    consentMethod: 'Form Submission', unsubscribed: true, unsubDate: new Date('2026-01-30T12:00:00'),
    clickedLinks: [],
    campaigns: ['ABM Campaign - Fortune 500'],
  },
];

const GDPR_COLUMNS: ColumnDef[] = [
  { key: 'sNo', label: 'S.No', visible: true, minWidth: 50, width: 60 },
  { key: 'email', label: 'Email', visible: true, minWidth: 120, width: 200 },
  { key: 'name', label: 'Name', visible: true, minWidth: 100, width: 150 },
  { key: 'company', label: 'Company', visible: true, minWidth: 100, width: 150 },
  { key: 'country', label: 'Country', visible: true, minWidth: 80, width: 120 },
  { key: 'consent', label: 'Consent', visible: true, minWidth: 70, width: 100 },
  { key: 'unsub', label: 'Unsubscribed', visible: true, minWidth: 70, width: 110 },
  { key: 'clicks', label: 'Clicks', visible: true, minWidth: 60, width: 80 },
  { key: 'source', label: 'Source', visible: true, minWidth: 100, width: 160 },
  { key: 'actions', label: 'Actions', visible: true, minWidth: 60, width: 80 },
];

const GDPRCompliance = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConsent, setFilterConsent] = useState('all');
  const [filterUnsub, setFilterUnsub] = useState('all');
  const [detailContact, setDetailContact] = useState<GDPRContact | null>(null);
  const { columns: tableColumns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(GDPR_COLUMNS);

  const filtered = useMemo(() => {
    let data = MOCK_CONTACTS;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(c => c.email.toLowerCase().includes(q) || c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.company.toLowerCase().includes(q));
    }
    if (filterConsent === 'yes') data = data.filter(c => c.consented);
    if (filterConsent === 'no') data = data.filter(c => !c.consented);
    if (filterUnsub === 'yes') data = data.filter(c => c.unsubscribed);
    if (filterUnsub === 'no') data = data.filter(c => !c.unsubscribed);
    return data;
  }, [searchQuery, filterConsent, filterUnsub]);

  const exportAll = () => {
    const headers = ['Email', 'First Name', 'Last Name', 'Company', 'Country', 'Consented', 'Consent Date', 'Consent Method', 'Unsubscribed', 'Unsub Date', 'Source', 'Campaigns', 'Links Clicked'];
    const rows = filtered.map(c => [
      c.email, c.firstName, c.lastName, c.company, c.country,
      c.consented ? 'Yes' : 'No', c.consentDate?.toISOString() || '', c.consentMethod,
      c.unsubscribed ? 'Yes' : 'No', c.unsubDate?.toISOString() || '', c.source,
      c.campaigns.join('; '), c.clickedLinks.map(l => l.url).join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'gdpr_compliance_report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const consentedCount = MOCK_CONTACTS.filter(c => c.consented).length;
  const unsubCount = MOCK_CONTACTS.filter(c => c.unsubscribed).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">GDPR Compliance</p>
        <h1 className="text-2xl font-semibold text-foreground">Data & Consent Overview</h1>
      </div>

      <HolidayBanner />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{MOCK_CONTACTS.length}</p>
            <p className="text-xs text-muted-foreground">Total Records</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-chart-1">{consentedCount}</p>
            <p className="text-xs text-muted-foreground">Consented</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{MOCK_CONTACTS.length - consentedCount}</p>
            <p className="text-xs text-muted-foreground">No Consent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-chart-4">{unsubCount}</p>
            <p className="text-xs text-muted-foreground">Unsubscribed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Imported Data Records
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={exportAll}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
              <ManageColumnsButton columns={tableColumns} toggleColumn={toggleColumn} />
            </div>
          </div>
        </CardHeader>
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap p-4 border-b">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search email, name, company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterConsent} onValueChange={setFilterConsent}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Consent" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Consent</SelectItem>
                <SelectItem value="yes">Consented</SelectItem>
                <SelectItem value="no">No Consent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterUnsub} onValueChange={setFilterUnsub}>
              <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Unsub Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Unsubscribed</SelectItem>
                <SelectItem value="no">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardContent className="p-0">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={filtered.map((c, i) => ({ ...c, _sNo: i + 1 }))}
            rowKey={(c) => c.id}
            emptyMessage="No records found"
            renderCell={(contact: GDPRContact & { _sNo: number }, key: string) => {
              switch (key) {
                case 'sNo': return contact._sNo;
                case 'email': return <span className="font-mono text-xs">{contact.email}</span>;
                case 'name': return <span className="font-medium">{contact.firstName} {contact.lastName}</span>;
                case 'company': return contact.company;
                case 'country': return contact.country;
                case 'consent': return (
                  <Badge variant={contact.consented ? 'default' : 'destructive'} className="text-xs">
                    {contact.consented ? <><Check className="h-3 w-3 mr-1" /> Yes</> : <><X className="h-3 w-3 mr-1" /> No</>}
                  </Badge>
                );
                case 'unsub': return (
                  <Badge variant={contact.unsubscribed ? 'destructive' : 'secondary'} className="text-xs">
                    {contact.unsubscribed ? 'Yes' : 'No'}
                  </Badge>
                );
                case 'clicks': return (
                  <Badge variant="outline" className="text-xs">
                    <MousePointerClick className="h-3 w-3 mr-1" /> {contact.clickedLinks.length}
                  </Badge>
                );
                case 'source': return <span className="text-xs text-muted-foreground">{contact.source}</span>;
                case 'actions': return (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailContact(contact)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                );
                default: return '-';
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailContact} onOpenChange={(open) => !open && setDetailContact(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> GDPR Data — {detailContact?.email}
            </DialogTitle>
          </DialogHeader>
          {detailContact && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-5">
                {/* Personal Data */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">Personal Data</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground block text-xs">Email</span><span className="font-mono">{detailContact.email}</span></div>
                    <div><span className="text-muted-foreground block text-xs">Name</span>{detailContact.firstName} {detailContact.lastName}</div>
                    <div><span className="text-muted-foreground block text-xs">Company</span>{detailContact.company}</div>
                    <div><span className="text-muted-foreground block text-xs">Country</span>{detailContact.country}</div>
                    <div><span className="text-muted-foreground block text-xs">Imported On</span>{detailContact.importedAt.toLocaleDateString()}</div>
                    <div><span className="text-muted-foreground block text-xs">Source</span>{detailContact.source}</div>
                  </CardContent>
                </Card>

                {/* Consent */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">Consent Status</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Consented?</span>
                      <Badge variant={detailContact.consented ? 'default' : 'destructive'}>
                        {detailContact.consented ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {detailContact.consentDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consent Date</span>
                        <span>{detailContact.consentDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span>{detailContact.consentMethod}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Unsubscribe */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">Unsubscribe Status</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Unsubscribed?</span>
                      <Badge variant={detailContact.unsubscribed ? 'destructive' : 'secondary'}>
                        {detailContact.unsubscribed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    {detailContact.unsubDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unsub Date</span>
                        <span>{detailContact.unsubDate.toLocaleDateString()} at {detailContact.unsubDate.toLocaleTimeString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Campaigns */}
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" /> Campaigns</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {detailContact.campaigns.map((c, i) => (
                        <Badge key={i} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Clicked Links */}
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MousePointerClick className="h-4 w-4" /> Links Clicked</CardTitle></CardHeader>
                  <CardContent>
                    {detailContact.clickedLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No links clicked</p>
                    ) : (
                      <div className="space-y-2">
                        {detailContact.clickedLinks.map((link, i) => (
                          <div key={i} className="flex items-center justify-between rounded border border-border p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">{i + 1}.</span>
                              <code className="font-mono text-xs truncate max-w-[300px]">{link.url}</code>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {link.clickedAt.toLocaleDateString()} at {link.clickedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GDPRCompliance;
