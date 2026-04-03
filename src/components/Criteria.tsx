import React from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function Criteria() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inclusão */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[2.5rem] p-8 academic-shadow border border-slate-100 space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 p-3 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Critérios de Inclusão</h3>
            <p className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest mt-1">Parâmetros de Seleção</p>
          </div>
        </div>

        <ul className="space-y-3">
          {[
            'Estar disponíveis em repositórios institucionais ou periódicos científicos vinculados a Instituições de Ensino Superior do estado do Tocantins;',
            'Ter como cenário de pesquisa o estado do Tocantins, seja na totalidade ou em recorte institucional específico;',
            'Ter sido publicados no período de 2015 a 2025, considerando a consolidação das discussões contemporâneas sobre saúde mental no ensino superior;',
            'Estar redigidos em língua portuguesa;',
            'Ter como público-alvo estudantes do ensino superior;',
            'Abordar diretamente a temática da saúde mental ou variáveis correlatas (sofrimento psíquico, adoecimento mental, transtornos mentais, bem-estar psicológico, estresse, ansiedade, depressão ou qualidade de vida);',
            'Configurar-se como estudo empírico ou relato de experiência com descrição de procedimentos de coleta e análise de dados;',
            'Estar disponível em texto completo para leitura integral.'
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Exclusão */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[2.5rem] p-8 academic-shadow border border-slate-100 space-y-6"
      >
        <div className="flex items-center gap-4">
          <div className="bg-rose-50 p-3 rounded-2xl">
            <XCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">Critérios de Exclusão</h3>
            <p className="text-rose-600 text-[10px] font-bold uppercase tracking-widest mt-1">Filtros de Descarte</p>
          </div>
        </div>

        <ul className="space-y-3">
          {[
            'Produções publicadas fora do recorte temporal estabelecido;',
            'Trabalhos redigidos em idioma diferente do português;',
            'Estudos cujo cenário de pesquisa não seja o estado do Tocantins;',
            'Revisões de literatura, ensaios teóricos, artigos de opinião ou textos sem descrição de procedimentos metodológicos;',
            'Estudos que abordem saúde mental sem delimitação para estudantes do ensino superior;',
            'Produções duplicadas encontradas em mais de uma base institucional;',
            'Trabalhos cujo texto completo não esteja acessível;',
            'Produções que tratem exclusivamente de aspectos administrativos ou pedagógicos sem relação com saúde mental.'
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
