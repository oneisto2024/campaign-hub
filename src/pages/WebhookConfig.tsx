import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit, Webhook, Link2, FileJson, Server, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import HolidayBanner from '@/components/HolidayBanner';

const WEBHOOK_EVENTS = ['delivered', 'opened', 'clicked', 'bounced', 'unsubscribed', 'complained', 'deferred', 'dropped', 'spam_report'];

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  createdAt: Date;
}

const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: '1',
    name: 'ACME Production',
    url: 'https://api.acme.com/webhooks/email-events',
    events: ['delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'],
    isActive: true,
    secret: 'whsec_xxxx...xxxx',
    createdAt: new Date('2026-01-10'),
  },
  {
    id: '2',
    name: 'Globex Staging',
    url: 'https://staging.globex.com/hooks/campaigns',
    events: ['delivered', 'opened', 'clicked', 'bounced'],
    isActive: false,
    secret: 'whsec_yyyy...yyyy',
    createdAt: new Date('2026-02-01'),
  },
];

const SAMPLE_PAYLOAD = `{
  "event": "opened",
  "timestamp": "2026-03-02T10:30:00Z",
  "data": {
    "message_id": "msg_abc123",
    "recipient": "john@example.com",
    "campaign_id": "PRJ-2026-001",
    "subject": "Your Q1 Report",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "metadata": {
      "client_id": "ACME001",
      "funnel_step": 1
    }
  }
}`;

const WebhookConfig = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(MOCK_WEBHOOKS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editWebhook, setEditWebhook] = useState<WebhookEndpoint | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<WebhookEndpoint | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [formActive, setFormActive] = useState(true);

  const resetForm = () => { setFormName(''); setFormUrl(''); setFormEvents([]); setFormActive(true); };

  const openAdd = () => { resetForm(); setEditWebhook(null); setIsAddOpen(true); };

  const openEdit = (wh: WebhookEndpoint) => {
    setFormName(wh.name); setFormUrl(wh.url); setFormEvents([...wh.events]); setFormActive(wh.isActive);
    setEditWebhook(wh); setIsAddOpen(true);
  };

  const toggleEvent = (event: string) => {
    setFormEvents(prev => prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]);
  };

  const handleSave = () => {
    if (!formName.trim() || !formUrl.trim()) {
      toast({ title: 'Name and URL are required', variant: 'destructive' }); return;
    }
    if (formEvents.length === 0) {
      toast({ title: 'Select at least one event', variant: 'destructive' }); return;
    }
    if (editWebhook) {
      setWebhooks(webhooks.map(w => w.id === editWebhook.id
        ? { ...w, name: formName.trim(), url: formUrl.trim(), events: formEvents, isActive: formActive }
        : w
      ));
      toast({ title: 'Webhook updated' });
    } else {
      setWebhooks([...webhooks, {
        id: Date.now().toString(), name: formName.trim(), url: formUrl.trim(),
        events: formEvents, isActive: formActive, secret: `whsec_${Math.random().toString(36).slice(2, 10)}`,
        createdAt: new Date(),
      }]);
      toast({ title: 'Webhook endpoint added' });
    }
    setIsAddOpen(false); resetForm(); setEditWebhook(null);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setWebhooks(webhooks.filter(w => w.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast({ title: 'Webhook removed' });
    }
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(SAMPLE_PAYLOAD);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
    toast({ title: 'Payload copied to clipboard' });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Email Config</p>
        <h1 className="text-2xl font-semibold text-foreground">Webhook & API Configuration</h1>
      </div>

      <HolidayBanner />

      {/* Webhook Endpoints */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Webhook className="h-5 w-5" /> Webhook Endpoints
            </CardTitle>
            <Button onClick={openAdd} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Endpoint</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {webhooks.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No webhook endpoints configured</div>
          ) : (
            <div className="divide-y divide-border">
              {webhooks.map((wh, i) => (
                <div key={wh.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{i + 1}.</span>
                      <span className="font-medium">{wh.name}</span>
                      <Badge variant={wh.isActive ? 'default' : 'secondary'}>{wh.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Link2 className="h-3 w-3 text-muted-foreground" />
                      <code className="font-mono text-muted-foreground">{wh.url}</code>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map(e => (
                        <Badge key={e} variant="outline" className="text-[10px] capitalize">{e.replace('_', ' ')}</Badge>
                      ))}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Secret: <code className="font-mono">{wh.secret}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={wh.isActive} onCheckedChange={() => {
                      setWebhooks(webhooks.map(w => w.id === wh.id ? { ...w, isActive: !w.isActive } : w));
                    }} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(wh)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(wh)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Endpoints Reference */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Server className="h-5 w-5" /> API Endpoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">Use these endpoints to send transactional mail or query campaign statistics via API.</p>
          <div className="space-y-3">
            {[
              { method: 'POST', path: '/api/v1/send', desc: 'Send transactional email' },
              { method: 'GET', path: '/api/v1/campaigns/:id/stats', desc: 'Fetch campaign statistics' },
              { method: 'GET', path: '/api/v1/campaigns/:id/events', desc: 'List email events' },
              { method: 'POST', path: '/api/v1/webhooks/test', desc: 'Send test webhook event' },
            ].map((ep, i) => (
              <div key={i} className="flex items-center gap-3 rounded border border-border p-3">
                <Badge variant={ep.method === 'POST' ? 'default' : 'secondary'} className="font-mono text-xs w-14 justify-center">{ep.method}</Badge>
                <code className="font-mono text-sm flex-1">{ep.path}</code>
                <span className="text-xs text-muted-foreground">{ep.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sample Payload */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <FileJson className="h-5 w-5" /> Sample Event Payload
            </CardTitle>
            <Button variant="outline" size="sm" onClick={copyPayload}>
              {copiedPayload ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copiedPayload ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto">{SAMPLE_PAYLOAD}</pre>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditWebhook(null); resetForm(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editWebhook ? 'Edit' : 'Add'} Webhook Endpoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Endpoint Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. Production Webhook" />
            </div>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="https://your-domain.com/webhooks" />
            </div>
            <div className="space-y-2">
              <Label>Subscribe to Events</Label>
              <div className="flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map(event => (
                  <Badge
                    key={event}
                    variant={formEvents.includes(event) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleEvent(event)}
                  >
                    {event.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formActive} onCheckedChange={setFormActive} />
              <Label>{formActive ? 'Active' : 'Inactive'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditWebhook(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editWebhook ? 'Update' : 'Add'} Endpoint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteConfirm?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WebhookConfig;
