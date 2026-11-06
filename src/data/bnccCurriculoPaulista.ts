import { BnccLevel, KnowledgeArea, RiskProfile, SubjectInfo, QuintaMencaoStatus } from '../types/education.ts';

export const KNOWLEDGE_AREAS: Record<KnowledgeArea, { name: string; description: string; color: string; border: string }> = {
  linguagens: {
    name: 'Linguagens e suas Tecnologias',
    description: 'Língua Portuguesa, Arte, Educação Física, Língua Inglesa e Redação',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    border: '#2563eb'
  },
  matematica: {
    name: 'Matemática e suas Tecnologias',
    description: 'Matemática e Raciocínio Lógico-Quantitativo',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    border: '#4f46e5'
  },
  ciencias_natureza: {
    name: 'Ciências da Natureza',
    description: 'Ciências, Física, Química e Biologia',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    border: '#059669'
  },
  ciencias_humanas: {
    name: 'Ciências Humanas e Sociais Aplicadas',
    description: 'História e Geografia',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    border: '#d97706'
  },
  inova_educacao: {
    name: 'Inova Educação / Aprofundamento',
    description: 'Projeto de Vida, Orientação de Estudos I e II',
    color: 'bg-purple-50 text-purple-800 border-purple-200',
    border: '#7c3aed'
  }
};

// Exact subjects from official SEDUC-SP Registro e Controle do Rendimento Escolar (image_3e34e4b4.png)
export const OFFICIAL_SP_SUBJECTS: SubjectInfo[] = [
  { code: 'ART', name: 'Arte', shortName: 'Arte', area: 'linguagens', totalAulas: 10 },
  { code: 'CIEN', name: 'Ciências', shortName: 'Ciências', area: 'ciencias_natureza', totalAulas: 40 },
  { code: 'EDF', name: 'Educação Física', shortName: 'Ed. Física', area: 'linguagens', totalAulas: 20 },
  { code: 'GEO', name: 'Geografia', shortName: 'Geografia', area: 'ciencias_humanas', totalAulas: 21 },
  { code: 'HIST', name: 'História', shortName: 'História', area: 'ciencias_humanas', totalAulas: 30 },
  { code: 'ING', name: 'Língua Inglesa', shortName: 'Inglês', area: 'linguagens', totalAulas: 19 },
  { code: 'LP', name: 'Língua Portuguesa', shortName: 'Português', area: 'linguagens', totalAulas: 42 },
  { code: 'MAT', name: 'Matemática', shortName: 'Matemática', area: 'matematica', totalAulas: 50 },
  { code: 'OE1', name: 'Orientação de Estudos I', shortName: 'Orient. I', area: 'inova_educacao', totalAulas: 24 },
  { code: 'OE2', name: 'Orientação de Estudos II', shortName: 'Orient. II', area: 'inova_educacao', totalAulas: 20 },
  { code: 'PV', name: 'Projeto de Vida', shortName: 'Proj. Vida', area: 'inova_educacao', totalAulas: 10 },
  { code: 'RED', name: 'Redação e Leitura', shortName: 'Redação', area: 'linguagens', totalAulas: 24 }
];

export const BNCC_LEVEL_CONFIG: Record<BnccLevel, {
  label: string;
  gradeRange: string;
  description: string;
  actionRequired: string;
  badgeClass: string;
  barColor: string;
}> = {
  abaixo_do_basico: {
    label: 'Abaixo do Básico',
    gradeRange: '0,0 a 4,9',
    description: 'Não consolidou as habilidades essenciais do bimestre no Currículo Paulista.',
    actionRequired: 'Recuperação Contínua imediata e elaboração de PDI (Plano de Desenvolvimento Individual).',
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
    barColor: '#e11d48'
  },
  basico: {
    label: 'Básico',
    gradeRange: '5,0 a 6,9 (EP)',
    description: 'Desenvolveu parcialmente as habilidades mínimas (Engajamento Parcial).',
    actionRequired: 'Atividades direcionadas de nivelamento e consolidação.',
    badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    barColor: '#d97706'
  },
  adequado: {
    label: 'Adequado',
    gradeRange: '7,0 a 8,9 (ES)',
    description: 'Domínio satisfatório das competências (Engajamento Satisfatório).',
    actionRequired: 'Manutenção do ritmo e incentivo à autonomia nos estudos.',
    badgeClass: 'text-blue-700 bg-blue-50 border-blue-200',
    barColor: '#2563eb'
  },
  avancado: {
    label: 'Avançado',
    gradeRange: '9,0 a 10,0 (ET)',
    description: 'Pleno domínio cognitivo e procedimental (Engajamento Total).',
    actionRequired: 'Projetos de aprofundamento, iniciação científica e monitoria entre pares.',
    badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    barColor: '#059669'
  }
};

export const BNCC_GENERAL_COMPETENCIES = [
  { id: 1, title: 'Conhecimento', description: 'Valorizar e utilizar os conhecimentos sobre o mundo físico, social, cultural e digital.' },
  { id: 2, title: 'Pensamento Científico, Crítico e Criativo', description: 'Exercitar a curiosidade intelectual e recorrer à abordagem própria das ciências.' },
  { id: 3, title: 'Repertório Cultural', description: 'Valorizar e fruir as diversas manifestações artísticas e culturais.' },
  { id: 4, title: 'Comunicação', description: 'Utilizar diferentes linguagens para expressar e partilhar informações e sentimentos.' },
  { id: 5, title: 'Cultura Digital', description: 'Compreender, utilizar e criar tecnologias digitais de forma crítica, significativa e ética.' },
  { id: 6, title: 'Trabalho e Projeto de Vida', description: 'Valorizar a diversidade de saberes e vivências culturais e apropriar-se de conhecimentos.' },
  { id: 7, title: 'Argumentação', description: 'Argumentar com base em fatos, dados e informações confiáveis.' },
  { id: 8, title: 'Autoconhecimento e Autocuidado', description: 'Conhecer-se, apreciar-se e cuidar de sua saúde física e emocional.' },
  { id: 9, title: 'Empatia e Cooperação', description: 'Exercitar a empatia, o diálogo, a resolução de conflitos e a cooperação.' },
  { id: 10, title: 'Responsabilidade e Cidadania', description: 'Agir pessoal e coletivamente com autonomia, responsabilidade e flexibilidade.' }
];

export const CURRICULO_PAULISTA_ESSENTIAL_SKILLS: Record<string, string[]> = {
  LP: [
    'EF09LP01: Analisar criticamente textos argumentativos e de divulgação científica.',
    'EF09LP04: Produzir artigos de opinião e editoriais com posicionamento ético fundamentado.',
    'EF09LP08: Identificar e analisar efeitos de sentido em figuras de linguagem e escolhas lexicais.'
  ],
  MAT: [
    'EF09MA06: Compreender as funções afim e quadrática e suas representações gráficas.',
    'EF09MA04: Resolver problemas com porcentagens sucessivas e juros simples/compostos.',
    'EF09MA13: Reconhecer e calcular relações métricas no triângulo retângulo (Teorema de Pitágoras).'
  ],
  CIEN: [
    'EF09CI01: Investigar as mudanças de estado da matéria e a estrutura atômica básica.',
    'EF09CI09: Discutir as ideias de seleção natural e evolução biológica a partir de evidências fósseis.'
  ],
  HIST: [
    'EF09HI01: Analisar o processo de proclamação da República no Brasil e seus desdobramentos sociopolíticos.',
    'EF09HI10: Identificar os mecanismos de segregação e as lutas por direitos civis.'
  ],
  GEO: [
    'EF09GE02: Analisar a integração do continente europeu e as disparidades econômicas globais.',
    'EF09GE14: Avaliar os impactos ambientais da urbanização acelerada e matrizes energéticas.'
  ],
  ING: [
    'EF09LI05: Identificar argumentos e contra-argumentos em textos orais e escritos em língua inglesa.',
    'EF09LI14: Utilizar marcadores discursivos para coesão textual em produções autônomas.'
  ],
  PV: [
    'BNCC-PV01: Mapear valores pessoais, aspirações acadêmicas e metas profissionais a médio prazo.',
    'BNCC-PV02: Desenvolver rotina de auto-organização, gestão do tempo e resiliência acadêmica.'
  ],
  RED: [
    'EF09LP03: Produzir textos em conformidade com o padrão da Redação Paulista (SEDUC-SP).',
    'EF09LP07: Desenvolver repertório legitimado e proposta de intervenção social fundamentada.'
  ]
};

export function getBnccLevel(grade: number): BnccLevel {
  if (grade < 5.0) return 'abaixo_do_basico';
  if (grade < 7.0) return 'basico';
  if (grade < 9.0) return 'adequado';
  return 'avancado';
}

export function parseMentionToGrade(mention: any): { grade: number; display: string } {
  if (mention === null || mention === undefined || mention === '' || mention === '-') {
    return { grade: 0, display: '-' };
  }
  const str = String(mention).trim().toUpperCase();
  if (str === 'ET') return { grade: 10.0, display: 'ET' }; // Engajamento Total
  if (str === 'ES') return { grade: 8.0, display: 'ES' }; // Engajamento Satisfatório
  if (str === 'EP') return { grade: 6.0, display: 'EP' }; // Engajamento Parcial
  
  const num = parseFloat(str.replace(',', '.'));
  if (!isNaN(num)) {
    const clamped = Math.min(10, Math.max(0, Math.round(num * 10) / 10));
    return { grade: clamped, display: String(clamped) };
  }
  return { grade: 0, display: str };
}

export function getRiskProfile(averageGrade: number, attendanceRate: number, situation?: string): RiskProfile {
  if (situation === 'Não Comparecimento' || situation === 'Baixa - Transferência' || situation === 'Transferido') {
    return 'inativo';
  }
  if (averageGrade >= 9.0 && attendanceRate >= 90) return 'excelencia';
  if (averageGrade < 5.0 && attendanceRate < 75) return 'risco_critico';
  if (averageGrade < 5.0) return 'risco_academico';
  if (attendanceRate < 75) return 'alerta_frequencia';
  return 'regular';
}

export function getRiskProfileInfo(risk: RiskProfile): { label: string; description: string; badge: string; color: string } {
  switch (risk) {
    case 'risco_critico':
      return {
        label: 'Risco Crítico (Duplo)',
        description: 'Nota < 5,0 e Frequência < 75%. Urgência: Busca Ativa + PDI pedagógico.',
        badge: 'text-red-700 bg-red-50 border border-red-200',
        color: '#dc2626'
      };
    case 'risco_academico':
      return {
        label: 'Risco Acadêmico',
        description: 'Nota < 5,0 com Frequência regular. Necessita Recuperação Contínua.',
        badge: 'text-amber-700 bg-amber-50 border border-amber-200',
        color: '#d97706'
      };
    case 'alerta_frequencia':
      return {
        label: 'Alerta de Infrequência',
        description: 'Frequência < 75%. Risco de reprovação por faltas. Notificar responsáveis.',
        badge: 'text-orange-700 bg-orange-50 border border-orange-200',
        color: '#ea580c'
      };
    case 'excelencia':
      return {
        label: 'Excelência Pedagógica',
        description: 'Nota >= 9,0 e Frequência >= 90%. Perfil apto para monitoria e aprofundamento.',
        badge: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
        color: '#059669'
      };
    case 'inativo':
      return {
        label: 'Não Comparecimento / Transferido',
        description: 'Estudante com matrícula transferida ou abandono registrado na SED.',
        badge: 'text-slate-500 bg-slate-100 border border-slate-300',
        color: '#94a3b8'
      };
    case 'regular':
    default:
      return {
        label: 'Regular / Satisfatório',
        description: 'Nota >= 5,0 e Frequência >= 75%. Habilidades do bimestre consolidadas.',
        badge: 'text-slate-700 bg-slate-100 border border-slate-200',
        color: '#475569'
      };
  }
}
