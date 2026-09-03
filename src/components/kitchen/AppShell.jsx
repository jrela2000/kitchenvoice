import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Mic, Settings, Sun, Type } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/create', label: 'Create', icon: Mic },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export default function AppShell() {
  const { settings, update } = useSettings();
  const loc = useLocation();
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-background/85 backdrop-blur px-4 py-3 border-b border-border">
        <Link to="/" className="font-heading text-xl font-extrabold tracking-tight">
          Kitchen<span className="text-primary">Voice</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => update({ highContrast: !settings.highContrast })}
            aria-label="Toggle high contrast"
            className={`rounded-full p-2.5 min-w-[44px] min-h-[44px] ${settings.highContrast ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            <Sun size={20} />
          </button>
          <button
            onClick={() => update({ fontScale: settings.fontScale >= 26 ? 18 : settings.fontScale + 4 })}
            aria-label="Increase text size"
            className="rounded-full p-2.5 min-w-[44px] min-h-[44px] hover:bg-accent"
          >
            <Type size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-20 grid grid-cols-3 border-t border-border bg-background/90 backdrop-blur">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-1 ${active ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}