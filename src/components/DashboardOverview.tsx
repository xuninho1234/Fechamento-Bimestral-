import React from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  Clock, 
  BookOpen, 
  ChevronRight,
  ArrowUpRight,
  FileCheck2,
  ShieldAlert,
  FileSpreadsheet,
  Upload,
  RefreshCw,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { StudentRecord, ClassAnalysisSummary, KnowledgeArea } from '../types/education.ts';
import { BNCC_LEVEL_CONFIG, KNOWLEDGE_AREAS, getRiskProfileInfo } from '../data/bnccCurriculoPaulista.ts';

interface DashboardOverviewProps {
  summary: ClassAnalysisSummary;
  students: StudentRecord[];
  onSelectStudent: (student: StudentRecord) => void;
  onNavigateToTab: (tab: 'students' | 'bncc' | 'conselho') => void;
  onOpenUpload?: () => void;
  onLoadSample?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  summary,
  students,
  onSelectStudent,
  onNavigateToTab,
  onOpenUpload,
  onLoadSample
}) => {
  // Empty state when all bimesters have been cleared
  if (students.length === 0) {
    return (
      <div className="space-y-6">
        {/* Clean Empty State Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-inner">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            Sistema Limpo · Aguardando Upload da Planilha
          </h2>
          <p className="text-xs md:text-sm text-slate-600 max-w-xl mx-auto mt-2 leading-relaxed">
            Todos os dados anteriores foram removidos. Envie a planilha de fechamento bimestral da 
            <strong className="text-slate-800"> Sala do Futuro SP</strong> (.xls ou .xlsx) para organizar automaticamente os alunos, notas, faltas e análises da BNCC.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            {onOpenUpload && (
              <button
                onClick={onOpenUpload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs md:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Upar Planilha de Fechamento</span>
              </button>
            )}

            {onLoadSample && (
              <button
                onClick={onLoadSample}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-xs md:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-slate-500" />
                <span>Carregar Turma Modelo (Demonstração)</span>
              </button>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Exclusão Automática da Legenda</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Linhas finais de legenda (ET, ES, EP, M, F, AC) e totais de aulas dadas são filtradas automaticamente para não entrarem como alunos.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">Navegação Aluno por Aluno</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Consulte ficha completa digitando o Nº de chamada ou navegando pelas setas do teclado, com histórico acumulado de 1º a 4º bimestre.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900">5ª Menção & Conselho de Classe</h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Julgamento colegiado soberano de aprovação pelo conselho, cálculo de retenção e emissão de Ata Oficial impressa em padrão A4.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const total = summary.totalStudents || 1;
  const pctAbaixo = Math.round((summary.bnccLevelDistribution.abaixo_do_basico / total) * 100);
  const pctBasico = Math.round((summary.bnccLevelDistribution.basico / total) * 100);
  const pctAdequado = Math.round((summary.bnccLevelDistribution.adequado / total) * 100);
  const pctAvancado = Math.round((summary.bnccLevelDistribution.avancado / total) * 100);

  // Filter students for the risk matrix
  const criticalStudents = students.filter((s) => s.riskProfile === 'risco_critico');
  const academicRiskStudents = students.filter((s) => s.riskProfile === 'risco_academico');
  const attendanceAlertStudents = students.filter((s) => s.riskProfile === 'alerta_frequencia');
  const topStudents = students.filter((s) => s.riskProfile === 'excelencia');

  return (
    <div className="space-y-6">
      
      {/* Top Banner / School Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Secretaria da Educação do Estado de São Paulo</span>
              <span aria-hidden="true">·</span>
              <span>Sala do Futuro SP</span>
              <span aria-hidden="true">·</span>
              <span>Currículo Paulista & BNCC</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              Fechamento Bimestral · {summary.classGroup}
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {summary.schoolName} · {summary.bimester}º Bimestre / {summary.year}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab('conselho')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FileCheck2 className="w-4 h-4 text-slate-600" />
              <span>Ata do Conselho</span>
            </button>
            <button
              onClick={() => onNavigateToTab('students')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
            >
              <span>Ver {students.length} Alunos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Estudantes */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Matrículas Ativas</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {summary.totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Organizados por aluno
          </p>
        </div>

        {/* Média da Turma */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Média da Turma</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {summary.classAverage.toFixed(1)}
          </div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            Meta SEDUC: &ge; 5,0
          </p>
        </div>

        {/* Frequência Média */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Frequência Geral</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {summary.averageAttendanceRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            LDB mín. legal 75%
          </p>
        </div>

        {/* Em Recuperação */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Em Recuperação</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">
            {summary.totalStudentsInRecovery}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">
            {Math.round((summary.totalStudentsInRecovery / total) * 100)}% da turma
          </p>
        </div>

        {/* Casos Críticos / Busca Ativa */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Busca Ativa SP</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">
            {summary.totalStudentsCriticalRisk}
          </div>
          <p className="text-[11px] text-rose-700 mt-1">
            Nota &lt; 5 e Faltas &gt; 25%
          </p>
        </div>

        {/* Destaque / Avançado */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Nível Avançado</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">
            {summary.totalStudentsHighPerforming}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Aptidão para monitoria
          </p>
        </div>

      </div>

      {/* BNCC Levels Distribution Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Distribuição por Níveis de Aprendizagem (BNCC & Currículo Paulista)
            </h2>
            <p className="text-xs text-slate-500">
              Classificação pedagógica oficial adotada na rede estadual de São Paulo
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Total: {total} estudantes</span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-5 w-full bg-slate-100 rounded-lg overflow-hidden flex shadow-inner">
          {pctAbaixo > 0 && (
            <div 
              style={{ width: `${pctAbaixo}%` }} 
              className="bg-rose-500 hover:bg-rose-600 transition-all text-[10px] font-bold text-white flex items-center justify-center"
              title={`Abaixo do Básico: ${summary.bnccLevelDistribution.abaixo_do_basico} alunos (${pctAbaixo}%)`}
            >
              {pctAbaixo > 6 ? `${pctAbaixo}%` : ''}
            </div>
          )}
          {pctBasico > 0 && (
            <div 
              style={{ width: `${pctBasico}%` }} 
              className="bg-amber-500 hover:bg-amber-600 transition-all text-[10px] font-bold text-white flex items-center justify-center"
              title={`Básico: ${summary.bnccLevelDistribution.basico} alunos (${pctBasico}%)`}
            >
              {pctBasico > 6 ? `${pctBasico}%` : ''}
            </div>
          )}
          {pctAdequado > 0 && (
            <div 
              style={{ width: `${pctAdequado}%` }} 
              className="bg-blue-500 hover:bg-blue-600 transition-all text-[10px] font-bold text-white flex items-center justify-center"
              title={`Adequado: ${summary.bnccLevelDistribution.adequado} alunos (${pctAdequado}%)`}
            >
              {pctAdequado > 6 ? `${pctAdequado}%` : ''}
            </div>
          )}
          {pctAvancado > 0 && (
            <div 
              style={{ width: `${pctAvancado}%` }} 
              className="bg-emerald-500 hover:bg-emerald-600 transition-all text-[10px] font-bold text-white flex items-center justify-center"
              title={`Avançado: ${summary.bnccLevelDistribution.avancado} alunos (${pctAvancado}%)`}
            >
              {pctAvancado > 6 ? `${pctAvancado}%` : ''}
            </div>
          )}
        </div>

        {/* 4 Levels Legend Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          
          {/* Abaixo do Básico */}
          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800">Abaixo do Básico</span>
              <span className="text-xs font-mono font-bold text-rose-700 tabular-nums">
                {summary.bnccLevelDistribution.abaixo_do_basico} ({pctAbaixo}%)
              </span>
            </div>
            <p className="text-[11px] text-rose-900/80 mt-1 line-clamp-2">
              {BNCC_LEVEL_CONFIG.abaixo_do_basico.actionRequired}
            </p>
          </div>

          {/* Básico */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">Básico</span>
              <span className="text-xs font-mono font-bold text-amber-700 tabular-nums">
                {summary.bnccLevelDistribution.basico} ({pctBasico}%)
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 mt-1 line-clamp-2">
              {BNCC_LEVEL_CONFIG.basico.actionRequired}
            </p>
          </div>

          {/* Adequado */}
          <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">Adequado</span>
              <span className="text-xs font-mono font-bold text-blue-700 tabular-nums">
                {summary.bnccLevelDistribution.adequado} ({pctAdequado}%)
              </span>
            </div>
            <p className="text-[11px] text-blue-900/80 mt-1 line-clamp-2">
              {BNCC_LEVEL_CONFIG.adequado.actionRequired}
            </p>
          </div>

          {/* Avançado */}
          <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">Avançado</span>
              <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                {summary.bnccLevelDistribution.avancado} ({pctAvancado}%)
              </span>
            </div>
            <p className="text-[11px] text-emerald-900/80 mt-1 line-clamp-2">
              {BNCC_LEVEL_CONFIG.avancado.actionRequired}
            </p>
          </div>

        </div>
      </div>

      {/* Two-Column Analysis: Areas do Conhecimento + Componentes Críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Desempenho por Área do Conhecimento */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Áreas do Conhecimento · Currículo Paulista
              </h2>
              <p className="text-xs text-slate-500">
                Média bimestral e taxa de defasagem por grande área
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('bncc')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Ver Habilidades</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {(Object.keys(summary.areaPerformance) as KnowledgeArea[]).map((areaKey) => {
              const area = summary.areaPerformance[areaKey];
              const config = KNOWLEDGE_AREAS[areaKey];
              const pctWidth = Math.min(100, (area.averageGrade / 10) * 100);

              return (
                <div key={areaKey} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{config.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-[11px]">
                        Defasagem: <strong className="text-rose-600 font-mono">{area.failureRate}%</strong>
                      </span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">
                        {area.averageGrade.toFixed(1)} / 10
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ 
                        width: `${pctWidth}%`,
                        backgroundColor: area.averageGrade < 5.0 ? '#e11d48' : area.averageGrade < 7.0 ? '#d97706' : '#2563eb'
                      }}
                      className="h-full rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disciplinas com Maior Defasagem / Atenção */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Componentes em Alerta Pedagógico
                </h2>
                <p className="text-xs text-slate-500">
                  Disciplinas que exigem reforço intensivo e recuperação contínua
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">Critério: Nota &lt; 5,0</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 font-semibold">Componente Curricular</th>
                    <th className="pb-2 font-semibold text-center">Média</th>
                    <th className="pb-2 font-semibold text-center">Em Recuperação</th>
                    <th className="pb-2 font-semibold text-right">Taxa Insucesso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.criticalSubjects.slice(0, 6).map((sub, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-medium text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sub.subjectName}</span>
                      </td>
                      <td className="py-2.5 text-center font-mono tabular-nums font-semibold text-slate-700">
                        {sub.averageGrade.toFixed(1)}
                      </td>
                      <td className="py-2.5 text-center font-mono tabular-nums text-slate-600">
                        {sub.failingStudentsCount} alunos
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          sub.failingRate > 25
                            ? 'text-rose-700 bg-rose-50'
                            : sub.failingRate > 15
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-slate-700 bg-slate-100'
                        }`}>
                          {sub.failingRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Foco de intervenção nos ATPCs (Aulas de Trabalho Pedagógico Coletivo)</span>
            <button
              onClick={() => onNavigateToTab('conselho')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Deliberar em Conselho &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Matriz de Risco Pedagógico (4 Quadrantes) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Matriz de Intervenção Pedagógica (Nota x Frequência)
          </h2>
          <p className="text-xs text-slate-500">
            Identificação rápida de vulnerabilidade escolar e priorização da Busca Ativa da Sala do Futuro
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Quadrante 1: Risco Crítico / Busca Ativa */}
          <div className="rounded-xl border border-rose-300 bg-rose-50/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-rose-800">Risco Crítico (Duplo)</span>
                <span className="text-xs font-mono font-bold text-rose-700 tabular-nums">
                  {criticalStudents.length} alunos
                </span>
              </div>
              <p className="text-[11px] text-rose-900/80 mb-3">
                Nota &lt; 5,0 E Frequência &lt; 75%. Acionamento da Busca Ativa SEDUC e Conselho Tutelar.
              </p>
              
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {criticalStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum aluno neste perfil</p>
                ) : (
                  criticalStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="w-full text-left p-2 rounded-lg bg-white border border-rose-200 hover:border-rose-400 transition-colors shadow-xs flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900">{s.number}. {s.name}</span>
                        <div className="text-[10px] text-slate-500">RA: {s.ra}-{s.raDigit}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-rose-600 font-bold tabular-nums">{s.overallAverage.toFixed(1)}</div>
                        <div className="font-mono text-[10px] text-slate-500 tabular-nums">{s.overallAttendanceRate}% pres.</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-rose-200/60 text-[11px] text-rose-800 font-medium">
              Ação: Convocação de responsáveis + FICAI
            </div>
          </div>

          {/* Quadrante 2: Risco Acadêmico */}
          <div className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-800">Risco Acadêmico</span>
                <span className="text-xs font-mono font-bold text-amber-700 tabular-nums">
                  {academicRiskStudents.length} alunos
                </span>
              </div>
              <p className="text-[11px] text-amber-900/80 mb-3">
                Nota &lt; 5,0 com assiduidade regular (&ge; 75%). Foco em defasagem cognitiva de conteúdo.
              </p>
              
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {academicRiskStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum aluno neste perfil</p>
                ) : (
                  academicRiskStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="w-full text-left p-2 rounded-lg bg-white border border-amber-200 hover:border-amber-400 transition-colors shadow-xs flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900">{s.number}. {s.name}</span>
                        <div className="text-[10px] text-slate-500">Recuperar: {s.needsRecoverySubjects.length} disc.</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-amber-600 font-bold tabular-nums">{s.overallAverage.toFixed(1)}</div>
                        <div className="font-mono text-[10px] text-slate-500 tabular-nums">{s.overallAttendanceRate}% pres.</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 font-medium">
              Ação: Reforço no contraturno / Sala do Futuro
            </div>
          </div>

          {/* Quadrante 3: Alerta de Frequência */}
          <div className="rounded-xl border border-orange-300 bg-orange-50/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-orange-800">Alerta de Frequência</span>
                <span className="text-xs font-mono font-bold text-orange-700 tabular-nums">
                  {attendanceAlertStudents.length} alunos
                </span>
              </div>
              <p className="text-[11px] text-orange-900/80 mb-3">
                Nota &ge; 5,0 porém Frequência &lt; 75%. Risco iminente de reprovação por faltas.
              </p>
              
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {attendanceAlertStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum aluno neste perfil</p>
                ) : (
                  attendanceAlertStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="w-full text-left p-2 rounded-lg bg-white border border-orange-200 hover:border-orange-400 transition-colors shadow-xs flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900">{s.number}. {s.name}</span>
                        <div className="text-[10px] text-slate-500">Total: {s.totalAbsences} faltas</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-slate-700 font-bold tabular-nums">{s.overallAverage.toFixed(1)}</div>
                        <div className="font-mono text-[10px] text-orange-600 font-bold tabular-nums">{s.overallAttendanceRate}% pres.</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-orange-200/60 text-[11px] text-orange-800 font-medium">
              Ação: Plano de compensação de ausências
            </div>
          </div>

          {/* Quadrante 4: Excelência Pedagógica */}
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-800">Excelência Acadêmica</span>
                <span className="text-xs font-mono font-bold text-emerald-700 tabular-nums">
                  {topStudents.length} alunos
                </span>
              </div>
              <p className="text-[11px] text-emerald-900/80 mb-3">
                Nota &ge; 9,0 e Frequência &ge; 90%. Alunos com potencial de monitoria e protagonismo juvenil.
              </p>
              
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {topStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Nenhum aluno neste perfil</p>
                ) : (
                  topStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onSelectStudent(s)}
                      className="w-full text-left p-2 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 transition-colors shadow-xs flex items-center justify-between text-xs"
                    >
                      <div className="truncate pr-2">
                        <span className="font-semibold text-slate-900">{s.number}. {s.name}</span>
                        <div className="text-[10px] text-emerald-700 font-medium">Avançado BNCC</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-emerald-600 font-bold tabular-nums">{s.overallAverage.toFixed(1)}</div>
                        <div className="font-mono text-[10px] text-slate-500 tabular-nums">{s.overallAttendanceRate}% pres.</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-800 font-medium">
              Ação: Monitoria entre pares e Olimpíadas (OBMEP)
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
