import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import Logo from './Logo';
import { mainNavItems, moduleGroups, adminGroups, type NavGroup } from './navigationConfig';
import { ScrollArea } from '@/components/ui/scroll-area';

const NavGroupItem = ({ group, collapsed }: { group: NavGroup; collapsed: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isActive = group.items.some(item => location.pathname === item.href);

  if (collapsed) {
    return (
      <div className="relative group/nav">
        <button
          className={cn(
            'flex w-full items-center justify-center rounded-md p-2 text-sm font-light transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-foreground/70 hover:bg-accent hover:text-foreground'
          )}
        >
          <group.icon className="h-5 w-5" />
        </button>
        <div className="absolute left-full top-0 ml-2 hidden w-48 rounded-md border border-border bg-card p-2 shadow-lg group-hover/nav:block z-50">
          <p className="mb-2 px-2 text-xs font-medium text-muted-foreground">{group.title}</p>
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-light transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                )
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-light transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-foreground/70 hover:bg-accent hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <group.icon className="h-4 w-4" />
          <span>{group.title}</span>
        </div>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
          {group.items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-light transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                )
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

const VerticalSidebar = () => {
  const { sidebarOpen, setSidebarOpen } = useLayout();
  const [modulesOpen, setModulesOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);
  const [mainOpen, setMainOpen] = useState(true);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Logo collapsed={!sidebarOpen} />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {/* Dashboard section - collapsible */}
        {sidebarOpen && (
          <button
            onClick={() => setMainOpen(!mainOpen)}
            className="mb-2 flex w-full items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span>Dashboard</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', !mainOpen && '-rotate-90')} />
          </button>
        )}
        {(mainOpen || !sidebarOpen) && (
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-light transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:bg-accent hover:text-foreground',
                    !sidebarOpen && 'justify-center px-2'
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {sidebarOpen && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        )}

        {/* Modules section - collapsible */}
        {sidebarOpen && (
          <button
            onClick={() => setModulesOpen(!modulesOpen)}
            className="mb-2 mt-6 flex w-full items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span>Modules</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', !modulesOpen && '-rotate-90')} />
          </button>
        )}
        {(modulesOpen || !sidebarOpen) && (
          <div className="space-y-1">
            {moduleGroups.map((group) => (
              <NavGroupItem key={group.title} group={group} collapsed={!sidebarOpen} />
            ))}
          </div>
        )}

        {/* Admin section - collapsible */}
        {sidebarOpen && (
          <button
            onClick={() => setAdminOpen(!adminOpen)}
            className="mb-2 mt-6 flex w-full items-center justify-between px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            <span>Admin</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', !adminOpen && '-rotate-90')} />
          </button>
        )}
        {(adminOpen || !sidebarOpen) && (
          <div className="space-y-1">
            {adminGroups.map((group) => (
              <NavGroupItem key={group.title} group={group} collapsed={!sidebarOpen} />
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
};

export default VerticalSidebar;
