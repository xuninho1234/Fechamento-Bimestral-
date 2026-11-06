import React from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Users, 
  LayoutDashboard, 
  GraduationCap, 
  FileText, 
  Download, 
  Sparkles,
  School,
  Award,
  Trash2
} from 'lucide-react';
import { downloadSampleExcelTemplate, exportConsolidatedReportXLSX } from '../utils/excelParser.ts';
import { StudentRecord, ClassAnalysisSummary } from '../types/education.ts';

export type ActiveTab = 'dashboard' | 'students' | 'bncc' | 'conselho' | 'quinta_mencao' | 'assistant';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  onOpenClearModal: () => void;
  students: StudentRecord[];
  summary: ClassAnalysisSummary;
  selectedBimester: number | '5ª Menção';
  onSelectBimester: (b: number | '5ª Menção') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenClearModal,
  students,
  summary,
  selectedBimester,
  onSelectBimester
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md no-print w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* ROW 1: Brand Wordmark (Left) + Primary Action Buttons (Right) - NEVER OVERFLOWS */}
        <div className="flex items-center justify-between h-14 gap-3 border-b border-slate-800/80">
          
          {/* Brand & School Context */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <School className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white whitespace-nowrap">
                  Sala do Futuro SP
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold truncate">
                  {summary.diretoriaEnsino}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {summary.schoolName} · {summary.classGroup}
              </p>
            </div>
          </div>

          {/* Right Action Buttons: "Limpar Bimestres" + "Modelo XLS" + "Upar Planilha" */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Limpar Bimestres Button */}
            <button
              onClick={onOpenClearModal}
              title="Limpar ou resetar bimestres para subir novas planilhas"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Limpar Bimestres</span>
              <span className="sm:hidden">Limpar</span>
            </button>

            {/* Baixar Modelo XLS */}
            <button
              onClick={downloadSampleExcelTemplate}
              title="Baixar planilha modelo original da Sala do Futuro SP (.xlsx)"
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Modelo XLS</span>
            </button>

            {/* UPAR PLANILHA - FIRMLY ANCHORED, ALWAYS VISIBLE */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
              title="Enviar planilha de fechamento bimestral (XLS/XLSX)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upar Planilha</span>
            </button>

          </div>
        </div>

        {/* ROW 2: Navigation Tabs (Left) + Bimester Switcher (Right) - FITS FULL PAGE */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2">
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 overflow-x-auto text-xs font-semibold no-scrollbar">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'students'
                  ? 'bg-slate-800 text-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Alunos ({students.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bncc')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'bncc'
                  ? 'bg-slate-800 text-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Matriz BNCC</span>
            </button>

            <button
              onClick={() => setActiveTab('conselho')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'conselho'
                  ? 'bg-slate-800 text-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Conselho Bimestral</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('quinta_mencao');
                onSelectBimester('5ª Menção');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'quinta_mencao'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-amber-300 hover:text-white bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>5ª Menção (Julgamento)</span>
            </button>

            <button
              onClick={() => setActiveTab('assistant')}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'assistant'
                  ? 'bg-slate-800 text-blue-400 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Parecer IA</span>
            </button>
          </nav>

          {/* Bimester Switcher Toolbar */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-[11px] font-semibold shrink-0 self-start md:self-auto">
            <span className="text-[10px] text-slate-400 px-2 font-medium">Bimestre:</span>
            
            <button
              onClick={() => onSelectBimester(1)}
              className={`px-2 py-1 rounded transition-colors ${selectedBimester === 1 ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              1º
            </button>
            <button
              onClick={() => onSelectBimester(2)}
              className={`px-2 py-1 rounded transition-colors ${selectedBimester === 2 ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              2º
            </button>
            <button
              onClick={() => onSelectBimester(3)}
              className={`px-2 py-1 rounded transition-colors ${selectedBimester === 3 ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              3º
            </button>
            <button
              onClick={() => onSelectBimester(4)}
              className={`px-2 py-1 rounded transition-colors ${selectedBimester === 4 ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              4º
            </button>
            <button
              onClick={() => {
                onSelectBimester('5ª Menção');
                setActiveTab('quinta_mencao');
              }}
              className={`px-2.5 py-1 rounded font-bold transition-colors ${selectedBimester === '5ª Menção' ? 'bg-amber-500 text-slate-950' : 'text-amber-400 hover:text-white'}`}
              title="5ª Menção - Julgamento de Aprovação pelo Conselho"
            >
              5ª Menção
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
