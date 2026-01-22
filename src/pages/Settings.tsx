import { Monitor, PanelLeft, Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useLayout } from '@/contexts/LayoutContext';

const Settings = () => {
  const { layout, setLayout } = useLayout();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm font-light text-muted-foreground">
          Customize your CRM experience
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Monitor className="h-5 w-5 text-primary" />
              Layout Preference
            </CardTitle>
            <CardDescription className="font-light">
              Choose between horizontal or vertical navigation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={layout}
              onValueChange={(value) => setLayout(value as 'horizontal' | 'vertical')}
              className="grid gap-4 sm:grid-cols-2"
            >
              <div>
                <RadioGroupItem
                  value="vertical"
                  id="vertical"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="vertical"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <PanelLeft className="mb-3 h-8 w-8" />
                  <span className="font-medium">Vertical Sidebar</span>
                  <span className="text-xs font-light text-muted-foreground">
                    Side navigation panel
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="horizontal"
                  id="horizontal"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="horizontal"
                  className="flex cursor-pointer flex-col items-center justify-between rounded-md border-2 border-border bg-card p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="mb-3 flex h-8 w-8 flex-col gap-1">
                    <div className="h-2 w-full rounded bg-foreground/30" />
                    <div className="flex-1 rounded bg-foreground/10" />
                  </div>
                  <span className="font-medium">Horizontal Navbar</span>
                  <span className="text-xs font-light text-muted-foreground">
                    Top navigation bar
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Sun className="h-5 w-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription className="font-light">
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Dark Mode</p>
                  <p className="text-sm font-light text-muted-foreground">
                    Switch to dark theme
                  </p>
                </div>
              </div>
              <Switch disabled />
            </div>
            <p className="text-xs font-light text-muted-foreground">
              * Dark mode coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
