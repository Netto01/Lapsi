import React, { useState } from 'react';
import { Publication } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Search, Calendar, User, Database, MessageSquare, Tag, X, ChevronRight, ExternalLink, BookOpen } from 'lucide-react';

interface ReviewArchiveProps {
  publications: Publication[];
}

export default function ReviewArchive({ 
  publications, 
}: ReviewArchiveProps) {
  const [activeTab, setActiveTab] = useState<'approved' | 'rejected'>('approved');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingPubId, setViewingPubId] = useState<string | null>(null);

  const visiblePublications = publications;

  const viewingPub = visiblePublications.find(p => p.id === viewingPubId);

  const filtered = visiblePublications.filter(p => 
    p.status === activeTab &&
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.authors.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'approved' 
              ? 'bg-white text-emerald-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Aceitos
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'rejected' 
              ? 'bg-white text-rose-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Recusados
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
        <input
          type="text"
          placeholder="Buscar no arquivo..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl academic-shadow focus:ring-2 focus:ring-brand-500/20 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((pub, idx) => (
            <motion.div 
              key={pub.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl academic-shadow border border-slate-100 hover:border-brand-200 transition-all group overflow-hidden flex flex-col md:flex-row"
            >
              <div className={`w-2 md:w-3 shrink-0 ${
                pub.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />

              <div className="flex-1 p-8">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-100">
                        {pub.nature}
                      </span>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        pub.status === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {pub.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-slate-900 leading-tight">
                      {pub.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <User className="w-4 h-4 text-brand-400" />
                      <span>{pub.authors}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                        {pub.user_name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700">{pub.user_name}</span>
                        <span className="text-[9px] text-slate-400 leading-none">{pub.user_email}</span>
                      </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                          pub.user_role === 'professor' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {pub.user_role || 'ligante'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative mb-6">
                  <p className="text-slate-600 text-sm leading-relaxed italic line-clamp-3 pl-4 border-l-2 border-slate-100">
                    "{pub.abstract}"
                  </p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    {pub.journal_name && (
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <BookOpen className="w-4 h-4 text-brand-400" />
                        <span>{pub.journal_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <Calendar className="w-4 h-4 text-brand-400" />
                      <span>{pub.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <Database className="w-4 h-4 text-brand-400" />
                      <span>{pub.database}</span>
                    </div>
                    {pub.link && (
                      <a 
                        href={pub.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-brand-600 text-xs font-bold uppercase tracking-widest hover:text-brand-700 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Link</span>
                      </a>
                    )}
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <Tag className="w-4 h-4 text-brand-400" />
                      <span>Critério: {pub.inclusion_criterion}</span>
                    </div>
                  </div>

                  {pub.review_comment && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Feedback da Banca</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic">{pub.review_comment}</p>
                        {pub.reviewed_by_name && (
                          <p className="text-[8px] font-bold text-brand-600/60 uppercase tracking-widest mt-1">
                            Revisado por: {pub.reviewed_by_name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div 
                    onClick={() => setViewingPubId(pub.id)}
                    className="flex items-center gap-1 text-brand-600 text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform cursor-pointer pt-2"
                  >
                    <span>Detalhes</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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

                  {viewingPub.journal_name && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome da Revista</p>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-brand-500" />
                        <p className="text-sm text-slate-700 font-bold">{viewingPub.journal_name}</p>
                      </div>
                    </div>
                  )}

                  {viewingPub.link && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link para Leitura</p>
                      <a 
                        href={viewingPub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-4 bg-brand-50 rounded-2xl border border-brand-100 text-brand-700 hover:bg-brand-100 transition-all group"
                      >
                        <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold truncate">{viewingPub.link}</span>
                      </a>
                    </div>
                  )}

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
                        <div className="space-y-1">
                          <p className="text-xs text-amber-800 leading-relaxed italic">{viewingPub.review_comment}</p>
                          {viewingPub.reviewed_by_name && (
                            <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-widest">
                              Revisado por: {viewingPub.reviewed_by_name} ({viewingPub.reviewed_by_role || 'professor'})
                            </p>
                          )}
                        </div>
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
                    
                    <button 
                      onClick={() => setViewingPubId(null)}
                      className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhum registro encontrado</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Não há trabalhos {activeTab === 'approved' ? 'aceitos' : 'recusados'} que correspondam à sua busca.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
