import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Download, UserMinus } from 'lucide-react';
import HolidayBanner from '@/components/HolidayBanner';

interface UnsubRecord {
  id: string;
  email: string;
  reason: string;
  unsubAt: Date;
  campaignId: string;
  status: 'processing' | 'removed';
}

const MOCK_UNSUB: UnsubRecord[] = [
  { id: '1', email: 'nomore@gmail.com', reason: 'I no longer want to receive these emails', unsubAt: new Date('2026-02-20T14:00:00'), campaignId: 'PRJ-2026-001', status: 'removed' },
  { id: '2', email: 'optout@yahoo.com', reason: 'The emails are not relevant to me', unsubAt: new Date('2026-02-25T10:30:00'), campaignId: 'PRJ-2026-003', status: 'removed' },
  { id: '3', email: 'stop@outlook.com', reason: 'I receive too many emails', unsubAt: new Date('2026-03-01T08:15:00'), campaignId: 'PRJ-2026-005', status: 'processing' },
  { id: '4', email: 'done@company.com', reason: 'I never signed up for this mailing list', unsubAt: new Date('2026-03-02T16:45:00'), campaignId: 'PRJ-2026-001', status: 'processing' },
];

const UnsubscribeAdmin = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    if (!searchQuery) return MOCK_UNSUB;
    const q = searchQuery.toLowerCase();
    return MOCK_UNSUB.filter(r => r.email.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q) || r.campaignId.toLowerCase().includes(q));
  }, [searchQuery]);

  const exportCsv = () => {
    const headers = ['Email', 'Reason', 'Unsubscribed At', 'Campaign ID', 'Status'];
    const rows = filtered.map(r => [r.email, r.reason, r.unsubAt.toISOString(), r.campaignId, r.status]);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'unsubscribes.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Administration</p>
        <h1 className="text-2xl font-semibold text-foreground">Unsubscribe Requests</h1>
      </div>
      <HolidayBanner />
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <UserMinus className="h-5 w-5" /> Unsubscribe Log
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[150px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full sm:w-64" />
              </div>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-3 w-3 mr-1" /> Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Campaign</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Requested At</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b border-border/30">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3 font-mono text-xs">{r.email}</td>
                  <td className="p-3 text-xs max-w-xs truncate">{r.reason}</td>
                  <td className="p-3 font-mono text-xs">{r.campaignId}</td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {r.unsubAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-3">
                    <Badge variant={r.status === 'removed' ? 'default' : 'secondary'} className="text-xs">
                      {r.status === 'removed' ? 'Removed' : 'Processing'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No records found</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnsubscribeAdmin;
