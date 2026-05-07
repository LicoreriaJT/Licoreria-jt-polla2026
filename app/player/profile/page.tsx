import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/layout/Logo';
import { User, Phone, Mail, CreditCard, Trophy, Target, LogOut } from 'lucide-react';

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  return (
    <div className="space-y-6">
      <div className="card-jt text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-radial opacity-30" />
        <div className="relative">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-display text-3xl mb-1">{profile?.full_name}</h1>
          {profile?.favorite_team && (
            <div className="inline-block bg-gold/10 border border-gold/20 text-gold text-xs px-3 py-1 rounded-full mt-2">
              ⚽ {profile.favorite_team}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-jt text-center">
          <Trophy className="w-6 h-6 text-gold mx-auto mb-2" />
          <div className="text-display text-4xl text-gold-gradient leading-none">{profile?.total_points ?? 0}</div>
          <div className="text-[10px] tracking-widest text-cream/50 uppercase mt-2">Puntos totales</div>
        </div>
        <div className="card-jt text-center">
          <Target className="w-6 h-6 text-gold mx-auto mb-2" />
          <div className="text-display text-4xl text-cream leading-none">{profile?.exact_predictions ?? 0}</div>
          <div className="text-[10px] tracking-widest text-cream/50 uppercase mt-2">Marcadores exactos</div>
        </div>
      </div>

      <div className="card-jt">
        <h2 className="text-display text-xl mb-4">Mis datos</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 py-2 border-b border-gold/10">
            <User className="w-4 h-4 text-gold/60" />
            <div className="flex-1">
              <div className="text-cream/40 text-xs">Nombre</div>
              <div>{profile?.full_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-gold/10">
            <CreditCard className="w-4 h-4 text-gold/60" />
            <div className="flex-1">
              <div className="text-cream/40 text-xs">Cédula</div>
              <div>{profile?.cedula}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2 border-b border-gold/10">
            <Phone className="w-4 h-4 text-gold/60" />
            <div className="flex-1">
              <div className="text-cream/40 text-xs">WhatsApp</div>
              <div>{profile?.whatsapp}</div>
            </div>
          </div>
          {profile?.email && (
            <div className="flex items-center gap-3 py-2">
              <Mail className="w-4 h-4 text-gold/60" />
              <div className="flex-1">
                <div className="text-cream/40 text-xs">Email</div>
                <div>{profile.email}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <form action="/api/auth/signout" method="post">
        <button className="btn-ghost w-full inline-flex items-center justify-center gap-2 !text-red-400 !border-red-400/30 hover:!bg-red-400/10">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
