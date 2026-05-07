'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatMatchDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Calendar, Plus, Trophy, Save, Loader2 } from 'lucide-react';

type Team = { id: number; code: string; name: string; flag_emoji: string | null };
type Match = {
  id: number;
  match_number: number;
  home_team: Team;
  away_team: Team;
  match_date: string;
  stage: string;
  group_letter: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string;
  predictions_close_at: string;
};

export default function AdminMatchesPage() {
  const supabase = createClient();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [newMatch, setNewMatch] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    stage: 'group',
    group_letter: 'A',
  });

  const loadData = async () => {
    setLoading(true);
    const [matchesRes, teamsRes] = await Promise.all([
      supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)')
        .order('match_date', { ascending: true }),
      supabase.from('teams').select('*').order('name'),
    ]);
    setMatches((matchesRes.data || []) as any);
    setTeams(teamsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!newMatch.home_team_id || !newMatch.away_team_id || !newMatch.match_date) {
      toast.error('Completa todos los campos');
      return;
    }
    if (newMatch.home_team_id === newMatch.away_team_id) {
      toast.error('Los equipos deben ser distintos');
      return;
    }

    setCreating(true);
    const matchDate = new Date(newMatch.match_date);
    const closeAt = new Date(matchDate.getTime()); // Cierra al inicio del partido

    const nextNumber = (matches.length > 0 ? Math.max(...matches.map((m) => m.match_number)) : 0) + 1;

    const { error } = await supabase.from('matches').insert({
      match_number: nextNumber,
      home_team_id: parseInt(newMatch.home_team_id),
      away_team_id: parseInt(newMatch.away_team_id),
      match_date: matchDate.toISOString(),
      predictions_close_at: closeAt.toISOString(),
      stage: newMatch.stage,
      group_letter: newMatch.stage === 'group' ? newMatch.group_letter : null,
    });

    if (error) {
      toast.error(error.message);
      setCreating(false);
      return;
    }

    toast.success('Partido creado');
    setShowCreate(false);
    setNewMatch({ home_team_id: '', away_team_id: '', match_date: '', stage: 'group', group_letter: 'A' });
    setCreating(false);
    loadData();
  };

  const handleSetResult = async (matchId: number, home: number, away: number) => {
    const { error: matchError } = await supabase
      .from('matches')
      .update({ home_score: home, away_score: away, status: 'finished' })
      .eq('id', matchId);

    if (matchError) {
      toast.error('Error al actualizar partido');
      return;
    }

    // Trigger points calculation
    const { error: rpcError } = await supabase.rpc('calculate_match_points', {
      p_match_id: matchId,
    });

    if (rpcError) {
      toast.error('Resultado guardado, pero falló cálculo de puntos');
      console.error(rpcError);
    } else {
      toast.success('¡Resultado y puntos guardados!');
    }

    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display text-4xl mb-1">Partidos</h1>
          <p className="text-sm text-cream/50">Gestiona partidos y carga resultados.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-gold inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo partido
        </button>
      </div>

      {showCreate && (
        <div className="card-jt">
          <h3 className="text-display text-xl mb-4">Crear partido</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Local</label>
              <select
                value={newMatch.home_team_id}
                onChange={(e) => setNewMatch({ ...newMatch, home_team_id: e.target.value })}
                className="input-jt"
              >
                <option value="">Selecciona...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Visitante</label>
              <select
                value={newMatch.away_team_id}
                onChange={(e) => setNewMatch({ ...newMatch, away_team_id: e.target.value })}
                className="input-jt"
              >
                <option value="">Selecciona...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.flag_emoji} {t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Fecha y hora</label>
              <input
                type="datetime-local"
                value={newMatch.match_date}
                onChange={(e) => setNewMatch({ ...newMatch, match_date: e.target.value })}
                className="input-jt"
              />
            </div>
            <div>
              <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Etapa</label>
              <select
                value={newMatch.stage}
                onChange={(e) => setNewMatch({ ...newMatch, stage: e.target.value })}
                className="input-jt"
              >
                <option value="group">Fase de grupos</option>
                <option value="round_16">Octavos</option>
                <option value="quarter">Cuartos</option>
                <option value="semi">Semifinal</option>
                <option value="third_place">3er puesto</option>
                <option value="final">Final</option>
              </select>
            </div>
            {newMatch.stage === 'group' && (
              <div>
                <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Grupo</label>
                <select
                  value={newMatch.group_letter}
                  onChange={(e) => setNewMatch({ ...newMatch, group_letter: e.target.value })}
                  className="input-jt"
                >
                  {['A','B','C','D','E','F','G','H'].map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={creating} className="btn-gold inline-flex items-center gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Crear
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-ghost">Cancelar</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card-jt text-center py-12 text-cream/40">Cargando...</div>
      ) : matches.length === 0 ? (
        <div className="card-jt text-center py-12">
          <Calendar className="w-10 h-10 text-gold/40 mx-auto mb-3" />
          <p className="text-cream/60 mb-1">No hay partidos creados</p>
          <p className="text-xs text-cream/40">Crea el primero con el botón arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <AdminMatchRow key={match.id} match={match} onSaveResult={handleSetResult} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminMatchRow({ match, onSaveResult }: { match: Match; onSaveResult: (id: number, h: number, a: number) => void }) {
  const [home, setHome] = useState(match.home_score?.toString() ?? '');
  const [away, setAway] = useState(match.away_score?.toString() ?? '');
  const isFinished = match.status === 'finished';

  return (
    <div className={`card-jt ${isFinished ? 'opacity-80' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <div className="text-[10px] tracking-widest text-cream/40 uppercase md:w-32">
          #{match.match_number} · {match.stage === 'group' ? `Grupo ${match.group_letter}` : match.stage}
          <div className="text-cream/30 normal-case">{formatMatchDate(match.match_date)}</div>
        </div>

        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 text-right">
            <span className="mr-2">{match.home_team.flag_emoji}</span>
            <span className="font-semibold">{match.home_team.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={home}
              onChange={(e) => setHome(e.target.value)}
              className="w-12 h-12 text-center text-display text-2xl bg-carbon border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
            />
            <div className="text-cream/30">-</div>
            <input
              type="number"
              min="0"
              value={away}
              onChange={(e) => setAway(e.target.value)}
              className="w-12 h-12 text-center text-display text-2xl bg-carbon border border-gold/30 rounded-lg focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex-1 text-left">
            <span className="font-semibold">{match.away_team.name}</span>
            <span className="ml-2">{match.away_team.flag_emoji}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (home === '' || away === '') {
              toast.error('Ingresa el marcador');
              return;
            }
            if (confirm(`¿Confirmar resultado ${match.home_team.name} ${home} - ${away} ${match.away_team.name}?\nEsto recalculará puntos a todos los jugadores.`)) {
              onSaveResult(match.id, parseInt(home), parseInt(away));
            }
          }}
          className="btn-gold text-xs py-2 px-4 inline-flex items-center gap-1.5"
        >
          {isFinished ? <Trophy className="w-3 h-3" /> : <Save className="w-3 h-3" />}
          {isFinished ? 'Recalcular' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
