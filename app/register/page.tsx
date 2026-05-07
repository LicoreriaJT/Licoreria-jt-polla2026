'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/layout/Logo';
import toast from 'react-hot-toast';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    cedula: '',
    whatsapp: '',
    email: '',
    favorite_team: '',
    validation_code: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Validar el código
      const { data: codeData, error: codeError } = await supabase
        .from('validation_codes')
        .select('*')
        .eq('code', form.validation_code.trim().toUpperCase())
        .eq('is_used', false)
        .single();

      if (codeError || !codeData) {
        toast.error('Código inválido o ya utilizado. Pídelo en caja.');
        setLoading(false);
        return;
      }

      // 2. Crear cuenta de auth (necesitamos email, usamos cedula+@licoreriajt.local si no provee)
      const authEmail = form.email || `${form.cedula}@licoreriajt.local`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: authEmail,
        password: form.password,
        options: {
          data: { full_name: form.full_name },
        },
      });

      if (authError || !authData.user) {
        toast.error(authError?.message || 'Error al crear la cuenta');
        setLoading(false);
        return;
      }

      // 3. Crear el perfil
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: form.full_name,
        cedula: form.cedula,
        whatsapp: form.whatsapp,
        email: form.email || null,
        favorite_team: form.favorite_team || null,
        validation_code: form.validation_code.trim().toUpperCase(),
        is_validated: true,
        validated_at: new Date().toISOString(),
      });

      if (profileError) {
        toast.error('Error al crear el perfil. Intenta de nuevo.');
        setLoading(false);
        return;
      }

      // 4. Marcar código como usado
      await supabase
        .from('validation_codes')
        .update({ is_used: true, used_by_user: authData.user.id, used_at: new Date().toISOString() })
        .eq('id', codeData.id);

      toast.success('¡Bienvenido a la Polla! 🏆');
      router.push('/player/predictions');
      router.refresh();
    } catch (err) {
      toast.error('Algo salió mal. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-radial pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-display text-4xl mb-2">CREAR CUENTA</h1>
          <p className="text-sm text-cream/60">Una vez inscrito, juegas todo el mundial.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-jt space-y-4">
          <div>
            <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Código de validación</label>
            <input
              required
              type="text"
              placeholder="LJT-XXXXXX"
              value={form.validation_code}
              onChange={(e) => setForm({ ...form, validation_code: e.target.value.toUpperCase() })}
              className="input-jt font-mono tracking-widest text-center text-lg"
            />
            <p className="text-xs text-cream/40 mt-1">Pídelo en caja con tus facturas de $50.000.</p>
          </div>

          <div className="border-t border-gold/10 pt-4">
            <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Nombre completo</label>
            <input
              required
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input-jt"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Cédula</label>
              <input
                required
                type="text"
                value={form.cedula}
                onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                className="input-jt"
              />
            </div>
            <div>
              <label className="text-xs tracking-widest text-gold uppercase mb-1 block">WhatsApp</label>
              <input
                required
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="input-jt"
              />
            </div>
          </div>

          <div>
            <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Email (opcional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-jt"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Equipo favorito</label>
            <input
              type="text"
              placeholder="Ej: Colombia"
              value={form.favorite_team}
              onChange={(e) => setForm({ ...form, favorite_team: e.target.value })}
              className="input-jt"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest text-gold uppercase mb-1 block">Crear contraseña</label>
            <input
              required
              type="password"
              minLength={6}
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
                Crear mi cuenta <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-cream/50">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-gold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
