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
import { Plus, Trash2, Edit, ShieldCheck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useResizableColumns, ColumnDef } from '@/hooks/useResizableColumns';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';
import HolidayBanner from '@/components/HolidayBanner';

interface ValidationAPIAccount {
  id: string;
  accountName: string;
  apiKey: string;
  isLive: boolean;
  createdAt: Date;
}

const MOCK_ACCOUNTS: ValidationAPIAccount[] = [
  {
    id: '1',
    accountName: 'ZeroBounce Primary',
    apiKey: 'zb-api-xxxx-xxxx-1234',
    isLive: true,
    createdAt: new Date('2026-01-05'),
  },
  {
    id: '2',
    accountName: 'NeverBounce Backup',
    apiKey: 'nb-api-xxxx-xxxx-5678',
    isLive: false,
    createdAt: new Date('2026-01-10'),
  },
];

const VALIDATION_COLUMNS: ColumnDef[] = [
  { key: 'sNo', label: 'S.No', visible: true, minWidth: 50, width: 60 },
  { key: 'accountName', label: 'Account Name', visible: true, minWidth: 100, width: 180 },
  { key: 'apiKey', label: 'API Key', visible: true, minWidth: 100, width: 180 },
  { key: 'status', label: 'Status', visible: true, minWidth: 70, width: 100 },
  { key: 'liveHold', label: 'Live / Hold', visible: true, minWidth: 70, width: 100 },
  { key: 'actions', label: 'Actions', visible: true, minWidth: 80, width: 100 },
];

const EmailValidationAPI = () => {
  const [accounts, setAccounts] = useState<ValidationAPIAccount[]>(MOCK_ACCOUNTS);
  const { columns: tableColumns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(VALIDATION_COLUMNS);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<ValidationAPIAccount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ValidationAPIAccount | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formIsLive, setFormIsLive] = useState(false);

  const resetForm = () => {
    setFormName('');
    setFormApiKey('');
    setFormIsLive(false);
  };

  const openAdd = () => {
    resetForm();
    setEditAccount(null);
    setIsAddOpen(true);
  };

  const openEdit = (account: ValidationAPIAccount) => {
    setFormName(account.accountName);
    setFormApiKey(account.apiKey);
    setFormIsLive(account.isLive);
    setEditAccount(account);
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim() || !formApiKey.trim()) {
      toast({ title: 'Account name and API key are required', variant: 'destructive' });
      return;
    }

    if (editAccount) {
      setAccounts(accounts.map(a =>
        a.id === editAccount.id
          ? { ...a, accountName: formName.trim(), apiKey: formApiKey.trim(), isLive: formIsLive }
          : a
      ));
      toast({ title: 'API account updated' });
    } else {
      const newAccount: ValidationAPIAccount = {
        id: Date.now().toString(),
        accountName: formName.trim(),
        apiKey: formApiKey.trim(),
        isLive: formIsLive,
        createdAt: new Date(),
      };
      setAccounts([...accounts, newAccount]);
      toast({ title: 'API account added' });
    }

    setIsAddOpen(false);
    resetForm();
    setEditAccount(null);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      setAccounts(accounts.filter(a => a.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast({ title: 'API account removed' });
    }
  };

  const toggleLive = (id: string) => {
    setAccounts(accounts.map(a =>
      a.id === id ? { ...a, isLive: !a.isLive } : a
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Email Config</p>
        <h1 className="text-2xl font-semibold text-foreground">Email Validation API</h1>
      </div>

      <HolidayBanner />

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Validation API Accounts
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button onClick={openAdd} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add API Account
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
            emptyMessage="No validation API accounts configured"
            renderCell={(account: ValidationAPIAccount & { _sNo: number }, key: string) => {
              switch (key) {
                case 'sNo': return account._sNo;
                case 'accountName': return <span className="font-medium">{account.accountName}</span>;
                case 'apiKey': return (
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {account.apiKey.slice(0, 12)}••••••
                  </code>
                );
                case 'status': return (
                  <Badge variant={account.isLive ? 'default' : 'secondary'}>
                    {account.isLive ? 'Live' : 'On Hold'}
                  </Badge>
                );
                case 'liveHold': return (
                  <Switch checked={account.isLive} onCheckedChange={() => toggleLive(account.id)} />
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
      <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) { setIsAddOpen(false); setEditAccount(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editAccount ? 'Edit' : 'Add'} Validation API Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. ZeroBounce Primary" />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input value={formApiKey} onChange={(e) => setFormApiKey(e.target.value)} placeholder="Enter API key" type="password" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={formIsLive} onCheckedChange={setFormIsLive} />
              <Label>{formIsLive ? 'Live' : 'On Hold'}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddOpen(false); setEditAccount(null); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave}>{editAccount ? 'Update' : 'Add'} Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Account</AlertDialogTitle>
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

export default EmailValidationAPI;
