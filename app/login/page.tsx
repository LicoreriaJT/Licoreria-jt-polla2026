'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/layout/Logo';
import toast from 'react-hot-toast';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ identifier: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Si el identificador no contiene @, asumimos cédula
    const email = form.identifier.includes('@')
      ? form.identifier
      : `${form.identifier}@licoreriajt.local`;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: form.password,
    });

    if (error) {
      toast.error('Credenciales incorrectas');
      setLoading(false);
      return;
    }

    // Verificar si es admin para redireccionar correctamente
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      toast.success('¡Bienvenido!');
      router.push(profile?.is_admin ? '/admin' : '/player/predictions');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-radial pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-display text-4xl mb-2">INICIAR SESIÓN</h1>
          <p className="text-sm text-cream/60">Bienvenido de regreso a la polla.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-jt space-y-4">
          <div>
            <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Cédula o email</label>
            <input
              required
              type="text"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              className="input-jt"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Contraseña</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-jt"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Entrar <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-cream/50">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-gold hover:underline">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
