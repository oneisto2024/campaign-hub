import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Monitor, BarChart3 } from 'lucide-react';
import { useResizableColumns, ColumnDef } from '@/hooks/useResizableColumns';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';

interface ProjectMetric {
  id: string;
  clientId: string;
  projectName: string;
  uniqueId: string;
  projectType: string;
  totalDB: number;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounced: number;
  unsubscribed: number;
  replied: number;
}

const MOCK_METRICS: ProjectMetric[] = [
  { id: '1a', clientId: 'ACME001', projectName: 'Q1 Appointment Setting Campaign', uniqueId: 'PRJ-2026-001-B1', projectType: 'Appointment Setting', totalDB: 4000, sent: 3800, delivered: 3650, opens: 1825, clicks: 456, bounced: 80, unsubscribed: 23, replied: 45 },
  { id: '1b', clientId: 'ACME001', projectName: 'Q1 Appointment Setting Campaign', uniqueId: 'PRJ-2026-001-B2', projectType: 'Appointment Setting', totalDB: 2000, sent: 1950, delivered: 1880, opens: 940, clicks: 220, bounced: 40, unsubscribed: 11, replied: 18 },
  { id: '1c', clientId: 'ACME001', projectName: 'Q1 Appointment Setting Campaign', uniqueId: 'PRJ-2026-001-B3', projectType: 'Appointment Setting', totalDB: 1500, sent: 1450, delivered: 1400, opens: 700, clicks: 180, bounced: 30, unsubscribed: 7, replied: 12 },
  { id: '2', clientId: 'ACME001', projectName: 'Q2 Webinar Follow-up', uniqueId: 'PRJ-2026-005', projectType: 'Webinar', totalDB: 2500, sent: 2400, delivered: 2350, opens: 1410, clicks: 380, bounced: 30, unsubscribed: 8, replied: 22 },
  { id: '3a', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003-B1', projectType: 'ABM Campaign', totalDB: 10000, sent: 9500, delivered: 9200, opens: 4600, clicks: 1380, bounced: 180, unsubscribed: 45, replied: 120 },
  { id: '3b', clientId: 'GLOB003', projectName: 'ABM Campaign - Fortune 500', uniqueId: 'PRJ-2026-003-B2', projectType: 'ABM Campaign', totalDB: 5000, sent: 4800, delivered: 4650, opens: 2300, clicks: 680, bounced: 90, unsubscribed: 22, replied: 60 },
];

const PROJECT_TYPES = ['MQL Campaign', 'Click Campaign', 'ABM Campaign', 'Webinar', 'Appointment Setting', 'API Project', 'Double Touch'];

const pct = (num: number, denom: number) => denom > 0 ? `${((num / denom) * 100).toFixed(1)}%` : '0%';

const exportCsv = (rows: any[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${r[h]}"`).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

interface MetricsTableProps {
  mode: 'consolidated' | 'per-project';
  title: string;
  subtitle: string;
  Icon: typeof Monitor;
}

const buildColumns = (mode: 'consolidated' | 'per-project'): ColumnDef[] => [
  { key: 'sno', label: '#', visible: true, minWidth: 50, width: 60 },
  { key: 'clientId', label: 'Client ID', visible: true, minWidth: 90, width: 110 },
  { key: 'projectName', label: 'Project', visible: true, minWidth: 160, width: 240 },
  mode === 'per-project'
    ? { key: 'uniqueId', label: 'Unique ID', visible: true, minWidth: 120, width: 170 }
    : { key: 'batches', label: 'Batches', visible: true, minWidth: 80, width: 90 },
  { key: 'projectType', label: 'Type', visible: true, minWidth: 110, width: 150 },
  { key: 'totalDB', label: 'Total DB', visible: true, minWidth: 80, width: 100 },
  { key: 'sent', label: 'Sent', visible: true, minWidth: 70, width: 90 },
  { key: 'delivered', label: 'Delivered', visible: true, minWidth: 80, width: 100 },
  { key: 'opens', label: 'Opens (%)', visible: true, minWidth: 100, width: 130 },
  { key: 'clicks', label: 'Clicks (%)', visible: true, minWidth: 100, width: 130 },
  { key: 'bounced', label: 'Bounced', visible: true, minWidth: 80, width: 100 },
  { key: 'unsubscribed', label: 'Unsubs', visible: true, minWidth: 70, width: 90 },
  { key: 'replied', label: 'Replied', visible: true, minWidth: 70, width: 90 },
];

const MetricsTable = ({ mode, title, subtitle, Icon }: MetricsTableProps) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterClient, setFilterClient] = useState('all');

  const { columns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(
    useMemo(() => buildColumns(mode), [mode])
  );

  const allClients = useMemo(() => [...new Set(MOCK_METRICS.map(m => m.clientId))], []);

  const filteredRaw = useMemo(() => {
    return MOCK_METRICS.filter(m => {
      if (filterType !== 'all' && m.projectType !== filterType) return false;
      if (filterClient !== 'all' && m.clientId !== filterClient) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!m.projectName.toLowerCase().includes(s) && !m.uniqueId.toLowerCase().includes(s) && !m.clientId.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [search, filterType, filterClient]);

  const rows = useMemo(() => {
    if (mode === 'per-project') return filteredRaw;
    const grouped = new Map<string, ProjectMetric & { batchCount: number }>();
    for (const m of filteredRaw) {
      const key = `${m.clientId}__${m.projectName}`;
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, { ...m, batchCount: 1 });
      } else {
        existing.totalDB += m.totalDB;
        existing.sent += m.sent;
        existing.delivered += m.delivered;
        existing.opens += m.opens;
        existing.clicks += m.clicks;
        existing.bounced += m.bounced;
        existing.unsubscribed += m.unsubscribed;
        existing.replied += m.replied;
        existing.batchCount += 1;
      }
    }
    return Array.from(grouped.values());
  }, [filteredRaw, mode]);

  const indexedRows = useMemo(() => rows.map((r: any, i) => ({ ...r, _idx: i + 1 })), [rows]);

  const handleExport = () => {
    const data = rows.map((r: any, i) => ({
      '#': i + 1,
      'Client ID': r.clientId,
      'Project': r.projectName,
      ...(mode === 'per-project' ? { 'Unique ID': r.uniqueId } : { 'Batches': r.batchCount }),
      'Type': r.projectType,
      'Total DB': r.totalDB,
      'Sent': r.sent,
      'Delivered': r.delivered,
      'Opens': r.opens,
      'Open %': pct(r.opens, r.delivered),
      'Clicks': r.clicks,
      'Click %': pct(r.clicks, r.delivered),
      'Bounced': r.bounced,
      'Unsubs': r.unsubscribed,
      'Replied': r.replied,
    }));
    exportCsv(data, mode);
  };

  const renderCell = (r: any, key: string) => {
    switch (key) {
      case 'sno': return <span className="text-muted-foreground">{r._idx}</span>;
      case 'clientId': return <span className="font-mono text-xs">{r.clientId}</span>;
      case 'projectName': return <span className="font-medium text-sm" title={r.projectName}>{r.projectName}</span>;
      case 'uniqueId': return <span className="font-mono text-xs text-muted-foreground" title={r.uniqueId}>{r.uniqueId}</span>;
      case 'batches': return <Badge variant="secondary" className="text-xs">{r.batchCount}</Badge>;
      case 'projectType': return <Badge variant="outline" className="text-xs" title={r.projectType}>{r.projectType}</Badge>;
      case 'totalDB': return <span className="text-sm">{r.totalDB.toLocaleString()}</span>;
      case 'sent': return <span className="text-sm">{r.sent.toLocaleString()}</span>;
      case 'delivered': return <span className="text-sm">{r.delivered.toLocaleString()}</span>;
      case 'opens':
        return <span className="text-sm">{r.opens.toLocaleString()} <span className="text-muted-foreground text-xs">({pct(r.opens, r.delivered)})</span></span>;
      case 'clicks':
        return <span className="text-sm">{r.clicks.toLocaleString()} <span className="text-muted-foreground text-xs">({pct(r.clicks, r.delivered)})</span></span>;
      case 'bounced': return <span className="text-sm">{r.bounced.toLocaleString()}</span>;
      case 'unsubscribed': return <span className="text-sm">{r.unsubscribed.toLocaleString()}</span>;
      case 'replied': return <span className="text-sm">{r.replied.toLocaleString()}</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Icon className="h-6 w-6 text-primary" /> {title}
          </h1>
          <p className="text-sm font-light text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <ManageColumnsButton columns={columns} toggleColumn={toggleColumn} />
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-4 mb-4">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search project, ID, client..."
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
          Showing {rows.length} {mode === 'consolidated' ? 'project group' : 'project'}{rows.length !== 1 ? 's' : ''}
          <span className="ml-2 italic">· Drag column edges to resize</span>
        </div>

        <div className="rounded-md border">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={indexedRows}
            renderCell={renderCell}
            rowKey={(r) => r.id || `${r.clientId}-${r.projectName}`}
            emptyMessage="No projects found"
          />
        </div>
      </Card>
    </div>
  );
};

export const ConsoleView = () => (
  <MetricsTable
    mode="consolidated"
    title="Console View"
    subtitle="Consolidated metrics per project (multiple batches under the same project are clubbed together)"
    Icon={Monitor}
  />
);

export const Analytics = () => (
  <MetricsTable
    mode="per-project"
    title="Analytics"
    subtitle="Per-project metrics (each batch shown separately)"
    Icon={BarChart3}
  />
);

export default MetricsTable;
