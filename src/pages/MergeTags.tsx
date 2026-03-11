import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash2, Edit, Copy, Tags } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import HolidayBanner from '@/components/HolidayBanner';

interface MergeTag {
  id: string;
  tag: string;
  label: string;
  category: 'contact' | 'company' | 'campaign' | 'custom';
  defaultValue: string;
  example: string;
}

const DEFAULT_MERGE_TAGS: MergeTag[] = [
  { id: '1', tag: '{{first_name}}', label: 'First Name', category: 'contact', defaultValue: 'there', example: 'John' },
  { id: '2', tag: '{{last_name}}', label: 'Last Name', category: 'contact', defaultValue: '', example: 'Smith' },
  { id: '3', tag: '{{email}}', label: 'Email', category: 'contact', defaultValue: '', example: 'john@example.com' },
  { id: '4', tag: '{{company}}', label: 'Company', category: 'company', defaultValue: 'your company', example: 'Acme Corp' },
  { id: '5', tag: '{{job_title}}', label: 'Job Title', category: 'contact', defaultValue: '', example: 'VP Marketing' },
  { id: '6', tag: '{{industry}}', label: 'Industry', category: 'company', defaultValue: '', example: 'Technology' },
  { id: '7', tag: '{{country}}', label: 'Country', category: 'contact', defaultValue: '', example: 'United States' },
  { id: '8', tag: '{{campaign_name}}', label: 'Campaign Name', category: 'campaign', defaultValue: '', example: 'Q1 Lead Gen' },
  { id: '9', tag: '{{unsubscribe_link}}', label: 'Unsubscribe Link', category: 'campaign', defaultValue: '', example: 'https://...' },
  { id: '10', tag: '{{website}}', label: 'Website', category: 'company', defaultValue: '', example: 'https://acme.com' },
];

const CATEGORIES = ['contact', 'company', 'campaign', 'custom'] as const;

const MergeTags = () => {
  const [tags, setTags] = useState<MergeTag[]>(DEFAULT_MERGE_TAGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [addDialog, setAddDialog] = useState(false);
  const [editTag, setEditTag] = useState<MergeTag | null>(null);
  const [form, setForm] = useState({ tag: '', label: '', category: 'custom' as MergeTag['category'], defaultValue: '', example: '' });

  const filtered = tags.filter(t => {
    const matchSearch = t.tag.toLowerCase().includes(searchQuery.toLowerCase()) || t.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    toast({ title: `Copied ${tag}` });
  };

  const addTag = () => {
    if (!form.tag.trim() || !form.label.trim()) { toast({ title: 'Tag and label required', variant: 'destructive' }); return; }
    const tagValue = form.tag.startsWith('{{') ? form.tag : `{{${form.tag.replace(/[{}]/g, '')}}}`;
    setTags(prev => [...prev, { ...form, id: Date.now().toString(), tag: tagValue }]);
    setForm({ tag: '', label: '', category: 'custom', defaultValue: '', example: '' });
    setAddDialog(false);
    toast({ title: 'Merge tag created' });
  };

  const updateTag = () => {
    if (!editTag) return;
    const tagValue = form.tag.startsWith('{{') ? form.tag : `{{${form.tag.replace(/[{}]/g, '')}}}`;
    setTags(prev => prev.map(t => t.id === editTag.id ? { ...form, id: editTag.id, tag: tagValue } : t));
    setEditTag(null);
    toast({ title: 'Merge tag updated' });
  };

  const deleteTag = (id: string) => {
    setTags(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Merge tag deleted' });
  };

  const catColor: Record<string, string> = {
    contact: 'bg-chart-2/15 text-chart-2',
    company: 'bg-chart-4/15 text-chart-4',
    campaign: 'bg-primary/15 text-primary',
    custom: 'bg-chart-5/15 text-chart-5',
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Tools</p>
        <h1 className="text-2xl font-semibold text-foreground">Merge Tags</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage personalization tags for email templates and outreach campaigns.</p>
      </div>
      <HolidayBanner />

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Tags className="h-5 w-5" /> Available Merge Tags
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-full sm:w-48" />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => { setForm({ tag: '', label: '', category: 'custom', defaultValue: '', example: '' }); setAddDialog(true); }}>
                <Plus className="h-3 w-3 mr-1" /> New Tag
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-muted-foreground w-8">#</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Tag</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Label</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Default</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Example</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tag, i) => (
                <tr key={tag.id} className="border-b border-border/30">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{tag.tag}</code>
                  </td>
                  <td className="p-3 text-sm">{tag.label}</td>
                  <td className="p-3">
                    <Badge variant="outline" className={`text-xs capitalize ${catColor[tag.category] || ''}`}>{tag.category}</Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{tag.defaultValue || '-'}</td>
                  <td className="p-3 text-xs text-muted-foreground italic">{tag.example || '-'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyTag(tag.tag)} title="Copy tag">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTag(tag); setForm({ tag: tag.tag, label: tag.label, category: tag.category, defaultValue: tag.defaultValue, example: tag.example }); }} title="Edit">
                        <Edit className="h-3 w-3" />
                      </Button>
                      {tag.category === 'custom' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTag(tag.id)} title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={addDialog || !!editTag} onOpenChange={(open) => { if (!open) { setAddDialog(false); setEditTag(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editTag ? 'Edit Merge Tag' : 'Create Merge Tag'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tag Name *</Label>
              <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="e.g. first_name or {{first_name}}" />
            </div>
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. First Name" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as MergeTag['category'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Value</Label>
              <Input value={form.defaultValue} onChange={(e) => setForm({ ...form, defaultValue: e.target.value })} placeholder="Fallback if empty" />
            </div>
            <div className="space-y-2">
              <Label>Example Value</Label>
              <Input value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} placeholder="e.g. John" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddDialog(false); setEditTag(null); }}>Cancel</Button>
            <Button onClick={editTag ? updateTag : addTag}>{editTag ? 'Save' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MergeTags;
