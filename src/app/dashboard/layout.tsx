import Link from 'next/link';
import { ReactNode } from 'react';
import { 
  LineChart, 
  LayoutDashboard, 
  BrainCircuit, 
  Image as ImageIcon, 
  MessageSquareText, 
  History, 
  Settings,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: SidebarProps) {
  return (
    <div className="flex h-screen bg-dark-600 text-text-primary overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-border-glass flex flex-col z-20">
        <div className="p-6 border-b border-border-glass">
          <Link href="/" className="flex items-center gap-3">
            <BrainCircuit className="text-neon-blue" size={28} />
            <span className="font-bold text-xl tracking-tight">Q-Edge<span className="text-neon-blue">.ai</span></span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto content-scroll">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 mt-2">Platform</div>
          
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Live Terminal" active />
          <NavItem href="/analysis" icon={<ImageIcon size={20} />} label="Vision Analysis" />
          <NavItem href="/sentiment" icon={<MessageSquareText size={20} />} label="NLP Sentiment" />
          
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 mt-8">Simulation</div>
          
          <NavItem href="/backtesting" icon={<History size={20} />} label="Backtest Engine" />
          <NavItem href="/portfolio" icon={<LineChart size={20} />} label="Paper Trading" />
          
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 mt-8">System</div>
          
          <NavItem href="/alerts" icon={<ShieldAlert size={20} />} label="Risk Alerts" />
          <NavItem href="/settings" icon={<Settings size={20} />} label="Configuration" />
        </nav>
        
        <div className="p-4 border-t border-border-glass">
          <div className="glass p-3 rounded-lg bg-dark-400">
            <div className="flex items-center gap-2 mb-2">
              <div className="live-dot"></div>
              <span className="text-xs font-medium text-neon-green">System Online</span>
            </div>
            <div className="flex justify-between text-xs text-text-muted font-mono">
              <span>Latency</span>
              <span className="text-text-primary">24ms</span>
            </div>
            <div className="flex justify-between text-xs text-text-muted font-mono mt-1">
              <span>Models</span>
              <span className="text-text-primary">12/12</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active = false }: { href: string, icon: ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-brand-600/20 text-neon-blue border border-brand-500/30 shadow-[inset_0_0_20px_rgba(98,113,241,0.1)]' 
          : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}
