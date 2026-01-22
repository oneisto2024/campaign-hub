import { Zap } from 'lucide-react';

interface LogoProps {
  collapsed?: boolean;
}

const Logo = ({ collapsed = false }: LogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
        <Zap className="h-5 w-5 text-primary-foreground" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-lg font-semibold leading-tight text-foreground">Campaign</span>
          <span className="text-xs font-light text-muted-foreground">CRM</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
