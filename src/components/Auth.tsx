import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, Loader2, Mail, Lock, UserPlus, User, Eye, EyeOff, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'ligante' | 'professor'>('ligante');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Cadastro realizado! Verifique seu e-mail para confirmar (se necessário) ou faça login.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro na autenticação.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, insira seu e-mail para recuperar a senha.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setMessage({ type: 'success', text: 'Instruções de recuperação enviadas para o seu e-mail.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao solicitar recuperação de senha.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] academic-shadow border border-slate-100 overflow-hidden"
      >
        <div className="bg-brand-900 p-10 text-white text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 overflow-hidden bg-white shadow-sm">
            <img 
              src="https://i.ibb.co/6cf1bcfN/Whats-App-Image-2026-04-03-at-15-53-27-photoaidcom-cropped-removebg-preview.png" 
              alt="LAPSI Logo" 
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-3xl font-serif font-bold mb-3">
            {isResettingPassword ? 'Recuperar Senha' : isSignUp ? 'Criar Conta' : 'Acesso LAPSI'}
          </h1>
          <p className="text-brand-200 text-sm leading-relaxed">
            {isResettingPassword
              ? 'Enviaremos um link para você redefinir sua senha.'
              : isSignUp 
              ? 'Junte-se à Liga Acadêmica de Psicologia e Saúde Mental.' 
              : 'Entre com suas credenciais para acessar o sistema.'}
          </p>
        </div>
        
        <div className="p-10">
          <form onSubmit={isResettingPassword ? handleResetPassword : handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isResettingPassword && isSignUp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      required={isSignUp}
                      type="text"
                      placeholder="Seu Nome"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-900"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Eu sou:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('ligante')}
                        className={`py-3 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          role === 'ligante' 
                            ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm' 
                            : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        Ligante
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('professor')}
                        className={`py-3 px-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          role === 'professor' 
                            ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-sm' 
                            : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        Professor
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input
                  required
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isResettingPassword && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Senha</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResettingPassword(true);
                          setMessage(null);
                        }}
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      required={!isResettingPassword}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-900"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {message && (
              <div className={`p-4 rounded-2xl text-sm font-medium ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-brand-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isResettingPassword ? <KeyRound className="w-4 h-4" /> : isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {isResettingPassword ? 'Enviar Link' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 text-center flex flex-col gap-3">
            {isResettingPassword ? (
              <button 
                onClick={() => {
                  setIsResettingPassword(false);
                  setMessage(null);
                }}
                className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-700"
              >
                Voltar para o Login
              </button>
            ) : (
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-xs font-bold text-brand-600 uppercase tracking-widest hover:underline"
              >
                {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
              </button>
            )}
          </div>
          
          <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Liga Acadêmica de Psicologia e Saúde Mental <br /> LAPSI &bull; 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
