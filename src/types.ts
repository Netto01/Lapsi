export type NaturezaPublicacao = 
  | 'Artigo' 
  | 'TCC' 
  | 'TCR' 
  | 'TCC de especialização' 
  | 'Dissertação' 
  | 'Tese';

export type CriterioInclusao = 
  | 'Pela leitura do título' 
  | 'Pela leitura do resumo' 
  | 'Pela leitura do artigo completo' 
  | 'Não incluso';

export interface Publication {
  id: string;
  created_at: string;
  authors: string;
  title: string;
  abstract: string;
  year: number;
  database: string;
  nature: NaturezaPublicacao;
  inclusion_criterion: CriterioInclusao;
  reason: string;
  user_name: string;
  user_email: string;
}

export type PublicationInsert = Omit<Publication, 'id' | 'created_at'>;
