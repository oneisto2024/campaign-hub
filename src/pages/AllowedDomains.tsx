import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';
import { useResizableColumns, type ColumnDef } from '@/hooks/useResizableColumns';
import HolidayBanner from '@/components/HolidayBanner';

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'sno', label: 'S.No', visible: true, width: 70, minWidth: 50 },
  { key: 'domain', label: 'Domain', visible: true, width: 250, minWidth: 120 },
  { key: 'addedBy', label: 'Added By', visible: true, width: 180, minWidth: 100 },
  { key: 'addedOn', label: 'Added On', visible: true, width: 180, minWidth: 100 },
  { key: 'status', label: 'Status', visible: true, width: 120, minWidth: 80 },
  { key: 'actions', label: 'Actions', visible: true, width: 100, minWidth: 80 },
];

interface DomainEntry {
  id: string;
  domain: string;
  addedBy: string;
  addedOn: string;
  status: 'Active' | 'Inactive';
}

const SAMPLE_DOMAINS: DomainEntry[] = [
  { id: '1', domain: 'company.com', addedBy: 'Admin', addedOn: '2025-01-15', status: 'Active' },
  { id: '2', domain: 'partner.org', addedBy: 'Admin', addedOn: '2025-02-01', status: 'Active' },
  { id: '3', domain: 'vendor.net', addedBy: 'Admin', addedOn: '2025-02-10', status: 'Active' },
];

const AllowedDomains = () => {
  const { toast } = useToast();
  const [domains, setDomains] = useState<DomainEntry[]>(SAMPLE_DOMAINS);
  const [newDomain, setNewDomain] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { columns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(DEFAULT_COLUMNS);

  const handleAddDomain = () => {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) {
      toast({ title: 'Validation Error', description: 'Please enter a domain.', variant: 'destructive' });
      return;
    }
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(trimmed)) {
      toast({ title: 'Invalid Domain', description: 'Please enter a valid domain (e.g. company.com).', variant: 'destructive' });
      return;
    }
    if (domains.some(d => d.domain === trimmed)) {
      toast({ title: 'Duplicate', description: 'This domain already exists.', variant: 'destructive' });
      return;
    }

    setDomains(prev => [...prev, {
      id: Date.now().toString(),
      domain: trimmed,
      addedBy: 'Admin',
      addedOn: new Date().toISOString().split('T')[0],
      status: 'Active',
    }]);
    setNewDomain('');
    setDialogOpen(false);
    toast({ title: 'Domain Added', description: `${trimmed} has been added to allowed domains.` });
  };

  const handleRemoveDomain = (id: string) => {
    const domain = domains.find(d => d.id === id);
    setDomains(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Domain Removed', description: `${domain?.domain} has been removed.` });
  };

  const renderCell = (item: DomainEntry & { sno: number }, columnKey: string) => {
    switch (columnKey) {
      case 'sno': return item.sno;
      case 'domain': return item.domain;
      case 'addedBy': return item.addedBy;
      case 'addedOn': return item.addedOn;
      case 'status':
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            item.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
          }`}>
            {item.status}
          </span>
        );
      case 'actions':
        return (
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveDomain(item.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      default: return '';
    }
  };

  const tableData = domains.map((d, idx) => ({ ...d, sno: idx + 1 }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-light text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold text-foreground">Allowed Domains</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Only users with email addresses from these domains can be created.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ManageColumnsButton columns={columns} toggleColumn={toggleColumn} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Allowed Domain</DialogTitle>
                <DialogDescription>
                  Enter a domain name. Only users with emails from allowed domains can be created.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-4">
                <Label htmlFor="domain">Domain</Label>
                <Input id="domain" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="e.g. company.com" onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddDomain}>Add Domain</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <HolidayBanner />

      <Card>
        <CardContent className="p-0">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={tableData}
            renderCell={renderCell}
            rowKey={(item) => item.id}
            emptyMessage="No allowed domains configured"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AllowedDomains;
