import React from 'react';
import { Trash2, AlertTriangle, X, RefreshCw, Upload, Check } from 'lucide-react';

interface ClearBimestersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllBimesters: () => void;
  onClearLaterBimesters?: () => void;
  onRestoreOriginal: () => void;
  totalStudents: number;
}

export const ClearBimestersModal: React.FC<ClearBimestersModalProps> = ({
  isOpen,
  onClose,
  onClearAllBimesters,
  onClearLaterBimesters,
  onRestoreOriginal,
  totalStudents
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in no-print">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Limpar Todo o Sistema
              </h3>
              <p className="text-[11px] text-slate-500">
                Remover todos os dados para novo envio de planilha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 leading-relaxed">
              <strong className="block font-bold">Atenção: Limpeza Completa</strong>
              Ao confirmar, <strong>todas as notas, bimestres, alunos e parâmetros serão removidos</strong> da aplicação. O site ficará completamente limpo e pronto para receber o upload da sua planilha oficial.
            </div>
          </div>

          <div className="space-y-2">
            {/* Primary Action: Clear everything */}
            <button
              type="button"
              onClick={() => {
                onClearAllBimesters();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Sim, Limpar e Zerar Todo o Site</span>
            </button>

            {/* Secondary: Restore sample */}
            <button
              type="button"
              onClick={() => {
                onRestoreOriginal();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restaurar Turma Modelo (E.E. Maria Cristina)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
