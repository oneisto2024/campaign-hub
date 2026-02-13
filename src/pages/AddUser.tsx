import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  UserPlus,
  KeyRound,
  Shield,
  FolderKanban,
  Database,
  Mail,
  Megaphone,
  Users,
  Monitor,
  BarChart3,
  RefreshCcw,
  Settings,
  Search,
  Bot,
  Eye,
  EyeOff,
} from 'lucide-react';

const ALLOWED_DOMAINS = ['company.com', 'partner.org', 'vendor.net'];

const availableModules = [
  { id: 'project-initiator', name: 'Project Initiator', icon: FolderKanban },
  { id: 'db-import', name: 'DB Import', icon: Database },
  { id: 'email-draft', name: 'Email Draft', icon: Mail },
  { id: 'email-sending', name: 'Email Sending', icon: Megaphone },
  { id: 'lead-discovery', name: 'Lead Discovery', icon: Users },
  { id: 'console-view', name: 'Console View', icon: Monitor },
  { id: 'metrics', name: 'Metrics', icon: BarChart3 },
  { id: 'reconnect', name: 'Reconnect', icon: RefreshCcw },
  { id: 'administration', name: 'Administration', icon: UserPlus },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'email-config', name: 'Email Config', icon: Settings },
  { id: 'gdpr', name: 'GDPR Compliance', icon: Search },
  { id: 'ask-ai', name: 'Ask AI', icon: Bot },
];

const AddUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    shift: '',
    role: '',
    username: '',
    password: '',
  });
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedModules.length === availableModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(availableModules.map(m => m.id));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({ title: 'Validation Error', description: 'First name, last name, and email are required.', variant: 'destructive' });
      return;
    }

    if (!formData.role) {
      toast({ title: 'Validation Error', description: 'Please select a role.', variant: 'destructive' });
      return;
    }

    if (!formData.username || !formData.password) {
      toast({ title: 'Validation Error', description: 'Username and password are required.', variant: 'destructive' });
      return;
    }

    // Check domain
    const emailDomain = formData.email.split('@')[1]?.toLowerCase();
    if (!emailDomain || !ALLOWED_DOMAINS.includes(emailDomain)) {
      toast({
        title: 'Domain Not Allowed',
        description: `The email domain "${emailDomain}" is not in the allowed domains list. Please add it in Allowed Domains first.`,
        variant: 'destructive',
      });
      return;
    }

    if (selectedModules.length === 0) {
      toast({ title: 'Validation Error', description: 'Please select at least one module.', variant: 'destructive' });
      return;
    }

    toast({
      title: 'User Created',
      description: `${formData.firstName} ${formData.lastName} has been created with ${selectedModules.length} module(s).`,
    });

    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      birthday: '',
      shift: '',
      role: '',
      username: '',
      password: '',
    });
    setSelectedModules([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-light text-muted-foreground">Administration</p>
        <h1 className="text-2xl font-semibold text-foreground">Add User</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new user account with role and module access</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Enter the user's personal details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Enter first name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Enter last name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" />
              <p className="text-xs text-muted-foreground">Must be from an allowed domain</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input id="birthday" name="birthday" type="date" value={formData.birthday} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift">Shift</Label>
              <Select value={formData.shift} onValueChange={(val) => setFormData(prev => ({ ...prev, shift: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (6AM - 2PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2PM - 10PM)</SelectItem>
                  <SelectItem value="night">Night (10PM - 6AM)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Login Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Login Credentials
            </CardTitle>
            <CardDescription>Set the user's login username and password</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="Enter username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={generatePassword} className="shrink-0">
                  Generate
                </Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="button" variant="outline" size="sm" disabled>
                <KeyRound className="h-4 w-4 mr-2" />
                Reset Password (available after creation)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Module Access */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Module Access
                </CardTitle>
                <CardDescription>
                  Select pages/modules this user can access ({selectedModules.length} of {availableModules.length} selected)
                </CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedModules.length === availableModules.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableModules.map((module) => {
                const Icon = module.icon;
                const isSelected = selectedModules.includes(module.id);

                return (
                  <div
                    key={module.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleModuleToggle(module.id)}
                  >
                    <Checkbox
                      id={module.id}
                      checked={isSelected}
                      onCheckedChange={() => handleModuleToggle(module.id)}
                    />
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium text-sm">{module.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
