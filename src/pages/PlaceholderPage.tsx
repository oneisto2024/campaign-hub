import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

const PlaceholderPage = () => {
  const location = useLocation();
  
  // Convert path to readable title
  const getPageTitle = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || 'Page';
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getModuleName = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 1) {
      return segments[0]
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return null;
  };

  const moduleName = getModuleName();
  const pageTitle = getPageTitle();

  return (
    <div className="space-y-6">
      <div>
        {moduleName && (
          <p className="text-sm font-light text-muted-foreground">{moduleName}</p>
        )}
        <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Construction className="h-5 w-5 text-primary" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Construction className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              This page is under construction
            </h3>
            <p className="mt-2 max-w-md text-sm font-light text-muted-foreground">
              The {pageTitle} module is being developed. Check back soon for updates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
