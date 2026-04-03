import { Publication } from '../types';
import { motion } from 'motion/react';
import { FileText, CheckCircle2, XCircle, User, MessageSquare, Clock } from 'lucide-react';

interface AdminDashboardProps {
  publications: Publication[];
}

export default function AdminDashboard({ publications }: AdminDashboardProps) {
  const total = publications.length;
  const included = publications.filter(p => p.inclusion_criterion !== 'Não incluso').length;
  const excluded = total - included;

  const stats = [
    { label: 'Trabalhos Cadastrados', value: total, icon: FileText, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Trabalhos Inclusos', value: included, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Trabalhos Exclusos', value: excluded, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xl font-serif font-bold text-slate-900">Histórico de Ações</h3>
          <span className="px-4 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {publications.length} Registros Totais
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Trabalho</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Motivo / Justificativa</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Usuário</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {publications.map((pub) => (
                <tr key={pub.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition-colors">{pub.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{pub.authors}</p>
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
                    <div className="flex items-start gap-2 max-w-xs">
                      <MessageSquare className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 leading-relaxed">{pub.reason || 'Sem justificativa detalhada'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-[10px]">
                        {pub.user_name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{pub.user_name || 'Usuário Desconhecido'}</p>
                        <p className="text-[10px] text-slate-400">{pub.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {new Date(pub.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {publications.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-400 font-medium italic">Nenhum registro encontrado no sistema.</p>
          </div>
        )}
      </div>
    </div>
  );
}
