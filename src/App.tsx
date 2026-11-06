/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header.tsx';
import { DashboardOverview } from './components/DashboardOverview.tsx';
import { StudentListAndDetail } from './components/StudentListAndDetail.tsx';
import { BnccCurricularMatrix } from './components/BnccCurricularMatrix.tsx';
import { ConselhoDeClasseView } from './components/ConselhoDeClasseView.tsx';
import { QuintaMencaoView } from './components/QuintaMencaoView.tsx';
import { GeminiPedagogicalAssistant } from './components/GeminiPedagogicalAssistant.tsx';
import { UploadModal } from './components/UploadModal.tsx';
import { ClearBimestersModal } from './components/ClearBimestersModal.tsx';
import { StudentRecord, ClassAnalysisSummary, QuintaMencaoStatus, StudentBimesterData } from './types/education.ts';
import { generateSampleClassData, calculateClassSummary } from './data/mockSampleData.ts';
import { OFFICIAL_SP_SUBJECTS } from './data/bnccCurriculoPaulista.ts';

export default function App() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [summary, setSummary] = useState<ClassAnalysisSummary | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedBimester, setSelectedBimester] = useState<number | '5ª Menção'>(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize with official SEDUC-SP class on first load
  useEffect(() => {
    const { students: sampleStudents, summary: sampleSummary } = generateSampleClassData();
    setStudents(sampleStudents);
    setSummary(sampleSummary);
    if (sampleStudents.length > 0) {
      setSelectedStudent(sampleStudents[0]);
    }
  }, []);

  const handleDataLoaded = (newStudents: StudentRecord[], newSummary: ClassAnalysisSummary) => {
    setStudents(newStudents);
    setSummary(newSummary);
    setSelectedBimester(newSummary.bimester);
    if (newStudents.length > 0) {
      setSelectedStudent(newStudents[0]);
    }
    setActiveTab('dashboard');
    showNotification(`Planilha SEDUC processada! ${newStudents.length} estudantes organizados.`);
  };

  const handleLoadSample = () => {
    const { students: sampleStudents, summary: sampleSummary } = generateSampleClassData();
    setStudents(sampleStudents);
    setSummary(sampleSummary);
    setSelectedBimester(1);
    if (sampleStudents.length > 0) {
      setSelectedStudent(sampleStudents[0]);
    }
    showNotification('Turma oficial E.E. Maria Cristina Schmidt Miranda carregada com sucesso.');
  };

  // Handler to clear ALL bimesters and all website data with zero leftover information
  const handleClearAllBimesters = () => {
    setStudents([]);
    setSelectedStudent(null);
    setSelectedBimester(1);

    const blankSummary: ClassAnalysisSummary = {
      schoolName: 'Aguardando Importação da Planilha',
      directorName: '-',
      goeName: '-',
      diretoriaEnsino: 'SEDUC-SP',
      classGroup: 'Nenhuma Turma Carregada',
      teachingType: '-',
      bimester: 1,
      tipoFechamento: 'Conselho de Classe',
      totalAulasDadas: 0,
      year: 2026,
      totalStudents: 0,
      totalActiveStudents: 0,
      totalTransferredStudents: 0,
      totalNonAttendingStudents: 0,
      classAverage: 0,
      averageAttendanceRate: 0,
      averageAnnualAttendanceRate: 0,
      totalStudentsInRecovery: 0,
      totalStudentsAtRiskAbsences: 0,
      totalStudentsCriticalRisk: 0,
      totalStudentsHighPerforming: 0,
      loadedBimesters: [],
      bnccLevelDistribution: {
        abaixo_do_basico: 0,
        basico: 0,
        adequado: 0,
        avancado: 0
      },
      quintaMencaoDistribution: {
        aprovadosDiretos: 0,
        aprovadosPeloConselho: 0,
        retidosRendimento: 0,
        retidosFaltas: 0,
        retidosDuplo: 0,
        pendentes: 0
      },
      areaPerformance: {
        linguagens: { areaName: 'Linguagens', averageGrade: 0, failureRate: 0 },
        matematica: { areaName: 'Matemática', averageGrade: 0, failureRate: 0 },
        ciencias_natureza: { areaName: 'Ciências da Natureza', averageGrade: 0, failureRate: 0 },
        ciencias_humanas: { areaName: 'Ciências Humanas', averageGrade: 0, failureRate: 0 },
        inova_educacao: { areaName: 'Inova Educação', averageGrade: 0, failureRate: 0 }
      },
      criticalSubjects: []
    };

    setSummary(blankSummary);
    setActiveTab('dashboard');
    showNotification('O sistema foi totalmente limpo! Nenhuma informação anterior mantida. Pronto para novo envio.');
  };

  // Handler to clear only later bimesters (2º, 3º, 4º)
  const handleClearLaterBimesters = () => {
    if (!summary) return;

    const updatedStudents = students.map((s) => {
      const bim1 = s.bimesters[1];
      const emptyGrades: Record<string, any> = {};
      OFFICIAL_SP_SUBJECTS.forEach((subj) => {
        emptyGrades[subj.code] = {
          subjectCode: subj.code,
          subjectName: subj.name,
          area: subj.area,
          mention: '-',
          grade: 0,
          absences: 0,
          compensatedAbsences: 0,
          totalClasses: subj.totalAulas,
          attendanceRate: 100,
          bnccLevel: 'basico' as const,
          needsRecovery: false,
          finalGrade: 0
        };
      });

      const emptyBimData = (num: 2 | 3 | 4): StudentBimesterData => ({
        bimester: num,
        grades: emptyGrades,
        overallAverage: 0,
        totalAbsences: 0,
        totalCompensatedAbsences: 0,
        attendanceRate: 100,
        annualAbsences: 0,
        annualAttendanceRate: 100,
        bnccLevel: 'basico',
        needsRecoverySubjects: [],
        areaAverages: {
          linguagens: 0,
          matematica: 0,
          ciencias_natureza: 0,
          ciencias_humanas: 0,
          inova_educacao: 0
        },
        isLoaded: false
      });

      return {
        ...s,
        grades: bim1?.grades || s.grades,
        overallAverage: bim1?.overallAverage || s.overallAverage,
        totalAbsences: bim1?.totalAbsences || s.totalAbsences,
        totalCompensatedAbsences: bim1?.totalCompensatedAbsences || s.totalCompensatedAbsences,
        overallAttendanceRate: bim1?.attendanceRate || s.overallAttendanceRate,
        bimesters: {
          1: bim1 || s.bimesters[1],
          2: emptyBimData(2),
          3: emptyBimData(3),
          4: emptyBimData(4)
        }
      };
    });

    setStudents(updatedStudents);
    if (selectedStudent) {
      const match = updatedStudents.find((s) => s.id === selectedStudent.id);
      setSelectedStudent(match || updatedStudents[0]);
    }
    setSelectedBimester(1);
    showNotification('Bimestres 2º, 3º e 4º limpos. Dados do 1º Bimestre preservados!');
  };

  const handleSelectStudent = (student: StudentRecord) => {
    setSelectedStudent(student);
    setActiveTab('students');
  };

  const handleUpdateDeliberation = (studentId: string, deliberation: 'Aprovado' | 'Recuperação Contínua' | 'Busca Ativa' | 'Encaminhamento PDI') => {
    setStudents((prev) => 
      prev.map((s) => s.id === studentId ? { ...s, councilDeliberation: deliberation } : s)
    );
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) => prev ? { ...prev, councilDeliberation: deliberation } : null);
    }
    showNotification(`Deliberação atualizada para "${deliberation}".`);
  };

  const handleUpdateQuintaMencao = (studentId: string, status: QuintaMencaoStatus, justification: string) => {
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            quintaMencao: {
              ...s.quintaMencao,
              status,
              justification,
              updatedAt: new Date().toISOString()
            }
          };
        }
        return s;
      });

      if (summary) {
        const newSummary = calculateClassSummary(
          updated,
          summary.schoolName,
          summary.classGroup,
          selectedBimester,
          summary.year,
          summary.directorName,
          summary.goeName,
          summary.diretoriaEnsino,
          summary.teachingType,
          summary.tipoFechamento,
          summary.totalAulasDadas
        );
        setSummary(newSummary);
      }

      return updated;
    });

    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev) => prev ? {
        ...prev,
        quintaMencao: {
          ...prev.quintaMencao,
          status,
          justification,
          updatedAt: new Date().toISOString()
        }
      } : null);
    }

    showNotification(`5ª Menção registrada: "${status}".`);
  };

  const handleSelectBimester = (b: number | '5ª Menção') => {
    setSelectedBimester(b);
    if (b === '5ª Menção') {
      setActiveTab('quinta_mencao');
    }
    if (summary) {
      setSummary({ ...summary, bimester: b });
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  if (!summary) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Carregando dados da Sala do Futuro SP...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation Bar with Always-Visible Action Buttons & Zero Overflow */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenClearModal={() => setIsClearModalOpen(true)}
        students={students}
        summary={summary}
        selectedBimester={selectedBimester}
        onSelectBimester={handleSelectBimester}
      />

      {/* Ephemeral Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 text-xs font-medium flex items-center gap-2 animate-bounce-in no-print">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {activeTab === 'dashboard' && (
          <DashboardOverview
            summary={summary}
            students={students}
            onSelectStudent={handleSelectStudent}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onLoadSample={handleLoadSample}
            onNavigateToTab={(tab) => {
              if (tab === 'conselho' && selectedBimester === '5ª Menção') {
                setActiveTab('quinta_mencao');
              } else {
                setActiveTab(tab as any);
              }
            }}
          />
        )}

        {activeTab === 'students' && (
          <StudentListAndDetail
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={setSelectedStudent}
            onUpdateDeliberation={handleUpdateDeliberation}
            onUpdateQuintaMencao={handleUpdateQuintaMencao}
          />
        )}

        {activeTab === 'bncc' && (
          <BnccCurricularMatrix
            summary={summary}
          />
        )}

        {activeTab === 'conselho' && (
          <ConselhoDeClasseView
            students={students}
            summary={summary}
            onUpdateDeliberation={handleUpdateDeliberation}
          />
        )}

        {activeTab === 'quinta_mencao' && (
          <QuintaMencaoView
            students={students}
            summary={summary}
            onUpdateQuintaMencao={handleUpdateQuintaMencao}
          />
        )}

        {activeTab === 'assistant' && (
          <GeminiPedagogicalAssistant
            summary={summary}
            students={students}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {summary.schoolName} · Diretoria: {summary.diretoriaEnsino} · Sala do Futuro SEDUC-SP
          </p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>5ª Menção Regimental</span>
            <span>·</span>
            <span>Art. 24 LDB 9.394/96</span>
            <span>·</span>
            <span>Resoluções SEDUC-SP</span>
          </div>
        </div>
      </footer>

      {/* Upload Spreadsheet Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        onLoadSample={handleLoadSample}
        currentStudents={students}
      />

      {/* Clear Bimesters Modal */}
      <ClearBimestersModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onClearAllBimesters={handleClearAllBimesters}
        onClearLaterBimesters={handleClearLaterBimesters}
        onRestoreOriginal={handleLoadSample}
        totalStudents={students.length}
      />

    </div>
  );
}
