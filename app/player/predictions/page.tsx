import { createClient } from '@/lib/supabase/server';
import { MatchPredictionCard } from '@/components/match/MatchPredictionCard';
import { Trophy, Target } from 'lucide-react';

export default async function PredictionsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .order('match_date', { ascending: true });

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', user!.id);

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const predMap = new Map();
  (predictions || []).forEach((p) => predMap.set(p.match_id, p));

  const upcoming = (matches || []).filter((m) => m.status !== 'finished');
  const finished = (matches || []).filter((m) => m.status === 'finished');

  return (
    <div className="space-y-6">
      {/* Stats card */}
      <div className="card-jt">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] tracking-widest text-gold uppercase mb-1">Tu progreso</div>
            <h1 className="text-display text-3xl">Hola, {profile?.full_name?.split(' ')[0]}</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-carbon/50 border border-gold/10 rounded-lg px-4 py-2">
              <div className="text-display text-3xl text-gold-gradient leading-none">{profile?.total_points ?? 0}</div>
              <div className="text-[9px] tracking-widest text-cream/50 uppercase mt-1">Puntos</div>
            </div>
            <div className="bg-carbon/50 border border-gold/10 rounded-lg px-4 py-2">
              <div className="text-display text-3xl text-cream leading-none">{profile?.exact_predictions ?? 0}</div>
              <div className="text-[9px] tracking-widest text-cream/50 uppercase mt-1">Exactos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-gold" />
            <h2 className="text-display text-2xl">Próximos partidos</h2>
          </div>
          <div className="space-y-3">
            {upcoming.map((match) => (
              <MatchPredictionCard
                key={match.id}
                match={match as any}
                initialPrediction={predMap.get(match.id) ?? null}
                userId={user!.id}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="card-jt text-center py-12">
          <Trophy className="w-12 h-12 text-gold/30 mx-auto mb-3" />
          <p className="text-cream/60">No hay partidos próximos. Vuelve pronto.</p>
        </div>
      )}

      {/* Finished */}
      {finished.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3 mt-8">
            <Trophy className="w-4 h-4 text-cream/40" />
            <h2 className="text-display text-2xl text-cream/70">Resultados</h2>
          </div>
          <div className="space-y-3 opacity-90">
            {finished.map((match) => (
              <MatchPredictionCard
                key={match.id}
                match={match as any}
                initialPrediction={predMap.get(match.id) ?? null}
                userId={user!.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
