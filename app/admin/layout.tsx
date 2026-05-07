import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/layout/Logo';
import { LayoutDashboard, Calendar, KeySquare, Users, LogOut, Trophy } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/player/predictions');

  return (
    <div className="min-h-screen flex">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-radial pointer-events-none" />

      {/* Sidebar */}
      <aside className="w-60 bg-carbon-soft border-r border-gold/10 hidden md:flex flex-col">
        <div className="p-5 border-b border-gold/10">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Logo size="sm" />
            <div>
              <div className="text-display text-base leading-none text-gold">JT ADMIN</div>
              <div className="text-[9px] text-cream/40 tracking-widest">PANEL</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/admin/codes', icon: KeySquare, label: 'Códigos' },
            { href: '/admin/matches', icon: Calendar, label: 'Partidos' },
            { href: '/admin/users', icon: Users, label: 'Usuarios' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/70 hover:bg-gold/10 hover:text-gold transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gold/10">
          <Link
            href="/player/predictions"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/50 hover:text-gold transition-colors"
          >
            <Trophy className="w-4 h-4" />
            Vista jugador
          </Link>
          <form action="/api/auth/signout" method="post">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/50 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-carbon/95 border-b border-gold/10 h-14 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo size="sm" />
          <div className="text-display text-gold">JT ADMIN</div>
        </Link>
        <form action="/api/auth/signout" method="post">
          <button className="text-cream/40 p-2"><LogOut className="w-4 h-4" /></button>
        </form>
      </div>

      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
