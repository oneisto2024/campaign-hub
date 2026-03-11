import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLayout } from '@/contexts/LayoutContext';
import { useIsMobile } from '@/hooks/use-mobile';
import VerticalSidebar from './VerticalSidebar';
import HorizontalNav from './HorizontalNav';
import TopBar from './TopBar';

const MainLayout = () => {
  const { layout, sidebarOpen } = useLayout();
  const isMobile = useIsMobile();

  if (layout === 'horizontal') {
    return (
      <div className="min-h-screen bg-background">
        <HorizontalNav />
        <main className="pt-16">
          <div className="p-4 md:p-6">
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
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-64' : 'ml-16'
        )}
      >
        <TopBar />
        <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
