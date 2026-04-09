import { useState, useEffect } from 'react';
import { supabase, isConfigured } from './lib/supabase';
import { Publication, AdminAssignment, Profile, AcademicResource, UserResourceAccess } from './types';
import { ADMIN_EMAILS, SUPER_ADMIN_EMAILS } from './constants';
import PublicationForm from './components/PublicationForm';
import PublicationList from './components/PublicationList';
import Stats from './components/Stats';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import Criteria from './components/Criteria';
import ReviewArchive from './components/ReviewArchive';
import ResourcesView from './components/ResourcesView';
import ManagementView from './components/ManagementView';
import { Plus, BookOpen, Loader2, Database, AlertTriangle, ExternalLink, LayoutDashboard, Settings, Info, FileText, Users, LogOut, Key, Globe, ShieldCheck, User, ClipboardList, Clock, Menu, X as CloseIcon, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Session } from '@supabase/supabase-js';
import { RESOURCE_JOURNAL_MAPPING } from './constants';

export default function App() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<'dashboard' | 'admin' | 'archive' | 'resources' | 'management'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [assignments, setAssignments] = useState<AdminAssignment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [resources, setResources] = useState<AcademicResource[]>([]);
  const [resourceAccess, setResourceAccess] = useState<UserResourceAccess[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error.message);
        if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
          supabase.auth.signOut();
        }
      }
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setView('dashboard');
      } else if (event === 'USER_UPDATED' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPublications();
      fetchProfiles();
      fetchResources();
      fetchResourceAccess();
    }
  }, [session]);

  const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email) : false;
  const isSuperAdmin = session?.user?.email ? SUPER_ADMIN_EMAILS.includes(session.user.email) : false;
  const currentUserProfile = profiles.find(p => p.email === session?.user?.email);

  const userPublications = publications.filter(p => p.user_email === session?.user?.email);

  useEffect(() => {
    if (isAdmin) {
      fetchAssignments();
    }
  }, [isAdmin]);

  async function fetchResourceAccess() {
    try {
      const { data, error } = await supabase
        .from('user_resource_access')
        .select('*');
      if (error) {
        if (error.message.includes('relation "user_resource_access" does not exist')) {
          console.warn('user_resource_access table not yet created.');
          return;
        }
        throw error;
      }
      setResourceAccess(data || []);
    } catch (error) {
      console.error('Error fetching resource access:', error);
    }
  }

  async function fetchResources() {
    try {
      const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        if (error.message.includes('relation "academic_resources" does not exist')) {
          console.warn('academic_resources table not yet created.');
          return;
        }
        throw error;
      }
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }

  async function fetchProfiles() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "profiles" does not exist')) {
          console.warn('Profiles table not yet created. Please run the SQL script.');
          return;
        }
        throw error;
      }
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  }

  async function fetchAssignments() {
    try {
      const { data, error } = await supabase
        .from('admin_assignments')
        .select('*');
      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  }

  async function fetchPublications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPublications(data || []);
    } catch (error) {
      console.error('Error fetching publications:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected', comment?: string) => {
    try {
      const { error } = await supabase
        .from('publications')
        .update({ 
          status, 
          review_comment: comment,
          reviewed_by_name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0],
          reviewed_by_role: session?.user?.user_metadata?.role || 'ligante'
        })
        .eq('id', id);

      if (error) throw error;
      fetchPublications();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erro ao atualizar status.');
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white rounded-[2.5rem] academic-shadow border border-slate-100 overflow-hidden"
        >
          <div className="bg-brand-900 p-10 text-white text-center">
            <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
              <Settings className="w-10 h-10 text-brand-200 animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-3">Configuração Pendente</h1>
            <p className="text-brand-200 text-sm leading-relaxed">
              Para ativar o sistema de gestão da LAPSI, conecte sua instância do Supabase.
            </p>
          </div>
          
          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Passo a Passo</h3>
              <div className="space-y-3">
                {[
                  'Acesse o menu "Settings" no AI Studio',
                  'Adicione VITE_SUPABASE_URL',
                  'Adicione VITE_SUPABASE_ANON_KEY'
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                    <span className="text-slate-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-700 transition-all text-center shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                Dashboard Supabase <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                O sistema recarregará automaticamente após salvar
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[60] academic-shadow">
        <div className="flex items-center gap-3">
          <img 
            src="https://yafmivbcakhcxyimmkvs.supabase.co/storage/v1/object/public/logo/logo.png" 
            alt="LAPSI Logo" 
            className="w-8 h-8 object-contain"
            referrerPolicy="no-referrer"
          />
          <h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight">LAPSI</h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
        >
          {isSidebarOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-white border-r border-slate-100 flex flex-col academic-shadow transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 hidden lg:flex flex-col items-center text-center border-b border-slate-50">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden bg-white shadow-md border border-slate-100 mb-4 group transition-transform hover:scale-105">
            <img 
              src="https://yafmivbcakhcxyimmkvs.supabase.co/storage/v1/object/public/logo/logo.png" 
              alt="LAPSI Logo" 
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 leading-none tracking-tight">LAPSI</h1>
            <p className="text-[10px] text-brand-600 font-bold uppercase tracking-[0.2em] mt-2 leading-relaxed">
              Liga Acadêmica de <br /> Psicologia e Saúde Mental
            </p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Menu Principal</p>
            <button 
              onClick={() => {
                setView('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border ${
                view === 'dashboard' 
                  ? 'bg-brand-50 text-brand-700 border-brand-100' 
                  : 'text-slate-400 border-transparent hover:text-brand-600 hover:bg-brand-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            
            {isAdmin && (
              <button 
                onClick={() => {
                  setView('admin');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border ${
                  view === 'admin' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'text-slate-400 border-transparent hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                Painel Admin
              </button>
            )}

            {isSuperAdmin && (
              <button 
                onClick={() => {
                  setView('management');
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border ${
                  view === 'management' 
                    ? 'bg-violet-50 text-violet-700 border-violet-100' 
                    : 'text-slate-400 border-transparent hover:text-violet-600 hover:bg-violet-50'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Gestão Acadêmica
              </button>
            )}

            <button 
              onClick={() => {
                setView('archive');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border ${
                view === 'archive' 
                  ? 'bg-blue-50 text-blue-700 border-blue-100' 
                  : 'text-slate-400 border-transparent hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Arquivo de Revisão
            </button>

            <button 
              onClick={() => {
                setView('resources');
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border ${
                view === 'resources' 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                  : 'text-slate-400 border-transparent hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              Fontes de Pesquisa
            </button>
          </div>

          <div className="pt-8 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Ações</p>
            <button
              onClick={() => {
                setView('dashboard');
                setShowForm(true);
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 bg-brand-900 hover:bg-brand-950 text-white px-4 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-brand-900/10 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>
            <a
              href="https://docs.google.com/document/d/1aAsQ3fCntQkNm-jN378-7iWdJEwJz8iu/edit?usp=drive_link&ouid=104850456356424907329&rtpof=true&sd=true"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all border border-indigo-100 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Trabalho a ser desenvolvido</span>
            </a>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 font-bold text-[10px]">
              {session.user?.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-900 truncate">
                {currentUserProfile?.full_name || session.user?.user_metadata?.full_name || session.user?.email?.split('@')[0]}
              </p>
              <p className="text-[9px] text-slate-400 font-medium truncate">
                {currentUserProfile?.role === 'professor' ? 'Professor' : 'Ligante'}
              </p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors group">
              <LogOut className="w-4 h-4 text-slate-300 group-hover:text-rose-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[65] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <main className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 space-y-8 md:space-y-12">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-slate-900">
                {view === 'admin' ? 'Painel Administrativo' : 
                 view === 'archive' ? 'Arquivo de Revisão' : 
                 view === 'resources' ? 'Fontes de Pesquisa' : 
                 view === 'management' ? 'Gestão Acadêmica' :
                 `Bem-vindo, ${currentUserProfile?.role === 'professor' ? 'Professor' : 'Ligante'} ${currentUserProfile?.full_name || session?.user?.email?.split('@')[0]}`}
              </h2>
              <p className="text-slate-500 font-medium">
                {view === 'admin' 
                  ? 'Visão geral de todas as ações e registros do sistema.' 
                  : view === 'archive'
                  ? 'Consulte os trabalhos aprovados e rejeitados pela banca.'
                  : view === 'resources'
                  ? 'Acesse repositórios e revistas acadêmicas para suas pesquisas.'
                  : view === 'management'
                  ? 'Controle de supervisão acadêmica e acessos a repositórios.'
                  : 'Gerencie e organize as evidências científicas da LAPSI.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 academic-shadow">
              <Info className="w-4 h-4 text-brand-500" />
              <span>{view === 'admin' ? 'Controle Geral' : view === 'archive' ? 'Consulta Pública' : view === 'resources' ? 'Repositórios' : view === 'management' ? 'Gestão Acadêmica' : 'Visão Geral do Projeto'}</span>
            </div>
          </div>

          {view === 'admin' ? (
            <AdminDashboard 
              publications={publications} 
              onUpdateStatus={handleUpdateStatus} 
              isSuperAdmin={isSuperAdmin}
              assignments={assignments}
              onUpdateAssignments={fetchAssignments}
              currentAdminEmail={session?.user?.email || ''}
              currentAdminName={currentUserProfile?.full_name || session?.user?.user_metadata?.full_name || ''}
              profiles={profiles}
              resources={resources}
              resourceAccess={resourceAccess}
            />
          ) : view === 'archive' ? (
            <ReviewArchive publications={publications} />
          ) : view === 'resources' ? (
            <ResourcesView 
              resources={resources} 
              isSuperAdmin={isSuperAdmin} 
              isAdmin={isAdmin}
              onUpdate={fetchResources}
              assignments={assignments}
              currentAdminEmail={session?.user?.email || ''}
              currentAdminName={currentUserProfile?.full_name || session?.user?.user_metadata?.full_name || ''}
              resourceAccess={resourceAccess}
              onUpdateAccess={fetchResourceAccess}
              profiles={profiles}
            />
          ) : view === 'management' ? (
            <ManagementView 
              assignments={assignments}
              profiles={profiles}
              resources={resources}
              resourceAccess={resourceAccess}
              onUpdateAssignments={fetchAssignments}
              onUpdateAccess={fetchResourceAccess}
              currentAdminEmail={session?.user?.email || ''}
            />
          ) : (
            <div className="space-y-12">
              {/* Personal Stats Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-serif font-bold text-slate-900">Seu Progresso Acadêmico</h3>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3" />
                    Atualizado em tempo real
                  </div>
                </div>
                <Stats publications={userPublications} />
              </div>

              {/* Orientation Banner (for anyone assigned to an admin) */}
              {assignments.some(a => a.assigned_user_email === session?.user?.email || a.assigned_user_name === session?.user?.email) && (
                <div className="bg-gradient-to-r from-brand-900 to-brand-800 rounded-[2.5rem] p-8 text-white academic-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                  <div className="relative z-10 flex items-start gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                      <ShieldCheck className="w-6 h-6 text-brand-200" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">Seu Docente Responsável</h3>
                      <div className="flex flex-wrap gap-3">
                        {assignments.filter(a => a.assigned_user_email === session?.user?.email || a.assigned_user_name === session?.user?.email).map(assignment => {
                          const adminProfile = profiles.find(p => p.email === (assignment.admin_email || assignment.admin_name));
                          return (
                            <div key={assignment.id} className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                              <User className="w-4 h-4 text-brand-200" />
                              <span className="font-medium">{adminProfile?.full_name || assignment.admin_name || assignment.admin_email}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions Banner for anyone under orientation */}
              {assignments.some(a => a.assigned_user_email === session?.user?.email || a.assigned_user_name === session?.user?.email) && (
                <div className="bg-gradient-to-r from-indigo-500 to-brand-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/20">
                        Importante
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold">Trabalho a ser desenvolvido</h3>
                    <p className="text-indigo-100 max-w-xl text-sm leading-relaxed">
                      Acesse o documento oficial com todas as diretrizes, regras e o modelo que deve ser seguido para o desenvolvimento das pesquisas e publicações da LAPSI.
                    </p>
                  </div>
                  <a 
                    href="https://docs.google.com/document/d/1aAsQ3fCntQkNm-jN378-7iWdJEwJz8iu/edit?usp=drive_link&ouid=104850456356424907329&rtpof=true&sd=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-6 py-4 bg-white text-indigo-600 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-lg"
                  >
                    <FileText className="w-4 h-4" />
                    Trabalho a ser desenvolvido
                  </a>
                </div>
              )}

              {/* Academic Resources for anyone with access */}
              {resources.filter(res => resourceAccess.some(acc => acc.resource_id === res.id && ((acc.user_email && acc.user_email === session?.user?.email) || (acc.user_name && acc.user_name === (currentUserProfile?.full_name || session?.user?.user_metadata?.full_name))))).length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-slate-900">Fontes de Pesquisa</h3>
                    <Globe className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources
                      .filter(res => resourceAccess.some(acc => acc.resource_id === res.id && ((acc.user_email && acc.user_email === session?.user?.email) || (acc.user_name && acc.user_name === (currentUserProfile?.full_name || session?.user?.user_metadata?.full_name)))))
                      .map((resource) => (
                        <div key={resource.id} className="bg-white rounded-[2rem] academic-shadow border border-slate-100 p-6 flex flex-col group hover:border-indigo-200 transition-all">
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
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <div className="flex-1 space-y-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{resource.category}</span>
                            <h4 className="text-sm font-bold text-slate-900">{resource.title}</h4>
                          </div>

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
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Main Content Area */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-slate-900">Seus Registros de Publicação</h3>
                  </div>
                  
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-6 bg-white rounded-[2.5rem] border border-slate-100 academic-shadow">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
                        <div className="absolute inset-0 blur-xl bg-brand-400/20 animate-pulse" />
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Sincronizando Dados...</p>
                    </div>
                  ) : (
                    <PublicationList 
                      publications={userPublications} 
                      onDelete={fetchPublications}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  )}
                </div>
              </div>

              {/* Criteria Section */}
              <Criteria />
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 pb-20 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
            LAPSI &copy; 2026 &bull; Liga Acadêmica de Psicologia e Saúde Mental
          </p>
        </footer>
      </div>

      {/* Modal for New Publication */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto academic-shadow"
            >
              <PublicationForm 
                onSuccess={() => {
                  setShowForm(false);
                  fetchPublications();
                }}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
