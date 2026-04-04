import React, { useState } from 'react';
import { PublicationInsert, NaturezaPublicacao, CriterioInclusao } from '../types';
import { supabase } from '../lib/supabase';
import { Loader2, Plus, X, Book, Users, Calendar, Database, FileType, CheckCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PublicationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const NATURE_OPTIONS: NaturezaPublicacao[] = [
  'Artigo', 'TCC', 'TCR', 'TCC de especialização', 'Dissertação', 'Tese'
];

const CRITERION_OPTIONS: CriterioInclusao[] = [
  'Pela leitura do título', 'Pela leitura do resumo', 'Pela leitura do artigo completo', 'Não incluso'
];

export default function PublicationForm({ onSuccess, onCancel }: PublicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PublicationInsert>({
    authors: '',
    title: '',
    abstract: '',
    year: new Date().getFullYear(),
    database: '',
    nature: 'Artigo',
    inclusion_criterion: 'Pela leitura do título',
    reason: '',
    user_name: '',
    user_email: '',
    user_role: 'ligante',
    status: 'pending',
    link: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const submissionData = {
        ...formData,
        user_email: session?.user?.email || 'anon@lapsi.org',
        user_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuário',
        user_role: session?.user?.user_metadata?.role || 'ligante',
      };

      const { error } = await supabase
        .from('publications')
        .insert([submissionData]);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Error saving publication:', error);
      alert('Erro ao salvar publicação.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-900 placeholder:text-slate-400";
  const labelClasses = "flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl academic-shadow border border-slate-100 overflow-hidden"
    >
      <div className="bg-brand-900 p-8 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-serif font-bold">Nova Publicação</h2>
          <p className="text-brand-200 text-sm">Preencha os detalhes da obra bibliográfica</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3 mb-2">
          <Database className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-indigo-700 leading-relaxed">
            <strong>Dica:</strong> Se você ainda não tem os dados completos, consulte a aba <strong>"Fontes de Pesquisa"</strong> no menu lateral para acessar os repositórios e revistas recomendados pela Liga.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1">
            <label className={labelClasses}>
              <Book className="w-3.5 h-3.5" /> Título da Obra
            </label>
            <input
              required
              placeholder="Ex: Impacto da Pandemia na Saúde Mental..."
              className={inputClasses}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>
              <Plus className="w-3.5 h-3.5" /> Link da Publicação (URL)
            </label>
            <input
              placeholder="Ex: https://doi.org/... ou https://scholar.google.com/..."
              className={inputClasses}
              value={formData.link}
              onChange={e => setFormData({ ...formData, link: e.target.value })}
            />
          </div>
          
          <div className="space-y-1">
            <label className={labelClasses}>
              <Users className="w-3.5 h-3.5" /> Autores
            </label>
            <input
              required
              placeholder="Ex: Silva, A.; Santos, B."
              className={inputClasses}
              value={formData.authors}
              onChange={e => setFormData({ ...formData, authors: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClasses}>
            <FileType className="w-3.5 h-3.5" /> Resumo / Abstract
          </label>
          <textarea
            required
            rows={4}
            placeholder="Cole aqui o resumo da publicação..."
            className={`${inputClasses} resize-none`}
            value={formData.abstract}
            onChange={e => setFormData({ ...formData, abstract: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className={labelClasses}>
              <Calendar className="w-3.5 h-3.5" /> Ano
            </label>
            <input
              required
              type="number"
              className={inputClasses}
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>
              <Database className="w-3.5 h-3.5" /> Base de Dados
            </label>
            <input
              required
              placeholder="Ex: PubMed, Scielo"
              className={inputClasses}
              value={formData.database}
              onChange={e => setFormData({ ...formData, database: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>
              <FileType className="w-3.5 h-3.5" /> Natureza
            </label>
            <select
              className={inputClasses}
              value={formData.nature}
              onChange={e => setFormData({ ...formData, nature: e.target.value as NaturezaPublicacao })}
            >
              {NATURE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={labelClasses}>
              <CheckCircle className="w-3.5 h-3.5" /> Critério de Inclusão
            </label>
            <select
              className={inputClasses}
              value={formData.inclusion_criterion}
              onChange={e => setFormData({ ...formData, inclusion_criterion: e.target.value as CriterioInclusao })}
            >
              {CRITERION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>
              <MessageSquare className="w-3.5 h-3.5" /> Justificativa
            </label>
            <input
              placeholder="Motivo da inclusão ou exclusão..."
              className={inputClasses}
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-brand-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-700 transition-all flex items-center gap-3 shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Salvar Registro
          </button>
        </div>
      </form>
    </motion.div>
  );
}
