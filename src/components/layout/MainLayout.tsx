import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import VerticalSidebar from './VerticalSidebar';
import HorizontalNav from './HorizontalNav';
import TopBar from './TopBar';

const MainLayout = () => {
  const { layout, sidebarOpen } = useLayout();

  if (layout === 'horizontal') {
    return (
      <div className="min-h-screen bg-background">
        <HorizontalNav />
        <main className="pt-16">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <VerticalSidebar />
      <div
        className={cn(
          'flex flex-col transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <TopBar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
