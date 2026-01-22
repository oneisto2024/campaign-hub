import { Bell, Search, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
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

const TopBar = () => {
  return (
    <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search campaigns, users, leads..."
          className="w-full bg-background pl-10 font-light"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <NavLink
          to="/settings"
          className="rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </NavLink>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  SA
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
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
