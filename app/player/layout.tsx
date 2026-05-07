import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/layout/Logo';
import { Trophy, Target, User, LogOut } from 'lucide-react';

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');
  if (!profile.is_validated) redirect('/login');

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-radial pointer-events-none" />

      <header className="sticky top-0 z-30 backdrop-blur-md bg-carbon/80 border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/player/predictions" className="flex items-center gap-2.5">
            <Logo size="sm" />
            <div>
              <div className="text-display text-lg leading-none text-gold">LICORERÍA JT</div>
              <div className="text-[9px] text-cream/40 tracking-widest">MUNDIALERA 2026</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/player/predictions" className="px-4 py-2 text-sm hover:text-gold transition-colors">Pronósticos</Link>
            <Link href="/player/leaderboard" className="px-4 py-2 text-sm hover:text-gold transition-colors">Ranking</Link>
            <Link href="/player/profile" className="px-4 py-2 text-sm hover:text-gold transition-colors">Mi perfil</Link>
            {profile.is_admin && (
              <Link href="/admin" className="px-4 py-2 text-sm text-gold">Admin</Link>
            )}
            <form action="/api/auth/signout" method="post">
              <button className="ml-2 p-2 text-cream/40 hover:text-gold transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </nav>
          <div className="md:hidden flex items-center gap-3">
            <div className="text-right">
              <div className="text-display text-xl text-gold leading-none">{profile.total_points}</div>
              <div className="text-[9px] text-cream/40 tracking-widest">PUNTOS</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md bg-carbon/95 border-t border-gold/10">
        <div className="flex items-center justify-around h-16">
          <Link href="/player/predictions" className="flex flex-col items-center gap-0.5 px-4 py-2 text-cream/60">
            <Target className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase">Predicciones</span>
          </Link>
          <Link href="/player/leaderboard" className="flex flex-col items-center gap-0.5 px-4 py-2 text-cream/60">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase">Ranking</span>
          </Link>
          <Link href="/player/profile" className="flex flex-col items-center gap-0.5 px-4 py-2 text-cream/60">
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-wider uppercase">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
