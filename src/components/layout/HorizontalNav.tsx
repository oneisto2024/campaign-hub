import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { mainNavItems, moduleGroups, adminGroups, type NavGroup } from './navigationConfig';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';

const NavDropdown = ({ group }: { group: NavGroup }) => {
  const location = useLocation();
  const isActive = group.items.some(item => location.pathname === item.href);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-light transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-foreground/70 hover:bg-accent hover:text-foreground'
          )}
        >
          <group.icon className="h-4 w-4" />
          <span>{group.title}</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {group.items.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex w-full items-center gap-2 font-light',
                  isActive && 'text-primary'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </NavLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ModulesDropdown = () => {
  const location = useLocation();
  const isActive = moduleGroups.some(group =>
    group.items.some(item => location.pathname === item.href)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-light transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-foreground/70 hover:bg-accent hover:text-foreground'
          )}
        >
          <span>Modules</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {moduleGroups.map((group) => (
          <DropdownMenuSub key={group.title}>
            <DropdownMenuSubTrigger className="font-light">
              <group.icon className="mr-2 h-4 w-4" />
              {group.title}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {group.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex w-full items-center gap-2 font-light',
                        isActive && 'text-primary'
                      )
                    }
                  >
                    {item.title}
                  </NavLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AdminDropdown = () => {
  const location = useLocation();
  const isActive = adminGroups.some(group =>
    group.items.some(item => location.pathname === item.href)
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-light transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-foreground/70 hover:bg-accent hover:text-foreground'
          )}
        >
          <span>Admin Panel</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {adminGroups.map((group) => (
          <DropdownMenuSub key={group.title}>
            <DropdownMenuSubTrigger className="font-light">
              <group.icon className="mr-2 h-4 w-4" />
              {group.title}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {group.items.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex w-full items-center gap-2 font-light',
                        isActive && 'text-primary'
                      )
                    }
                  >
                    {item.title}
                  </NavLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const HorizontalNav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-light transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/70 hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
            <ModulesDropdown />
            <AdminDropdown />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <NavLink
            to="/settings"
            className="hidden text-sm font-light text-foreground/70 hover:text-foreground lg:block"
          >
            Settings
          </NavLink>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-foreground/70 hover:bg-accent lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 lg:hidden">
          <nav className="space-y-2">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-light',
                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground/70'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HorizontalNav;
