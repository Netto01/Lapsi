import { motion } from 'motion/react';
import { ShieldCheck, Users, Database, User, BookOpen, Globe } from 'lucide-react';
import { AdminAssignment, Profile, AcademicResource, UserResourceAccess } from '../types';

interface ManagementViewProps {
  assignments: AdminAssignment[];
  profiles: Profile[];
  resources: AcademicResource[];
  resourceAccess: UserResourceAccess[];
}

export default function ManagementView({ 
  assignments, 
  profiles, 
  resources, 
  resourceAccess 
}: ManagementViewProps) {
  
  const admins = Array.from(new Set(assignments.map(a => a.admin_email || a.admin_name)));

  return (
    <div className="space-y-8">
      <div className="bg-brand-900 rounded-[2.5rem] p-8 text-white academic-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-start gap-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck className="w-6 h-6 text-brand-200" />
          </div>
          <div>
            <h3 className="text-2xl font-serif font-bold mb-2">Gestão Acadêmica e Acessos</h3>
            <p className="text-brand-200 text-sm max-w-2xl">
              Visão consolidada de supervisão acadêmica e repositórios atribuídos a cada ligante no sistema.
            </p>
          </div>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center academic-shadow border border-slate-100">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Nenhuma vinculação registrada no sistema.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {admins.map((adminId, idx) => {
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
                      .map(acc => resources.find(r => r.id === acc.resource_id))
                      .filter(Boolean) as AcademicResource[];

                    return (
                      <div key={assignment.id} className="bg-slate-50/30 rounded-3xl border border-slate-100 p-6 space-y-4 hover:border-brand-200 transition-all group">
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
                              {studentResources.map(res => (
                                <div key={res.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 text-[10px] font-medium text-slate-600">
                                  {res.category === 'Repositório' ? <Database className="w-3 h-3 text-blue-500" /> :
                                   res.category === 'Revista' ? <BookOpen className="w-3 h-3 text-emerald-500" /> :
                                   <Globe className="w-3 h-3 text-indigo-500" />}
                                  {res.title}
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
    </div>
  );
}
