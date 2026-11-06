import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpDown, 
  FileText, 
  ChevronLeft,
  ChevronRight,
  TrendingUp, 
  Award,
  Layers,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { StudentRecord, QuintaMencaoStatus, StudentBimesterData } from '../types/education.ts';
import { BNCC_LEVEL_CONFIG, KNOWLEDGE_AREAS, OFFICIAL_SP_SUBJECTS } from '../data/bnccCurriculoPaulista.ts';

interface StudentListAndDetailProps {
  students: StudentRecord[];
  selectedStudent: StudentRecord | null;
  onSelectStudent: (student: StudentRecord) => void;
  onUpdateDeliberation?: (studentId: string, deliberation: 'Aprovado' | 'Recuperação Contínua' | 'Busca Ativa' | 'Encaminhamento PDI') => void;
  onUpdateQuintaMencao?: (studentId: string, status: QuintaMencaoStatus, justification: string) => void;
}

type FilterOption = 'all' | 'recuperacao' | 'abaixo_basico' | 'faltas' | 'avancado' | 'nao_comparecimento';
type SortOption = 'number' | 'name' | 'grade_desc' | 'grade_asc' | 'attendance_asc';
type ViewBimesterTab = 1 | 2 | 3 | 4 | 'anual' | 'quinta_mencao';

export const StudentListAndDetail: React.FC<StudentListAndDetailProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  onUpdateDeliberation,
  onUpdateQuintaMencao
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('number');
  const [activeBimesterTab, setActiveBimesterTab] = useState<ViewBimesterTab>(1);

  // Filter & search pipeline
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = 
        !q || 
        s.name.toLowerCase().includes(q) || 
        s.ra.includes(q) || 
        String(s.number) === q;

      if (!matchSearch) return false;

      if (activeFilter === 'recuperacao') return s.needsRecoverySubjects.length > 0 || s.overallAverage < 5.0;
      if (activeFilter === 'abaixo_basico') return s.overallBnccLevel === 'abaixo_do_basico';
      if (activeFilter === 'faltas') return s.overallAttendanceRate < 75;
      if (activeFilter === 'avancado') return s.overallBnccLevel === 'avancado';
      if (activeFilter === 'nao_comparecimento') return s.situation === 'Não Comparecimento' || s.situation.includes('Transferência');

      return true;
    }).sort((a, b) => {
      if (sortOption === 'number') return a.number - b.number;
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      if (sortOption === 'grade_desc') return b.overallAverage - a.overallAverage;
      if (sortOption === 'grade_asc') return a.overallAverage - b.overallAverage;
      if (sortOption === 'attendance_asc') return a.overallAttendanceRate - b.overallAttendanceRate;
      return 0;
    });
  }, [students, searchQuery, activeFilter, sortOption]);

  const currentStudent = selectedStudent || filteredStudents[0] || students[0];

  // Navigate to student by number (Nº de chamada)
  const handleJumpToNumber = (targetNum: number) => {
    const found = students.find((s) => s.number === targetNum);
    if (found) {
      onSelectStudent(found);
    }
  };

  const handlePrevStudent = () => {
    if (!currentStudent) return;
    const currentIndex = students.findIndex((s) => s.id === currentStudent.id);
    if (currentIndex > 0) {
      onSelectStudent(students[currentIndex - 1]);
    } else {
      onSelectStudent(students[students.length - 1]); // Loop around
    }
  };

  const handleNextStudent = () => {
    if (!currentStudent) return;
    const currentIndex = students.findIndex((s) => s.id === currentStudent.id);
    if (currentIndex < students.length - 1) {
      onSelectStudent(students[currentIndex + 1]);
    } else {
      onSelectStudent(students[0]); // Loop around
    }
  };

  // Keyboard navigation with Left and Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only navigate if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrevStudent();
      } else if (e.key === 'ArrowRight') {
        handleNextStudent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStudent, students]);

  const handlePrint = () => {
    window.print();
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Nenhum aluno carregado</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          O sistema foi limpo. Faça o upload da planilha de fechamento bimestral para navegar aluno por aluno, alterar a numeração de chamada e consultar o histórico de notas, menções e frequências de cada bimestre.
        </p>
      </div>
    );
  }

  // Active bimester payload for the current student
  const currentBimData: StudentBimesterData | null = currentStudent && typeof activeBimesterTab === 'number'
    ? currentStudent.bimesters[activeBimesterTab] || null
    : null;

  const currentLevelConfig = currentStudent ? BNCC_LEVEL_CONFIG[currentStudent.overallBnccLevel] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT COLUMN: Student Navigation & Filters (5 cols on lg) */}
      <div className="lg:col-span-5 space-y-4 no-print">
        
        {/* Search & Sort Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar aluno por nome, RA ou número..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setActiveFilter('recuperacao')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'recuperacao'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Recuperação
            </button>
            <button
              onClick={() => setActiveFilter('abaixo_basico')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'abaixo_basico'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              &lt; Básico
            </button>
            <button
              onClick={() => setActiveFilter('faltas')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'faltas'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
              }`}
            >
              Faltas &gt; 25%
            </button>
            <button
              onClick={() => setActiveFilter('nao_comparecimento')}
              className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeFilter === 'nao_comparecimento'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Não Comp. / Transf.
            </button>
          </div>

          {/* Sort bar */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <span>{filteredStudents.length} de {students.length} estudantes</span>
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent border-0 text-[11px] font-medium text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="number">Nº Chamada</option>
                <option value="name">Nome (A-Z)</option>
                <option value="grade_desc">Maior Média</option>
                <option value="grade_asc">Menor Média</option>
                <option value="attendance_asc">Menor Frequência</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable Student List */}
        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredStudents.map((s) => {
            const isSelected = currentStudent?.id === s.id;
            const level = BNCC_LEVEL_CONFIG[s.overallBnccLevel];
            const isInactive = s.situation !== 'Ativo';

            return (
              <div
                key={s.id}
                onClick={() => onSelectStudent(s)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.number}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {s.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono truncate">
                        <span>RA: {s.ra}-{s.raDigit}</span>
                        {isInactive && (
                          <span className="text-rose-600 font-bold font-sans">({s.situation})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold tabular-nums">
                      <span className={s.overallAverage < 5.0 ? 'text-rose-600' : 'text-slate-900'}>
                        {s.overallAverage.toFixed(1)}
                      </span>
                      <span className="text-slate-400 font-normal"> / 10</span>
                    </div>
                    <div className={`text-[10px] font-mono tabular-nums ${s.overallAttendanceRate < 75 ? 'text-orange-600 font-semibold' : 'text-slate-500'}`}>
                      {s.overallAttendanceRate}% pres.
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${level.badgeClass}`}>
                    {level.label}
                  </span>

                  <span className={`text-[10px] font-bold ${
                    s.quintaMencao.status === 'Aprovado pelo Conselho'
                      ? 'text-blue-700'
                      : s.quintaMencao.status.startsWith('Retido')
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                  }`}>
                    {s.quintaMencao.status === 'Aprovado pelo Conselho' ? '5ª Menção: Aprovado' : s.quintaMencao.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* RIGHT COLUMN: Selected Student Dossier (7 cols on lg) */}
      <div className="lg:col-span-7">
        {currentStudent ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            
            {/* 1. KEY FEATURE: Student-by-Student Number Stepper & Quick Navigator */}
            <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Navegação Aluno por Aluno:</span>
                
                <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                  <button
                    onClick={handlePrevStudent}
                    title="Aluno Anterior (Tecla Seta Esquerda)"
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center px-2 text-xs font-mono font-bold text-blue-400">
                    <span>Nº</span>
                    <input
                      type="number"
                      min={1}
                      max={students.length}
                      value={currentStudent.number}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= students.length) {
                          handleJumpToNumber(val);
                        }
                      }}
                      className="w-10 bg-transparent text-center font-bold text-white focus:outline-none focus:bg-slate-700 rounded mx-1"
                    />
                    <span className="text-slate-400">/ {students.length}</span>
                  </div>

                  <button
                    onClick={handleNextStudent}
                    title="Próximo Aluno (Tecla Seta Direita)"
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Select by Name */}
              <div className="flex items-center gap-2">
                <select
                  value={currentStudent.number}
                  onChange={(e) => handleJumpToNumber(parseInt(e.target.value, 10))}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium max-w-[220px] truncate"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.number}>
                      {String(s.number).padStart(2, '0')} - {s.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>Imprimir</span>
                </button>
              </div>

            </div>

            {/* Header: Student Profile Info */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    {currentStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                        Nº {currentStudent.number}
                      </span>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {currentStudent.name}
                      </h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>RA: {currentStudent.ra}-{currentStudent.raDigit} {currentStudent.raUf}</span>
                      <span aria-hidden="true">·</span>
                      <span>Situação: <strong>{currentStudent.situation}</strong></span>
                      <span aria-hidden="true">·</span>
                      <span>{currentStudent.classGroup}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bimester Selector Tabs for this Student */}
              <div className="flex items-center gap-1 mt-5 pt-4 border-t border-slate-200/70 overflow-x-auto text-xs no-print">
                <span className="text-slate-500 font-semibold mr-1">Visualizar Bimestre:</span>
                
                <button
                  onClick={() => setActiveBimesterTab(1)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    activeBimesterTab === 1
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  1º Bimestre
                </button>

                <button
                  onClick={() => setActiveBimesterTab(2)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    activeBimesterTab === 2
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  2º Bimestre
                </button>

                <button
                  onClick={() => setActiveBimesterTab(3)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    activeBimesterTab === 3
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  3º Bimestre
                </button>

                <button
                  onClick={() => setActiveBimesterTab(4)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    activeBimesterTab === 4
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  4º Bimestre
                </button>

                <button
                  onClick={() => setActiveBimesterTab('anual')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                    activeBimesterTab === 'anual'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 inline mr-1" />
                  <span>Comparativo Anual (Todos os Bimestres)</span>
                </button>
              </div>

              {/* Status summary strip (Calculated for active view) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                
                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {activeBimesterTab === 'anual' ? 'Média Anual' : `Média ${activeBimesterTab}º Bim`}
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
                    {currentBimData ? currentBimData.overallAverage.toFixed(1) : currentStudent.overallAverage.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-400">Meta: &ge; 5,0</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    {activeBimesterTab === 'anual' ? 'Frequência Anual' : `Freq. ${activeBimesterTab}º Bim`}
                  </span>
                  <div className={`text-lg font-bold font-mono tabular-nums mt-0.5 ${
                    (currentBimData?.attendanceRate || currentStudent.overallAttendanceRate) < 75 ? 'text-orange-600' : 'text-slate-900'
                  }`}>
                    {currentBimData ? currentBimData.attendanceRate : currentStudent.overallAttendanceRate}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Faltas: {currentBimData ? currentBimData.totalAbsences : currentStudent.totalAbsences}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Ausências Comp. (AC)</span>
                  <div className="text-lg font-bold font-mono text-blue-700 tabular-nums mt-0.5">
                    {currentBimData ? currentBimData.totalCompensatedAbsences : currentStudent.totalCompensatedAbsences}
                  </div>
                  <span className="text-[10px] text-slate-400">Aulas repostas</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-500 font-medium block">Julgamento 5ª Menção</span>
                  <div className={`text-xs font-bold mt-1.5 ${
                    currentStudent.quintaMencao.status === 'Aprovado pelo Conselho'
                      ? 'text-blue-700'
                      : currentStudent.quintaMencao.status.startsWith('Retido')
                      ? 'text-rose-700'
                      : 'text-emerald-700'
                  }`}>
                    {currentStudent.quintaMencao.status}
                  </div>
                  <span className="text-[10px] text-slate-400">Conselho soberano</span>
                </div>

              </div>

            </div>

            {/* Body: Gradebook Table */}
            <div className="p-6 space-y-6">
              
              {/* IF VIEW IS A SINGLE BIMESTER (1, 2, 3 OR 4) */}
              {activeBimesterTab !== 'anual' && currentBimData && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Boletim do {activeBimesterTab}º Bimestre (M · F · AC)
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>M = Menção</span>
                      <span>·</span>
                      <span>F = Faltas</span>
                      <span>·</span>
                      <span>AC = Ausência Compensada</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                          <th className="py-2.5 px-3 font-semibold">Componente Curricular</th>
                          <th className="py-2.5 px-2 font-semibold text-center">Menção (M)</th>
                          <th className="py-2.5 px-2 font-semibold text-center">Faltas (F)</th>
                          <th className="py-2.5 px-2 font-semibold text-center">Comp. (AC)</th>
                          <th className="py-2.5 px-2 font-semibold text-center">Aulas</th>
                          <th className="py-2.5 px-2 font-semibold text-center">Freq. (%)</th>
                          <th className="py-2.5 px-3 font-semibold text-right">Situação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.values(currentBimData.grades).map((grade) => {
                          const isFailing = grade.grade > 0 && grade.grade < 5.0;
                          const isLowAttendance = grade.attendanceRate < 75;

                          return (
                            <tr key={grade.subjectCode} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                {grade.subjectName}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums">
                                <span className={isFailing ? 'text-rose-600 font-bold' : 'text-slate-900'}>
                                  {grade.mention || grade.grade.toFixed(1)}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono text-slate-700 tabular-nums">
                                {grade.absences}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono text-blue-700 font-medium tabular-nums">
                                {grade.compensatedAbsences > 0 ? `+${grade.compensatedAbsences}` : '0'}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono text-slate-500 tabular-nums text-[11px]">
                                {grade.totalClasses}
                              </td>
                              <td className="py-2.5 px-2 text-center font-mono tabular-nums">
                                <span className={isLowAttendance ? 'text-orange-600 font-bold' : 'text-slate-600'}>
                                  {grade.attendanceRate}%
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {isFailing ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Recuperação</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Satisfatório</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* IF VIEW IS COMPARATIVO ANUAL: Shows all 4 bimesters side-by-side! */}
              {activeBimesterTab === 'anual' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Evolução Bimestral Completa (1º, 2º, 3º, 4º Bimestre e 5ª Menção)
                    </h3>
                    <span className="text-xs text-blue-700 font-semibold">Parâmetros Anuais Consolidados</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                          <th className="py-2.5 px-3 font-semibold">Componente Curricular</th>
                          <th className="py-2.5 px-2 font-semibold text-center bg-blue-50/50">1º Bim (M·F)</th>
                          <th className="py-2.5 px-2 font-semibold text-center bg-blue-50/70">2º Bim (M·F)</th>
                          <th className="py-2.5 px-2 font-semibold text-center bg-blue-50/50">3º Bim (M·F)</th>
                          <th className="py-2.5 px-2 font-semibold text-center bg-blue-50/70">4º Bim (M·F)</th>
                          <th className="py-2.5 px-2 font-semibold text-center">Média Anual</th>
                          <th className="py-2.5 px-3 font-semibold text-right">5ª Menção (Conselho)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {OFFICIAL_SP_SUBJECTS.map((subj) => {
                          const g1 = currentStudent.bimesters[1]?.grades[subj.code];
                          const g2 = currentStudent.bimesters[2]?.grades[subj.code];
                          const g3 = currentStudent.bimesters[3]?.grades[subj.code];
                          const g4 = currentStudent.bimesters[4]?.grades[subj.code];

                          const notes = [g1?.grade || 0, g2?.grade || 0, g3?.grade || 0, g4?.grade || 0].filter((n) => n > 0);
                          const subjAnnualAvg = notes.length > 0 ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10 : 0;

                          return (
                            <tr key={subj.code} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-3 font-medium text-slate-900">
                                {subj.name}
                              </td>

                              <td className="py-2.5 px-2 text-center font-mono tabular-nums bg-blue-50/20">
                                {g1 ? (
                                  <span>
                                    <strong className={g1.grade < 5.0 ? 'text-rose-600' : 'text-slate-800'}>{g1.mention || g1.grade}</strong>
                                    <span className="text-slate-400 text-[10px]"> ({g1.absences}f)</span>
                                  </span>
                                ) : '-'}
                              </td>

                              <td className="py-2.5 px-2 text-center font-mono tabular-nums bg-blue-50/30">
                                {g2 ? (
                                  <span>
                                    <strong className={g2.grade < 5.0 ? 'text-rose-600' : 'text-slate-800'}>{g2.mention || g2.grade}</strong>
                                    <span className="text-slate-400 text-[10px]"> ({g2.absences}f)</span>
                                  </span>
                                ) : '-'}
                              </td>

                              <td className="py-2.5 px-2 text-center font-mono tabular-nums bg-blue-50/20">
                                {g3 ? (
                                  <span>
                                    <strong className={g3.grade < 5.0 ? 'text-rose-600' : 'text-slate-800'}>{g3.mention || g3.grade}</strong>
                                    <span className="text-slate-400 text-[10px]"> ({g3.absences}f)</span>
                                  </span>
                                ) : '-'}
                              </td>

                              <td className="py-2.5 px-2 text-center font-mono tabular-nums bg-blue-50/30">
                                {g4 ? (
                                  <span>
                                    <strong className={g4.grade < 5.0 ? 'text-rose-600' : 'text-slate-800'}>{g4.mention || g4.grade}</strong>
                                    <span className="text-slate-400 text-[10px]"> ({g4.absences}f)</span>
                                  </span>
                                ) : '-'}
                              </td>

                              <td className="py-2.5 px-2 text-center font-mono font-bold tabular-nums">
                                <span className={subjAnnualAvg < 5.0 ? 'text-rose-600' : 'text-slate-900'}>
                                  {subjAnnualAvg.toFixed(1)}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 text-right">
                                {currentStudent.quintaMencao.status === 'Aprovado pelo Conselho' ? (
                                  <span className="text-blue-700 font-bold text-[11px]">
                                    {subjAnnualAvg < 5.0 ? '5ª M: 5,0 (Conselho)' : 'Aprovado'}
                                  </span>
                                ) : subjAnnualAvg >= 5.0 ? (
                                  <span className="text-emerald-700 font-bold text-[11px]">Aprovado</span>
                                ) : (
                                  <span className="text-rose-700 font-bold text-[11px]">Recuperação / Retido</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5ª Menção Deliberation Box */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <Award className="w-4 h-4 text-blue-600" />
                    <span>Deliberação Soberana da 5ª Menção (Conselho de Classe)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700">Art. 24 LDB / SEDUC-SP</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Julgamento do Conselho:
                    </label>
                    <select
                      value={currentStudent.quintaMencao.status}
                      onChange={(e) => onUpdateQuintaMencao && onUpdateQuintaMencao(currentStudent.id, e.target.value as QuintaMencaoStatus, currentStudent.quintaMencao.justification)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-lg border border-blue-300 bg-white text-slate-800 focus:outline-none"
                    >
                      <option value="Aprovado">Aprovado (Direto)</option>
                      <option value="Aprovado pelo Conselho">Aprovado pelo Conselho (5ª Menção)</option>
                      <option value="Retido por Rendimento">Retido por Rendimento</option>
                      <option value="Retido por Faltas">Retido por Faltas</option>
                      <option value="Retido por Rendimento e Faltas">Retido por Rendimento e Faltas</option>
                      <option value="Pendente">Pendente / Transferido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Justificativa Registrada em Ata:
                    </label>
                    <input
                      type="text"
                      value={currentStudent.quintaMencao.justification}
                      onChange={(e) => onUpdateQuintaMencao && onUpdateQuintaMencao(currentStudent.id, currentStudent.quintaMencao.status, e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-blue-200 bg-white text-slate-800 focus:outline-none"
                      placeholder="Parecer da comissão de professores..."
                    />
                  </div>
                </div>
              </div>

              {/* Parecer Descritivo e Ações */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Parecer Descritivo e Encaminhamentos da Sala do Futuro</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {currentStudent.pedagogicalOpinion}
                </p>
              </div>

              {/* Print layout signature footer */}
              <div className="print-only mt-12 pt-8 border-t border-slate-300">
                <div className="grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-b border-black w-48 mx-auto mb-1"></div>
                    <p className="font-semibold">Professor(a) Coordenador(a)</p>
                    <p className="text-[10px] text-slate-600">Polo Sala do Futuro SP</p>
                  </div>
                  <div>
                    <div className="border-b border-black w-48 mx-auto mb-1"></div>
                    <p className="font-semibold">Direção Escolar</p>
                    <p className="text-[10px] text-slate-600">E.E. Maria Cristina Schmidt Miranda Profes</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : null}
      </div>

    </div>
  );
};
