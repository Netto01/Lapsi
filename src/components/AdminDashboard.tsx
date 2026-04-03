import { useState } from 'react';
import { Publication, PublicationStatus, AdminAssignment } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, CheckCircle2, XCircle, User, MessageSquare, Clock, Filter, Check, X, Search, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ADMIN_EMAILS } from '../constants';

interface AdminDashboardProps {
  publications: Publication[];
  onUpdateStatus: (id: string, status: 'approved' | 'rejected', comment?: string) => void;
  isSuperAdmin: boolean;
  assignments: AdminAssignment[];
  onUpdateAssignments: () => void;
  currentAdminEmail: string;
}

export default function AdminDashboard({ 
  publications, 
  onUpdateStatus, 
  isSuperAdmin, 
  assignments, 
  onUpdateAssignments,
  currentAdminEmail
}: AdminDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<PublicationStatus | 'all'>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [viewingPubId, setViewingPubId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);

  const viewingPub = publications.find(p => p.id === viewingPubId);

  const handleReviewSubmit = () => {
    if (reviewingId && reviewAction) {
      onUpdateStatus(reviewingId, reviewAction, reviewComment);
      setReviewingId(null);
      setReviewComment('');
      setReviewAction(null);
    }
  };

  const assignedUserEmails = assignments
    .filter(a => a.admin_email === currentAdminEmail)
    .map(a => a.assigned_user_email);

  const visiblePublications = isSuperAdmin 
    ? publications 
    : publications.filter(p => assignedUserEmails.includes(p.user_email));

  const uniqueUsers = Array.from(new Set(visiblePublications.map(p => p.user_email))).map(email => {
    const pub = visiblePublications.find(p => p.user_email === email);
    return { email, name: pub?.user_name || email };
  });

  const filteredPublications = visiblePublications.filter(pub => {
    const matchesStatus = statusFilter === 'all' || pub.status === statusFilter;
    const matchesUser = userFilter === 'all' || pub.user_email === userFilter;
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         pub.authors.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesUser && matchesSearch;
  });

  const total = visiblePublications.length;
  const pending = visiblePublications.filter(p => p.status === 'pending').length;
  const approved = visiblePublications.filter(p => p.status === 'approved').length;

  const stats = [
    { label: 'Total de Registros', value: total, icon: FileText, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Aguardando Revisão', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Aprovados', value: approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] academic-shadow border border-slate-100 flex flex-col gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-4xl font-serif font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-serif font-bold text-slate-900">Fila de Revisão Acadêmica</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar por título ou autor..."
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20 outline-none w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select 
                className="text-xs font-bold text-slate-600 uppercase tracking-widest outline-none bg-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
              </select>
            </div>

            {isSuperAdmin && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  className="text-xs font-bold text-slate-600 uppercase tracking-widest outline-none bg-transparent max-w-[200px]"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                >
                  <option value="all">Todos os Usuários</option>
                  {uniqueUsers.map(user => (
                    <option key={user.email} value={user.email}>{user.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Trabalho</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Critério</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Usuário</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Status Atual</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPublications.map((pub) => (
                <tr key={pub.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6 max-w-md">
                    <button 
                      onClick={() => setViewingPubId(pub.id)}
                      className="text-left group/title"
                    >
                      <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover/title:text-brand-600 transition-colors">{pub.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{pub.authors} ({pub.year})</p>
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      pub.inclusion_criterion === 'Não incluso' 
                        ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {pub.inclusion_criterion === 'Não incluso' ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      {pub.inclusion_criterion}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-[10px]">
                        {pub.user_name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{pub.user_name || 'Usuário'}</p>
                          <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border ${
                            pub.user_role === 'professor' 
                              ? 'bg-amber-50 text-amber-600 border-amber-100' 
                              : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>
                            {pub.user_role || 'ligante'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{pub.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      pub.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                      pub.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {pub.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {pub.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {pub.status === 'pending' && <Clock className="w-3 h-3" />}
                      {pub.status === 'approved' ? 'Aprovado' : 
                       pub.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setViewingPubId(pub.id)}
                        className="p-2 bg-slate-50 text-slate-400 hover:bg-brand-600 hover:text-white rounded-xl transition-all"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {pub.status !== 'approved' && (
                        <button 
                          onClick={() => {
                            setReviewingId(pub.id);
                            setReviewAction('approved');
                            setReviewComment(pub.review_comment || '');
                          }}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                          title="Aprovar"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {pub.status !== 'rejected' && (
                        <button 
                          onClick={() => {
                            setReviewingId(pub.id);
                            setReviewAction('rejected');
                            setReviewComment(pub.review_comment || '');
                          }}
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                          title="Rejeitar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredPublications.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-400 font-medium italic">Nenhum registro encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewingId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 w-full max-w-lg overflow-hidden"
            >
              <div className={`p-8 text-white ${reviewAction === 'approved' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
                  {reviewAction === 'approved' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  {reviewAction === 'approved' ? 'Aprovar Registro' : 'Rejeitar Registro'}
                </h3>
                <p className="text-white/80 text-sm mt-2">
                  Adicione uma justificativa acadêmica para esta decisão.
                </p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Comentário da Revisão
                  </label>
                  <textarea 
                    autoFocus
                    placeholder="Ex: O trabalho atende a todos os critérios de inclusão estabelecidos..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-sm resize-none"
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button 
                    onClick={() => {
                      setReviewingId(null);
                      setReviewComment('');
                      setReviewAction(null);
                    }}
                    className="px-6 py-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:text-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleReviewSubmit}
                    className={`px-8 py-3 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg ${
                      reviewAction === 'approved' 
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' 
                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                    }`}
                  >
                    Confirmar {reviewAction === 'approved' ? 'Aprovação' : 'Rejeição'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {viewingPub && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 bg-brand-900 text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-sm">
                      {viewingPub.nature}
                    </span>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                      viewingPub.status === 'approved' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20' :
                      viewingPub.status === 'rejected' ? 'bg-rose-500/20 text-rose-200 border-rose-500/20' :
                      'bg-amber-500/20 text-amber-200 border-amber-500/20'
                    }`}>
                      {viewingPub.status === 'approved' ? 'Aprovado' : 
                       viewingPub.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold leading-tight">
                    {viewingPub.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setViewingPubId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autores</p>
                    <p className="text-sm text-slate-700 font-medium">{viewingPub.authors}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ano / Base de Dados</p>
                    <p className="text-sm text-slate-700 font-medium">{viewingPub.year} &bull; {viewingPub.database}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo / Abstract</p>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{viewingPub.abstract}"</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critério de Inclusão</p>
                    <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                      viewingPub.inclusion_criterion === 'Não incluso' 
                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {viewingPub.inclusion_criterion === 'Não incluso' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span className="text-xs font-bold uppercase tracking-widest">{viewingPub.inclusion_criterion}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Justificativa do Motivo</p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-600 font-medium">{viewingPub.reason || 'Nenhuma justificativa informada.'}</p>
                    </div>
                  </div>
                </div>

                {viewingPub.review_comment && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Feedback da Revisão</p>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed italic">{viewingPub.review_comment}</p>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                      {viewingPub.user_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{viewingPub.user_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{viewingPub.user_role || 'ligante'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {viewingPub.status !== 'approved' && (
                      <button 
                        onClick={() => {
                          setViewingPubId(null);
                          setReviewingId(viewingPub.id);
                          setReviewAction('approved');
                          setReviewComment(viewingPub.review_comment || '');
                        }}
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Aprovar
                      </button>
                    )}
                    {viewingPub.status !== 'rejected' && (
                      <button 
                        onClick={() => {
                          setViewingPubId(null);
                          setReviewingId(viewingPub.id);
                          setReviewAction('rejected');
                          setReviewComment(viewingPub.review_comment || '');
                        }}
                        className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Rejeitar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
