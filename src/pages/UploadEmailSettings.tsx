import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Edit, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useResizableColumns, ColumnDef } from '@/hooks/useResizableColumns';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';
import HolidayBanner from '@/components/HolidayBanner';

type AccountStatus = 'live' | 'hold' | 'paused';

interface EmailAccount {
  id: string;
  accountName: string;
  apiKey: string;
  host: string;
  email: string;
  fromName: string;
  replyToEmail: string;
  secretKey: string;
  region: string;
  remark: string;
  status: AccountStatus;
  createdAt: Date;
}

const MOCK_ACCOUNTS: EmailAccount[] = [
  {
    id: '1',
    accountName: 'AWS SES Production',
    apiKey: 'AKIA-xxxx-xxxx-1234',
    host: 'email-smtp.us-east-1.amazonaws.com',
    email: 'noreply@company.com',
    fromName: 'Company Notifications',
    replyToEmail: 'support@company.com',
    secretKey: 'wJalr-xxxx-xxxx-5678',
    region: 'us-east-1',
    remark: 'Primary sending account',
    status: 'live',
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '2',
    accountName: 'SendGrid Backup',
    apiKey: 'SG.xxxx-xxxx-9012',
    host: 'smtp.sendgrid.net',
    email: 'outreach@company.com',
    fromName: 'Company Outreach',
    replyToEmail: 'outreach@company.com',
    secretKey: 'sg-secret-xxxx-3456',
    region: 'global',
    remark: 'Backup for campaigns',
    status: 'hold',
    createdAt: new Date('2026-01-12'),
  },
];

const statusConfig: Record<AccountStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  live: { label: 'Live', variant: 'default' },
  hold: { label: 'On Hold', variant: 'secondary' },
  paused: { label: 'Paused', variant: 'outline' },
};

const UPLOAD_EMAIL_COLUMNS: ColumnDef[] = [
  { key: 'sNo', label: 'S.No', visible: true, minWidth: 50, width: 60 },
  { key: 'accountName', label: 'Account Name', visible: true, minWidth: 100, width: 170 },
  { key: 'email', label: 'Email', visible: true, minWidth: 100, width: 180 },
  { key: 'host', label: 'Host', visible: true, minWidth: 100, width: 200 },
  { key: 'region', label: 'Region', visible: true, minWidth: 70, width: 100 },
  { key: 'status', label: 'Status', visible: true, minWidth: 100, width: 140 },
  { key: 'actions', label: 'Actions', visible: true, minWidth: 80, width: 100 },
];

const UploadEmailSettings = () => {
  const [accounts, setAccounts] = useState<EmailAccount[]>(MOCK_ACCOUNTS);
  const { columns: tableColumns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(UPLOAD_EMAIL_COLUMNS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<EmailAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<EmailAccount | null>(null);

  // Form state
  const [form, setForm] = useState({
    accountName: '', apiKey: '', host: '', email: '', fromName: '',
    replyToEmail: '', secretKey: '', region: '', remark: '', status: 'hold' as AccountStatus,
  });

  const resetForm = () => setForm({
    accountName: '', apiKey: '', host: '', email: '', fromName: '',
    replyToEmail: '', secretKey: '', region: '', remark: '', status: 'hold',
  });

  const openAdd = () => {
    resetForm();
    setEditAccount(null);
    setIsFormOpen(true);
  };

  const openEdit = (account: EmailAccount) => {
    setForm({
      accountName: account.accountName, apiKey: account.apiKey, host: account.host,
      email: account.email, fromName: account.fromName, replyToEmail: account.replyToEmail,
      secretKey: account.secretKey, region: account.region, remark: account.remark, status: account.status,
    });
    setEditAccount(account);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.accountName.trim() || !form.apiKey.trim() || !form.email.trim()) {
      toast({ title: 'Account name, API key, and email are required', variant: 'destructive' });
      return;
    }

    if (editAccount) {
      setAccounts(accounts.map(a =>
        a.id === editAccount.id ? { ...a, ...form } : a
      ));
      toast({ title: 'Email account updated' });
    } else {
      const newAccount: EmailAccount = {
        id: Date.now().toString(),
        ...form,
        createdAt: new Date(),
      };
      setAccounts([...accounts, newAccount]);
      toast({ title: 'Email account added' });
    }

    setIsFormOpen(false);
    resetForm();
    setEditAccount(null);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setAccounts(accounts.filter(a => a.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast({ title: 'Email account removed' });
    }
  };

  const updateStatus = (id: string, status: AccountStatus) => {
    setAccounts(accounts.map(a => a.id === id ? { ...a, status } : a));
    toast({ title: `Account status changed to ${statusConfig[status].label}` });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Email Config</p>
        <h1 className="text-2xl font-semibold text-foreground">Upload Email Settings</h1>
      </div>

      <HolidayBanner />

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Accounts
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button onClick={openAdd} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Account
              </Button>
              <ManageColumnsButton columns={tableColumns} toggleColumn={toggleColumn} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={accounts.map((a, i) => ({ ...a, _sNo: i + 1 }))}
            rowKey={(a) => a.id}
            emptyMessage="No email accounts configured"
            renderCell={(account: EmailAccount & { _sNo: number }, key: string) => {
              switch (key) {
                case 'sNo': return account._sNo;
                case 'accountName': return <span className="font-medium">{account.accountName}</span>;
                case 'email': return <span className="text-sm">{account.email}</span>;
                case 'host': return <span className="text-sm text-muted-foreground">{account.host}</span>;
                case 'region': return <span className="text-sm text-muted-foreground">{account.region}</span>;
                case 'status': return (
                  <Select value={account.status} onValueChange={(val) => updateStatus(account.id, val as AccountStatus)}>
                    <SelectTrigger className="w-[120px] h-8">
                      <Badge variant={statusConfig[account.status].variant} className="text-xs">
                        {statusConfig[account.status].label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="hold">On Hold</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                );
                case 'actions': return (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(account)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteConfirm(account)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
                default: return '-';
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) { setIsFormOpen(false); setEditAccount(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editAccount ? 'Edit' : 'Add'} Email Account</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Name *</Label>
              <Input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="e.g. AWS SES Production" />
            </div>
            <div className="space-y-2">
              <Label>Account API Key *</Label>
              <Input value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} placeholder="Enter API key" type="password" />
            </div>
            <div className="space-y-2">
              <Label>Account Host</Label>
              <Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="e.g. smtp.provider.com" />
            </div>
            <div className="space-y-2">
              <Label>Account Email *</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. noreply@company.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} placeholder="e.g. Company Notifications" />
            </div>
            <div className="space-y-2">
              <Label>Reply To Email</Label>
              <Input value={form.replyToEmail} onChange={(e) => setForm({ ...form, replyToEmail: e.target.value })} placeholder="e.g. support@company.com" type="email" />
            </div>
            <div className="space-y-2">
              <Label>Account Secret Key</Label>
              <Input value={form.secretKey} onChange={(e) => setForm({ ...form, secretKey: e.target.value })} placeholder="Enter secret key" type="password" />
            </div>
            <div className="space-y-2">
              <Label>Account Region</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. us-east-1" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Account Remark</Label>
              <Input value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} placeholder="Optional notes about this account" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(val) => setForm({ ...form, status: val as AccountStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="hold">On Hold</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsFormOpen(false); setEditAccount(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editAccount ? 'Update' : 'Add'} Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Email Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteConfirm?.accountName}</strong>? This action cannot be undone.
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

export default UploadEmailSettings;
