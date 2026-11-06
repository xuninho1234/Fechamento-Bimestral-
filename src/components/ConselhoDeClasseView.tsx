import React, { useState } from 'react';
import { 
  Printer, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  UserCheck, 
  Users,
  Search,
  Filter
} from 'lucide-react';
import { StudentRecord, ClassAnalysisSummary } from '../types/education.ts';
import { exportConsolidatedReportXLSX } from '../utils/excelParser.ts';

interface ConselhoDeClasseViewProps {
  students: StudentRecord[];
  summary: ClassAnalysisSummary;
  onUpdateDeliberation: (studentId: string, deliberation: 'Aprovado' | 'Recuperação Contínua' | 'Busca Ativa' | 'Encaminhamento PDI') => void;
}

export const ConselhoDeClasseView: React.FC<ConselhoDeClasseViewProps> = ({
  students,
  summary,
  onUpdateDeliberation
}) => {
  const [filterDelib, setFilterDelib] = useState<string>('all');
  const [searchName, setSearchName] = useState<string>('');
  const [councilNotes, setCouncilNotes] = useState<string>(
    `Reunidos em Conselho de Classe referente ao ${summary.bimester}º Bimestre do ano letivo de ${summary.year}, a equipe docente e pedagógica analisou o rendimento e a assiduidade dos estudantes da turma ${summary.classGroup}. Observou-se a necessidade de reforço intensivo nas habilidades prioritárias de Matemática e Língua Portuguesa, bem como o acionamento de medidas de Busca Ativa aos alunos com frequência inferior a 75%.`
  );

  const filteredStudents = students.filter((s) => {
    if (searchName && !s.name.toLowerCase().includes(searchName.toLowerCase()) && !s.ra.includes(searchName)) {
      return false;
    }
    if (filterDelib !== 'all' && s.councilDeliberation !== filterDelib) {
      return false;
    }
    return true;
  });

  const handlePrintAta = () => {
    window.print();
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Ata de Conselho Vazia</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          O sistema está limpo. Faça o upload da planilha de fechamento bimestral da Sala do Futuro SP para gerar e imprimir a Ata de Deliberação do Conselho de Classe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <FileText className="w-4 h-4" />
              <span>Documento Oficial SEDUC-SP</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Ata de Fechamento do Conselho de Classe Bimestral
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registro das deliberações pedagógicas, encaminhamentos para recuperação contínua e busca ativa escolar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportConsolidatedReportXLSX(students, summary.classGroup, summary.bimester)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={handlePrintAta}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ata Oficial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Printable Ata Sheet (A4 formatted container) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs card-print">
        
        {/* Institutional Letterhead */}
        <div className="text-center border-b border-slate-300 pb-5 mb-6">
          <p className="text-xs uppercase font-bold tracking-widest text-slate-700">
            Governo do Estado de São Paulo · Secretaria da Educação
          </p>
          <p className="text-xs text-slate-600">
            Diretoria de Ensino · Polo Sala do Futuro SP
          </p>
          <h2 className="text-base font-bold text-slate-900 mt-2">
            ATA DE DELIBERAÇÃO DO CONSELHO DE CLASSE E FECHAMENTO BIMESTRAL
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mt-1 font-medium">
            <span>Turma: <strong>{summary.classGroup}</strong></span>
            <span>·</span>
            <span>Bimestre: <strong>{summary.bimester}º Bimestre / {summary.year}</strong></span>
            <span>·</span>
            <span>Total Estudantes: <strong>{summary.totalStudents}</strong></span>
          </div>
        </div>

        {/* Synthesis Metrics for the Council */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-slate-500">Média Geral da Turma:</span>
            <div className="font-bold text-slate-900 font-mono text-sm tabular-nums">{summary.classAverage.toFixed(1)}</div>
          </div>
          <div>
            <span className="text-slate-500">Frequência da Turma:</span>
            <div className="font-bold text-slate-900 font-mono text-sm tabular-nums">{summary.averageAttendanceRate}%</div>
          </div>
          <div>
            <span className="text-slate-500">Em Recuperação:</span>
            <div className="font-bold text-amber-600 font-mono text-sm tabular-nums">{summary.totalStudentsInRecovery} estudantes</div>
          </div>
          <div>
            <span className="text-slate-500">Risco Crítico / Faltas:</span>
            <div className="font-bold text-rose-600 font-mono text-sm tabular-nums">{summary.totalStudentsCriticalRisk} estudantes</div>
          </div>
        </div>

        {/* Council Text / Observations Field */}
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            Síntese e Encaminhamentos Coletivos da Equipe Escolar
          </label>
          <textarea
            value={councilNotes}
            onChange={(e) => setCouncilNotes(e.target.value)}
            rows={3}
            className="w-full text-xs p-3 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 leading-relaxed font-sans"
          />
        </div>

        {/* Filters bar (no print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 no-print">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Localizar na ata..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px]">Filtrar:</span>
            <select
              value={filterDelib}
              onChange={(e) => setFilterDelib(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Todas as Situações</option>
              <option value="Aprovado">Aprovado no Bimestre</option>
              <option value="Recuperação Contínua">Recuperação Contínua</option>
              <option value="Busca Ativa">Busca Ativa</option>
              <option value="Encaminhamento PDI">Encaminhamento PDI</option>
            </select>
          </div>
        </div>

        {/* Table of Deliberations per Student */}
        <div className="overflow-x-auto border border-slate-300 rounded-lg mb-8">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">Nº</th>
                <th className="py-2.5 px-3 font-semibold">Nome do Estudante</th>
                <th className="py-2.5 px-3 font-semibold">RA</th>
                <th className="py-2.5 px-2 font-semibold text-center">Média</th>
                <th className="py-2.5 px-2 font-semibold text-center">Freq.</th>
                <th className="py-2.5 px-3 font-semibold">Defasagens / Disciplinas</th>
                <th className="py-2.5 px-3 font-semibold text-right">Deliberação do Conselho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.map((s) => {
                const isRecovery = s.councilDeliberation === 'Recuperação Contínua';
                const isBusca = s.councilDeliberation === 'Busca Ativa';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-700">
                      {s.number}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900">
                      {s.name}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                      {s.ra}-{s.raDigit} {s.raUf}
                    </td>
                    <td className="py-2 px-2 text-center font-mono font-bold tabular-nums">
                      <span className={s.overallAverage < 5.0 ? 'text-rose-600' : 'text-slate-800'}>
                        {s.overallAverage.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-center font-mono tabular-nums">
                      <span className={s.overallAttendanceRate < 75 ? 'text-orange-600 font-semibold' : 'text-slate-600'}>
                        {s.overallAttendanceRate}%
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px]">
                      {s.needsRecoverySubjects.length > 0 ? (
                        <span className="text-amber-800 font-medium">
                          {s.needsRecoverySubjects.slice(0, 3).join(', ')}
                          {s.needsRecoverySubjects.length > 3 && ` +${s.needsRecoverySubjects.length - 3}`}
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">Nenhuma defasagem</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {/* Printable view renders text; interactive view allows changing */}
                      <span className="print-only font-bold text-[11px]">
                        {s.councilDeliberation || 'Aprovado'}
                      </span>
                      <div className="no-print inline-block">
                        <select
                          value={s.councilDeliberation || 'Aprovado'}
                          onChange={(e) => onUpdateDeliberation(s.id, e.target.value as any)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded border focus:outline-none ${
                            isBusca 
                              ? 'bg-rose-50 border-rose-300 text-rose-800' 
                              : isRecovery 
                              ? 'bg-amber-50 border-amber-300 text-amber-800' 
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <option value="Aprovado">Aprovado</option>
                          <option value="Recuperação Contínua">Recuperação Contínua</option>
                          <option value="Busca Ativa">Busca Ativa</option>
                          <option value="Encaminhamento PDI">Encaminhamento PDI</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Commission Signatures Block (Essential for official records) */}
        <div className="pt-6 border-t border-slate-300 mt-8">
          <p className="text-xs text-slate-500 font-semibold text-center mb-8 uppercase tracking-wider">
            Comissão de Fechamento do Conselho de Classe · Assinaturas
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-black w-36 mx-auto mb-1.5"></div>
              <p className="font-semibold text-slate-800">Diretor(a) de Escola</p>
              <p className="text-[10px] text-slate-500">Presidente do Conselho</p>
            </div>
            <div>
              <div className="border-b border-black w-36 mx-auto mb-1.5"></div>
              <p className="font-semibold text-slate-800">Coordenação Pedagógica</p>
              <p className="text-[10px] text-slate-500">Gestão de Aprendizagem</p>
            </div>
            <div>
              <div className="border-b border-black w-36 mx-auto mb-1.5"></div>
              <p className="font-semibold text-slate-800">Prof. Coordenador de Área</p>
              <p className="text-[10px] text-slate-500">Linguagens / Exatas</p>
            </div>
            <div>
              <div className="border-b border-black w-36 mx-auto mb-1.5"></div>
              <p className="font-semibold text-slate-800">Prof. Tutor / Sala do Futuro</p>
              <p className="text-[10px] text-slate-500">Acompanhamento e Mentoria</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
