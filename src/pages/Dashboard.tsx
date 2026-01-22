import {
  Eye,
  CheckCircle,
  Users,
  FileText,
  Mail,
  XCircle,
  MousePointer,
  Download,
  FolderKanban,
} from 'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm font-light text-muted-foreground">
            Overview of your campaign performance
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <WelcomeBanner userName="Super Admin" />
        </div>
        <div className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Total Number of Campaigns"
              value={30}
              icon={FolderKanban}
              iconColor="primary"
            />
            <StatsCard
              title="Uploaded Records"
              value="12,930"
              icon={Eye}
              iconColor="muted"
            />
            <StatsCard
              title="Total Validated Records"
              value="12,339"
              icon={CheckCircle}
              iconColor="success"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Unique PDF Links"
          value={2}
          icon={FileText}
          iconColor="primary"
        />
        <StatsCard
          title="Email Sent"
          value="12,342"
          icon={Mail}
          iconColor="primary"
        />
        <StatsCard
          title="Total Bounced"
          value="1,647"
          subtitle="13.34%"
          icon={XCircle}
          iconColor="destructive"
        />
        <StatsCard
          title="Total Opens"
          value="6,693"
          trend={{ value: '62.58%', positive: true }}
          icon={Eye}
          iconColor="success"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Clicks"
          value="4,946"
          trend={{ value: '46.25%', positive: true }}
          icon={MousePointer}
          iconColor="primary"
        />
        <StatsCard
          title="No. of Downloads"
          value={582}
          trend={{ value: '5.44%', positive: true }}
          icon={Download}
          iconColor="muted"
        />
        <StatsCard
          title="Lead Exit/OOO Found"
          value={0}
          icon={Users}
          iconColor="warning"
        />
        <StatsCard
          title="Active Users"
          value={24}
          icon={Users}
          iconColor="success"
        />
      </div>
    </div>
  );
};

export default Dashboard;
