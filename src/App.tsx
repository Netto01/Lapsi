import { useState, useEffect } from 'react';
import { supabase, isConfigured } from './lib/supabase';
import { Publication } from './types';
import { ADMIN_EMAILS } from './constants';
import PublicationForm from './components/PublicationForm';
import PublicationList from './components/PublicationList';
import Stats from './components/Stats';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import { Plus, BookOpen, Loader2, Database, AlertTriangle, ExternalLink, LayoutDashboard, Settings, Info, FileText, Users, LogOut, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Session } from '@supabase/supabase-js';

export default function App() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPublications();
    }
  }, [session]);

  const isAdmin = session?.user?.email ? ADMIN_EMAILS.includes(session.user.email) : false;

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900 flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-100 sticky top-0 h-screen flex flex-col z-50 academic-shadow">
        <div className="p-8 flex flex-col items-center text-center border-b border-slate-50">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden bg-white shadow-md border border-slate-100 mb-4 group transition-transform hover:scale-105">
            <img 
              src="https://i.ibb.co/6cf1bcfN/Whats-App-Image-2026-04-03-at-15-53-27-photoaidcom-cropped-removebg-preview.png" 
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
              onClick={() => setView('dashboard')}
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
                onClick={() => setView('admin')}
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

            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
              <FileText className="w-4 h-4" />
              Relatórios
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
              <Users className="w-4 h-4" />
              Equipe
            </a>
          </div>

          <div className="pt-8 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4 mb-4">Ações</p>
            <button
              onClick={() => {
                setView('dashboard');
                setShowForm(true);
              }}
              className="w-full flex items-center gap-3 bg-brand-900 hover:bg-brand-950 text-white px-4 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-brand-900/10 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Registro</span>
            </button>
          </div>
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-200 flex items-center justify-center text-brand-700 font-bold text-[10px]">
              {session.user?.email?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-900 truncate">
                {session.user?.user_metadata?.full_name || session.user?.email?.split('@')[0]}
              </p>
              <p className="text-[9px] text-slate-400 font-medium truncate">{isAdmin ? 'Administrador' : 'Ligante'}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors group">
              <LogOut className="w-4 h-4 text-slate-300 group-hover:text-rose-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <main className="max-w-6xl mx-auto w-full px-8 py-12 space-y-12">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-slate-900">
                {view === 'admin' ? 'Painel Administrativo' : 'Bem-vindo, Ligante'}
              </h2>
              <p className="text-slate-500 font-medium">
                {view === 'admin' 
                  ? 'Visão geral de todas as ações e registros do sistema.' 
                  : 'Gerencie e organize as evidências científicas da LAPSI.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 academic-shadow">
              <Info className="w-4 h-4 text-brand-500" />
              <span>{view === 'admin' ? 'Controle Geral' : 'Visão Geral do Projeto'}</span>
            </div>
          </div>

          {view === 'admin' ? (
            <AdminDashboard publications={publications} />
          ) : (
            <>
              {/* Stats Section */}
              <Stats publications={publications} />

              {/* Main Content Area */}
              <div className="space-y-10">
                <AnimatePresence>
                  {showForm && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <PublicationForm 
                        onSuccess={() => {
                          setShowForm(false);
                          fetchPublications();
                        }}
                        onCancel={() => setShowForm(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-slate-900">Repositório de Publicações</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-widest cursor-pointer hover:underline">
                      <Info className="w-4 h-4" />
                      <span>Guia de Inclusão</span>
                    </div>
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
                      publications={publications} 
                      onDelete={fetchPublications}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        {/* Footer / SQL Helper */}
        <footer className="max-w-7xl mx-auto px-6 pb-20">
          <div className="bg-brand-950 rounded-[2.5rem] p-12 text-slate-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-brand-500/20 transition-all duration-700" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-800 p-3 rounded-2xl">
                  <Database className="w-6 h-6 text-brand-300" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-white">Infraestrutura de Dados</h3>
                  <p className="text-brand-400 text-xs font-bold uppercase tracking-widest mt-1">Configuração do Banco de Dados</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Este sistema utiliza o Supabase como motor de banco de dados. Para garantir a integridade dos registros, certifique-se de que o esquema SQL abaixo foi executado no seu editor.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-brand-900/50 px-4 py-2 rounded-xl border border-brand-800 text-xs font-medium text-brand-200">
                      PostgreSQL 15+
                    </div>
                    <div className="bg-brand-900/50 px-4 py-2 rounded-xl border border-brand-800 text-xs font-medium text-brand-200">
                      RLS Enabled
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-black/40 backdrop-blur-sm p-6 rounded-3xl overflow-x-auto text-[11px] font-mono text-brand-300 border border-white/5 academic-shadow">
{`CREATE TABLE publications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  authors TEXT NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  year INTEGER NOT NULL,
  database TEXT NOT NULL,
  nature TEXT NOT NULL,
  inclusion_criterion TEXT NOT NULL,
  reason TEXT,
  user_name TEXT,
  user_email TEXT
);

-- Habilitar RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON publications FOR ALL USING (true);`}
                  </pre>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`CREATE TABLE publications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  authors TEXT NOT NULL,
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  year INTEGER NOT NULL,
  database TEXT NOT NULL,
  nature TEXT NOT NULL,
  inclusion_criterion TEXT NOT NULL,
  reason TEXT,
  user_name TEXT,
  user_email TEXT
);

-- Habilitar RLS
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON publications FOR ALL USING (true);`);
                      alert('SQL copiado!');
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-[10px] font-bold uppercase tracking-widest"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
              LAPSI &copy; 2026 &bull; Liga Acadêmica de Psicologia e Saúde Mental
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
