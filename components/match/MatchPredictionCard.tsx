'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithTeams, Prediction } from '@/lib/types';
import { formatMatchDate, isMatchClosed, timeUntilClose } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Lock, Save, Check } from 'lucide-react';

export function MatchPredictionCard({
  match,
  initialPrediction,
  userId,
}: {
  match: MatchWithTeams;
  initialPrediction: Prediction | null;
  userId: string;
}) {
  const supabase = createClient();
  const closed = isMatchClosed(match.predictions_close_at);
  const finished = match.status === 'finished';

  const [home, setHome] = useState<string>(initialPrediction?.predicted_home_score?.toString() ?? '');
  const [away, setAway] = useState<string>(initialPrediction?.predicted_away_score?.toString() ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialPrediction);
  const [timeLeft, setTimeLeft] = useState(timeUntilClose(match.predictions_close_at));

  useEffect(() => {
    if (closed || finished) return;
    const interval = setInterval(() => setTimeLeft(timeUntilClose(match.predictions_close_at)), 60000);
    return () => clearInterval(interval);
  }, [match.predictions_close_at, closed, finished]);

  const handleSave = async () => {
    if (home === '' || away === '') {
      toast.error('Ingresa ambos marcadores');
      return;
    }
    setSaving(true);
    const homeNum = parseInt(home);
    const awayNum = parseInt(away);

    if (initialPrediction) {
      const { error } = await supabase
        .from('predictions')
        .update({
          predicted_home_score: homeNum,
          predicted_away_score: awayNum,
        })
        .eq('id', initialPrediction.id);
      if (error) {
        toast.error('Error al guardar');
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from('predictions').insert({
        user_id: userId,
        match_id: match.id,
        predicted_home_score: homeNum,
        predicted_away_score: awayNum,
      });
      if (error) {
        toast.error('Error al guardar');
        setSaving(false);
        return;
      }
    }

    setSaved(true);
    setSaving(false);
    toast.success('¡Pronóstico guardado!');
  };

  const points = initialPrediction?.points_earned ?? 0;

  return (
    <div className={`card-jt relative ${finished && points > 0 ? 'border-gold/50' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-widest text-cream/40 uppercase">
          {match.stage === 'group' ? `Grupo ${match.group_letter}` : match.stage} · {formatMatchDate(match.match_date)}
        </div>
        {finished ? (
          <div className="text-[10px] tracking-widest text-gold uppercase font-bold">Finalizado</div>
        ) : closed ? (
          <div className="flex items-center gap-1 text-[10px] tracking-widest text-red-400 uppercase">
            <Lock className="w-3 h-3" /> Cerrado
          </div>
        ) : (
          <div className="text-[10px] tracking-widest text-gold/80 uppercase">Cierra en {timeLeft}</div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Home team */}
        <div className="flex-1 text-right">
          <div className="text-3xl mb-1">{match.home_team.flag_emoji}</div>
          <div className="text-sm font-semibold">{match.home_team.name}</div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2">
          {finished ? (
            <>
              <div className="text-display text-4xl text-cream w-12 text-center">{match.home_score}</div>
              <div className="text-cream/30">-</div>
              <div className="text-display text-4xl text-cream w-12 text-center">{match.away_score}</div>
            </>
          ) : (
            <>
              <input
                type="number"
                min="0"
                max="20"
                disabled={closed}
                value={home}
                onChange={(e) => { setHome(e.target.value); setSaved(false); }}
                className="w-14 h-14 text-center text-display text-3xl bg-carbon border border-gold/30 rounded-lg focus:outline-none focus:border-gold disabled:opacity-50"
              />
              <div className="text-cream/30">-</div>
              <input
                type="number"
                min="0"
                max="20"
                disabled={closed}
                value={away}
                onChange={(e) => { setAway(e.target.value); setSaved(false); }}
                className="w-14 h-14 text-center text-display text-3xl bg-carbon border border-gold/30 rounded-lg focus:outline-none focus:border-gold disabled:opacity-50"
              />
            </>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 text-left">
          <div className="text-3xl mb-1">{match.away_team.flag_emoji}</div>
          <div className="text-sm font-semibold">{match.away_team.name}</div>
        </div>
      </div>

      {/* Action footer */}
      {!finished && !closed && (
        <div className="mt-4 pt-4 border-t border-gold/10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="btn-gold text-xs py-2 px-4 inline-flex items-center gap-1.5"
          >
            {saving ? '...' : saved ? <><Check className="w-3 h-3" /> Guardado</> : <><Save className="w-3 h-3" /> Guardar</>}
          </button>
        </div>
      )}

      {finished && initialPrediction && (
        <div className="mt-4 pt-4 border-t border-gold/10 flex items-center justify-between">
          <div className="text-xs text-cream/50">
            Tu pronóstico: <span className="text-cream">{initialPrediction.predicted_home_score}-{initialPrediction.predicted_away_score}</span>
          </div>
          <div className={`text-display text-2xl ${points > 0 ? 'text-gold-gradient' : 'text-cream/30'}`}>
            +{points} pts
          </div>
        </div>
      )}
    </div>
  );
}
