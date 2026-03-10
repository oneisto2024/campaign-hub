import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus, Trash2, Upload, Users, Edit2, Save, X, Download, Search, HelpCircle, ChevronRight,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSeedLists, SeedContact, SeedList as SeedListType } from '@/contexts/SeedListContext';
import { format } from 'date-fns';

const COLUMNS = ['Email', 'First Name', 'Last Name', 'Company'];
const COL_KEYS: (keyof SeedContact)[] = ['email', 'firstName', 'lastName', 'company'];
const EMPTY_ROW = (): SeedContact => ({
  id: Date.now().toString() + Math.random(),
  email: '', firstName: '', lastName: '', company: '',
});

// ─── Editable grid ────────────────────────────────────────────────────────────
const EditableGrid = ({
  rows,
  hasHeaders,
  onChange,
}: {
  rows: SeedContact[];
  hasHeaders: boolean;
  onChange: (rows: SeedContact[]) => void;
}) => {
  const updateCell = (rowIdx: number, key: keyof SeedContact, value: string) => {
    const next = rows.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r));
    onChange(next);
  };

  const addRow = () => onChange([...rows, EMPTY_ROW()]);

  const removeRow = (rowIdx: number) => {
    const next = rows.filter((_, i) => i !== rowIdx);
    onChange(next.length ? next : [EMPTY_ROW()]);
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => {
      const text = e.clipboardData.getData('text');
      const pastedRows = text.trim().split('\n').map((r) => r.split('\t'));
      if (pastedRows.length === 1 && pastedRows[0].length === 1) return; // single cell — let default paste handle
      e.preventDefault();
      const next = [...rows];
      pastedRows.forEach((cells, ri) => {
        const targetRow = rowIdx + ri;
        if (targetRow >= next.length) next.push(EMPTY_ROW());
        cells.forEach((val, ci) => {
          const col = COL_KEYS[colIdx + ci];
          if (col) next[targetRow] = { ...next[targetRow], [col]: val.trim() };
        });
      });
      onChange(next);
    },
    [rows, onChange]
  );

  return (
    <div className="rounded-md border border-border overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-muted/50">
            <th className="border-b border-r border-border px-3 py-2 text-left text-xs text-muted-foreground w-8">#</th>
            {(hasHeaders ? COLUMNS : COLUMNS.map((_, i) => `Column ${i + 1}`)).map((col, i) => (
              <th key={i} className="border-b border-r border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                {col}
              </th>
            ))}
            <th className="border-b border-border px-2 py-2 w-8" />
          </tr>
          {hasHeaders && (
            <tr className="bg-background/50">
              <td className="border-b border-r border-border px-3 py-1 text-xs text-muted-foreground" />
              {COL_KEYS.map((key, i) => (
                <td key={i} className="border-b border-r border-border px-3 py-1 text-xs text-muted-foreground italic">
                  {key === 'email' ? 'email@example.com' : key === 'firstName' ? 'First Name' : key === 'lastName' ? 'Last Name' : 'Company'}
                </td>
              ))}
              <td className="border-b border-border" />
            </tr>
          )}
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.id} className="hover:bg-muted/20 group">
              <td className="border-b border-r border-border px-3 py-1 text-xs text-muted-foreground">{ri + 1}</td>
              {COL_KEYS.map((key, ci) => (
                <td key={ci} className="border-b border-r border-border p-0">
                  <input
                    className="w-full px-3 py-2 bg-transparent text-sm focus:outline-none focus:bg-primary/5"
                    value={row[key] as string}
                    placeholder={key === 'email' ? 'email@example.com' : ''}
                    onChange={(e) => updateCell(ri, key, e.target.value)}
                    onPaste={(e) => handlePaste(e, ri, ci)}
                  />
                </td>
              ))}
              <td className="border-b border-border px-2 py-1 text-center">
                <button
                  onClick={() => removeRow(ri)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>
          ))}
          {/* empty placeholder rows */}
          {Array.from({ length: Math.max(0, 5 - rows.length) }).map((_, i) => (
            <tr key={`empty-${i}`} className="hover:bg-muted/10 cursor-pointer" onClick={addRow}>
              <td className="border-b border-r border-border px-3 py-2 text-xs text-muted-foreground/30">{rows.length + i + 1}</td>
              {COL_KEYS.map((_, ci) => (
                <td key={ci} className="border-b border-r border-border px-3 py-2 text-xs text-muted-foreground/30">
                  {i === 0 && ci === 0 ? 'Click to add...' : ''}
                </td>
              ))}
              <td className="border-b border-border" />
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t border-border">
        <p className="text-xs text-muted-foreground">
          You can copy and paste contact data directly from a spreadsheet into the cells above, or click in a cell and manually type your data.
        </p>
        <Button variant="ghost" size="sm" onClick={addRow} className="text-xs h-7">
          <Plus className="h-3 w-3 mr-1" /> Add Row
        </Button>
      </div>
    </div>
  );
};

// ─── Create / Edit dialog ─────────────────────────────────────────────────────
const SeedListDialog = ({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: SeedListType | null;
}) => {
  const { addSeedList, updateSeedList } = useSeedLists();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(editing?.name ?? '');
  const [importMode, setImportMode] = useState<'paste' | 'upload'>('paste');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [rows, setRows] = useState<SeedContact[]>(editing?.contacts.length ? editing.contacts : [EMPTY_ROW()]);

  // Reset when dialog opens
  const handleOpenChange = () => {
    setName(editing?.name ?? '');
    setImportMode('paste');
    setHasHeaders(true);
    setRows(editing?.contacts.length ? editing.contacts : [EMPTY_ROW()]);
    onClose();
  };

  const parseCSV = (text: string): SeedContact[] => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (!lines.length) return [];
    const start = hasHeaders ? 1 : 0;
    return lines.slice(start).map((line) => {
      const cells = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
      return {
        id: Date.now().toString() + Math.random(),
        email: cells[0] ?? '',
        firstName: cells[1] ?? '',
        lastName: cells[2] ?? '',
        company: cells[3] ?? '',
      };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length) {
        setRows(parsed);
        toast({ title: `Imported ${parsed.length} contacts from ${file.name}` });
      } else {
        toast({ title: 'No contacts found in file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!name.trim()) { toast({ title: 'List name is required', variant: 'destructive' }); return; }
    const valid = rows.filter((r) => r.email.trim());
    if (!valid.length) { toast({ title: 'Add at least one contact with an email', variant: 'destructive' }); return; }

    if (editing) {
      updateSeedList(editing.id, { name: name.trim(), contacts: valid });
      toast({ title: `Seed list "${name.trim()}" updated` });
    } else {
      addSeedList({ name: name.trim(), contacts: valid });
      toast({ title: `Seed list "${name.trim()}" created with ${valid.length} contacts` });
    }
    handleOpenChange();
  };

  const exportTemplate = () => {
    const csv = ['Email,First Name,Last Name,Company', '"email@example.com","John","Doe","Acme Corp"'].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'seed_list_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleOpenChange()}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Seed List' : 'Create New Seed List'}</DialogTitle>
          <DialogDescription>
            Build a list of internal contacts to use when sending test emails.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-5 pb-2">
            {/* Name */}
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="space-y-2">
                  <Label>Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Internal QA Team"
                    className="max-w-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Import method */}
            <Card>
              <CardContent className="pt-5 pb-5 space-y-5">
                <div className="space-y-3">
                  <Label>How would you like to import contact data?</Label>
                  <RadioGroup
                    value={importMode}
                    onValueChange={(v) => setImportMode(v as 'paste' | 'upload')}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="upload" id="upload" />
                      <label htmlFor="upload" className="text-sm cursor-pointer">Upload a file</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="paste" id="paste" />
                      <label htmlFor="paste" className="text-sm cursor-pointer">Copy and paste</label>
                    </div>
                  </RadioGroup>

                  {importMode === 'upload' && (
                    <div className="flex items-center gap-3 mt-2">
                      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5 mr-1.5" /> Choose CSV File
                      </Button>
                      <Button variant="ghost" size="sm" onClick={exportTemplate} className="text-xs">
                        <Download className="h-3 w-3 mr-1" /> Download Template
                      </Button>
                      <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
                    </div>
                  )}
                </div>

                {/* Headers toggle */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label>Does your contact list have column headers?</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-primary">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        If your first row contains labels like "Email", "First Name", etc., select Yes. Otherwise select No.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <RadioGroup
                    value={hasHeaders ? 'yes' : 'no'}
                    onValueChange={(v) => setHasHeaders(v === 'yes')}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="hyes" />
                      <label htmlFor="hyes" className="text-sm cursor-pointer">Yes</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="hno" />
                      <label htmlFor="hno" className="text-sm cursor-pointer">No</label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Editable grid */}
                <EditableGrid rows={rows} hasHeaders={hasHeaders} onChange={setRows} />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleOpenChange}>Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> {editing ? 'Save Changes' : 'Create List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const SeedList = () => {
  const { seedLists, deleteSeedList } = useSeedLists();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<SeedListType | null>(null);
  const [search, setSearch] = useState('');
  const [expandedList, setExpandedList] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SeedListType | null>(null);

  const filtered = seedLists.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.contacts.some((c) => c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = () => {
    if (!deleteConfirm) return;
    deleteSeedList(deleteConfirm.id);
    toast({ title: `"${deleteConfirm.name}" deleted` });
    setDeleteConfirm(null);
  };

  const exportList = (list: SeedList) => {
    const rows = [
      'Email,First Name,Last Name,Company',
      ...list.contacts.map((c) => `"${c.email}","${c.firstName}","${c.lastName}","${c.company}"`),
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${list.name.replace(/\s+/g, '_')}_seed_list.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-light text-muted-foreground">Ask AI</p>
          <h1 className="text-2xl font-semibold text-foreground">Seed List</h1>
        </div>
        <Button onClick={() => { setEditing(null); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Create Seed List
        </Button>
      </div>

      {/* Search + stats */}
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lists or emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="secondary" className="text-xs">
          {seedLists.length} list{seedLists.length !== 1 ? 's' : ''} · {seedLists.reduce((s, l) => s + l.contacts.length, 0)} contacts
        </Badge>
      </div>

      {/* List cards */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {search ? 'No seed lists match your search.' : 'No seed lists yet. Create one to get started.'}
            </p>
            {!search && (
              <Button variant="outline" onClick={() => { setEditing(null); setCreateOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Create Seed List
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((list) => {
            const isExpanded = expandedList === list.id;
            return (
              <Card key={list.id} className="overflow-hidden">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => setExpandedList(isExpanded ? null : list.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>
                      <div className="min-w-0">
                        <CardTitle className="text-sm font-semibold truncate">{list.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {list.contacts.length} contact{list.contacts.length !== 1 ? 's' : ''} · Updated {format(list.updatedAt, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />{list.contacts.length}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => exportList(list)}>
                        <Download className="h-3 w-3 mr-1" /> Export
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setEditing(list); setCreateOpen(true); }}>
                        <Edit2 className="h-3 w-3 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(list)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-0 border-t border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="text-left px-4 py-2 font-medium text-xs text-muted-foreground w-8">#</th>
                            {COLUMNS.map((c) => (
                              <th key={c} className="text-left px-4 py-2 font-medium text-xs text-muted-foreground">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {list.contacts.map((contact, i) => (
                            <tr key={contact.id} className="border-t border-border/30 hover:bg-muted/20">
                              <td className="px-4 py-2 text-xs text-muted-foreground">{i + 1}</td>
                              <td className="px-4 py-2 font-mono text-xs">{contact.email}</td>
                              <td className="px-4 py-2 text-xs">{contact.firstName}</td>
                              <td className="px-4 py-2 text-xs">{contact.lastName}</td>
                              <td className="px-4 py-2 text-xs">{contact.company}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="px-4 py-2 bg-muted/20 border-t border-border/30 flex justify-end">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { setEditing(list); setCreateOpen(true); }}>
                        <Plus className="h-3 w-3 mr-1" /> Add Contacts
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit dialog */}
      <SeedListDialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setEditing(null); }}
        editing={editing}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Seed List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{deleteConfirm?.name}"</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeedList;
