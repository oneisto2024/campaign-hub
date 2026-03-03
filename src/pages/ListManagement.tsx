import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Trash2, Upload, Edit, ShieldBan, Ban, Globe, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import HolidayBanner from '@/components/HolidayBanner';

interface ListEntry {
  id: string;
  value: string;
  addedAt: Date;
  addedBy: string;
  reason?: string;
}

type ListType = 'dnc' | 'blacklist-email' | 'blacklist-domain';

const MOCK_DATA: Record<ListType, ListEntry[]> = {
  'dnc': [
    { id: '1', value: 'important@vip.com', addedAt: new Date('2026-01-15'), addedBy: 'Admin', reason: 'Client request' },
    { id: '2', value: 'ceo@bigcorp.com', addedAt: new Date('2026-02-01'), addedBy: 'System', reason: 'Escalation' },
  ],
  'blacklist-email': [
    { id: '3', value: 'spammer@fake.com', addedAt: new Date('2026-01-20'), addedBy: 'Admin', reason: 'Spam trap' },
    { id: '4', value: 'bounced@invalid.com', addedAt: new Date('2026-02-10'), addedBy: 'System', reason: 'Hard bounce' },
  ],
  'blacklist-domain': [
    { id: '5', value: 'spammydomain.com', addedAt: new Date('2026-01-25'), addedBy: 'Admin', reason: 'Known spam domain' },
    { id: '6', value: 'competitor.com', addedAt: new Date('2026-02-05'), addedBy: 'Admin', reason: 'Competitor domain' },
  ],
};

const TAB_CONFIG: { key: ListType; label: string; icon: React.ElementType; description: string; placeholder: string }[] = [
  { key: 'dnc', label: 'Do Not Contact', icon: ShieldBan, description: 'Emails blocked from all sending. These contacts will never receive any campaign emails.', placeholder: 'email@example.com' },
  { key: 'blacklist-email', label: 'Blacklist Emails', icon: Ban, description: 'Individual email addresses permanently blocked from receiving any communications.', placeholder: 'blocked@example.com' },
  { key: 'blacklist-domain', label: 'Blacklist Domains', icon: Globe, description: 'All email addresses from these domains are blocked. No emails will be sent to any address @domain.', placeholder: 'domain.com' },
];

const ListManagement = () => {
  const [activeTab, setActiveTab] = useState<ListType>('dnc');
  const [lists, setLists] = useState(MOCK_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialog, setAddDialog] = useState(false);
  const [bulkDialog, setBulkDialog] = useState(false);
  const [editEntry, setEditEntry] = useState<ListEntry | null>(null);
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [bulkText, setBulkText] = useState('');

  const currentConfig = TAB_CONFIG.find(t => t.key === activeTab)!;
  const currentList = lists[activeTab].filter(e =>
    e.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.reason || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addEntry = () => {
    if (!newValue.trim()) { toast({ title: 'Value is required', variant: 'destructive' }); return; }
    const entry: ListEntry = { id: Date.now().toString(), value: newValue.trim(), addedAt: new Date(), addedBy: 'Admin', reason: newReason.trim() || undefined };
    setLists(prev => ({ ...prev, [activeTab]: [...prev[activeTab], entry] }));
    setNewValue(''); setNewReason(''); setAddDialog(false);
    toast({ title: `Added to ${currentConfig.label}` });
  };

  const bulkAdd = () => {
    const values = bulkText.split(/[\n,]/).map(v => v.trim()).filter(Boolean);
    if (!values.length) { toast({ title: 'No entries found', variant: 'destructive' }); return; }
    const entries: ListEntry[] = values.map(v => ({ id: Date.now().toString() + Math.random(), value: v, addedAt: new Date(), addedBy: 'Admin' }));
    setLists(prev => ({ ...prev, [activeTab]: [...prev[activeTab], ...entries] }));
    setBulkText(''); setBulkDialog(false);
    toast({ title: `${values.length} entries added to ${currentConfig.label}` });
  };

  const removeEntry = (id: string) => {
    setLists(prev => ({ ...prev, [activeTab]: prev[activeTab].filter(e => e.id !== id) }));
    toast({ title: 'Entry removed' });
  };

  const updateEntry = () => {
    if (!editEntry || !newValue.trim()) return;
    setLists(prev => ({ ...prev, [activeTab]: prev[activeTab].map(e => e.id === editEntry.id ? { ...e, value: newValue.trim(), reason: newReason.trim() || undefined } : e) }));
    setEditEntry(null); setNewValue(''); setNewReason('');
    toast({ title: 'Entry updated' });
  };

  const exportCsv = () => {
    const headers = ['Value', 'Added At', 'Added By', 'Reason'];
    const rows = currentList.map(e => [e.value, e.addedAt.toISOString(), e.addedBy, e.reason || '']);
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeTab}-list.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Administration</p>
        <h1 className="text-2xl font-semibold text-foreground">List Management</h1>
      </div>
      <HolidayBanner />

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ListType); setSearchQuery(''); }}>
        <TabsList>
          {TAB_CONFIG.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="flex items-center gap-1.5">
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_CONFIG.map(config => (
          <TabsContent key={config.key} value={config.key}>
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <config.icon className="h-5 w-5" /> {config.label}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-48" />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setBulkDialog(true)}>
                      <Upload className="h-3 w-3 mr-1" /> Bulk Upload
                    </Button>
                    <Button size="sm" onClick={() => { setNewValue(''); setNewReason(''); setAddDialog(true); }}>
                      <Plus className="h-3 w-3 mr-1" /> Add Entry
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCsv}>
                      <Download className="h-3 w-3 mr-1" /> Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">{config.key === 'blacklist-domain' ? 'Domain' : 'Email'}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Reason</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Added By</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Added At</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map((entry, i) => (
                      <tr key={entry.id} className="border-b border-border/30">
                        <td className="p-3 text-muted-foreground">{i + 1}</td>
                        <td className="p-3 font-mono text-xs">{entry.value}</td>
                        <td className="p-3 text-xs text-muted-foreground">{entry.reason || '-'}</td>
                        <td className="p-3 text-xs">{entry.addedBy}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {entry.addedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditEntry(entry); setNewValue(entry.value); setNewReason(entry.reason || ''); }}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeEntry(entry.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {currentList.length === 0 && (
                      <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No entries found</td></tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Add Entry Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add to {currentConfig.label}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{currentConfig.key === 'blacklist-domain' ? 'Domain' : 'Email'}</Label>
              <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder={currentConfig.placeholder} />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="Why is this being added?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
            <Button onClick={addEntry}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editEntry} onOpenChange={(open) => !open && setEditEntry(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Entry</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{currentConfig.key === 'blacklist-domain' ? 'Domain' : 'Email'}</Label>
              <Input value={newValue} onChange={(e) => setNewValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input value={newReason} onChange={(e) => setNewReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEntry(null)}>Cancel</Button>
            <Button onClick={updateEntry}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bulk Upload to {currentConfig.label}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Paste entries separated by commas or new lines.</p>
            <Textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={`${currentConfig.placeholder}\nanother@example.com\n...`} className="min-h-[150px] font-mono text-xs" />
            <p className="text-xs text-muted-foreground">{bulkText.split(/[\n,]/).map(v => v.trim()).filter(Boolean).length} entries detected</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialog(false)}>Cancel</Button>
            <Button onClick={bulkAdd}>Upload All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListManagement;
