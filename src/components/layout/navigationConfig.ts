import {
  LayoutDashboard,
  Calendar,
  User,
  FolderKanban,
  Database,
  Mail,
  Megaphone,
  Users,
  Target,
  Monitor,
  BarChart3,
  RefreshCcw,
  UserPlus,
  Settings,
  Shield,
  Globe,
  Key,
  Lock,
  Search,
  Bot,
  Link,
  UserMinus,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'My Calendar', href: '/my-calendar', icon: Calendar },
  { title: 'Profile', href: '/profile', icon: User },
];

export const moduleGroups: NavGroup[] = [
  {
    title: 'Project Initiator',
    icon: FolderKanban,
    items: [
      { title: 'Create Campaign', href: '/project-initiator/create-campaign', icon: FolderKanban },
      { title: 'All Projects', href: '/project-initiator/all-projects', icon: FolderKanban },
    ],
  },
  {
    title: 'DB Import',
    icon: Database,
    items: [
      { title: 'All Campaigns', href: '/db-import/all-campaigns', icon: Database },
    ],
  },
  {
    title: 'Email Data',
    icon: Mail,
    items: [
      { title: 'All Content', href: '/email-data/all-content', icon: Mail },
    ],
  },
  {
    title: 'Email Sending',
    icon: Megaphone,
    items: [
      { title: 'ABM Campaign', href: '/campaign/abm-campaign', icon: Megaphone },
      { title: 'Webinar', href: '/campaign/webinar', icon: Megaphone },
      { title: 'Click Campaign', href: '/campaign/click-campaign', icon: Megaphone },
      { title: 'MQL Campaign', href: '/campaign/mql-campaign', icon: Megaphone },
      { title: 'Lead Generation', href: '/campaign/lead-generation', icon: Target },
      { title: 'Funnel Set', href: '/campaign/funnel-set', icon: Target },
    ],
  },
  {
    title: 'Lead Discovery',
    icon: Users,
    items: [
      { title: 'Lead Discovery', href: '/lead-discovery', icon: Users },
    ],
  },
  {
    title: 'Console View',
    icon: Monitor,
    items: [
      { title: 'All Console', href: '/console-view/all-console', icon: Monitor },
    ],
  },
  {
    title: 'Metrics',
    icon: BarChart3,
    items: [
      { title: 'Analytics', href: '/metrics/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Reconnect',
    icon: RefreshCcw,
    items: [
      { title: 'Upload Campaign', href: '/reconnect/upload-campaign', icon: RefreshCcw },
      { title: 'All Campaigns', href: '/reconnect/all-campaigns', icon: RefreshCcw },
    ],
  },
];

export const adminGroups: NavGroup[] = [
  {
    title: 'Administration',
    icon: UserPlus,
    items: [
      { title: 'Add User', href: '/administration/add-user', icon: UserPlus },
      { title: 'Manage Users', href: '/administration/manage-users', icon: Users },
      { title: 'Access Restriction', href: '/administration/access-restriction', icon: Lock },
      { title: 'Allowed Domains', href: '/administration/allowed-domains', icon: Globe },
      { title: 'Generate ET', href: '/administration/generate-et', icon: Key },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { title: 'IP Lists', href: '/security/ip-lists', icon: Shield },
    ],
  },
  {
    title: 'Email Config',
    icon: Settings,
    items: [
      { title: 'Upload Email Settings', href: '/email-config/upload-settings', icon: Settings },
    ],
  },
  {
    title: 'GDPR Compliance',
    icon: Search,
    items: [
      { title: 'Search', href: '/gdpr/search', icon: Search },
    ],
  },
  {
    title: 'Ask AI',
    icon: Bot,
    items: [
      { title: 'Search Email', href: '/ask-ai/search-email', icon: Search },
      { title: 'Search Assets', href: '/ask-ai/search-assets', icon: Link },
      { title: 'Unsubscribe Lists', href: '/ask-ai/unsubscribe-lists', icon: UserMinus },
    ],
  },
];
