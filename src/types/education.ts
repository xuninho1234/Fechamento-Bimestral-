export type BnccLevel = 'abaixo_do_basico' | 'basico' | 'adequado' | 'avancado';

export type KnowledgeArea = 
  | 'linguagens' 
  | 'matematica' 
  | 'ciencias_natureza' 
  | 'ciencias_humanas' 
  | 'inova_educacao';

export interface SubjectInfo {
  code: string;
  name: string;
  area: KnowledgeArea;
  shortName: string;
  totalAulas: number;
}

export type StudentSituation = 
  | 'Ativo' 
  | 'Baixa - Transferência' 
  | 'Transferido' 
  | 'Não Comparecimento';

export interface StudentSubjectGrade {
  subjectCode: string;
  subjectName: string;
  area: KnowledgeArea;
  mention: string; // Ex: "8", "10", "ET", "ES", "EP"
  grade: number; // 0.0 - 10.0
  absences: number; // F (Faltas)
  compensatedAbsences: number; // AC (Ausência Compensada)
  totalClasses: number; // Aulas dadas
  attendanceRate: number; // 0 - 100%
  bnccLevel: BnccLevel;
  needsRecovery: boolean;
  quintaMencaoGrade?: number; // 5ª Menção atribuída pelo Conselho
  quintaMencaoMention?: string; // Menção original da planilha ("8", "10", "ET", "ES", "EP")
  quintaMencaoObs?: string;
  finalGrade: number;
}

export type RiskProfile = 
  | 'regular' // Desempenho satisfatório (Nota >= 5.0, Freq >= 75%)
  | 'risco_academico' // Nota < 5.0, Freq >= 75%
  | 'alerta_frequencia' // Nota >= 5.0, Freq < 75%
  | 'risco_critico' // Nota < 5.0 e Freq < 75% (Duplo risco)
  | 'excelencia' // Nota >= 9.0 e Freq >= 90%
  | 'inativo'; // Não Comparecimento / Transferido

export type QuintaMencaoStatus = 
  | 'Aprovado' 
  | 'Aprovado pelo Conselho' 
  | 'Retido por Rendimento' 
  | 'Retido por Faltas' 
  | 'Retido por Rendimento e Faltas' 
  | 'Pendente';

export interface QuintaMencaoDeliberation {
  status: QuintaMencaoStatus;
  justification: string;
  updatedAt?: string;
  councilMembers?: string[];
  subjectAdjustments?: Record<string, { adjustedGrade: number; reason: string }>;
  isPlanilhaImported?: boolean;
  importedFileName?: string;
  importedAt?: string;
  importedBimesterSource?: string;
}

export interface StudentBimesterData {
  bimester: 1 | 2 | 3 | 4;
  grades: Record<string, StudentSubjectGrade>;
  overallAverage: number;
  totalAbsences: number; // TF
  totalCompensatedAbsences: number; // AC
  attendanceRate: number; // Fre(%)
  annualAbsences: number; // FT An
  annualAttendanceRate: number; // Fre An(%)
  bnccLevel: BnccLevel;
  needsRecoverySubjects: string[];
  areaAverages: Record<KnowledgeArea, number>;
  isLoaded: boolean;
}

export interface StudentRecord {
  id: string;
  number: number;
  ra: string;
  raDigit: string;
  raUf: string;
  name: string;
  situation: StudentSituation;
  classGroup: string; // Ex: 9º ANO A MANHA ANUAL
  bimester: number | '5ª Menção'; // Active displayed bimester
  year: number;
  bimesters: Record<1 | 2 | 3 | 4, StudentBimesterData>; // All bimesters history
  grades: Record<string, StudentSubjectGrade>; // Current active bimester grades
  overallAverage: number;
  totalAbsences: number; // TF
  totalCompensatedAbsences: number; // Soma de AC
  totalClasses: number;
  overallAttendanceRate: number; // Fre(%)
  annualAbsences: number; // FT An
  annualAttendanceRate: number; // Fre An(%)
  overallBnccLevel: BnccLevel;
  riskProfile: RiskProfile;
  needsRecoverySubjects: string[];
  areaAverages: Record<KnowledgeArea, number>;
  pedagogicalOpinion?: string;
  actionPlan?: string;
  councilDeliberation?: 'Aprovado' | 'Recuperação Contínua' | 'Busca Ativa' | 'Encaminhamento PDI';
  quintaMencao: QuintaMencaoDeliberation;
}

export interface ClassAnalysisSummary {
  schoolName: string;
  directorName: string;
  goeName: string;
  diretoriaEnsino: string;
  classGroup: string;
  teachingType: string;
  bimester: number | '5ª Menção';
  tipoFechamento: string;
  totalAulasDadas: number;
  year: number;
  totalStudents: number;
  totalActiveStudents: number;
  totalTransferredStudents: number;
  totalNonAttendingStudents: number;
  classAverage: number;
  averageAttendanceRate: number;
  averageAnnualAttendanceRate: number;
  totalStudentsInRecovery: number;
  totalStudentsAtRiskAbsences: number;
  totalStudentsCriticalRisk: number;
  totalStudentsHighPerforming: number;
  loadedBimesters: number[]; // e.g. [1, 2]
  bnccLevelDistribution: {
    abaixo_do_basico: number;
    basico: number;
    adequado: number;
    avancado: number;
  };
  quintaMencaoDistribution: {
    aprovadosDiretos: number;
    aprovadosPeloConselho: number;
    retidosRendimento: number;
    retidosFaltas: number;
    retidosDuplo: number;
    pendentes: number;
  };
  areaPerformance: Record<KnowledgeArea, {
    areaName: string;
    averageGrade: number;
    failureRate: number;
  }>;
  criticalSubjects: {
    subjectName: string;
    averageGrade: number;
    failingStudentsCount: number;
    failingRate: number;
  }[];
}
