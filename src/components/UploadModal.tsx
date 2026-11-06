import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles,
  Info,
  Layers,
  ShieldCheck
} from 'lucide-react';
import { 
  parseExcelFechamento, 
  downloadSampleExcelTemplate, 
  downloadQuintaMencaoExcelTemplate, 
  mergeBimesterIntoExistingStudents, 
  mergeQuintaMencaoIntoExistingStudents 
} from '../utils/excelParser.ts';
import { StudentRecord, ClassAnalysisSummary } from '../types/education.ts';
import { calculateClassSummary } from '../data/mockSampleData.ts';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (students: StudentRecord[], summary: ClassAnalysisSummary) => void;
  onLoadSample: () => void;
  currentStudents?: StudentRecord[];
  initialMode?: 'bimester' | 'quinta_mencao';
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onLoadSample,
  currentStudents = [],
  initialMode = 'bimester'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBimOption, setSelectedBimOption] = useState<'auto' | 1 | 2 | 3 | 4 | '5ª Menção'>(
    initialMode === 'quinta_mencao' ? '5ª Menção' : 'auto'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ count: number; bimester: string; isMerge: boolean } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialMode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (initialMode === 'quinta_mencao') {
        setSelectedBimOption('5ª Menção');
      } else {
        setSelectedBimOption('auto');
      }
      setErrorMessage(null);
      setSuccessInfo(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessInfo(null);

    const bimesterOverride = selectedBimOption === 'auto' ? undefined : selectedBimOption;
    const result = await parseExcelFechamento(file, bimesterOverride);

    setIsProcessing(false);

    if (!result.success || result.students.length === 0) {
      setErrorMessage(result.error || 'Não foi possível extrair os dados da planilha.');
      return;
    }

    const isQuintaMencaoUpload = result.metadata.bimester === '5ª Menção' || selectedBimOption === '5ª Menção';
    let finalStudents: StudentRecord[] = result.students;
    let isMerge = false;

    if (isQuintaMencaoUpload) {
      // Merge 5ª Menção spreadsheet (downloaded from Sala do Futuro SP) into existing students
      if (currentStudents.length > 0) {
        finalStudents = mergeQuintaMencaoIntoExistingStudents(currentStudents, result.students, file.name);
        isMerge = true;
      } else {
        finalStudents = result.students;
      }
    } else {
      const effectiveBim = typeof result.metadata.bimester === 'number' ? result.metadata.bimester : 1;
      // Merge bimester grades into existing students if already loaded
      if (currentStudents.length > 0) {
        finalStudents = mergeBimesterIntoExistingStudents(currentStudents, result.students, effectiveBim);
        isMerge = true;
      }
    }

    const effectiveBim = isQuintaMencaoUpload ? ('5ª Menção' as const) : (typeof result.metadata.bimester === 'number' ? result.metadata.bimester : 1);

    const summary = calculateClassSummary(
      finalStudents,
      result.metadata.schoolName || 'Maria Cristina Schmidt Miranda Profes',
      result.metadata.classGroup || '9º ANO A MANHA ANUAL',
      effectiveBim,
      result.metadata.year || 2026,
      result.metadata.directorName || 'IARA KURZ GATTI',
      result.metadata.goeName || 'MARILI MARTIM OGEDA OLIVEIRA',
      result.metadata.diretoriaEnsino || 'São Bernardo do Campo',
      result.metadata.teachingType || '14 - ENSINO FUNDAMENTAL DE 9 AN',
      isQuintaMencaoUpload ? 'Conselho Final - 5ª Menção' : `Conselho ${effectiveBim}º Bimestre`,
      result.metadata.totalAulasDadas || 310
    );

    setSuccessInfo({
      count: finalStudents.length,
      bimester: isQuintaMencaoUpload ? '5ª Menção (Conselho Final)' : `${effectiveBim}º Bimestre`,
      isMerge
    });

    setTimeout(() => {
      onDataLoaded(finalStudents, summary);
      onClose();
    }, 800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in no-print">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upar Fechamento Bimestral (XLS / XLSX)
              </h2>
              <p className="text-xs text-slate-500">
                Secretaria da Educação SP · Sala do Futuro
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Target Bimester Selector */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>Tipo de Planilha a ser enviada:</span>
              <span className="text-[11px] font-normal text-slate-500">Planilhas oficiais da Sala do Futuro SP</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedBimOption('auto')}
                className={`py-1.5 px-2 rounded font-medium border text-center transition-colors ${
                  selectedBimOption === 'auto'
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Auto (Detectar)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBimOption(1)}
                className={`py-1.5 px-2 rounded font-medium border text-center transition-colors ${
                  selectedBimOption === 1
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                1º Bim
              </button>
              <button
                type="button"
                onClick={() => setSelectedBimOption(2)}
                className={`py-1.5 px-2 rounded font-medium border text-center transition-colors ${
                  selectedBimOption === 2
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                2º Bim
              </button>
              <button
                type="button"
                onClick={() => setSelectedBimOption(3)}
                className={`py-1.5 px-2 rounded font-medium border text-center transition-colors ${
                  selectedBimOption === 3
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                3º Bim
              </button>
              <button
                type="button"
                onClick={() => setSelectedBimOption(4)}
                className={`py-1.5 px-2 rounded font-medium border text-center transition-colors ${
                  selectedBimOption === 4
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                4º Bim
              </button>
              <button
                type="button"
                onClick={() => setSelectedBimOption('5ª Menção')}
                className={`py-1.5 px-2 rounded font-medium border text-center transition-all ${
                  selectedBimOption === '5ª Menção'
                    ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
              >
                🎓 5ª Menção
              </button>
            </div>

            {selectedBimOption === '5ª Menção' && (
              <div className="mt-2.5 p-2 rounded bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Planilha de 5ª Menção:</strong> Os dados de conselho final e menções deliberadas serão integrados diretamente aos alunos cadastrados.
                </span>
              </div>
            )}
          </div>

          {/* Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
            />

            <div className="mx-auto w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
              <FileSpreadsheet className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {isProcessing ? 'Processando e organizando dados por aluno...' : 'Clique para selecionar ou arraste a planilha aqui'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Registro e Controle do Rendimento Escolar (.xls ou .xlsx)
            </p>

            {/* Strict legend exclusion guarantee indicator */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 py-1 px-2.5 rounded-md max-w-md mx-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>A legenda e rodapé no final da planilha são excluídos automaticamente da lista</span>
            </div>
          </div>

          {/* Feedback states */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro no processamento da planilha</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successInfo && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {successInfo.isMerge ? `Dados do ${successInfo.bimester} integrados ao histórico!` : `Planilha do ${successInfo.bimester} carregada com sucesso!`}
                </p>
                <p className="mt-0.5">
                  Organizados {successInfo.count} estudantes com notas, faltas (F), ausências compensadas (AC) e sem linhas de legenda.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onLoadSample();
                onClose();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Turma Exemplo</span>
            </button>

            <button
              type="button"
              onClick={downloadSampleExcelTemplate}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Modelo Bimestral (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={downloadQuintaMencaoExcelTemplate}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Modelo 5ª Menção (.xlsx)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
