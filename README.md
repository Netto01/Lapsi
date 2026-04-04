# LAPSI - Liga Acadêmica de Psicologia e Saúde Mental

O **LAPSI** é uma plataforma acadêmica robusta desenvolvida para a gestão, organização e revisão de evidências científicas. O sistema permite que ligantes submetam seus trabalhos e publicações para uma banca avaliadora, garantindo um fluxo de trabalho estruturado e transparente.

## 🚀 Funcionalidades Principais

### Para Ligantes
- **Submissão de Publicações**: Formulário detalhado para registro de artigos, resumos e outras produções acadêmicas.
- **Dashboard Pessoal**: Acompanhamento em tempo real do status de cada submissão (Pendente, Aprovado ou Rejeitado).
- **Critérios de Inclusão**: Acesso rápido às diretrizes acadêmicas da Liga.
- **Estatísticas**: Visualização do progresso individual e coletivo da produção científica.

### Para Administradores (Banca)
- **Fila de Revisão**: Painel exclusivo para análise de trabalhos submetidos por ligantes atribuídos.
- **Feedback Acadêmico**: Possibilidade de aprovar ou rejeitar registros com comentários justificativos.
- **Rastreabilidade**: Identificação automática de qual administrador realizou cada revisão.

### Para Super Administradores
- **Gestão de Permissões**: Controle total sobre qual administrador é responsável por revisar cada ligante.
- **Auditoria**: Visualização de quem concedeu cada permissão no sistema.
- **Visão Geral**: Acesso a todos os registros e estatísticas globais da plataforma.

### Consulta Pública
- **Arquivo de Revisão**: Repositório centralizado de todos os trabalhos aceitos e recusados, servindo como base de conhecimento para a Liga.

## 🛠️ Stack Tecnológica

- **Frontend**: [React](https://reactjs.org/) com [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL + GoTrue)

## ⚙️ Configuração do Ambiente

O sistema utiliza o Supabase para persistência de dados e autenticação. Para rodar o projeto, são necessárias as seguintes variáveis de ambiente:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Estrutura do Banco de Dados (SQL)

Para o funcionamento correto, as seguintes tabelas devem ser criadas no Supabase:

1. **`profiles`**: Armazena dados dos usuários (nome, e-mail, papel).
2. **`publications`**: Armazena os registros acadêmicos submetidos.
3. **`admin_assignments`**: Gerencia as permissões de revisão entre admins e ligantes.

## 📄 Licença

Este projeto é de uso exclusivo da **Liga Acadêmica de Psicologia e Saúde Mental (LAPSI)**.

---
*Desenvolvido para elevar o padrão da pesquisa acadêmica em Saúde Mental.*
