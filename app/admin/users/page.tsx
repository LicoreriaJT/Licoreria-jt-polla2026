'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Users, Search, Crown, ShieldCheck } from 'lucide-react';

type Profile = {
  id: string;
  full_name: string;
  cedula: string;
  whatsapp: string;
  email: string | null;
  total_points: number;
  exact_predictions: number;
  is_admin: boolean;
  is_validated: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('total_points', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const toggleAdmin = async (id: string, current: boolean) => {
    if (!confirm(`¿${current ? 'Quitar' : 'Asignar'} permisos de admin?`)) return;
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', id);
    toast.success('Actualizado');
    loadUsers();
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.cedula.includes(search) ||
    u.whatsapp.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-4xl mb-1">Usuarios</h1>
        <p className="text-sm text-cream/50">{users.length} jugadores registrados.</p>
      </div>

      <div className="card-jt !p-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-cream/40 ml-2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-0 focus:outline-none text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="card-jt text-center py-8 text-cream/40">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="card-jt text-center py-12">
          <Users className="w-10 h-10 text-gold/40 mx-auto mb-3" />
          <p className="text-cream/60">No se encontraron usuarios.</p>
        </div>
      ) : (
        <div className="card-jt !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-carbon border-b border-gold/10">
                <tr>
                  <th className="text-left p-3 text-[10px] tracking-widest text-gold uppercase font-medium">Jugador</th>
                  <th className="text-left p-3 text-[10px] tracking-widest text-gold uppercase font-medium">Cédula</th>
                  <th className="text-left p-3 text-[10px] tracking-widest text-gold uppercase font-medium">Contacto</th>
                  <th className="text-right p-3 text-[10px] tracking-widest text-gold uppercase font-medium">Puntos</th>
                  <th className="text-center p-3 text-[10px] tracking-widest text-gold uppercase font-medium">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gold/5">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.is_admin && <Crown className="w-3.5 h-3.5 text-gold" />}
                        {u.is_validated && !u.is_admin && <ShieldCheck className="w-3.5 h-3.5 text-green-400" />}
                        <div>
                          <div className="font-semibold">{u.full_name}</div>
                          <div className="text-xs text-cream/40">
                            {new Date(u.created_at).toLocaleDateString('es-CO')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-cream/60">{u.cedula}</td>
                    <td className="p-3 text-cream/60">
                      <div>{u.whatsapp}</div>
                      {u.email && <div className="text-xs text-cream/40">{u.email}</div>}
                    </td>
                    <td className="p-3 text-right">
                      <div className="text-display text-xl text-gold">{u.total_points}</div>
                      <div className="text-[10px] text-cream/40">{u.exact_predictions} exactos</div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors ${
                          u.is_admin
                            ? 'bg-gold/20 text-gold'
                            : 'bg-carbon border border-white/10 text-cream/40 hover:border-gold/40 hover:text-gold'
                        }`}
                      >
                        {u.is_admin ? 'Admin' : 'Hacer admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
