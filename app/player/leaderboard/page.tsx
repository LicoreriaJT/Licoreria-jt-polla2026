import { createClient } from '@/lib/supabase/server';
import { Logo } from '@/components/layout/Logo';
import { Trophy, Medal, Award, ChevronUp } from 'lucide-react';

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ranking } = await supabase
    .from('profiles')
    .select('id, full_name, total_points, exact_predictions')
    .eq('is_validated', true)
    .order('total_points', { ascending: false })
    .order('exact_predictions', { ascending: false })
    .limit(50);

  const userPosition = ranking?.findIndex((p) => p.id === user!.id) ?? -1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-jt text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gold-radial opacity-30" />
        <div className="relative">
          <Trophy className="w-10 h-10 text-gold mx-auto mb-3" />
          <div className="text-[10px] tracking-widest text-gold uppercase mb-1">Polla Mundialera</div>
          <h1 className="text-display text-4xl mb-2">RANKING GENERAL</h1>
          <p className="text-sm text-cream/60">El que más sabe de fútbol gana las bandejas</p>
        </div>
      </div>

      {/* Top 3 podium */}
      {ranking && ranking.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* 2nd */}
          <div className="card-jt text-center !p-4 border-white/20">
            <Medal className="w-6 h-6 text-gray-400 mx-auto mb-2" />
            <div className="text-[9px] tracking-widest text-cream/40 uppercase mb-1">2°</div>
            <div className="text-sm font-semibold truncate mb-1">{ranking[1].full_name}</div>
            <div className="text-display text-3xl text-cream">{ranking[1].total_points}</div>
            <div className="text-[9px] text-cream/40 uppercase tracking-widest">PTS</div>
          </div>
          {/* 1st */}
          <div className="card-jt text-center !p-5 !border-gold !bg-gradient-to-b !from-gold/20 !to-ink-soft -mt-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-ink text-[10px] font-bold px-3 py-1 rounded-full tracking-widest">CAMPEÓN</div>
            <Trophy className="w-8 h-8 text-gold mx-auto mb-2" />
            <div className="text-[9px] tracking-widest text-gold uppercase mb-1">1°</div>
            <div className="text-sm font-semibold truncate mb-1">{ranking[0].full_name}</div>
            <div className="text-display text-4xl text-gold-gradient">{ranking[0].total_points}</div>
            <div className="text-[9px] text-gold/60 uppercase tracking-widest">PTS</div>
          </div>
          {/* 3rd */}
          <div className="card-jt text-center !p-4 border-orange-900/40">
            <Award className="w-6 h-6 text-orange-700 mx-auto mb-2" />
            <div className="text-[9px] tracking-widest text-cream/40 uppercase mb-1">3°</div>
            <div className="text-sm font-semibold truncate mb-1">{ranking[2].full_name}</div>
            <div className="text-display text-3xl text-cream">{ranking[2].total_points}</div>
            <div className="text-[9px] text-cream/40 uppercase tracking-widest">PTS</div>
          </div>
        </div>
      )}

      {/* Full ranking */}
      <div className="card-jt !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-gold/10 flex items-center justify-between">
          <h2 className="text-display text-xl">Tabla completa</h2>
          {userPosition >= 0 && (
            <div className="text-xs text-gold flex items-center gap-1">
              <ChevronUp className="w-3 h-3" />
              Tú: #{userPosition + 1}
            </div>
          )}
        </div>
        <div className="divide-y divide-gold/10">
          {(ranking || []).map((player, idx) => {
            const isMe = player.id === user!.id;
            return (
              <div
                key={player.id}
                className={`px-5 py-3 flex items-center gap-4 ${
                  isMe ? 'bg-gold/10 border-l-2 border-gold' : ''
                }`}
              >
                <div className={`text-display text-2xl w-10 ${
                  idx === 0 ? 'text-gold-gradient' :
                  idx === 1 ? 'text-gray-300' :
                  idx === 2 ? 'text-orange-600' :
                  'text-cream/40'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{player.full_name}{isMe && ' (Tú)'}</div>
                  <div className="text-xs text-cream/40">{player.exact_predictions} marcadores exactos</div>
                </div>
                <div className="text-right">
                  <div className="text-display text-2xl text-gold">{player.total_points}</div>
                  <div className="text-[9px] text-cream/40 uppercase tracking-widest">PTS</div>
                </div>
              </div>
            );
          })}
          {(!ranking || ranking.length === 0) && (
            <div className="text-center py-12 text-cream/50">
              <Trophy className="w-12 h-12 text-gold/30 mx-auto mb-3" />
              <p>Aún no hay puntos. ¡Sé el primero en pronosticar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
