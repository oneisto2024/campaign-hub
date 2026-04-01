import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { ResizableDataTable, ManageColumnsButton } from '@/components/ResizableDataTable';
import { useResizableColumns, type ColumnDef } from '@/hooks/useResizableColumns';
import HolidayBanner from '@/components/HolidayBanner';

const DEFAULT_COLUMNS: ColumnDef[] = [
  { key: 'sno', label: 'S.No', visible: true, width: 70, minWidth: 50 },
  { key: 'name', label: 'Full Name', visible: true, width: 180, minWidth: 120 },
  { key: 'email', label: 'Email', visible: true, width: 220, minWidth: 140 },
  { key: 'role', label: 'Role', visible: true, width: 120, minWidth: 80 },
  { key: 'shift', label: 'Shift', visible: true, width: 140, minWidth: 90 },
  { key: 'isProjectManager', label: 'Project Manager', visible: true, width: 140, minWidth: 100 },
  { key: 'modules', label: 'Modules', visible: true, width: 100, minWidth: 70 },
  { key: 'createdOn', label: 'Created On', visible: true, width: 140, minWidth: 100 },
  { key: 'status', label: 'Active', visible: true, width: 100, minWidth: 80 },
];

interface UserEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  shift: string;
  modulesCount: number;
  createdOn: string;
  active: boolean;
  isProjectManager: boolean;
}

const SAMPLE_USERS: UserEntry[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@company.com', role: 'Admin', shift: 'Morning', modulesCount: 13, createdOn: '2025-01-10', active: true, isProjectManager: true },
  { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@company.com', role: 'Manager', shift: 'Afternoon', modulesCount: 8, createdOn: '2025-01-15', active: true, isProjectManager: true },
  { id: '3', firstName: 'Bob', lastName: 'Wilson', email: 'bob@partner.org', role: 'User', shift: 'Flexible', modulesCount: 5, createdOn: '2025-02-01', active: false, isProjectManager: false },
  { id: '4', firstName: 'Alice', lastName: 'Brown', email: 'alice@vendor.net', role: 'User', shift: 'Night', modulesCount: 3, createdOn: '2025-02-05', active: true, isProjectManager: false },
  { id: '5', firstName: 'Mike', lastName: 'Johnson', email: 'mike@company.com', role: 'Manager', shift: 'Morning', modulesCount: 10, createdOn: '2025-01-20', active: true, isProjectManager: true },
];

const ManageUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserEntry[]>(SAMPLE_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const { columns, visibleColumns, toggleColumn, handleResizeStart } = useResizableColumns(DEFAULT_COLUMNS);

  const toggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newActive = !u.active;
        toast({
          title: newActive ? 'User Activated' : 'User Deactivated',
          description: `${u.firstName} ${u.lastName} has been ${newActive ? 'activated' : 'deactivated'}.`,
        });
        return { ...u, active: newActive };
      }
      return u;
    }));
  };

  const toggleProjectManager = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const newPM = !u.isProjectManager;
        toast({
          title: newPM ? 'Marked as Project Manager' : 'Removed from Project Managers',
          description: `${u.firstName} ${u.lastName} ${newPM ? 'will now appear' : 'will no longer appear'} in the Project Manager dropdown.`,
        });
        return { ...u, isProjectManager: newPM };
      }
      return u;
    }));
  };

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return !q || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  const renderCell = (item: UserEntry & { sno: number }, columnKey: string) => {
    switch (columnKey) {
      case 'sno': return item.sno;
      case 'name': return `${item.firstName} ${item.lastName}`;
      case 'email': return item.email;
      case 'role':
        return (
          <Badge variant={item.role === 'Admin' ? 'default' : item.role === 'Manager' ? 'secondary' : 'outline'}>
            {item.role}
          </Badge>
        );
      case 'shift': return item.shift;
      case 'isProjectManager':
        return (
          <Switch
            checked={item.isProjectManager}
            onCheckedChange={() => toggleProjectManager(item.id)}
          />
        );
      case 'modules': return `${item.modulesCount} modules`;
      case 'createdOn': return item.createdOn;
      case 'status':
        return (
          <Switch
            checked={item.active}
            onCheckedChange={() => toggleUserActive(item.id)}
          />
        );
      default: return '';
    }
  };

  const tableData = filtered.map((u, idx) => ({ ...u, sno: idx + 1 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-light text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold text-foreground">Manage Users</h1>
          <p className="text-sm text-muted-foreground mt-1">View all users and toggle their access</p>
        </div>
        <ManageColumnsButton columns={columns} toggleColumn={toggleColumn} />
      </div>

      <HolidayBanner />

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <ResizableDataTable
            visibleColumns={visibleColumns}
            handleResizeStart={handleResizeStart}
            data={tableData}
            renderCell={renderCell}
            rowKey={(item) => item.id}
            emptyMessage="No users found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;
