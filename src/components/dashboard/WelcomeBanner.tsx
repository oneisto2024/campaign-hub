import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';

interface WelcomeBannerProps {
  userName?: string;
}

const WelcomeBanner = ({ userName = 'Admin' }: WelcomeBannerProps) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-secondary/80 p-8 text-secondary-foreground">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary/5" />
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold">Campaign CRM Dashboard</h2>
        <h3 className="mt-1 text-xl font-light opacity-90">Welcome Back, {userName}!</h3>
        <p className="mt-4 max-w-md text-sm font-light leading-relaxed opacity-80">
          Don't watch the clock; do what it does. Keep moving. Your work is your story, so make it
          count. With focus, effort, and persistence, you'll achieve the best results.
        </p>
        <Button
          variant="outline"
          className="mt-6 border-secondary-foreground/20 bg-secondary-foreground/10 text-secondary-foreground hover:bg-secondary-foreground/20 hover:text-secondary-foreground"
          asChild
        >
          <NavLink to="/profile">
            View Profile <ArrowRight className="ml-2 h-4 w-4" />
          </NavLink>
        </Button>
      </div>
    </div>
  );
};

export default WelcomeBanner;
