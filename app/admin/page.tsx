import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Users, KeySquare, Calendar, Trophy, ArrowRight } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: totalUsers },
    { count: validatedUsers },
    { count: totalCodes },
    { count: usedCodes },
    { count: scheduledMatches },
    { count: finishedMatches },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_validated', true),
    supabase.from('validation_codes').select('*', { count: 'exact', head: true }),
    supabase.from('validation_codes').select('*', { count: 'exact', head: true }).eq('is_used', true),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('matches').select('*', { count: 'exact', head: true }).eq('status', 'finished'),
  ]);

  const { data: topPlayers } = await supabase
    .from('profiles')
    .select('full_name, total_points, exact_predictions')
    .eq('is_validated', true)
    .order('total_points', { ascending: false })
    .limit(5);

  const stats = [
    { label: 'Jugadores activos', value: validatedUsers ?? 0, icon: Users, href: '/admin/users' },
    { label: 'Códigos generados', value: totalCodes ?? 0, sub: `${usedCodes ?? 0} usados`, icon: KeySquare, href: '/admin/codes' },
    { label: 'Partidos programados', value: scheduledMatches ?? 0, icon: Calendar, href: '/admin/matches' },
    { label: 'Partidos finalizados', value: finishedMatches ?? 0, icon: Trophy, href: '/admin/matches' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-4xl mb-1">Dashboard</h1>
        <p className="text-sm text-cream/50">Operación de la Polla Mundialera JT</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-jt hover:border-gold/40 transition-all group"
          >
            <stat.icon className="w-6 h-6 text-gold mb-3" />
            <div className="text-display text-4xl text-gold-gradient leading-none mb-1">{stat.value}</div>
            <div className="text-xs text-cream/60 mb-0.5">{stat.label}</div>
            {stat.sub && <div className="text-[10px] text-cream/40">{stat.sub}</div>}
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Link href="/admin/codes" className="card-jt hover:border-gold/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <KeySquare className="w-6 h-6 text-gold" />
            <ArrowRight className="w-4 h-4 text-cream/30 group-hover:text-gold" />
          </div>
          <h3 className="text-display text-2xl mb-1">Generar códigos</h3>
          <p className="text-sm text-cream/50">Crea códigos para los clientes que cumplen el monto.</p>
        </Link>

        <Link href="/admin/matches" className="card-jt hover:border-gold/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-6 h-6 text-gold" />
            <ArrowRight className="w-4 h-4 text-cream/30 group-hover:text-gold" />
          </div>
          <h3 className="text-display text-2xl mb-1">Gestionar partidos</h3>
          <p className="text-sm text-cream/50">Crea partidos e ingresa resultados.</p>
        </Link>
      </div>

      {/* Top 5 */}
      <div className="card-jt">
        <h2 className="text-display text-2xl mb-4">Top 5 actual</h2>
        <div className="space-y-2">
          {(topPlayers || []).map((player, idx) => (
            <div key={idx} className="flex items-center gap-4 py-2 border-b border-gold/5 last:border-0">
              <div className={`text-display text-2xl w-8 ${
                idx === 0 ? 'text-gold-gradient' :
                idx === 1 ? 'text-gray-300' :
                idx === 2 ? 'text-orange-600' :
                'text-cream/40'
              }`}>{idx + 1}</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{player.full_name}</div>
                <div className="text-xs text-cream/40">{player.exact_predictions} exactos</div>
              </div>
              <div className="text-display text-xl text-gold">{player.total_points} pts</div>
            </div>
          ))}
          {(!topPlayers || topPlayers.length === 0) && (
            <p className="text-center text-cream/40 py-6 text-sm">Aún no hay jugadores con puntos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
