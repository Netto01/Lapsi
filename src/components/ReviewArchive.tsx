import React, { useState, useMemo, useEffect } from 'react';
import { Publication } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  Calendar, 
  User, 
  Users,
  Database, 
  MessageSquare, 
  Tag, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink, 
  BookOpen, 
  Globe, 
  Link as LinkIcon, 
  BarChart3, 
  TrendingUp,
  Filter,
  Layers,
  ArrowUpDown,
  RotateCcw,
  Bookmark,
  GraduationCap,
  Library,
  FileText
} from 'lucide-react';
import { RESOURCE_JOURNAL_MAPPING } from '../constants';

interface ReviewArchiveProps {
  publications: Publication[];
}

interface AuthorStat {
  name: string;
  total: number;
  approved: number;
  rejected: number;
  rate: number;
}

interface YearStat {
  year: number;
  total: number;
  approved: number;
  rejected: number;
  rate: number;
}

interface SubmitterStat {
  name: string;
  email: string;
  role: string;
  total: number;
  approved: number;
  rejected: number;
  rate: number;
}

export interface CategoryStat {
  name: string;
  total: number;
  approved: number;
  rejected: number;
  rate: number;
}

export interface NatureStat {
  name: string;
  macroType: string;
  total: number;
  approved: number;
  rejected: number;
  rate: number;
}

export interface MacroNatureStat {
  name: string;
  total: number;
  approved: number;
  rejected: number;
  rate: number;
  countSubtypes: number;
}

export function getMacroNature(nature: string | undefined): string {
  if (!nature) return 'Outras Naturezas';
  const clean = nature.trim();
  const lower = clean.toLowerCase();
  if (lower.startsWith('artigo')) return 'Artigo';
  if (lower.startsWith('tcc') || lower === 'tcr') return 'TCC';
  if (lower.startsWith('dissertação') || lower.startsWith('dissertacao')) return 'Dissertação';
  if (lower.startsWith('tese')) return 'Tese';
  if (lower.startsWith('relatório de estágio') || lower.startsWith('relatorio de estagio')) return 'Relatório de Estágio';
  if (lower.startsWith('monografia')) return 'Monografia';
  if (lower.startsWith('livro')) return 'Livro / E-book';
  if (lower.startsWith('anais')) return 'Anais de Evento';
  return 'Outras Naturezas';
}

export function cleanCategoryName(raw: string | undefined): string {
  if (!raw) return 'Não informada';
  let cat = raw.trim().replace(/\.+$/, '').trim();
  if (!cat) return 'Não informada';
  if (cat === cat.toUpperCase() && cat.length > 3) {
    cat = cat.charAt(0) + cat.slice(1).toLowerCase();
  }
  const lower = cat.toLowerCase();
  if (lower === 'psicologia') return 'Psicologia';
  if (lower === 'letras') return 'Letras';
  if (lower === 'direito') return 'Direito';
  if (lower === 'serviço social' || lower === 'servico social') return 'Serviço Social';
  if (lower === 'educação física' || lower === 'educacao fisica') return 'Educação Física';
  if (lower.includes('gestão de políticas públicas') || lower.includes('gestao de politicas publicas') || lower === 'políticas públicas' || lower === 'politicas publicas' || lower === 'política pública') return 'Gestão de Políticas Públicas';
  if (lower.includes('ciência e saúde') || lower.includes('ciências e saúde') || lower.includes('ciências em saúde') || lower.includes('ciência da saúde') || lower.includes('ciências da saúde')) return 'Ciências da Saúde';
  if (lower.includes('ciência da computação') || lower.includes('ciências da computação') || lower.includes('computação')) return 'Ciência da Computação';
  if (lower.includes('cultura e território') || lower.includes('culturas e territórios')) return 'Estudos de Cultura e Território';
  if (lower.includes('desenvolvimento regional')) return 'Desenvolvimento Regional';
  if (lower.includes('ciências biológicas')) return 'Ciências Biológicas';
  if (lower === 'ciências sociais') return 'Ciências Sociais';
  if (lower.includes('ciências do ambiente')) return 'Ciências do Ambiente';
  if (lower.includes('administração pública') || lower.includes('administracao publica')) return 'Administração Pública';
  if (lower.includes('prestação jurisdicional') || lower.includes('prestação jurisdiscional')) return 'Prestação Jurisdicional e Direitos Humanos';
  return cat;
}

function cleanAuthorName(raw: string): string {
  if (!raw) return '';
  let name = raw.trim();
  if (name.startsWith('http')) {
    const match = name.match(/value=([^&]+)/);
    if (match) {
      try {
        name = decodeURIComponent(match[1]).replace(/\+/g, ' ');
      } catch {
        name = match[1];
      }
    } else {
      const parts = name.split('/');
      name = parts[parts.length - 1];
    }
  }
  name = name.replace(/\t/g, ' ').replace(/\s+/g, ' ').replace(/\.$/, '');
  return name;
}

export default function ReviewArchive({ publications }: ReviewArchiveProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'rejected'>('approved');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedSubmitter, setSelectedSubmitter] = useState<string | null>(null);
  const [selectedNature, setSelectedNature] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [authorSearchTerm, setAuthorSearchTerm] = useState('');
  const [authorSortBy, setAuthorSortBy] = useState<'total' | 'approved' | 'name'>('total');
  const [visibleAuthorsLimit, setVisibleAuthorsLimit] = useState(12);
  const [authorViewMode, setAuthorViewMode] = useState<'paperAuthors' | 'submitters'>('paperAuthors');

  const [natureSearchTerm, setNatureSearchTerm] = useState('');
  const [natureSortBy, setNatureSortBy] = useState<'total' | 'approved' | 'name'>('total');
  const [natureViewMode, setNatureViewMode] = useState<'macro' | 'detailed'>('macro');
  const [visibleNaturesLimit, setVisibleNaturesLimit] = useState(15);

  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categorySortBy, setCategorySortBy] = useState<'total' | 'approved' | 'name'>('total');
  const [visibleCategoriesLimit, setVisibleCategoriesLimit] = useState(15);

  const [analyticsSection, setAnalyticsSection] = useState<'years' | 'authors' | 'natures' | 'categories' | 'overview'>('overview');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true);
  const [viewingPubId, setViewingPubId] = useState<string | null>(null);

  // Overall statistics
  const stats = useMemo(() => {
    const total = publications.length;
    const approved = publications.filter(p => p.status === 'approved').length;
    const rejected = publications.filter(p => p.status === 'rejected').length;
    const pending = publications.filter(p => p.status === 'pending').length;

    // Macro nature distributions
    const macroCounts: Record<string, { total: number; approved: number; rejected: number }> = {};
    publications.forEach(p => {
      const macro = getMacroNature(p.nature);
      if (!macroCounts[macro]) {
        macroCounts[macro] = { total: 0, approved: 0, rejected: 0 };
      }
      macroCounts[macro].total++;
      if (p.status === 'approved') macroCounts[macro].approved++;
      if (p.status === 'rejected') macroCounts[macro].rejected++;
    });

    // Specifically for Natureza === 'Artigo'
    const articlesTotal = macroCounts['Artigo']?.total || 0;
    const articlesApproved = macroCounts['Artigo']?.approved || 0;
    const articlesRejected = macroCounts['Artigo']?.rejected || 0;

    const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : '0';
    const rejectionRate = total > 0 ? ((rejected / total) * 100).toFixed(1) : '0';
    const articlesApprovalRate = articlesTotal > 0 ? ((articlesApproved / articlesTotal) * 100).toFixed(1) : '0';

    return {
      total,
      approved,
      rejected,
      pending,
      approvalRate,
      rejectionRate,
      articlesTotal,
      articlesApproved,
      articlesRejected,
      articlesApprovalRate,
      macroCounts,
    };
  }, [publications]);

  // Year statistics & distribution
  const yearStats = useMemo(() => {
    const map = new Map<number, { total: number; approved: number; rejected: number }>();
    publications.forEach(p => {
      let year = Number(p.year);
      if (!year || isNaN(year)) return;
      // Tratar eventuais erros de digitação (ex: 20231 -> 2023)
      if (year > 2050) {
        const str = String(year);
        if (str.length === 5 && str.startsWith('202')) {
          year = Number(str.slice(0, 4));
        } else {
          return;
        }
      }
      if (year < 1900 || year > 2050) return;

      if (!map.has(year)) {
        map.set(year, { total: 0, approved: 0, rejected: 0 });
      }
      const item = map.get(year)!;
      item.total++;
      if (p.status === 'approved') item.approved++;
      if (p.status === 'rejected') item.rejected++;
    });

    const list: YearStat[] = Array.from(map.entries())
      .map(([year, data]) => ({
        year,
        total: data.total,
        approved: data.approved,
        rejected: data.rejected,
        rate: data.total > 0 ? Math.round((data.approved / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.year - b.year);

    const maxTotalYear = list.reduce((max, y) => (y.total > max ? y.total : max), 1);
    const yearWithMostApproved = [...list].sort((a, b) => b.approved - a.approved)[0];
    const yearWithMostTotal = [...list].sort((a, b) => b.total - a.total)[0];

    return {
      list,
      maxTotalYear,
      yearWithMostApproved,
      yearWithMostTotal,
      minYear: list.length > 0 ? list[0].year : null,
      maxYear: list.length > 0 ? list[list.length - 1].year : null,
    };
  }, [publications]);

  // Authors extraction & distribution
  const authorStats = useMemo(() => {
    const map = new Map<string, { displayName: string; total: number; approved: number; rejected: number }>();

    publications.forEach(p => {
      if (!p.authors) return;
      const parts = p.authors
        .split(/;|\n/)
        .map(cleanAuthorName)
        .filter(s => s && s.length > 2 && !s.startsWith('http'));

      parts.forEach(name => {
        const key = name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, { displayName: name, total: 0, approved: 0, rejected: 0 });
        }
        const item = map.get(key)!;
        item.total++;
        if (p.status === 'approved') item.approved++;
        if (p.status === 'rejected') item.rejected++;
      });
    });

    const list: AuthorStat[] = Array.from(map.values()).map(item => ({
      name: item.displayName,
      total: item.total,
      approved: item.approved,
      rejected: item.rejected,
      rate: item.total > 0 ? Math.round((item.approved / item.total) * 100) : 0,
    }));

    return {
      totalUnique: list.length,
      list,
    };
  }, [publications]);

  // Submitters / Ligantes distribution
  const submitterStats = useMemo(() => {
    const map = new Map<string, { name: string; email: string; role: string; total: number; approved: number; rejected: number }>();

    publications.forEach(p => {
      const email = p.user_email || 'desconhecido';
      const name = p.user_name || p.user_email || 'Pesquisador';
      const role = p.user_role || 'ligante';
      const key = email.toLowerCase();

      if (!map.has(key)) {
        map.set(key, { name, email, role, total: 0, approved: 0, rejected: 0 });
      }
      const item = map.get(key)!;
      item.total++;
      if (p.status === 'approved') item.approved++;
      if (p.status === 'rejected') item.rejected++;
    });

    const list: SubmitterStat[] = Array.from(map.values()).map(item => ({
      ...item,
      rate: item.total > 0 ? Math.round((item.approved / item.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);

    return list;
  }, [publications]);

  // Category statistics & distribution (todas as categorias)
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; approved: number; rejected: number }>();
    publications.forEach(p => {
      const cat = cleanCategoryName(p.knowledge_area);
      if (!map.has(cat)) {
        map.set(cat, { total: 0, approved: 0, rejected: 0 });
      }
      const item = map.get(cat)!;
      item.total++;
      if (p.status === 'approved') item.approved++;
      if (p.status === 'rejected') item.rejected++;
    });

    const list: CategoryStat[] = Array.from(map.entries()).map(([name, d]) => ({
      name,
      total: d.total,
      approved: d.approved,
      rejected: d.rejected,
      rate: d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

    return {
      totalCategories: list.length,
      list,
      topCategories: list.slice(0, 5),
    };
  }, [publications]);

  // Nature statistics & distribution (todas as naturezas detalhadas e macro grupos)
  const natureStats = useMemo(() => {
    const specificMap = new Map<string, { macroType: string; total: number; approved: number; rejected: number }>();
    const macroMap = new Map<string, { total: number; approved: number; rejected: number; subtypes: Set<string> }>();

    publications.forEach(p => {
      const nat = (p.nature || 'Não informado').trim();
      const macro = getMacroNature(nat);

      // Specific nature
      if (!specificMap.has(nat)) {
        specificMap.set(nat, { macroType: macro, total: 0, approved: 0, rejected: 0 });
      }
      const item = specificMap.get(nat)!;
      item.total++;
      if (p.status === 'approved') item.approved++;
      if (p.status === 'rejected') item.rejected++;

      // Macro nature
      if (!macroMap.has(macro)) {
        macroMap.set(macro, { total: 0, approved: 0, rejected: 0, subtypes: new Set() });
      }
      const mItem = macroMap.get(macro)!;
      mItem.total++;
      mItem.subtypes.add(nat);
      if (p.status === 'approved') mItem.approved++;
      if (p.status === 'rejected') mItem.rejected++;
    });

    const specificList: NatureStat[] = Array.from(specificMap.entries()).map(([name, d]) => ({
      name,
      macroType: d.macroType,
      total: d.total,
      approved: d.approved,
      rejected: d.rejected,
      rate: d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

    const macroList: MacroNatureStat[] = Array.from(macroMap.entries()).map(([name, d]) => ({
      name,
      total: d.total,
      approved: d.approved,
      rejected: d.rejected,
      rate: d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0,
      countSubtypes: d.subtypes.size,
    })).sort((a, b) => b.total - a.total);

    const macroDict: Record<string, MacroNatureStat> = Object.fromEntries(macroList.map(m => [m.name, m]));

    return {
      totalTypes: specificList.length,
      specificList,
      macroList,
      macroDict,
    };
  }, [publications]);

  // Filtered categories for analytics view
  const displayedCategories = useMemo(() => {
    let result = categoryStats.list;
    if (categorySearchTerm.trim()) {
      const term = categorySearchTerm.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(term));
    }
    if (categorySortBy === 'total') {
      result = [...result].sort((a, b) => b.total - a.total || b.approved - a.approved);
    } else if (categorySortBy === 'approved') {
      result = [...result].sort((a, b) => b.approved - a.approved || b.total - a.total);
    } else if (categorySortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [categoryStats.list, categorySearchTerm, categorySortBy]);

  // Filtered natures for analytics view
  const displayedNatures = useMemo(() => {
    let result = natureStats.specificList;
    if (natureSearchTerm.trim()) {
      const term = natureSearchTerm.toLowerCase();
      result = result.filter(n => n.name.toLowerCase().includes(term) || n.macroType.toLowerCase().includes(term));
    }
    if (natureSortBy === 'total') {
      result = [...result].sort((a, b) => b.total - a.total || b.approved - a.approved);
    } else if (natureSortBy === 'approved') {
      result = [...result].sort((a, b) => b.approved - a.approved || b.total - a.total);
    } else if (natureSortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [natureStats.specificList, natureSearchTerm, natureSortBy]);

  // Filtered macro natures
  const displayedMacroNatures = useMemo(() => {
    let result = natureStats.macroList;
    if (natureSearchTerm.trim()) {
      const term = natureSearchTerm.toLowerCase();
      result = result.filter(n => n.name.toLowerCase().includes(term));
    }
    if (natureSortBy === 'total') {
      result = [...result].sort((a, b) => b.total - a.total || b.approved - a.approved);
    } else if (natureSortBy === 'approved') {
      result = [...result].sort((a, b) => b.approved - a.approved || b.total - a.total);
    } else if (natureSortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [natureStats.macroList, natureSearchTerm, natureSortBy]);

  // Filtered and sorted authors for display
  const displayedAuthors = useMemo(() => {
    let result = authorStats.list;

    if (authorSearchTerm.trim()) {
      const term = authorSearchTerm.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(term));
    }

    if (authorSortBy === 'total') {
      result = [...result].sort((a, b) => b.total - a.total || b.approved - a.approved);
    } else if (authorSortBy === 'approved') {
      result = [...result].sort((a, b) => b.approved - a.approved || b.total - a.total);
    } else if (authorSortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [authorStats.list, authorSearchTerm, authorSortBy]);

  // Main filtered publications list
  const filteredPublications = useMemo(() => {
    return publications.filter(p => {
      // Status filter
      if (activeTab !== 'all' && p.status !== activeTab) {
        return false;
      }

      // Year filter
      if (selectedYear !== null) {
        let pubYear = Number(p.year);
        if (pubYear > 2050 && String(pubYear).length === 5 && String(pubYear).startsWith('202')) {
          pubYear = Number(String(pubYear).slice(0, 4));
        }
        if (pubYear !== selectedYear) {
          return false;
        }
      }

      // Author filter (check if selected author name is in pub.authors)
      if (selectedAuthor !== null) {
        const pAuthors = (p.authors || '').toLowerCase();
        if (!pAuthors.includes(selectedAuthor.toLowerCase())) {
          return false;
        }
      }

      // Submitter filter
      if (selectedSubmitter !== null) {
        const submitterEmail = (p.user_email || '').toLowerCase();
        const submitterName = (p.user_name || '').toLowerCase();
        if (submitterEmail !== selectedSubmitter.toLowerCase() && submitterName !== selectedSubmitter.toLowerCase()) {
          return false;
        }
      }

      // Nature filter
      if (selectedNature !== null) {
        const pubNature = (p.nature || '').trim();
        const pubMacro = getMacroNature(pubNature);
        if (selectedNature.startsWith('macro:')) {
          const targetMacro = selectedNature.replace('macro:', '');
          if (pubMacro !== targetMacro) return false;
        } else {
          if (pubNature.toLowerCase() !== selectedNature.toLowerCase()) return false;
        }
      }

      // Category filter
      if (selectedCategory !== null) {
        const pubCat = cleanCategoryName(p.knowledge_area);
        const rawCat = (p.knowledge_area || '').trim();
        if (pubCat.toLowerCase() !== selectedCategory.toLowerCase() && rawCat.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const inTitle = p.title?.toLowerCase().includes(query);
        const inAuthors = p.authors?.toLowerCase().includes(query);
        const inJournal = p.journal_name?.toLowerCase().includes(query);
        const inAbstract = p.abstract?.toLowerCase().includes(query);
        const inSubmitter = p.user_name?.toLowerCase().includes(query);
        const inNature = p.nature?.toLowerCase().includes(query);
        const inCategory = p.knowledge_area?.toLowerCase().includes(query);
        if (!inTitle && !inAuthors && !inJournal && !inAbstract && !inSubmitter && !inNature && !inCategory) {
          return false;
        }
      }

      return true;
    });
  }, [publications, activeTab, selectedYear, selectedAuthor, selectedSubmitter, selectedNature, selectedCategory, searchTerm]);

  // Pagination states for high-volume dataset (1800+ records)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedYear, selectedAuthor, selectedSubmitter, selectedNature, selectedCategory, searchTerm, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredPublications.length / pageSize));
  const paginatedPublications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPublications.slice(startIndex, startIndex + pageSize);
  }, [filteredPublications, currentPage, pageSize]);

  const viewingPub = publications.find(p => p.id === viewingPubId);

  const clearAllFilters = () => {
    setSelectedYear(null);
    setSelectedAuthor(null);
    setSelectedSubmitter(null);
    setSelectedNature(null);
    setSelectedCategory(null);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedYear !== null || 
    selectedAuthor !== null || 
    selectedSubmitter !== null || 
    selectedNature !== null || 
    selectedCategory !== null || 
    searchTerm.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* KPI Stats Cards - Resumo de Aceitos, Recusados, Naturezas, Categorias e Autores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card: Obras Aceitas */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setActiveTab('approved')}
          className={`p-5 rounded-3xl bg-white border cursor-pointer transition-all hover:scale-[1.01] ${
            activeTab === 'approved' 
              ? 'border-emerald-300 ring-2 ring-emerald-500/20 academic-shadow' 
              : 'border-slate-100 hover:border-emerald-200 academic-shadow'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
              Aceitos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{stats.approved}</span>
            <span className="text-xs text-emerald-700 font-semibold">({stats.approvalRate}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-1">
            {stats.macroCounts['Artigo']?.approved || 0} Artigos · {stats.macroCounts['Dissertação']?.approved || 0} Dissertações · {stats.macroCounts['TCC']?.approved || 0} TCCs
          </p>
        </motion.div>

        {/* Card: Obras Recusadas */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          onClick={() => setActiveTab('rejected')}
          className={`p-5 rounded-3xl bg-white border cursor-pointer transition-all hover:scale-[1.01] ${
            activeTab === 'rejected' 
              ? 'border-rose-300 ring-2 ring-rose-500/20 academic-shadow' 
              : 'border-slate-100 hover:border-rose-200 academic-shadow'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg">
              Recusados
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{stats.rejected}</span>
            <span className="text-xs text-rose-700 font-semibold">({stats.rejectionRate}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-1">
            {stats.macroCounts['Artigo']?.rejected || 0} Artigos · {stats.macroCounts['Dissertação']?.rejected || 0} Dissertações · {stats.macroCounts['TCC']?.rejected || 0} TCCs
          </p>
        </motion.div>

        {/* Card: Todas as Naturezas */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => {
            setIsAnalyticsOpen(true);
            setAnalyticsSection('natures');
          }}
          className={`p-5 rounded-3xl bg-white border cursor-pointer transition-all hover:scale-[1.01] ${
            analyticsSection === 'natures' && isAnalyticsOpen
              ? 'border-brand-400 ring-2 ring-brand-500/20 academic-shadow' 
              : 'border-slate-100 hover:border-brand-200 academic-shadow'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-lg">
              Todas Naturezas
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{natureStats.macroList.length}</span>
            <span className="text-xs text-slate-400 font-medium">macros · {natureStats.totalTypes} tipos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-1">
            TCC ({natureStats.macroDict['TCC']?.total || 0}) · Dissertação ({natureStats.macroDict['Dissertação']?.total || 0}) · Tese ({natureStats.macroDict['Tese']?.total || 0}) · Artigo ({natureStats.macroDict['Artigo']?.total || 0})
          </p>
        </motion.div>

        {/* Card: Todas as Categorias */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => {
            setIsAnalyticsOpen(true);
            setAnalyticsSection('categories');
          }}
          className={`p-5 rounded-3xl bg-white border cursor-pointer transition-all hover:scale-[1.01] ${
            analyticsSection === 'categories' && isAnalyticsOpen
              ? 'border-purple-300 ring-2 ring-purple-500/20 academic-shadow' 
              : 'border-slate-100 hover:border-purple-200 academic-shadow'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">
              Categorias & Áreas
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{categoryStats.totalCategories}</span>
            <span className="text-xs text-slate-400 font-medium">áreas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-1">
            {categoryStats.list[0]?.name || 'Agrárias'} ({categoryStats.list[0]?.total || 0}) · {categoryStats.list[1]?.name || 'Sociais'} ({categoryStats.list[1]?.total || 0}) · {categoryStats.list[2]?.name || 'Humanas'} ({categoryStats.list[2]?.total || 0})
          </p>
        </motion.div>

        {/* Card: Autores e Anos */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            setIsAnalyticsOpen(true);
            setAnalyticsSection('years');
          }}
          className={`p-5 rounded-3xl bg-white border cursor-pointer transition-all hover:scale-[1.01] ${
            analyticsSection === 'years' && isAnalyticsOpen
              ? 'border-slate-300 ring-2 ring-slate-400/20 academic-shadow' 
              : 'border-slate-100 hover:border-slate-300 academic-shadow'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
              Autores & Anos
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-serif font-bold text-slate-900">{authorStats.totalUnique}</span>
            <span className="text-xs text-slate-400 font-medium">autores</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-1">
            {yearStats.minYear} a {yearStats.maxYear} ({yearStats.list.length} anos)
          </p>
        </motion.div>
      </div>

      {/* Analytics Panel: Distribuição das Naturezas, Categorias, Anos e Autores */}
      <div className="bg-white rounded-3xl border border-slate-100 academic-shadow overflow-hidden">
        {/* Panel Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Distribuição Bibliométrica Completa
              </h3>
              <p className="text-xs text-slate-500">
                Estatísticas detalhadas de todas as naturezas acadêmicas, categorias do conhecimento, anos e autoria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Selector */}
            <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-xl gap-0.5">
              <button
                onClick={() => {
                  setIsAnalyticsOpen(true);
                  setAnalyticsSection('natures');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  analyticsSection === 'natures' && isAnalyticsOpen
                    ? 'bg-white text-brand-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Por Natureza ({natureStats.macroList.length})</span>
              </button>
              <button
                onClick={() => {
                  setIsAnalyticsOpen(true);
                  setAnalyticsSection('categories');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  analyticsSection === 'categories' && isAnalyticsOpen
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Por Categoria ({categoryStats.totalCategories})</span>
              </button>
              <button
                onClick={() => {
                  setIsAnalyticsOpen(true);
                  setAnalyticsSection('years');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  analyticsSection === 'years' && isAnalyticsOpen
                    ? 'bg-white text-brand-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Por Ano</span>
              </button>
              <button
                onClick={() => {
                  setIsAnalyticsOpen(true);
                  setAnalyticsSection('authors');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  analyticsSection === 'authors' && isAnalyticsOpen
                    ? 'bg-white text-brand-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Por Autor</span>
              </button>
              <button
                onClick={() => {
                  setIsAnalyticsOpen(true);
                  setAnalyticsSection('overview');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  analyticsSection === 'overview' && isAnalyticsOpen
                    ? 'bg-white text-brand-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Comparativo</span>
              </button>
            </div>

            {/* Toggle collapse */}
            <button
              onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 transition-colors shrink-0"
            >
              {isAnalyticsOpen ? 'Ocultar' : 'Expandir'}
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <AnimatePresence>
          {isAnalyticsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-6 md:p-8"
            >
              {/* SECTION: DISTRIBUTION BY NATURE */}
              {analyticsSection === 'natures' && (
                <div className="space-y-6">
                  {/* Sub-header & Controls */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                      <button
                        onClick={() => setNatureViewMode('macro')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          natureViewMode === 'macro'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Tipos Principais ({natureStats.macroList.length})
                      </button>
                      <button
                        onClick={() => setNatureViewMode('detailed')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          natureViewMode === 'detailed'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Todas as Naturezas Específicas ({natureStats.totalTypes})
                      </button>
                    </div>

                    {/* Sorting & Search */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <select
                          value={natureSortBy}
                          onChange={(e) => setNatureSortBy(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none"
                        >
                          <option value="total">Mais Obras</option>
                          <option value="approved">Mais Aceitos</option>
                          <option value="name">Alfabética</option>
                        </select>
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar natureza..."
                          value={natureSearchTerm}
                          onChange={(e) => setNatureSearchTerm(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mode: Macro Natures */}
                  {natureViewMode === 'macro' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          Clique em um tipo acadêmico para filtrar todas as obras associadas no acervo.
                        </p>
                        {selectedNature && (
                          <button
                            onClick={() => setSelectedNature(null)}
                            className="text-xs text-rose-600 hover:underline font-semibold"
                          >
                            Limpar filtro de natureza
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedMacroNatures.map((macro) => {
                          const isSelected = selectedNature === `macro:${macro.name}`;
                          const approvedPct = macro.total > 0 ? Math.round((macro.approved / macro.total) * 100) : 0;
                          const rejectedPct = macro.total > 0 ? Math.round((macro.rejected / macro.total) * 100) : 0;

                          return (
                            <div
                              key={macro.name}
                              onClick={() => setSelectedNature(isSelected ? null : `macro:${macro.name}`)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-brand-50/90 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                                  : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900">{macro.name}</span>
                                    {macro.countSubtypes > 1 && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/70 text-slate-600 font-medium">
                                        {macro.countSubtypes} variações
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500">
                                    {macro.total} obras ({((macro.total / stats.total) * 100).toFixed(1)}% do acervo)
                                  </p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${
                                  isSelected 
                                    ? 'bg-brand-600 text-white border-brand-700' 
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}>
                                  {macro.total}
                                </span>
                              </div>

                              {/* Progress bar of accepted vs rejected */}
                              <div className="mt-4">
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                  <div 
                                    style={{ width: `${approvedPct}%` }} 
                                    className="h-full bg-emerald-500" 
                                    title={`${macro.approved} aceitos (${approvedPct}%)`}
                                  />
                                  <div 
                                    style={{ width: `${rejectedPct}%` }} 
                                    className="h-full bg-rose-400" 
                                    title={`${macro.rejected} recusados (${rejectedPct}%)`}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                    {macro.approved} aceito{macro.approved !== 1 ? 's' : ''} ({approvedPct}%)
                                  </span>
                                  <span className="text-rose-700 font-bold flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                                    {macro.rejected} recusado{macro.rejected !== 1 ? 's' : ''} ({rejectedPct}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mode: Detailed Natures (all 90+ individual natures) */}
                  {natureViewMode === 'detailed' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          Mostrando {displayedNatures.slice(0, visibleNaturesLimit).length} de {displayedNatures.length} naturezas específicas cadastradas. Clique para filtrar.
                        </p>
                        {selectedNature && (
                          <button
                            onClick={() => setSelectedNature(null)}
                            className="text-xs text-rose-600 hover:underline font-semibold"
                          >
                            Limpar filtro
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {displayedNatures.slice(0, visibleNaturesLimit).map((nat) => {
                          const isSelected = selectedNature?.toLowerCase() === nat.name.toLowerCase();
                          const approvedPct = nat.total > 0 ? Math.round((nat.approved / nat.total) * 100) : 0;
                          const rejectedPct = nat.total > 0 ? Math.round((nat.rejected / nat.total) * 100) : 0;

                          return (
                            <div
                              key={nat.name}
                              onClick={() => setSelectedNature(isSelected ? null : nat.name)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-brand-50/90 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                                  : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <span className="text-xs font-bold text-slate-900 line-clamp-2" title={nat.name}>
                                    {nat.name}
                                  </span>
                                  <span className="inline-block text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                                    {nat.macroType}
                                  </span>
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shrink-0">
                                  {nat.total} {nat.total === 1 ? 'obra' : 'obras'}
                                </span>
                              </div>

                              <div className="mt-3">
                                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                  <div style={{ width: `${approvedPct}%` }} className="h-full bg-emerald-500" />
                                  <div style={{ width: `${rejectedPct}%` }} className="h-full bg-rose-400" />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
                                  <span className="text-emerald-700 font-bold">{nat.approved} aceito{nat.approved !== 1 ? 's' : ''} ({approvedPct}%)</span>
                                  <span className="text-rose-700">{nat.rejected} recusado{nat.rejected !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {displayedNatures.length > visibleNaturesLimit && (
                        <div className="pt-2 text-center">
                          <button
                            onClick={() => setVisibleNaturesLimit(prev => prev + 24)}
                            className="px-4 py-2 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-all"
                          >
                            Carregar mais naturezas ({displayedNatures.length - visibleNaturesLimit} restantes)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: DISTRIBUTION BY CATEGORY / KNOWLEDGE AREA */}
              {analyticsSection === 'categories' && (
                <div className="space-y-6">
                  {/* Header & Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Categorias e Áreas do Conhecimento ({categoryStats.totalCategories})
                      </h4>
                      <p className="text-xs text-slate-500">
                        Clique em qualquer categoria para filtrar instantaneamente as publicações daquela área no acervo
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        <select
                          value={categorySortBy}
                          onChange={(e) => setCategorySortBy(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none"
                        >
                          <option value="total">Mais Obras</option>
                          <option value="approved">Mais Aceitos</option>
                          <option value="name">Alfabética</option>
                        </select>
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar categoria ou área..."
                          value={categorySearchTerm}
                          onChange={(e) => setCategorySearchTerm(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedCategory && (
                    <div className="flex items-center justify-between p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 font-semibold">
                      <span>Filtrando acervo por categoria: <strong>{selectedCategory}</strong></span>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-purple-700 hover:text-purple-900 underline"
                      >
                        Limpar filtro
                      </button>
                    </div>
                  )}

                  {/* Categories Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayedCategories.slice(0, visibleCategoriesLimit).map((cat) => {
                      const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
                      const approvedPct = cat.total > 0 ? Math.round((cat.approved / cat.total) * 100) : 0;
                      const rejectedPct = cat.total > 0 ? Math.round((cat.rejected / cat.total) * 100) : 0;

                      return (
                        <div
                          key={cat.name}
                          onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                              : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 line-clamp-2" title={cat.name}>
                              {cat.name}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shrink-0">
                              {cat.total} {cat.total === 1 ? 'obra' : 'obras'}
                            </span>
                          </div>

                          <div className="mt-3">
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                              <div style={{ width: `${approvedPct}%` }} className="h-full bg-emerald-500" title={`${cat.approved} aceitos`} />
                              <div style={{ width: `${rejectedPct}%` }} className="h-full bg-rose-400" title={`${cat.rejected} recusados`} />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                              <span className="text-emerald-700 font-bold">{cat.approved} aceito{cat.approved !== 1 ? 's' : ''} ({approvedPct}%)</span>
                              <span className="text-rose-700">{cat.rejected} recusado{cat.rejected !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {displayedCategories.length > visibleCategoriesLimit && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={() => setVisibleCategoriesLimit(prev => prev + 24)}
                        className="px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all"
                      >
                        Carregar mais categorias ({displayedCategories.length - visibleCategoriesLimit} restantes)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: DISTRIBUTION BY YEAR */}
              {analyticsSection === 'years' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Distribuição Temporal das Obras ({yearStats.minYear} — {yearStats.maxYear})</h4>
                      <p className="text-xs text-slate-500">
                        Clique em uma barra para filtrar automaticamente as publicações daquele ano
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
                        <span className="text-slate-600">Aceitos</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" />
                        <span className="text-slate-600">Recusados</span>
                      </div>
                    </div>
                  </div>

                  {/* Year Histogram Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-13 gap-2.5 pt-4">
                    {yearStats.list.map(item => {
                      const isSelected = selectedYear === item.year;
                      const approvedPct = item.total > 0 ? (item.approved / item.total) * 100 : 0;
                      const heightPct = Math.max(14, Math.round((item.total / yearStats.maxTotalYear) * 100));

                      return (
                        <div
                          key={item.year}
                          onClick={() => setSelectedYear(isSelected ? null : item.year)}
                          className={`group flex flex-col items-center p-2.5 rounded-2xl cursor-pointer transition-all border ${
                            isSelected 
                              ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20 shadow-sm' 
                              : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80 hover:border-slate-200'
                          }`}
                        >
                          {/* Total badge */}
                          <div className="text-[11px] font-bold text-slate-700 mb-2">
                            {item.total}
                          </div>

                          {/* Graphical Bar Container */}
                          <div className="w-full h-32 bg-slate-200/60 rounded-xl overflow-hidden flex flex-col-reverse relative p-0.5">
                            {/* Rejected portion */}
                            <div 
                              style={{ height: `${heightPct}%` }}
                              className="w-full bg-rose-400 rounded-lg flex flex-col-reverse overflow-hidden transition-all group-hover:brightness-105"
                            >
                              {/* Approved portion stacked inside or bottom */}
                              {item.approved > 0 && (
                                <div 
                                  style={{ height: `${approvedPct}%` }}
                                  className="w-full bg-emerald-500 transition-all"
                                  title={`${item.approved} aceitos em ${item.year}`}
                                />
                              )}
                            </div>
                          </div>

                          {/* Year label */}
                          <div className="mt-2 text-center">
                            <span className={`text-xs font-bold block ${isSelected ? 'text-brand-700' : 'text-slate-800'}`}>
                              {item.year}
                            </span>
                            <div className="text-[9px] text-slate-400 mt-0.5 font-medium">
                              {item.approved > 0 ? (
                                <span className="text-emerald-700 font-bold">{item.approved} aceito{item.approved > 1 ? 's' : ''}</span>
                              ) : (
                                <span>0 aceitos</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Year Quick Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-slate-400 uppercase text-[10px] font-bold block tracking-wider">Ano com Mais Aceites</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {yearStats.yearWithMostApproved ? (
                          <>
                            Ano {yearStats.yearWithMostApproved.year} ({yearStats.yearWithMostApproved.approved} aprovados de {yearStats.yearWithMostApproved.total})
                          </>
                        ) : '—'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-slate-400 uppercase text-[10px] font-bold block tracking-wider">Ano com Mais Submissões</span>
                      <p className="text-sm font-bold text-slate-800 mt-1">
                        {yearStats.yearWithMostTotal ? (
                          <>
                            Ano {yearStats.yearWithMostTotal.year} ({yearStats.yearWithMostTotal.total} trabalhos avaliados)
                          </>
                        ) : '—'}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl">
                      <span className="text-slate-400 uppercase text-[10px] font-bold block tracking-wider">Filtro de Ano Ativo</span>
                      <p className="text-sm font-bold text-brand-700 mt-1 flex items-center justify-between">
                        <span>{selectedYear ? `Filtrando por ${selectedYear}` : 'Nenhum (mostrando todos)'}</span>
                        {selectedYear && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedYear(null); }}
                            className="text-slate-400 hover:text-slate-700 underline text-xs ml-2 font-normal"
                          >
                            Remover
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: DISTRIBUTION BY AUTHOR */}
              {analyticsSection === 'authors' && (
                <div className="space-y-6">
                  {/* Top bar with subtabs and search */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                      <button
                        onClick={() => setAuthorViewMode('paperAuthors')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          authorViewMode === 'paperAuthors'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Autores das Obras ({authorStats.totalUnique})
                      </button>
                      <button
                        onClick={() => setAuthorViewMode('submitters')}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          authorViewMode === 'submitters'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Pesquisadores / Ligantes ({submitterStats.length})
                      </button>
                    </div>

                    {/* Sorting & Search */}
                    <div className="flex items-center gap-3">
                      {authorViewMode === 'paperAuthors' && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <select
                            value={authorSortBy}
                            onChange={(e) => setAuthorSortBy(e.target.value as any)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none"
                          >
                            <option value="total">Mais Obras</option>
                            <option value="approved">Mais Aceitos</option>
                            <option value="name">Alfabética</option>
                          </select>
                        </div>
                      )}

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder={authorViewMode === 'paperAuthors' ? "Buscar autor..." : "Buscar pesquisador..."}
                          value={authorSearchTerm}
                          onChange={(e) => setAuthorSearchTerm(e.target.value)}
                          className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Paper Authors View */}
                  {authorViewMode === 'paperAuthors' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">
                        Clique em um autor para filtrar as publicações dele no acervo abaixo.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {displayedAuthors.slice(0, visibleAuthorsLimit).map((author) => {
                          const isSelected = selectedAuthor?.toLowerCase() === author.name.toLowerCase();
                          const approvedPct = author.total > 0 ? (author.approved / author.total) * 100 : 0;

                          return (
                            <div
                              key={author.name}
                              onClick={() => setSelectedAuthor(isSelected ? null : author.name)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                                  : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-bold text-slate-900 line-clamp-2" title={author.name}>
                                  {author.name}
                                </span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shrink-0">
                                  {author.total} {author.total === 1 ? 'obra' : 'obras'}
                                </span>
                              </div>

                              {/* Progress bar of accepted vs rejected */}
                              <div className="mt-3">
                                <div className="w-full h-2 bg-rose-200 rounded-full overflow-hidden flex">
                                  <div 
                                    style={{ width: `${approvedPct}%` }}
                                    className="h-full bg-emerald-500"
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
                                  <span className="text-emerald-700 font-bold">{author.approved} aceito{author.approved !== 1 ? 's' : ''}</span>
                                  <span className="text-rose-700">{author.rejected} recusado{author.rejected !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {displayedAuthors.length > visibleAuthorsLimit && (
                        <div className="text-center pt-2">
                          <button
                            onClick={() => setVisibleAuthorsLimit(prev => prev + 18)}
                            className="px-5 py-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                          >
                            Mostrar mais autores (+18) · Total de {displayedAuthors.length}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submitters / Ligantes View */}
                  {authorViewMode === 'submitters' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">
                        Distribuição das submissões por integrante/pesquisador da liga. Clique para filtrar por pesquisador.
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {submitterStats
                          .filter(s => !authorSearchTerm.trim() || s.name.toLowerCase().includes(authorSearchTerm.toLowerCase()) || s.email.toLowerCase().includes(authorSearchTerm.toLowerCase()))
                          .map((submitter) => {
                            const isSelected = selectedSubmitter?.toLowerCase() === submitter.email.toLowerCase();
                            const approvedPct = submitter.total > 0 ? (submitter.approved / submitter.total) * 100 : 0;

                            return (
                              <div
                                key={submitter.email}
                                onClick={() => setSelectedSubmitter(isSelected ? null : submitter.email)}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-500/20 shadow-xs'
                                    : 'bg-slate-50/50 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h5 className="text-xs font-bold text-slate-900 leading-tight">{submitter.name}</h5>
                                      <p className="text-[10px] text-slate-400">{submitter.email}</p>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shrink-0">
                                      {submitter.total}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <div className="w-full h-2 bg-rose-200 rounded-full overflow-hidden flex">
                                    <div 
                                      style={{ width: `${approvedPct}%` }}
                                      className="h-full bg-emerald-500"
                                    />
                                  </div>
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
                                    <span className="text-emerald-700 font-bold">{submitter.approved} aceito{submitter.approved !== 1 ? 's' : ''} ({submitter.rate}%)</span>
                                    <span className="text-rose-700">{submitter.rejected} recusado{submitter.rejected !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: OVERVIEW COMPARATIVE */}
              {analyticsSection === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Comparative Card: Anos em Destaque */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Anos</h4>
                        </div>
                        <button
                          onClick={() => setAnalyticsSection('years')}
                          className="text-xs text-brand-600 hover:underline font-semibold"
                        >
                          Ver todos
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {[...yearStats.list].sort((a, b) => b.total - a.total).slice(0, 5).map(y => (
                          <div 
                            key={y.year}
                            onClick={() => setSelectedYear(selectedYear === y.year ? null : y.year)}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-300 cursor-pointer transition-all text-xs"
                          >
                            <span className="font-bold text-slate-800">Ano {y.year}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-700 font-semibold">{y.approved} ac.</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{y.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comparative Card: Autores com mais aprovações */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-brand-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Autores</h4>
                        </div>
                        <button
                          onClick={() => setAnalyticsSection('authors')}
                          className="text-xs text-brand-600 hover:underline font-semibold"
                        >
                          Ver todos
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {authorStats.list.filter(a => a.approved > 0).slice(0, 5).map(a => (
                          <div 
                            key={a.name}
                            onClick={() => setSelectedAuthor(selectedAuthor === a.name ? null : a.name)}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-300 cursor-pointer transition-all text-xs"
                          >
                            <span className="font-bold text-slate-800 truncate max-w-[130px]" title={a.name}>{a.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                {a.approved} apr.
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comparative Card: Top Naturezas */}
                    <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-brand-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Top Naturezas</h4>
                        </div>
                        <button
                          onClick={() => setAnalyticsSection('natures')}
                          className="text-xs text-brand-600 hover:underline font-semibold"
                        >
                          Ver todas ({natureStats.totalTypes})
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {natureStats.macroList.slice(0, 5).map(m => (
                          <div 
                            key={m.name}
                            onClick={() => setSelectedNature(selectedNature === `macro:${m.name}` ? null : `macro:${m.name}`)}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-300 cursor-pointer transition-all text-xs"
                          >
                            <span className="font-bold text-slate-800 truncate max-w-[130px]" title={m.name}>{m.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-700 font-semibold">{m.approved} ac.</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">{m.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comparative Card: Top Categorias */}
                    <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-purple-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">Top Categorias</h4>
                        </div>
                        <button
                          onClick={() => setAnalyticsSection('categories')}
                          className="text-xs text-purple-700 hover:underline font-semibold"
                        >
                          Ver todas ({categoryStats.totalCategories})
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {categoryStats.list.slice(0, 5).map(c => (
                          <div 
                            key={c.name}
                            onClick={() => setSelectedCategory(selectedCategory === c.name ? null : c.name)}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-purple-100 hover:border-purple-300 cursor-pointer transition-all text-xs"
                          >
                            <span className="font-bold text-slate-800 truncate max-w-[130px]" title={c.name}>{c.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-700 font-semibold">{c.approved} ac.</span>
                              <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md">{c.total}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Status Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'all' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Todos</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                {stats.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'approved' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Aceitos</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono">
                {stats.approved}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'rejected' 
                  ? 'bg-white text-rose-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Recusados</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 font-mono">
                {stats.rejected}
              </span>
            </button>
          </div>

          {/* Filters Row: Natureza, Categoria, Search */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Filter by Natureza Dropdown */}
            <div className="relative min-w-[170px] flex-1 sm:flex-initial">
              <select
                value={selectedNature || ''}
                onChange={(e) => setSelectedNature(e.target.value || null)}
                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl academic-shadow text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Todas as Naturezas ({natureStats.totalTypes})</option>
                <optgroup label="Tipos Principais (Macros)">
                  {natureStats.macroList.map(m => (
                    <option key={`macro:${m.name}`} value={`macro:${m.name}`}>
                      {m.name} ({m.total})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Naturezas Específicas Detalhadas">
                  {natureStats.specificList.map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name.length > 50 ? s.name.substring(0, 48) + '...' : s.name} ({s.total})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Filter by Category Dropdown */}
            <div className="relative min-w-[170px] flex-1 sm:flex-initial">
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl academic-shadow text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="">Todas as Categorias ({categoryStats.totalCategories})</option>
                {categoryStats.list.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name.length > 40 ? c.name.substring(0, 38) + '...' : c.name} ({c.total})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative group min-w-[220px] flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="text"
                placeholder="Buscar obra, autor, revista, natureza..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl academic-shadow focus:ring-2 focus:ring-brand-500/20 outline-none text-xs text-slate-900 placeholder:text-slate-400 font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-brand-50/60 border border-brand-100 rounded-2xl">
            <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filtros ativos:
            </span>

            {selectedNature !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-200 rounded-xl text-xs font-semibold text-brand-800 shadow-2xs">
                <Bookmark className="w-3 h-3 text-brand-500" />
                Natureza: {selectedNature.startsWith('macro:') ? `Tipo ${selectedNature.replace('macro:', '')}` : selectedNature}
                <button onClick={() => setSelectedNature(null)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-purple-200 rounded-xl text-xs font-semibold text-purple-800 shadow-2xs">
                <Tag className="w-3 h-3 text-purple-500" />
                Categoria: {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedYear !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-200 rounded-xl text-xs font-semibold text-brand-800 shadow-2xs">
                <Calendar className="w-3 h-3 text-brand-500" />
                Ano: {selectedYear}
                <button onClick={() => setSelectedYear(null)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedAuthor !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-200 rounded-xl text-xs font-semibold text-brand-800 shadow-2xs">
                <User className="w-3 h-3 text-brand-500" />
                Autor: {selectedAuthor}
                <button onClick={() => setSelectedAuthor(null)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSubmitter !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-200 rounded-xl text-xs font-semibold text-brand-800 shadow-2xs">
                <User className="w-3 h-3 text-brand-500" />
                Pesquisador: {selectedSubmitter}
                <button onClick={() => setSelectedSubmitter(null)} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchTerm.trim().length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-brand-200 rounded-xl text-xs font-semibold text-brand-800 shadow-2xs">
                Busca: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="hover:text-rose-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 font-bold ml-auto px-2 py-1 rounded-lg hover:bg-brand-100/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar todos
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 px-1 font-medium gap-3">
          <span>
            {filteredPublications.length > 0 ? (
              <>
                Exibindo <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> a <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredPublications.length)}</strong> de <strong className="text-slate-800">{filteredPublications.length}</strong> publicações filtradas (Total no banco: {publications.length})
              </>
            ) : (
              <>Nenhuma publicação corresponde aos filtros (Total no banco: {publications.length})</>
            )}
          </span>

          {filteredPublications.length > 0 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-slate-400 font-medium">Itens por página:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 transition-colors"
              >
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
                <option value={filteredPublications.length}>Mostrar todas ({filteredPublications.length})</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Publications List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {paginatedPublications.map((pub, idx) => (
            <motion.div 
              key={pub.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
              className="bg-white rounded-3xl academic-shadow border border-slate-100 hover:border-brand-200 transition-all group overflow-hidden flex flex-col md:flex-row"
            >
              <div className={`w-2 md:w-3 shrink-0 ${
                pub.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />

              <div className="flex-1 p-6 md:p-8">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSelectedNature(pub.nature)}
                        className="px-3 py-1 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-slate-200 transition-colors flex items-center gap-1"
                        title="Filtrar por esta natureza"
                      >
                        <Bookmark className="w-3 h-3" />
                        {pub.nature}
                      </button>

                      {pub.knowledge_area && (
                        <button
                          onClick={() => setSelectedCategory(cleanCategoryName(pub.knowledge_area))}
                          className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-100 transition-colors flex items-center gap-1"
                          title="Filtrar por esta categoria / área"
                        >
                          <Tag className="w-3 h-3" />
                          {cleanCategoryName(pub.knowledge_area)}
                        </button>
                      )}

                      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                        pub.status === 'approved' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {pub.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                      </span>
                      {pub.year && (
                        <button
                          onClick={() => setSelectedYear(pub.year)}
                          className="px-2.5 py-0.5 text-[10px] font-bold text-slate-500 hover:text-brand-600 rounded-md bg-slate-50 hover:bg-brand-50 transition-colors"
                        >
                          Ano {pub.year}
                        </button>
                      )}
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 leading-tight">
                      {pub.title}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-xs md:text-sm">
                      <User className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{pub.authors}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
                        {pub.user_name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-700">{pub.user_name}</span>
                        <span className="text-[9px] text-slate-400 leading-none">{pub.user_email}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ml-1 ${
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
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {pub.journal_name && (
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        <BookOpen className="w-4 h-4 text-brand-400 shrink-0" />
                        <span>{pub.journal_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <Calendar className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{pub.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <Globe className="w-4 h-4 text-brand-400 shrink-0" />
                      <span>{pub.knowledge_area}</span>
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
                      <Tag className="w-4 h-4 text-brand-400 shrink-0" />
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
                    <span>Detalhes Completos</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Pagination Navigation Controls */}
        {filteredPublications.length > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-100 academic-shadow mt-4">
            <span className="text-xs text-slate-500 font-medium">
              Página <strong className="text-slate-800">{currentPage}</strong> de <strong className="text-slate-800">{totalPages}</strong> ({filteredPublications.length} resultados)
            </span>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {/* Number buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = currentPage;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 500, behavior: 'smooth' });
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredPublications.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Nenhum registro encontrado</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2 text-xs md:text-sm">
              Não há trabalhos que correspondam aos filtros selecionados.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Limpar filtros de busca
              </button>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {viewingPub && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] academic-shadow border border-slate-100 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 bg-brand-900 text-white flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/10 backdrop-blur-sm">
                      {viewingPub.nature}
                    </span>
                    {viewingPub.knowledge_area && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-200 text-[10px] font-bold uppercase tracking-widest rounded-full border border-purple-400/20 backdrop-blur-sm">
                        {cleanCategoryName(viewingPub.knowledge_area)}
                      </span>
                    )}
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                      viewingPub.status === 'approved' ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/20' :
                      viewingPub.status === 'rejected' ? 'bg-rose-500/20 text-rose-200 border-rose-500/20' :
                      'bg-amber-500/20 text-amber-200 border-amber-500/20'
                    }`}>
                      {viewingPub.status === 'approved' ? 'Aprovado' : 
                       viewingPub.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold leading-tight">
                    {viewingPub.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setViewingPubId(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Autores</p>
                    <p className="text-sm text-slate-700 font-medium">{viewingPub.authors}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ano / Área do Conhecimento</p>
                    <p className="text-sm text-slate-700 font-medium">{viewingPub.year} &bull; {viewingPub.knowledge_area}</p>
                  </div>
                </div>

                {viewingPub.journal_name && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome da Revista</p>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-brand-500 shrink-0" />
                        <p className="text-sm text-slate-700 font-bold">{viewingPub.journal_name}</p>
                      </div>
                      {RESOURCE_JOURNAL_MAPPING[viewingPub.journal_name] && (
                        <a 
                          href={RESOURCE_JOURNAL_MAPPING[viewingPub.journal_name]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-brand-100 transition-all shrink-0"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Periódico
                        </a>
                      )}
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
                      <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critério de Inclusão</p>
                    <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                      viewingPub.inclusion_criterion === 'Não incluso' 
                        ? 'bg-rose-50 text-rose-700 border-rose-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}>
                      {viewingPub.inclusion_criterion === 'Não incluso' ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
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
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
