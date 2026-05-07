'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateValidationCode } from '@/lib/utils';
import toast from 'react-hot-toast';
import { KeySquare, Plus, Copy, Check, Trash2 } from 'lucide-react';

type Code = {
  id: number;
  code: string;
  is_used: boolean;
  notes: string | null;
  created_at: string;
  used_at: string | null;
};

export default function AdminCodesPage() {
  const supabase = createClient();
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const loadCodes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('validation_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setCodes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const newCode = generateValidationCode();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('validation_codes').insert({
      code: newCode,
      generated_by_admin: user?.id,
      notes: notes || null,
    });

    if (error) {
      toast.error('Error al generar código');
      setGenerating(false);
      return;
    }

    toast.success(`Código generado: ${newCode}`);
    setNotes('');
    setGenerating(false);
    loadCodes();
  };

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('Código copiado');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este código?')) return;
    await supabase.from('validation_codes').delete().eq('id', id);
    toast.success('Código eliminado');
    loadCodes();
  };

  const unused = codes.filter((c) => !c.is_used);
  const used = codes.filter((c) => c.is_used);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display text-4xl mb-1">Códigos de validación</h1>
        <p className="text-sm text-cream/50">Genera códigos para clientes que acumularon $50.000.</p>
      </div>

      {/* Generator */}
      <div className="card-jt">
        <div className="flex items-center gap-2 mb-3">
          <KeySquare className="w-5 h-5 text-gold" />
          <h2 className="text-display text-xl">Nuevo código</h2>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Notas (ej: nombre del cliente, factura #)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-jt flex-1"
          />
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn-gold inline-flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            {generating ? 'Generando...' : 'Generar código'}
          </button>
        </div>
      </div>

      {/* Unused */}
      <div>
        <h3 className="text-display text-xl mb-3">
          Códigos disponibles <span className="text-gold">({unused.length})</span>
        </h3>
        {loading ? (
          <div className="card-jt text-center py-8 text-cream/40">Cargando...</div>
        ) : unused.length === 0 ? (
          <div className="card-jt text-center py-8 text-cream/40">
            No hay códigos disponibles. Genera uno arriba.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unused.map((code) => (
              <div key={code.id} className="card-jt !p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="font-mono text-display text-2xl text-gold-gradient">{code.code}</div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopy(code.code, code.id)}
                      className="p-1.5 hover:bg-gold/10 rounded transition-colors"
                      title="Copiar"
                    >
                      {copiedId === code.id ? <Check className="w-4 h-4 text-gold" /> : <Copy className="w-4 h-4 text-cream/40" />}
                    </button>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-red-400/60" />
                    </button>
                  </div>
                </div>
                {code.notes && <div className="text-xs text-cream/50 mb-1">{code.notes}</div>}
                <div className="text-[10px] text-cream/30">
                  Creado: {new Date(code.created_at).toLocaleString('es-CO')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Used codes */}
      {used.length > 0 && (
        <div>
          <h3 className="text-display text-xl mb-3 text-cream/60">
            Códigos usados ({used.length})
          </h3>
          <div className="card-jt !p-0 overflow-hidden">
            <div className="divide-y divide-gold/5">
              {used.slice(0, 20).map((code) => (
                <div key={code.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-mono text-cream/60">{code.code}</div>
                    {code.notes && <div className="text-xs text-cream/40">{code.notes}</div>}
                  </div>
                  <div className="text-xs text-cream/40">
                    Usado {code.used_at && new Date(code.used_at).toLocaleString('es-CO')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
