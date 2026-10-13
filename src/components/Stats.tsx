import { Publication } from '../types';
import { FileText, CheckCircle2, XCircle, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsProps {
  publications: Publication[];
}

export default function Stats({ publications }: StatsProps) {
  const total = publications.length;
  const included = publications.filter(p => p.inclusion_criterion !== 'Não incluso').length;
  const excluded = total - included;
  const distinctNatures = new Set(publications.map(p => p.nature).filter(Boolean)).size;

  const stats = [
    { label: 'Total', value: total, icon: FileText, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Inclusos', value: included, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Exclusos', value: excluded, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Naturezas', value: distinctNatures, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <motion.div 
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white p-6 rounded-2xl academic-shadow border border-slate-100 flex flex-col gap-3 group hover:border-brand-200 transition-all"
        >
          <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">{stat.label}</p>
            <p className="text-3xl font-serif font-bold text-slate-900">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
