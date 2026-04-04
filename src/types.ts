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

export type PublicationStatus = 'pending' | 'approved' | 'rejected';

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
  user_role: 'ligante' | 'professor';
  status: PublicationStatus;
  link?: string;
  review_comment?: string;
  reviewed_by_name?: string;
  reviewed_by_role?: 'ligante' | 'professor';
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'ligante' | 'professor';
  created_at: string;
}

export interface AdminAssignment {
  id: string;
  admin_email: string;
  assigned_user_email: string;
  created_by_email?: string;
  created_at: string;
}

export interface AcademicResource {
  id: string;
  title: string;
  url: string;
  description?: string;
  category: 'Repositório' | 'Revista' | 'Outro';
  created_by_email?: string;
  created_at: string;
}

export interface UserResourceAccess {
  id: string;
  resource_id: string;
  user_email: string;
  granted_by_email: string;
  created_at: string;
}

export type PublicationInsert = Omit<Publication, 'id' | 'created_at'>;
