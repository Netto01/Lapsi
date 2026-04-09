import React, { useState } from 'react';
import { AcademicResource, UserResourceAccess, Profile, AdminAssignment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Plus, Trash2, ExternalLink, BookOpen, Database, Info, X, Check, Users, Shield, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { RESOURCE_JOURNAL_MAPPING } from '../constants';

interface ResourcesViewProps {
  resources: AcademicResource[];
  isSuperAdmin: boolean;
  isAdmin: boolean;
  onUpdate: () => void;
  assignments: AdminAssignment[];
  currentAdminEmail: string;
  currentAdminName?: string;
  resourceAccess: UserResourceAccess[];
  onUpdateAccess: () => void;
  profiles: Profile[];
}

export default function ResourcesView({ 
  resources, 
  isSuperAdmin, 
  isAdmin,
  onUpdate,
  assignments,
  currentAdminEmail,
  currentAdminName,
  resourceAccess,
  onUpdateAccess,
  profiles
}: ResourcesViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [managingResourceId, setManagingResourceId] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    journal_url: '',
    description: '',
    category: 'Repositório' as AcademicResource['category']
  });

  const professors = profiles.filter(p => p.role === 'professor');

  const getAdminForStudent = (email: string) => {
    return assignments.find(a => a.assigned_user_email === email || a.assigned_user_name === email)?.admin_email;
  };

  const myAdminEmail = getAdminForStudent(currentAdminEmail);

  const myStudents = assignments
    .filter(a => a.admin_email === currentAdminEmail || a.admin_name === currentAdminName)
    .map(a => a.assigned_user_email || a.assigned_user_name || '');

  // Filter resources: Super Admin and Admins see everything.
  const visibleResources = (isSuperAdmin || isAdmin) 
    ? resources 
    : resources.filter(res => 
        res.created_by_email === currentAdminEmail ||
        resourceAccess.some(acc => 
          acc.resource_id === res.id && (
            (acc.user_email && (acc.user_email === currentAdminEmail || myStudents.includes(acc.user_email))) ||
            (acc.user_name && (acc.user_name === currentAdminName || myStudents.includes(acc.user_name)))
          )
        )
      );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title || !newResource.url) return;

    setLoading(true);
    try {
      const { data: resData, error: resError } = await supabase
        .from('academic_resources')
        .insert([{ ...newResource, created_by_email: currentAdminEmail }])
        .select()
        .single();

      if (resError) throw resError;

      // If professors were selected, grant them access
      if (selectedStudents.length > 0 && resData) {
        const accessRecords = selectedStudents.map(identifier => {
          const isEmail = identifier.includes('@');
          return {
            resource_id: resData.id,
            user_email: isEmail ? identifier : null,
            user_name: !isEmail ? identifier : null,
            granted_by_email: currentAdminEmail
          };
        });

        const { error: accessError } = await supabase
          .from('user_resource_access')
          .insert(accessRecords);

        if (accessError) throw accessError;
        onUpdateAccess();
      }
      
      onUpdate();
      setShowAddForm(false);
      setNewResource({ title: '', url: '', journal_url: '', description: '', category: 'Repositório' });
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Erro ao adicionar recurso.');
    } finally {
      setLoading(false);
    }
  };

  const toggleProfessorSelection = (email: string) => {
    setSelectedStudents(prev => 
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este recurso?')) return;

    try {
      const { error } = await supabase
        .from('academic_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Erro ao remover recurso.');
    }
  };

  const toggleAccess = async (resourceId: string, userIdentifier: string) => {
    const isEmail = userIdentifier.includes('@');
    const existing = resourceAccess.find(a => 
      a.resource_id === resourceId && 
      ((isEmail && a.user_email === userIdentifier) || (!isEmail && a.user_name === userIdentifier))
    );
    
    try {
      if (existing) {
        const { error } = await supabase
          .from('user_resource_access')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_resource_access')
          .insert([{
            resource_id: resourceId,
            user_email: isEmail ? userIdentifier : null,
            user_name: !isEmail ? userIdentifier : null,
            granted_by_email: currentAdminEmail
          }]);
        if (error) throw error;
      }
      onUpdateAccess();
    } catch (error) {
      console.error('Error toggling access:', error);
      alert('Erro ao atualizar acesso.');
    }
  };

  const categories = ['Repositório', 'Revista', 'Outro'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900">Fontes de Pesquisa</h3>
          <p className="text-slate-500 text-sm">
            {(isAdmin || isSuperAdmin) 
              ? 'Gerencie os links e o acesso dos ligantes aos repositórios.' 
              : 'Acesse os repositórios e revistas recomendados pela sua banca.'}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-brand-900 hover:bg-brand-950 text-white px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-brand-900/10 active:scale-95"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'Cancelar' : 'Nova Fonte Global'}</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 p-8"
          >
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Título da Fonte</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: SciELO, PubMed, Periódicos CAPES..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  value={newResource.title}
                  onChange={e => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  value={newResource.category}
                  onChange={e => setNewResource({ ...newResource, category: e.target.value as any })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL (Link)</label>
                <input
                  required
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  value={newResource.url}
                  onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Link do Periódico (Opcional)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  value={newResource.journal_url}
                  onChange={e => setNewResource({ ...newResource, journal_url: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição (Opcional)</label>
                <textarea
                  placeholder="Breve descrição sobre o que encontrar nesta fonte..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                  rows={2}
                  value={newResource.description}
                  onChange={e => setNewResource({ ...newResource, description: e.target.value })}
                />
              </div>

              <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Atribuir a Professores (Opcional)
                </label>
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                    Ao atribuir uma fonte a um professor, todos os ligantes vinculados a ele terão acesso automático a este material no dashboard.
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {professors.map(prof => (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => toggleProfessorSelection(prof.email)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          selectedStudents.includes(prof.email)
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-brand-300'
                        }`}
                      >
                        {prof.full_name || prof.email}
                      </button>
                    ))}
                    {professors.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic">Nenhum professor cadastrado no sistema.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-950 transition-all shadow-lg shadow-brand-900/10 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Fonte de Pesquisa'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleResources.map((resource, idx) => (
          <motion.div
            key={resource.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[2rem] academic-shadow border border-slate-100 p-6 flex flex-col group hover:border-brand-200 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                resource.category === 'Repositório' ? 'bg-blue-50 text-blue-600' :
                resource.category === 'Revista' ? 'bg-emerald-50 text-emerald-600' :
                'bg-slate-50 text-slate-600'
              }`}>
                {resource.category === 'Repositório' ? <Database className="w-5 h-5" /> :
                 resource.category === 'Revista' ? <BookOpen className="w-5 h-5" /> :
                 <Globe className="w-5 h-5" />}
              </div>
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <button
                    onClick={() => setManagingResourceId(managingResourceId === resource.id ? null : resource.id)}
                    className={`p-2 rounded-lg transition-all ${
                      managingResourceId === resource.id 
                        ? 'bg-brand-100 text-brand-600' 
                        : 'text-slate-400 hover:text-brand-600 hover:bg-brand-50'
                    }`}
                    title="Gerenciar Acesso"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                )}
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDelete(resource.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-bold uppercase tracking-widest rounded-full border border-slate-100">
                  {resource.category}
                </span>
              </div>
              <h4 className="text-lg font-serif font-bold text-slate-900 group-hover:text-brand-900 transition-colors">
                {resource.title}
              </h4>
              {resource.created_by_email && (
                <p className="text-[8px] font-bold text-brand-600/60 uppercase tracking-widest">
                  Criado por: {resource.created_by_email}
                </p>
              )}
              {resource.description && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {resource.description}
                </p>
              )}
            </div>

            <AnimatePresence>
              {managingResourceId === resource.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-100 space-y-3 overflow-hidden"
                >
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Liberar para seus ligantes:
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {myStudents.map(identifier => {
                      const isEmail = identifier.includes('@');
                      const access = resourceAccess.find(a => 
                        a.resource_id === resource.id && 
                        ((isEmail && a.user_email === identifier) || (!isEmail && a.user_name === identifier))
                      );
                      const hasAccess = !!access;
                      return (
                        <div key={identifier} className="space-y-1">
                          <button
                            onClick={() => toggleAccess(resource.id, identifier)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                              hasAccess ? 'bg-brand-50 text-brand-700' : 'hover:bg-slate-50 text-slate-500'
                            }`}
                          >
                            <span className="text-[10px] font-medium truncate">{identifier}</span>
                            {hasAccess ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          </button>
                          {hasAccess && access.granted_by_email && (
                            <p className="text-[7px] text-brand-600/60 font-bold uppercase tracking-widest pl-2">
                              Liberado por: {access.granted_by_email}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {myStudents.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic py-2">Você não possui ligantes atribuídos.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 pt-4 border-t border-slate-50 space-y-2">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-brand-50 text-slate-600 hover:text-brand-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                <span>Acessar Fonte</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              
              {(resource.journal_url || RESOURCE_JOURNAL_MAPPING[resource.title]) && (
                <a
                  href={resource.journal_url || RESOURCE_JOURNAL_MAPPING[resource.title]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  <span>Acessar Periódico</span>
                  <LinkIcon className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        ))}

        {visibleResources.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
            <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Nenhuma fonte disponível</h3>
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">
              {(isAdmin || isSuperAdmin) 
                ? 'Cadastre novas fontes globais como Super Admin.' 
                : 'Aguarde seu administrador liberar o acesso aos repositórios.'}
            </p>
          </div>
        )}
      </div>

      <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Info className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="space-y-1">
          <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-widest">Dica Acadêmica</h5>
          <p className="text-xs text-indigo-700/80 leading-relaxed">
            {(isAdmin || isSuperAdmin)
              ? 'Como administrador, você pode selecionar quais fontes de pesquisa cada um de seus ligantes poderá visualizar. Isso ajuda a direcionar o estudo para as bases de dados mais relevantes para cada projeto.'
              : 'Utilize estas fontes para buscar artigos e evidências científicas. Ao encontrar um trabalho relevante, copie os dados para o formulário de "Novo Registro" no Dashboard.'}
          </p>
        </div>
      </div>
    </div>
  );
}
