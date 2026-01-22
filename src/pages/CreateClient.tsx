import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  FolderKanban, 
  Database, 
  Mail, 
  Megaphone, 
  Users, 
  Monitor, 
  BarChart3, 
  RefreshCcw,
  UserPlus,
  Shield,
  Settings,
  Search,
  Bot,
  Building2
} from 'lucide-react';

const availableModules = [
  { id: 'project-initiator', name: 'Project Initiator', icon: FolderKanban, description: 'Create and manage campaigns' },
  { id: 'db-import', name: 'DB Import', icon: Database, description: 'Import database campaigns' },
  { id: 'email-data', name: 'Email Data', icon: Mail, description: 'Manage email content' },
  { id: 'email-sending', name: 'Email Sending', icon: Megaphone, description: 'ABM, Webinar, Click, MQL campaigns' },
  { id: 'lead-discovery', name: 'Lead Discovery', icon: Users, description: 'Discover and manage leads' },
  { id: 'console-view', name: 'Console View', icon: Monitor, description: 'View all console data' },
  { id: 'metrics', name: 'Metrics', icon: BarChart3, description: 'Analytics and reporting' },
  { id: 'reconnect', name: 'Reconnect', icon: RefreshCcw, description: 'Upload and manage reconnect campaigns' },
  { id: 'administration', name: 'Administration', icon: UserPlus, description: 'User and access management' },
  { id: 'security', name: 'Security', icon: Shield, description: 'IP lists and security settings' },
  { id: 'email-config', name: 'Email Config', icon: Settings, description: 'Email settings configuration' },
  { id: 'gdpr', name: 'GDPR Compliance', icon: Search, description: 'GDPR search and compliance' },
  { id: 'ask-ai', name: 'Ask AI', icon: Bot, description: 'AI-powered search and insights' },
];

const CreateClient = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Company name and email are required.",
        variant: "destructive",
      });
      return;
    }

    if (selectedModules.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one module for the client.",
        variant: "destructive",
      });
      return;
    }

    // For now, just show success - will integrate with backend later
    toast({
      title: "Client Created",
      description: `${formData.companyName} has been created with ${selectedModules.length} module(s).`,
    });

    // Reset form
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      address: '',
    });
    setSelectedModules([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Create Client</h1>
        <p className="text-muted-foreground">Add a new client and configure their module access</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Client Details
            </CardTitle>
            <CardDescription>Enter the client's company and contact information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="Enter contact person name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter company address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Module Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Module Access</CardTitle>
                <CardDescription>
                  Select the modules this client will have access to ({selectedModules.length} selected)
                </CardDescription>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
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
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
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
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-sm">{module.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {module.description}
                      </p>
                    </div>
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
            Create Client
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateClient;
