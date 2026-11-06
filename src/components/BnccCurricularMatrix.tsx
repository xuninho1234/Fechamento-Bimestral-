import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  CheckCircle, 
  AlertCircle, 
  Compass, 
  Lightbulb, 
  Laptop, 
  Layers,
  HelpCircle,
  FileText
} from 'lucide-react';
import { ClassAnalysisSummary, KnowledgeArea } from '../types/education.ts';
import { 
  BNCC_GENERAL_COMPETENCIES, 
  CURRICULO_PAULISTA_ESSENTIAL_SKILLS, 
  KNOWLEDGE_AREAS 
} from '../data/bnccCurriculoPaulista.ts';

interface BnccCurricularMatrixProps {
  summary: ClassAnalysisSummary;
}

export const BnccCurricularMatrix: React.FC<BnccCurricularMatrixProps> = ({ summary }) => {
  const [selectedArea, setSelectedArea] = useState<KnowledgeArea>('linguagens');

  if (summary.totalStudents === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Matriz Curricular BNCC / SEDUC-SP</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Nenhuma turma carregada. Ao fazer o upload da planilha de fechamento bimestral, os desempenhos por área (Linguagens, Matemática, Ciências da Natureza, Humanas e Inova Educação) serão consolidados com base no Currículo Paulista.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Currículo Paulista & Base Nacional Comum Curricular</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Análise de Competências e Habilidades · Fechamento Bimestral
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Alinhamento oficial com a Resolução SEDUC e o programa Sala do Futuro SP para identificação de defasagens e consolidação das habilidades essenciais.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              {summary.classGroup} · {summary.bimester}º Bimestre
            </span>
          </div>
        </div>
      </div>

      {/* Áreas do Conhecimento Tab Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            1. Diagnóstico Curricular por Grande Área
          </h2>
          <span className="text-xs text-slate-500">Média da Turma: {summary.classAverage.toFixed(1)}</span>
        </div>

        {/* Tab buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.keys(KNOWLEDGE_AREAS) as KnowledgeArea[]).map((areaKey) => {
            const isSelected = selectedArea === areaKey;
            const config = KNOWLEDGE_AREAS[areaKey];
            const perf = summary.areaPerformance[areaKey];

            return (
              <button
                key={areaKey}
                onClick={() => setSelectedArea(areaKey)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 truncate">
                  {config.name.split(' ')[0]}
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="font-mono font-bold text-slate-800 tabular-nums">
                    {perf.averageGrade.toFixed(1)}
                  </span>
                  <span className={`font-mono text-[10px] ${perf.failureRate > 20 ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                    {perf.failureRate}% defas.
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Area Detailed Focus */}
        <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {KNOWLEDGE_AREAS[selectedArea].name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {KNOWLEDGE_AREAS[selectedArea].description}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 block">Rendimento Médio</span>
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {summary.areaPerformance[selectedArea].averageGrade.toFixed(1)} / 10
              </span>
            </div>
          </div>

          {/* Essential Skills from Currículo Paulista for this area */}
          <div className="pt-3 border-t border-slate-200/60 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Habilidades Estruturantes do Bimestre (Currículo Paulista SP)
            </span>
            
            <div className="space-y-2">
              {Object.keys(CURRICULO_PAULISTA_ESSENTIAL_SKILLS).map((code) => {
                const skills = CURRICULO_PAULISTA_ESSENTIAL_SKILLS[code];
                return (
                  <div key={code} className="space-y-1.5">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-slate-800">{skill}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Foco de nivelamento e roteiros interativos nas plataformas Sala do Futuro (Tarefas SP, Matific, Redação SP).
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 10 Competências Gerais da BNCC Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            2. Mobilização das 10 Competências Gerais da BNCC
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento integral do desenvolvimento socioemocional e cognitivo da turma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {BNCC_GENERAL_COMPETENCIES.map((comp) => {
            return (
              <div key={comp.id} className="p-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {comp.id}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      {comp.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Prática pedagógica ativa</span>
                  <span className="text-emerald-700 font-semibold">Integrada</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diretrizes Oficiais SEDUC-SP para Recuperação e Aprofundamento */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          3. Roteiro de Intervenção Pedagógica SEDUC-SP
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>Sala do Futuro & Plataformas</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Utilização semanal das plataformas Tarefas SP, Redação SP e Matific/Khan Academy com monitoramento em tempo real do engajamento dos estudantes.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Recuperação Contínua</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Garantia do direito de recuperação de notas e habilidades deficitárias durante todo o bimestre e nas semanas de estudos intensivos (SEI).
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Compass className="w-4 h-4 text-purple-600" />
              <span>Busca Ativa & Acolhimento</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Acompanhamento rigoroso da assiduidade escolar para evitar o abandono. Notificação aos responsáveis quando as faltas ultrapassarem 10% do bimestre.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
