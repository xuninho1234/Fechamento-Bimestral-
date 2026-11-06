import React, { useState, useMemo } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Printer, 
  Download, 
  Search, 
  Filter, 
  FileCheck2, 
  Info, 
  Sparkles, 
  UserCheck,
  Upload,
  FileSpreadsheet,
  Calendar,
  Layers
} from 'lucide-react';
import { StudentRecord, ClassAnalysisSummary, QuintaMencaoStatus } from '../types/education.ts';
import { exportConsolidatedReportXLSX, downloadQuintaMencaoExcelTemplate } from '../utils/excelParser.ts';

interface QuintaMencaoViewProps {
  students: StudentRecord[];
  summary: ClassAnalysisSummary;
  onUpdateQuintaMencao: (studentId: string, status: QuintaMencaoStatus, justification: string) => void;
  onAdjustSubjectGrade?: (studentId: string, subjectCode: string, newGrade: number) => void;
  onOpenUploadQuintaMencao?: () => void;
  onLoadSample?: () => void;
}

export const QuintaMencaoView: React.FC<QuintaMencaoViewProps> = ({
  students,
  summary,
  onUpdateQuintaMencao,
  onAdjustSubjectGrade,
  onOpenUploadQuintaMencao,
  onLoadSample
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewDetailsStudentId, setViewDetailsStudentId] = useState<string | null>(null);

  // Check if 5ª Menção spreadsheet was imported
  const isPlanilhaImported = students.some((s) => s.quintaMencao?.isPlanilhaImported);
  const importedFileName = students.find((s) => s.quintaMencao?.importedFileName)?.quintaMencao?.importedFileName;
  const importedAt = students.find((s) => s.quintaMencao?.importedAt)?.quintaMencao?.importedAt;

  // Statistics calculation
  const stats = useMemo(() => {
    let aprovadosDiretos = 0;
    let aprovadosConselho = 0;
    let retidosRendimento = 0;
    let retidosFaltas = 0;
    let retidosDuplo = 0;
    let pendentes = 0;

    students.forEach((s) => {
      const st = s.quintaMencao.status;
      if (st === 'Aprovado') aprovadosDiretos++;
      else if (st === 'Aprovado pelo Conselho') aprovadosConselho++;
      else if (st === 'Retido por Rendimento') retidosRendimento++;
      else if (st === 'Retido por Faltas') retidosFaltas++;
      else if (st === 'Retido por Rendimento e Faltas') retidosDuplo++;
      else pendentes++;
    });

    return {
      aprovadosDiretos,
      aprovadosConselho,
      retidosRendimento,
      retidosFaltas,
      retidosDuplo,
      pendentes,
      totalAprovados: aprovadosDiretos + aprovadosConselho,
      taxaAprovacao: Math.round(((aprovadosDiretos + aprovadosConselho) / (students.length || 1)) * 100)
    };
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.ra.includes(q) && String(s.number) !== q) {
          return false;
        }
      }
      if (statusFilter !== 'all' && s.quintaMencao.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [students, search, statusFilter]);

  const handlePrint = () => {
    window.print();
  };

  const applyAutoApproval = () => {
    students.forEach((s) => {
      if (s.situation === 'Ativo') {
        if (s.overallAverage >= 5.0 && s.annualAttendanceRate >= 75) {
          onUpdateQuintaMencao(s.id, 'Aprovado', 'Aprovado por rendimento e assiduidade satisfatórios.');
        } else if (s.overallAverage >= 4.0 && s.annualAttendanceRate >= 75) {
          onUpdateQuintaMencao(s.id, 'Aprovado pelo Conselho', 'Aprovado pelo Conselho de Classe (5ª Menção) por evolução global.');
        }
      }
    });
  };

  // Clean empty state when students array is empty
  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          5ª Menção · Conselho de Classe Final
        </h2>
        <p className="text-xs md:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Nenhum estudante carregado. Você pode enviar diretamente a <strong className="text-slate-800">Planilha de 5ª Menção baixada da Sala do Futuro SP</strong> para preencher o conselho final, ou carregar uma turma de exemplo.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onOpenUploadQuintaMencao && (
            <button
              onClick={onOpenUploadQuintaMencao}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-all shadow-md active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Upar Planilha de 5ª Menção (XLS/XLSX)</span>
            </button>
          )}

          <button
            onClick={downloadQuintaMencaoExcelTemplate}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Baixar Planilha Modelo (.xlsx)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-1">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Conselho de Classe Final · SEDUC-SP</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              5ª Menção · Julgamento de Aprovação pelo Conselho
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Deliberação final e soberana da comissão de professores sobre a aprovação ou retenção dos estudantes (LDB Art. 24 e Resoluções SEDUC-SP).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenUploadQuintaMencao && (
              <button
                onClick={onOpenUploadQuintaMencao}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all shadow-xs"
                title="Fazer upload da planilha de 5ª Menção baixada da Sala do Futuro"
              >
                <Upload className="w-4 h-4" />
                <span>Upar Planilha 5ª Menção</span>
              </button>
            )}
            <button
              onClick={() => exportConsolidatedReportXLSX(students, summary.classGroup, '5ª Menção')}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ata da 5ª Menção</span>
            </button>
          </div>
        </div>
      </div>

      {/* SPREADSHEET IMPORT STATUS CARD */}
      <div className="no-print">
        {isPlanilhaImported ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                  <span>Planilha de 5ª Menção da Sala do Futuro SP Sincronizada</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold">IMPORTADA</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  Arquivo: <span className="font-mono font-semibold text-emerald-900">{importedFileName || '5ª Menção Sala do Futuro'}</span> {importedAt && `· Data: ${importedAt}`} · As menções e julgamentos de cada disciplina foram integrados aos registros dos alunos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={downloadQuintaMencaoExcelTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-300"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Modelo XLS</span>
              </button>
              {onOpenUploadQuintaMencao && (
                <button
                  type="button"
                  onClick={onOpenUploadQuintaMencao}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Reenviar Planilha</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border border-amber-200 text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-950 flex items-center gap-2">
                  <span>Planilha de 5ª Menção da Sala do Futuro SP</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-semibold text-[10px]">Aguardando Upload</span>
                </h3>
                <p className="text-[11px] text-amber-800 mt-1 max-w-2xl leading-relaxed">
                  A 5ª Menção é uma planilha separada gerada na Sala do Futuro após o conselho de final de ano. Ao fazer o upload dessa planilha, o sistema atualiza as notas finais e o julgamento soberano de aprovação de cada aluno automaticamente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={downloadQuintaMencaoExcelTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-white hover:bg-amber-100/80 border border-amber-300 rounded-lg transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span>Baixar Modelo 5ª Menção</span>
              </button>
              {onOpenUploadQuintaMencao && (
                <button
                  type="button"
                  onClick={onOpenUploadQuintaMencao}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-all shadow-sm active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upar Planilha 5ª Menção</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards: Resultados da 5ª Menção */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 no-print">
        
        {/* Taxa Geral de Aprovação */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-medium text-slate-500 block">Taxa de Aprovação</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {stats.taxaAprovacao}%
          </div>
          <span className="text-[11px] text-slate-500">{stats.totalAprovados} de {students.length} alunos</span>
        </div>

        {/* Aprovados Diretos */}
        <div className="bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-xs">
          <span className="text-xs font-medium text-emerald-800 block">Aprovados Diretos</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {stats.aprovadosDiretos}
          </div>
          <span className="text-[11px] text-emerald-700">Média &ge; 5 e Freq &ge; 75%</span>
        </div>

        {/* Aprovados pelo Conselho (5ª Menção) */}
        <div className="bg-white rounded-xl border border-blue-300 bg-blue-50/40 p-4 shadow-xs">
          <span className="text-xs font-bold text-blue-900 block">Aprov. pelo Conselho</span>
          <div className="text-2xl font-bold text-blue-600 font-mono tabular-nums mt-1">
            {stats.aprovadosConselho}
          </div>
          <span className="text-[11px] text-blue-700 font-semibold">5ª Menção concedida</span>
        </div>

        {/* Retidos por Rendimento */}
        <div className="bg-white rounded-xl border border-amber-200 bg-amber-50/20 p-4 shadow-xs">
          <span className="text-xs font-medium text-amber-800 block">Retidos Rendimento</span>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {stats.retidosRendimento}
          </div>
          <span className="text-[11px] text-amber-700">Nota final &lt; 5,0</span>
        </div>

        {/* Retidos por Faltas */}
        <div className="bg-white rounded-xl border border-orange-200 bg-orange-50/20 p-4 shadow-xs">
          <span className="text-xs font-medium text-orange-800 block">Retidos por Faltas</span>
          <div className="text-2xl font-bold text-orange-600 font-mono tabular-nums mt-1">
            {stats.retidosFaltas}
          </div>
          <span className="text-[11px] text-orange-700">Freq. Anual &lt; 75%</span>
        </div>

        {/* Retidos Duplo */}
        <div className="bg-white rounded-xl border border-rose-200 bg-rose-50/20 p-4 shadow-xs">
          <span className="text-xs font-medium text-rose-800 block">Retidos Nota + Faltas</span>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums mt-1">
            {stats.retidosDuplo}
          </div>
          <span className="text-[11px] text-rose-700">Casos críticos</span>
        </div>

      </div>

      {/* Main Deliberation Matrix Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs card-print">
        
        {/* Official Header for Print */}
        <div className="text-center border-b border-slate-300 pb-5 mb-6">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-700">
            Governo do Estado de São Paulo · Secretaria da Educação (SEDUC-SP)
          </p>
          <p className="text-xs text-slate-600">
            Diretoria de Ensino: {summary.diretoriaEnsino} · Escola: {summary.schoolName}
          </p>
          <h2 className="text-base font-bold text-slate-900 mt-2">
            ATA DE DELIBERAÇÃO FINAL · 5ª MENÇÃO DO CONSELHO DE CLASSE
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 mt-1 font-medium">
            <span>Turma: <strong>{summary.classGroup}</strong></span>
            <span>·</span>
            <span>Tipo de Ensino: <strong>{summary.teachingType}</strong></span>
            <span>·</span>
            <span>Ano Letivo: <strong>{summary.year}</strong></span>
            <span>·</span>
            <span>Total de Aulas: <strong>{summary.totalAulasDadas}</strong></span>
          </div>
        </div>

        {/* Educational Policy Notice */}
        <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 mb-6 no-print">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>O que é a 5ª Menção na Sala do Futuro SP?</strong> É a nota ou menção deliberada pelo Conselho de Classe ao estudante após a conclusão dos 4 bimestres letivos e dos períodos de recuperação contínua e intensiva. O conselho pode deliberar pela <em>Aprovação pelo Conselho</em> quando o estudante apresentar avanço formativo global, compensando notas abaixo de 5,0 ou ausências comprovadas.
          </div>
        </div>

        {/* Search, Filter and Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 no-print">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por estudante ou RA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Todas as Deliberações ({students.length})</option>
              <option value="Aprovado">Aprovado Direto ({stats.aprovadosDiretos})</option>
              <option value="Aprovado pelo Conselho">Aprovado pelo Conselho (5ª Menção) ({stats.aprovadosConselho})</option>
              <option value="Retido por Rendimento">Retido por Rendimento ({stats.retidosRendimento})</option>
              <option value="Retido por Faltas">Retido por Faltas ({stats.retidosFaltas})</option>
              <option value="Retido por Rendimento e Faltas">Retido Duplo ({stats.retidosDuplo})</option>
            </select>

            <button
              onClick={applyAutoApproval}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              title="Aplica aprovação padrão para estudantes com média e assiduidade satisfatórias"
            >
              <UserCheck className="w-3.5 h-3.5 inline mr-1" />
              <span>Sugerir Pré-Deliberação</span>
            </button>
          </div>
        </div>

        {/* Table of Deliberations */}
        <div className="overflow-x-auto border border-slate-300 rounded-lg mb-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">Nº</th>
                <th className="py-2.5 px-3 font-semibold">Nome do Estudante</th>
                <th className="py-2.5 px-2 font-semibold">Situação</th>
                <th className="py-2.5 px-2 font-semibold text-center">Média Anual</th>
                <th className="py-2.5 px-2 font-semibold text-center">Freq. Anual</th>
                <th className="py-2.5 px-2 font-semibold text-center">Faltas (TF)</th>
                <th className="py-2.5 px-2 font-semibold text-center">Comp. (AC)</th>
                <th className="py-2.5 px-3 font-semibold text-center">Julgamento do Conselho (5ª Menção)</th>
                <th className="py-2.5 px-3 font-semibold">Justificativa Pedagógica</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((s) => {
                const status = s.quintaMencao.status;
                const isConselho = status === 'Aprovado pelo Conselho';
                const isAprovado = status === 'Aprovado';
                const isRetido = status.startsWith('Retido');
                const hasImportedData = s.quintaMencao.isPlanilhaImported;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                      {s.number}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{s.name}</span>
                        {hasImportedData && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold border border-amber-300 no-print" title="Dados da 5ª Menção importados da planilha da Sala do Futuro">
                            5ª M
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">RA: {s.ra}-{s.raDigit}</div>
                    </td>
                    <td className="py-2.5 px-2 text-[11px]">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        s.situation === 'Ativo' ? 'bg-slate-100 text-slate-700' : 'bg-rose-50 text-rose-700 font-semibold'
                      }`}>
                        {s.situation}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums">
                      <span className={s.overallAverage < 5.0 ? 'text-rose-600' : 'text-slate-900'}>
                        {s.overallAverage.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums">
                      <span className={s.annualAttendanceRate < 75 ? 'text-orange-600 font-bold' : 'text-slate-700'}>
                        {s.annualAttendanceRate}%
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums text-slate-600">
                      {s.totalAbsences}
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono tabular-nums text-blue-700 font-medium">
                      {s.totalCompensatedAbsences > 0 ? `+${s.totalCompensatedAbsences}` : '0'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {/* Print only display */}
                      <span className="print-only font-bold text-[11px]">
                        {status}
                      </span>
                      {/* Interactive dropdown */}
                      <div className="no-print">
                        <select
                          value={status}
                          onChange={(e) => onUpdateQuintaMencao(s.id, e.target.value as QuintaMencaoStatus, s.quintaMencao.justification)}
                          className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none cursor-pointer ${
                            isConselho
                              ? 'bg-blue-100 text-blue-900 border-blue-400 shadow-xs'
                              : isAprovado
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isRetido
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Aprovado">Aprovado (Direto)</option>
                          <option value="Aprovado pelo Conselho">Aprovado pelo Conselho (5ª Menção)</option>
                          <option value="Retido por Rendimento">Retido por Rendimento</option>
                          <option value="Retido por Faltas">Retido por Faltas</option>
                          <option value="Retido por Rendimento e Faltas">Retido por Rendimento e Faltas</option>
                          <option value="Pendente">Pendente / Transferido</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <input
                        type="text"
                        value={s.quintaMencao.justification}
                        onChange={(e) => onUpdateQuintaMencao(s.id, status, e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-slate-300 focus:bg-white px-1 py-0.5 text-[11px] text-slate-700 focus:outline-none"
                        placeholder="Justificativa da comissão..."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Commission Signatures Block */}
        <div className="pt-8 border-t border-slate-300 mt-8">
          <p className="text-xs text-slate-600 font-bold text-center mb-10 uppercase tracking-widest">
            Comissão Deliberativa do Conselho de Classe Final · Assinaturas Oficiais
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-black w-40 mx-auto mb-1.5"></div>
              <p className="font-bold text-slate-900">{summary.directorName}</p>
              <p className="text-[10px] text-slate-500">Diretor(a) de Escola</p>
            </div>
            <div>
              <div className="border-b border-black w-40 mx-auto mb-1.5"></div>
              <p className="font-bold text-slate-900">{summary.goeName}</p>
              <p className="text-[10px] text-slate-500">Gerente de Organização Escolar (GOE)</p>
            </div>
            <div>
              <div className="border-b border-black w-40 mx-auto mb-1.5"></div>
              <p className="font-bold text-slate-900">Coordenação Pedagógica</p>
              <p className="text-[10px] text-slate-500">Acompanhamento Curricular BNCC</p>
            </div>
            <div>
              <div className="border-b border-black w-40 mx-auto mb-1.5"></div>
              <p className="font-bold text-slate-900">Professor(a) Coordenador(a)</p>
              <p className="text-[10px] text-slate-500">Polo Sala do Futuro SP</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
