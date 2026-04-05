import React, { useState } from 'react';
import { AdminAssignment, Publication, Profile } from '../types';
import { motion } from 'motion/react';
import { ShieldCheck, User, Plus, Trash2, Info, GraduationCap, Search, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAILS } from '../constants';

interface PermissionsManagerProps {
  assignments: AdminAssignment[];
  onUpdateAssignments: () => void;
  publications: Publication[];
  profiles: Profile[];
  currentAdminEmail: string;
}

export default function PermissionsManager({ assignments, onUpdateAssignments, publications, profiles, currentAdminEmail }: PermissionsManagerProps) {
  const [newAdminInput, setNewAdminInput] = useState('');
  const [newUserInput, setNewUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Helper to find name and role from profiles (preferred) or publications
  const getUserInfo = (email: string) => {
    const profile = profiles.find(p => p.email === email);
    if (profile) {
      return {
        name: profile.full_name,
        role: profile.role
      };
    }
    const pub = publications.find(p => p.user_email === email);
    return {
      name: pub?.user_name || 'Usuário não cadastrado',
      role: pub?.user_role || 'ligante'
    };
  };

  const filteredProfiles = profiles.filter(p => 
    p.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleAddAssignment = async () => {
    if (!newAdminInput || !newUserInput) return;
    setLoading(true);
    
    const adminIsEmail = newAdminInput.includes('@');
    const userIsEmail = newUserInput.includes('@');

    try {
      const { error } = await supabase
        .from('admin_assignments')
        .insert([{ 
          admin_email: adminIsEmail ? newAdminInput : null,
          admin_name: !adminIsEmail ? newAdminInput : null,
          assigned_user_email: userIsEmail ? newUserInput : null,
          assigned_user_name: !userIsEmail ? newUserInput : null,
          created_by_email: currentAdminEmail
        }]);
      if (error) throw error;
      onUpdateAssignments();
      setNewUserInput('');
      setUserSearch('');
    } catch (error) {
      console.error('Error adding assignment:', error);
      alert('Erro ao adicionar atribuição.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_assignments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      onUpdateAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Erro ao remover atribuição.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 p-10 space-y-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold text-slate-900">Gestão de Permissões</h3>
            <p className="text-slate-400 text-sm font-medium">Controle de atribuição de ligantes para administradores.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <Plus className="w-4 h-4" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Nova Atribuição</h4>
            </div>
            
            <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Administrador Responsável (E-mail ou Nome)</label>
                <input 
                  type="text"
                  placeholder="Ex: caio.brum@ulbra.br ou Caio César Brum"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  value={newAdminInput}
                  onChange={(e) => setNewAdminInput(e.target.value)}
                  list="admins-list"
                />
                <datalist id="admins-list">
                  {ADMIN_EMAILS.map(email => (
                    <option key={email} value={email} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ligante (E-mail ou Nome)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Buscar ou digitar nome/e-mail..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setNewUserInput(e.target.value);
                    }}
                  />
                </div>
                
                {/* User Selection List */}
                <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-slate-100 rounded-xl academic-shadow-sm custom-scrollbar">
                  {filteredProfiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setNewUserInput(profile.email);
                        setUserSearch(profile.full_name);
                      }}
                      className={`w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                        newUserInput === profile.email ? 'bg-brand-50/50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${profile.role === 'professor' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {profile.role === 'professor' ? <GraduationCap className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-900">{profile.full_name}</p>
                          <p className="text-[9px] text-slate-400">{profile.email}</p>
                        </div>
                      </div>
                      {newUserInput === profile.email && <Check className="w-4 h-4 text-brand-600" />}
                    </button>
                  ))}
                  {filteredProfiles.length === 0 && userSearch.length > 0 && (
                    <div className="p-4 text-center">
                      <p className="text-[10px] text-slate-400 italic">Usando "{userSearch}" como nome/e-mail.</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleAddAssignment}
                disabled={loading || !newAdminInput || !newUserInput}
                className="w-full py-4 bg-brand-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-brand-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Confirmar Atribuição'}
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                <strong>Nota:</strong> O administrador selecionado só poderá visualizar e revisar os registros enviados pelo e-mail do ligante atribuído.
              </p>
            </div>
          </div>

          {/* List Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-[10px] font-bold uppercase tracking-widest">Atribuições Ativas ({assignments.length})</h4>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {assignments.map((assignment, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={assignment.id} 
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-brand-200 transition-all group academic-shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      getUserInfo(assignment.assigned_user_email).role === 'professor' 
                        ? 'bg-amber-50 text-amber-600' 
                        : 'bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600'
                    }`}>
                      {getUserInfo(assignment.assigned_user_email).role === 'professor' ? <GraduationCap className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-bold text-slate-900 truncate uppercase tracking-wider">
                          Admin: {assignment.admin_email}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          getUserInfo(assignment.assigned_user_email).role === 'professor' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {getUserInfo(assignment.assigned_user_email).role}
                        </span>
                      </div>
                      <p className="text-[11px] text-brand-600 font-bold truncate">
                        {getUserInfo(assignment.assigned_user_email).name}
                      </p>
                      <p className="text-[9px] text-slate-400 truncate">
                        {assignment.assigned_user_email}
                      </p>
                      {assignment.created_by_email && (
                        <p className="text-[8px] text-brand-600/60 font-bold uppercase tracking-widest mt-1">
                          Atribuído por: {assignment.created_by_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteAssignment(assignment.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Remover Atribuição"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
              {assignments.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 font-medium italic">Nenhuma atribuição configurada no momento.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
