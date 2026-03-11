import { useState, useMemo, useRef, useEffect } from 'react';
import { Bell, Settings, Menu } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mainNavItems, moduleGroups, adminGroups } from './navigationConfig';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayout } from '@/contexts/LayoutContext';

// Build a flat searchable index from navigation config
interface SearchItem {
  title: string;
  href: string;
  category: string;
  keywords: string[];
}

const buildSearchIndex = (): SearchItem[] => {
  const items: SearchItem[] = [];
  mainNavItems.forEach(item => {
    items.push({ title: item.title, href: item.href, category: 'Page', keywords: [item.title.toLowerCase()] });
  });
  [...moduleGroups, ...adminGroups].forEach(group => {
    group.items.forEach(item => {
      items.push({
        title: item.title,
        href: item.href,
        category: group.title,
        keywords: [item.title.toLowerCase(), group.title.toLowerCase()],
      });
    });
  });
  items.push({ title: 'Analytics & Metrics', href: '/metrics/analytics', category: 'Metrics', keywords: ['stats', 'statistics', 'metrics', 'analytics', 'reports'] });
  return items;
};

const SEARCH_INDEX = buildSearchIndex();

const TopBar = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setSidebarOpen } = useLayout();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter(item =>
      item.keywords.some(k => k.includes(q)) || item.title.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  useEffect(() => { setSelectedIdx(0); }, [results]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[selectedIdx]) {
      navigate(results[selectedIdx].href);
      setQuery('');
      setShowResults(false);
    }
    else if (e.key === 'Escape') { setShowResults(false); }
  };

  const goTo = (href: string) => {
    navigate(href);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="flex h-14 md:h-16 items-center justify-between border-b border-border bg-card px-3 md:px-6 gap-2">
      {/* Hamburger for mobile */}
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-foreground flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="relative flex-1 max-w-md" ref={wrapperRef}>
        <Input
          type="search"
          placeholder={isMobile ? "Search..." : "Search modules, projects, stats..."}
          className="w-full bg-background pl-4 font-light h-9 md:h-10 text-sm"
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => query && setShowResults(true)}
          onKeyDown={handleKeyDown}
        />
        {showResults && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-card shadow-lg overflow-hidden">
            {results.map((item, idx) => (
              <button
                key={item.href}
                onClick={() => goTo(item.href)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors',
                  idx === selectedIdx ? 'bg-accent text-foreground' : 'text-foreground/80 hover:bg-accent/50'
                )}
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.category}</span>
              </button>
            ))}
          </div>
        )}
        {showResults && query.trim() && results.length === 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg">
            No results for "{query}"
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
        <button className="relative rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <NavLink
          to="/settings"
          className="rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-foreground hidden md:block"
        >
          <Settings className="h-5 w-5" />
        </NavLink>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-9 md:w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                  SA
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-foreground">Super Admin</p>
                <p className="text-xs font-light text-muted-foreground">admin@company.com</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Super Admin</p>
                <p className="text-xs text-muted-foreground">admin@company.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="cursor-pointer font-light">
                Profile
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <NavLink to="/settings" className="cursor-pointer font-light">
                Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-light text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TopBar;
