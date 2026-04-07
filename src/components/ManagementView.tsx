import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Users, Database, User, BookOpen, Globe, Plus, Trash2, X, Check, Loader2, Search } from 'lucide-react';
import { AdminAssignment, Profile, AcademicResource, UserResourceAccess } from '../types';
import { supabase } from '../lib/supabase';
import { DOCENTE_ORIENTADOR_EMAILS } from '../constants';

interface ManagementViewProps {
  assignments: AdminAssignment[];
  profiles: Profile[];
  resources: AcademicResource[];
  resourceAccess: UserResourceAccess[];
  onUpdateAssignments: () => void;
  onUpdateAccess: () => void;
  currentAdminEmail: string;
}

export default function ManagementView({ 
  assignments, 
  profiles, 
  resources, 
  resourceAccess,
  onUpdateAssignments,
  onUpdateAccess,
  currentAdminEmail
}: ManagementViewProps) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceUserSearch, setResourceUserSearch] = useState('');
  
  // Form states
  const [newAssignment, setNewAssignment] = useState({
    admin_email: '',
    assigned_user_emails: [] as string[]
  });
  
  const [newAccess, setNewAccess] = useState({
    resource_ids: [] as string[],
    user_emails: [] as string[]
  });

  const admins = Array.from(new Set(assignments.map(a => a.admin_email || a.admin_name)));
  
  const professors = profiles.filter(p => DOCENTE_ORIENTADOR_EMAILS.includes(p.email));
  const ligantes = profiles.filter(p => p.role === 'ligante');

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.admin_email || newAssignment.assigned_user_emails.length === 0) return;
    
    setLoading(true);
    try {
      const admin = profiles.find(p => p.email === newAssignment.admin_email);
      
      const records = newAssignment.assigned_user_emails.map(email => {
        const student = profiles.find(p => p.email === email);
        return {
          admin_email: newAssignment.admin_email,
          admin_name: admin?.full_name || newAssignment.admin_email,
          assigned_user_email: email,
          assigned_user_name: student?.full_name || email,
          created_by_email: currentAdminEmail
        };
      });
      
      const { error } = await supabase
        .from('admin_assignments')
        .insert(records);

      if (error) throw error;
      onUpdateAssignments();
      setShowAssignModal(false);
      setAssignSearch('');
      setNewAssignment({ admin_email: '', assigned_user_emails: [] });
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Erro ao criar atribuição.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccess.resource_ids.length === 0 || newAccess.user_emails.length === 0) return;
    
    setLoading(true);
    try {
      const records = newAccess.user_emails.flatMap(email => {
        const user = profiles.find(p => p.email === email);
        return newAccess.resource_ids.map(resourceId => ({
          resource_id: resourceId,
          user_email: email,
          user_name: user?.full_name || email,
          granted_by_email: currentAdminEmail
        }));
      });
      
      const { error } = await supabase
        .from('user_resource_access')
        .insert(records);

      if (error) throw error;
      onUpdateAccess();
      setShowResourceModal(false);
      setResourceSearch('');
      setResourceUserSearch('');
      setNewAccess({ resource_ids: [], user_emails: [] });
    } catch (error) {
      console.error('Error creating access:', error);
      alert('Erro ao criar acesso.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Remover esta vinculação de orientação?')) return;
    
    try {
      const { error } = await supabase
        .from('admin_assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      onUpdateAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const handleDeleteAccess = async (id: string) => {
    if (!confirm('Remover este acesso ao repositório?')) return;
    
    try {
      const { error } = await supabase
        .from('user_resource_access')
        .delete()
        .eq('id', id);
      if (error) throw error;
      onUpdateAccess();
    } catch (error) {
      console.error('Error deleting access:', error);
    }
  };

  const filteredAdmins = admins.filter(adminId => {
    const adminProfile = profiles.find(p => p.email === adminId || p.full_name === adminId);
    const adminName = adminProfile?.full_name || adminId;
    return adminName.toLowerCase().includes(searchTerm.toLowerCase()) || adminId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8">
      <div className="bg-brand-900 rounded-[2.5rem] p-8 text-white academic-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <ShieldCheck className="w-6 h-6 text-brand-200" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold mb-2">Gestão Acadêmica e Acessos</h3>
              <p className="text-brand-200 text-sm max-w-2xl">
                Controle total de supervisão e acessos a repositórios para ligantes e docentes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border border-white/10"
            >
              <Users className="w-4 h-4" />
              Nova Orientação
            </button>
            <button 
              onClick={() => setShowResourceModal(true)}
              className="flex items-center gap-2 bg-brand-200 text-brand-900 hover:bg-brand-300 px-5 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
            >
              <Database className="w-4 h-4" />
              Atribuir Repositório
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 academic-shadow">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por nome do docente..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center academic-shadow border border-slate-100">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhuma vinculação registrada no sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredAdmins.map((adminId, idx) => {
            const adminAssignments = assignments.filter(a => (a.admin_email || a.admin_name) === adminId);
            const adminProfile = profiles.find(p => p.email === adminId || p.full_name === adminId);
            const adminName = adminProfile?.full_name || adminAssignments[0].admin_name || adminId;
            
            return (
              <motion.div 
                key={adminId || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 overflow-hidden"
              >
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg">
                      {adminName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-900">{adminName}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Docente Responsável</p>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 bg-brand-50 rounded-full border border-brand-100">
                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest">
                      {adminAssignments.length} {adminAssignments.length === 1 ? 'Ligante' : 'Ligantes'}
                    </span>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {adminAssignments.map((assignment) => {
                    const studentEmail = assignment.assigned_user_email || assignment.assigned_user_name;
                    const studentProfile = profiles.find(p => p.email === studentEmail || p.full_name === studentEmail);
                    const studentName = studentProfile?.full_name || assignment.assigned_user_name || studentEmail;
                    
                    // Find resources for this student
                    const studentResources = resourceAccess
                      .filter(acc => acc.user_email === studentEmail || acc.user_name === studentName)
                      .map(acc => ({
                        accessId: acc.id,
                        resource: resources.find(r => r.id === acc.resource_id)
                      }))
                      .filter(item => item.resource) as { accessId: string, resource: AcademicResource }[];

                    return (
                      <div key={assignment.id} className="bg-slate-50/30 rounded-3xl border border-slate-100 p-6 space-y-4 hover:border-brand-200 transition-all group relative">
                        <button 
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remover Orientação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-100 group-hover:border-brand-200 transition-all">
                              {studentName?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{studentName}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ligante Orientado</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <Database className="w-3 h-3" />
                            Repositórios Autorizados
                          </div>
                          
                          {studentResources.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic pl-5">Nenhum repositório específico atribuído.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 pl-5">
                              {studentResources.map(item => (
                                <div key={item.accessId} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 text-[10px] font-medium text-slate-600 group/item">
                                  {item.resource.category === 'Repositório' ? <Database className="w-3 h-3 text-blue-500" /> :
                                   item.resource.category === 'Revista' ? <BookOpen className="w-3 h-3 text-emerald-500" /> :
                                   <Globe className="w-3 h-3 text-indigo-500" />}
                                  {item.resource.title}
                                  <button 
                                    onClick={() => handleDeleteAccess(item.accessId)}
                                    className="ml-1 text-slate-300 hover:text-rose-600 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showAssignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 bg-brand-900 text-white flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold">Nova Orientação</h3>
                <button onClick={() => {
                  setShowAssignModal(false);
                  setAssignSearch('');
                }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateAssignment} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Docente Responsável</label>
                  <select 
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    value={newAssignment.admin_email}
                    onChange={e => setNewAssignment({ ...newAssignment, admin_email: e.target.value })}
                  >
                    <option value="">Selecione um docente...</option>
                    {professors.map(p => (
                      <option key={p.id} value={p.email}>{p.full_name} ({p.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ligantes Orientados (Múltiplos)</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input 
                      type="text"
                      placeholder="Pesquisar ligante..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                    {ligantes
                      .filter(p => 
                        p.full_name.toLowerCase().includes(assignSearch.toLowerCase()) || 
                        p.email.toLowerCase().includes(assignSearch.toLowerCase())
                      )
                      .map(p => (
                        <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                            checked={newAssignment.assigned_user_emails.includes(p.email)}
                            onChange={e => {
                              const emails = e.target.checked 
                                ? [...newAssignment.assigned_user_emails, p.email]
                                : newAssignment.assigned_user_emails.filter(item => item !== p.email);
                              setNewAssignment({ ...newAssignment, assigned_user_emails: emails });
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700">{p.full_name}</span>
                            <span className="text-[9px] text-slate-400">{p.email} • {p.role}</span>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-brand-900 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-brand-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirmar Atribuição
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showResourceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 w-full max-w-4xl overflow-hidden"
            >
              <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold">Atribuir Repositório</h3>
                <button onClick={() => {
                  setShowResourceModal(false);
                  setResourceSearch('');
                  setResourceUserSearch('');
                }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateAccess} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">1. Selecione os Repositórios</label>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {newAccess.resource_ids.length} selecionados
                      </span>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Pesquisar repositório..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={resourceSearch}
                        onChange={(e) => setResourceSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                      {resources
                        .filter(r => 
                          r.title.toLowerCase().includes(resourceSearch.toLowerCase()) || 
                          r.category.toLowerCase().includes(resourceSearch.toLowerCase())
                        )
                        .map(r => (
                          <label key={r.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            checked={newAccess.resource_ids.includes(r.id)}
                            onChange={e => {
                              const ids = e.target.checked 
                                ? [...newAccess.resource_ids, r.id]
                                : newAccess.resource_ids.filter(item => item !== r.id);
                              setNewAccess({ ...newAccess, resource_ids: ids });
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-slate-700">{r.title}</span>
                            <span className="text-[9px] text-slate-400">{r.category}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">2. Selecione os Usuários</label>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {newAccess.user_emails.length} selecionados
                      </span>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Pesquisar usuário..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        value={resourceUserSearch}
                        onChange={(e) => setResourceUserSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
                      {profiles
                        .filter(p => 
                          p.full_name.toLowerCase().includes(resourceUserSearch.toLowerCase()) || 
                          p.email.toLowerCase().includes(resourceUserSearch.toLowerCase())
                        )
                        .map(p => (
                          <label key={p.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors">
                            <input 
                              type="checkbox"
                              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              checked={newAccess.user_emails.includes(p.email)}
                              onChange={e => {
                                const emails = e.target.checked 
                                  ? [...newAccess.user_emails, p.email]
                                  : newAccess.user_emails.filter(item => item !== p.email);
                                setNewAccess({ ...newAccess, user_emails: emails });
                              }}
                            />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-700">{p.full_name}</span>
                              <span className="text-[9px] text-slate-400">{p.email} • {p.role}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={loading || newAccess.resource_ids.length === 0 || newAccess.user_emails.length === 0}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Confirmar Acesso para {newAccess.user_emails.length} usuários em {newAccess.resource_ids.length} repositórios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

