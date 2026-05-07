import Link from 'next/link';
import { Logo } from '@/components/layout/Logo';
import { Trophy, Target, Zap, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-radial pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold-radial pointer-events-none opacity-50" />

      <div className="relative max-w-5xl mx-auto px-5 pt-12 pb-20">
        {/* Header */}
        <header className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <div>
              <div className="text-display text-2xl text-gold leading-none">LICORERÍA JT</div>
              <div className="text-xs text-cream/40 tracking-widest text-special">★ POLLA MUNDIALERA ★</div>
            </div>
          </div>
          <Link href="/login" className="btn-ghost text-xs">
            Iniciar sesión
          </Link>
        </header>

        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-20 animate-slide-up">
          <div className="inline-block bg-gold-gradient text-carbon text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded border-2 border-leather-darker mb-6 text-special">
            🤠 Mundial 2026 · Wild West Edition 🤠
          </div>
          <h1 className="text-display text-6xl md:text-8xl leading-none mb-6">
            POLLA
            <br />
            <span className="text-gold-gradient">MUNDIALERA</span>
          </h1>
          <p className="text-lg text-cream/70 max-w-2xl mx-auto mb-10 leading-relaxed text-special">
            Pronostica los partidos del Mundial, suma puntos por cada acierto y compite por la recompensa:
            <span className="text-gold font-semibold"> 2 bandejas de cerveza</span> al campeón.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="btn-gold inline-flex items-center justify-center gap-2">
              Registrarme ahora
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/leaderboard" className="btn-ghost inline-flex items-center justify-center gap-2">
              Ver ranking
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <p className="text-xs tracking-widest text-gold uppercase mb-2 text-special">★ Cómo Participar ★</p>
            <h2 className="text-display text-4xl">Es simple</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: Target, title: '1. Compra $50.000', desc: 'Acumula compras del mismo día por $50.000 en Licorería JT y pide tu código al cajero.' },
              { icon: Zap, title: '2. Regístrate', desc: 'Ingresa tu código en la app y crea tu cuenta. Quedas inscrito por todo el mundial.' },
              { icon: Trophy, title: '3. Pronostica y gana', desc: 'Predice los marcadores de cada partido, suma puntos y escala en el ranking.' },
            ].map((item, i) => (
              <div key={i} className="card-jt group hover:border-gold/40 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-radial opacity-50 pointer-events-none" />
                <item.icon className="w-8 h-8 text-gold mb-4" />
                <h3 className="text-display text-2xl mb-2">{item.title}</h3>
                <p className="text-sm text-cream/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Points */}
        <section className="mb-20">
          <div className="card-jt">
            <div className="text-center mb-8">
              <p className="text-xs tracking-widest text-gold uppercase mb-2 text-special">★ Sistema de Puntuación ★</p>
              <h2 className="text-display text-4xl">Cada acierto cuenta</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="text-center p-4 border-2 border-gold/30 rounded-lg">
                <div className="text-display text-5xl text-gold-gradient mb-1">3</div>
                <div className="text-sm font-semibold mb-1">Marcador exacto</div>
                <div className="text-xs text-cream/50">Predijiste 2-1, quedó 2-1</div>
              </div>
              <div className="text-center p-4 border-2 border-gold/30 rounded-lg">
                <div className="text-display text-5xl text-gold-gradient mb-1">1</div>
                <div className="text-sm font-semibold mb-1">Ganador correcto</div>
                <div className="text-xs text-cream/50">Acertaste quién ganó</div>
              </div>
              <div className="text-center p-4 border-2 border-cream/20 rounded-lg">
                <div className="text-display text-5xl text-cream/30 mb-1">0</div>
                <div className="text-sm font-semibold mb-1">Pronóstico errado</div>
                <div className="text-xs text-cream/50">Sigue en la siguiente jornada</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center">
          <div className="inline-block">
            <Logo size="lg" className="mx-auto mb-6" />
            <h3 className="text-display text-3xl mb-3">¿Listo para jugar?</h3>
            <p className="text-cream/60 mb-6 text-special">Pide tu código en caja después de tu próxima compra.</p>
            <Link href="/register" className="btn-gold inline-flex items-center gap-2">
              Tengo mi código
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-gold/20 text-center text-xs text-cream/30 tracking-widest text-display">
          ★ LICORERÍA JT · POLLA MUNDIALERA · MUNDIAL 2026 ★
        </footer>
      </div>
    </div>
  );
}
