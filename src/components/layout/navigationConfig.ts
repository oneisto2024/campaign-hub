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
  Building2,
  Tags,
  ShieldBan,
  ClipboardCheck,
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
  { title: 'Merge Tags', href: '/merge-tags', icon: Tags },
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
    title: 'Email Draft',
    icon: Mail,
    items: [
      { title: 'All Content', href: '/email-data/all-content', icon: Mail },
    ],
  },
  {
    title: 'Email Sending',
    icon: Megaphone,
    items: [
      { title: 'All Campaigns', href: '/campaign/all', icon: Megaphone },
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
];

export const adminGroups: NavGroup[] = [
  {
    title: 'Client Management',
    icon: Building2,
    items: [
      { title: 'Create Client', href: '/clients/create', icon: Building2 },
      { title: 'All Clients', href: '/clients/all', icon: Building2 },
    ],
  },
  {
    title: 'Administration',
    icon: UserPlus,
    items: [
      { title: 'Add User', href: '/administration/add-user', icon: UserPlus },
      { title: 'Manage Users', href: '/administration/manage-users', icon: Users },
      { title: 'Access Restriction', href: '/administration/access-restriction', icon: Lock },
      { title: 'Allowed Domains', href: '/administration/allowed-domains', icon: Globe },
      { title: 'Generate ET', href: '/administration/generate-et', icon: Key },
      { title: 'Unsubscribe Log', href: '/administration/unsubscribe-log', icon: UserMinus },
      { title: 'List Management', href: '/administration/list-management', icon: ShieldBan },
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
      { title: 'Email Validation API', href: '/email-config/validation-api', icon: Shield },
      { title: 'ICP Validation API', href: '/email-config/icp-validation-api', icon: ClipboardCheck },
      { title: 'Webhook & API', href: '/email-config/webhook-api', icon: Link },
    ],
  },
  {
    title: 'GDPR Compliance',
    icon: Search,
    items: [
      { title: 'Data & Consent', href: '/gdpr/compliance', icon: Search },
    ],
  },
  {
    title: 'Ops Management',
    icon: Bot,
    items: [
      { title: 'Search Email', href: '/ops/search-email', icon: Search },
      { title: 'Search Assets', href: '/ops/search-assets', icon: Link },
      { title: 'Unsubscribe Lists', href: '/ops/unsubscribe-lists', icon: UserMinus },
      { title: 'Seed List', href: '/ops/seed-list', icon: Users },
    ],
  },
];
