import * as XLSX from 'xlsx';
import { 
  StudentRecord, 
  StudentSubjectGrade, 
  KnowledgeArea, 
  StudentSituation, 
  QuintaMencaoStatus,
  StudentBimesterData 
} from '../types/education.ts';
import { OFFICIAL_SP_SUBJECTS, getBnccLevel, getRiskProfile, parseMentionToGrade } from '../data/bnccCurriculoPaulista.ts';

function normalizeStr(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseNumber(val: any): number {
  if (val === null || val === undefined || val === '' || val === '-') return 0;
  if (typeof val === 'number') return Math.max(0, val);
  const clean = String(val).trim().replace('%', '').replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.max(0, num);
}

// Strictly verify if a row is the bottom Legend/Footer to exclude it from the student list
function isLegendOrFooterRow(row: any[]): boolean {
  if (!row || row.length === 0) return true;
  const firstCells = row.slice(0, 5).map((c) => normalizeStr(c)).join(' ');

  const BANNED_PATTERNS = [
    'legenda',
    'mencao',
    'engajamento',
    'satisfatorio',
    'parcial',
    'ausencia compensada',
    'aulas dadas',
    'soma de todas',
    'diretor',
    'goe',
    'resultado informado',
    'corresponde',
    'registro e controle',
    'ano letivo',
    'diretoria',
    'tipo de ensino',
    'tipo fechamento',
    'total de aulas',
    'aluno',
    'situacao',
    'f - frequencia',
    'ac - ausencia'
  ];

  for (const pattern of BANNED_PATTERNS) {
    if (firstCells.includes(pattern)) {
      return true;
    }
  }

  // Check if first cell starts with legend codes (e.g., "M - Menção", "ES - ", "ET - ", "EP - ", "F - ", "AC - ")
  const cell0 = normalizeStr(row[0]);
  if (
    cell0.startsWith('m -') ||
    cell0.startsWith('es -') ||
    cell0.startsWith('et -') ||
    cell0.startsWith('ep -') ||
    cell0.startsWith('f -') ||
    cell0.startsWith('ac -') ||
    cell0.startsWith('legenda')
  ) {
    return true;
  }

  // Row with no student name or name shorter than 3 letters
  if (!row[0] || String(row[0]).trim().length < 3) {
    return true;
  }

  return false;
}

export interface ParseResult {
  success: boolean;
  students: StudentRecord[];
  metadata: {
    fileName: string;
    schoolName: string;
    directorName: string;
    goeName: string;
    diretoriaEnsino: string;
    classGroup: string;
    teachingType: string;
    bimester: 1 | 2 | 3 | 4 | '5ª Menção';
    tipoFechamento: string;
    totalAulasDadas: number;
    year: number;
    rowsCount: number;
    subjectsFound: string[];
    warnings: string[];
  };
  error?: string;
}

export async function parseExcelFechamento(file: File, overrideBimester?: 1 | 2 | 3 | 4 | '5ª Menção'): Promise<ParseResult> {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        students: [],
        metadata: createEmptyMetadata(file.name),
        error: 'O arquivo enviado não contém planilhas legíveis.'
      };
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    if (!rawData || rawData.length === 0) {
      return {
        success: false,
        students: [],
        metadata: createEmptyMetadata(file.name),
        error: 'A planilha selecionada está vazia.'
      };
    }

    // Default metadata
    let schoolName = 'Maria Cristina Schmidt Miranda Profes';
    let directorName = 'IARA KURZ GATTI';
    let goeName = 'MARILI MARTIM OGEDA OLIVEIRA';
    let diretoriaEnsino = 'São Bernardo do Campo';
    let classGroup = '9º ANO A MANHA ANUAL';
    let teachingType = '14 - ENSINO FUNDAMENTAL DE 9 AN';

    const fileNameNorm = normalizeStr(file.name);
    const isFileNameQuinta = fileNameNorm.includes('quinta') || 
                             fileNameNorm.includes('5a') || 
                             fileNameNorm.includes('5_') || 
                             fileNameNorm.includes('5m') ||
                             fileNameNorm.includes('conselho_final') ||
                             fileNameNorm.includes('fechamento_final');

    let detectedBimester: 1 | 2 | 3 | 4 | '5ª Menção' = overrideBimester || (isFileNameQuinta ? '5ª Menção' : 1);
    let tipoFechamento = detectedBimester === '5ª Menção' ? 'Conselho Final - 5ª Menção' : 'Conselho Primeiro Bimestre';
    let totalAulasDadas = 310;
    let year = 2026;

    let subHeaderRowIdx = -1;
    let mainHeaderRowIdx = -1;

    // Scan top 15 rows for SEDUC metadata
    for (let r = 0; r < Math.min(15, rawData.length); r++) {
      const row = rawData[r];
      const rowStr = row.map((c) => String(c)).join(' ');
      const norm = normalizeStr(rowStr);

      if (norm.includes('ano letivo:')) {
        const val = row[1] || row[2];
        if (val) year = parseInt(String(val), 10) || year;
      }
      if (norm.includes('diretoria:')) {
        diretoriaEnsino = String(row[1] || row[2] || diretoriaEnsino).trim();
      }
      if (norm.includes('escola:')) {
        schoolName = String(row[1] || row[2] || schoolName).trim();
      }
      if (norm.includes('tipo de ensino:')) {
        teachingType = String(row[1] || row[2] || teachingType).trim();
      }
      if (norm.includes('turma:')) {
        classGroup = String(row[1] || row[2] || classGroup).trim();
      }
      if (norm.includes('tipo fechamento:')) {
        tipoFechamento = String(row[1] || row[2] || tipoFechamento).trim();
        if (!overrideBimester) {
          const normFech = normalizeStr(tipoFechamento);
          if (normFech.includes('quinto') || normFech.includes('5') || normFech.includes('final') || normFech.includes('conselho final') || normFech.includes('mencao')) {
            detectedBimester = '5ª Menção';
          } else if (normFech.includes('segundo') || normFech.includes('2')) {
            detectedBimester = 2;
          } else if (normFech.includes('terceiro') || normFech.includes('3')) {
            detectedBimester = 3;
          } else if (normFech.includes('quarto') || normFech.includes('4')) {
            detectedBimester = 4;
          } else {
            detectedBimester = isFileNameQuinta ? '5ª Menção' : 1;
          }
        }
      }
      if (norm.includes('total de aulas dadas:')) {
        totalAulasDadas = parseNumber(row[1]) || totalAulasDadas;
      }
      if (norm.includes('diretor')) {
        const idx = row.findIndex((c) => normalizeStr(c).includes('diretor'));
        if (idx !== -1 && row[idx - 1]) directorName = String(row[idx - 1]).trim();
      }
      if (norm.includes('goe')) {
        const idx = row.findIndex((c) => normalizeStr(c).includes('goe'));
        if (idx !== -1 && row[idx - 1]) goeName = String(row[idx - 1]).trim();
      }

      const hasAluno = row.some((c) => normalizeStr(c) === 'aluno');
      const hasSituacao = row.some((c) => normalizeStr(c).includes('situac'));
      const hasM = row.some((c) => String(c).trim().toUpperCase() === 'M');
      const hasF = row.some((c) => String(c).trim().toUpperCase() === 'F');

      if (hasAluno && (hasSituacao || hasM || hasF)) {
        subHeaderRowIdx = r;
        mainHeaderRowIdx = r > 0 ? r - 1 : r;
        break;
      }
    }

    if (subHeaderRowIdx === -1) {
      subHeaderRowIdx = 10;
      mainHeaderRowIdx = 9;
    }

    const subHeaderRow = rawData[subHeaderRowIdx] || [];
    const mainHeaderRow = rawData[mainHeaderRowIdx] || [];

    let colAluno = 0;
    let colSituacao = 1;
    let colTf = -1;
    let colFre = -1;
    let colFtAn = -1;
    let colFreAn = -1;

    subHeaderRow.forEach((c, idx) => {
      const n = normalizeStr(c);
      if (n === 'aluno' || n.includes('nome')) colAluno = idx;
      if (n.includes('situac')) colSituacao = idx;
      if (n === 'tf' || n.includes('total de faltas')) colTf = idx;
      if (n.startsWith('fre(') || n === 'freq' || n === 'freq(%)' || n === 'frequencia') {
        if (colFre === -1) colFre = idx;
      }
      if (n === 'ft an' || n.includes('faltas anual')) colFtAn = idx;
      if (n.startsWith('fre an') || n.includes('frequencia anual')) colFreAn = idx;
    });

    interface DetectedSubjectBlock {
      code: string;
      name: string;
      area: KnowledgeArea;
      colM: number;
      colF: number;
      colAc: number;
    }

    const subjectBlocks: DetectedSubjectBlock[] = [];
    const subjectsFound: string[] = [];

    for (let c = 2; c < subHeaderRow.length; c++) {
      const cell = String(subHeaderRow[c]).trim().toUpperCase();
      if (cell === 'M' || cell === 'MENÇÃO') {
        const colM = c;
        const colF = c + 1;
        const colAc = c + 2;

        let subjHeader = String(mainHeaderRow[c - 1] || mainHeaderRow[c] || '').trim();
        if (!subjHeader && c >= 2) {
          subjHeader = String(mainHeaderRow[c - 2] || '').trim();
        }

        const mapped = mapHeaderToSubject(subjHeader, subjectBlocks.length);
        subjectBlocks.push({
          code: mapped.code,
          name: mapped.name,
          area: mapped.area,
          colM,
          colF,
          colAc
        });
        subjectsFound.push(mapped.name);
      }
    }

    if (subjectBlocks.length === 0) {
      OFFICIAL_SP_SUBJECTS.forEach((subj, i) => {
        const start = 2 + i * 4;
        subjectBlocks.push({
          code: subj.code,
          name: subj.name,
          area: subj.area,
          colM: start + 1,
          colF: start + 2,
          colAc: start + 3
        });
        subjectsFound.push(subj.name);
      });
    }

    const students: StudentRecord[] = [];
    const bimNum: 1 | 2 | 3 | 4 = typeof detectedBimester === 'number' ? detectedBimester : 1;

    // Scan student rows and STRICTLY FILTER OUT THE BOTTOM LEGEND ROWS
    for (let r = subHeaderRowIdx + 1; r < rawData.length; r++) {
      const row = rawData[r];

      // AUTOMATICALLY EXCLUDE THE LEGEND AND FOOTERS AT THE BOTTOM
      if (isLegendOrFooterRow(row)) {
        continue;
      }

      const studentName = String(row[colAluno] || '').trim();
      const number = students.length + 1;
      const situationStr = String(row[colSituacao] || 'Ativo').trim();
      let situation: StudentSituation = 'Ativo';
      if (situationStr.includes('Não Comparecimento')) situation = 'Não Comparecimento';
      else if (situationStr.includes('Baixa - Transferência')) situation = 'Baixa - Transferência';
      else if (situationStr.includes('Transferido')) situation = 'Transferido';

      const grades: Record<string, StudentSubjectGrade> = {};
      let gradeSum = 0;
      let validCount = 0;
      let calculatedTotalFaltas = 0;
      let calculatedTotalAc = 0;
      const recoverySubjects: string[] = [];

      const areaSums: Record<KnowledgeArea, { sum: number; count: number }> = {
        linguagens: { sum: 0, count: 0 },
        matematica: { sum: 0, count: 0 },
        ciencias_natureza: { sum: 0, count: 0 },
        ciencias_humanas: { sum: 0, count: 0 },
        inova_educacao: { sum: 0, count: 0 }
      };

      subjectBlocks.forEach((sb) => {
        const rawM = row[sb.colM];
        const rawF = row[sb.colF];
        const rawAc = row[sb.colAc];

        const { grade, display } = parseMentionToGrade(rawM);
        const f = parseNumber(rawF);
        const ac = parseNumber(rawAc);

        calculatedTotalFaltas += f;
        calculatedTotalAc += ac;

        const standardDef = OFFICIAL_SP_SUBJECTS.find((s) => s.code === sb.code);
        const totalClasses = standardDef ? standardDef.totalAulas : 30;
        const effectiveAbsences = Math.max(0, f - ac);
        const attRate = Math.max(0, Math.min(100, Math.round(((totalClasses - effectiveAbsences) / totalClasses) * 100)));
        const bnccLvl = getBnccLevel(grade);
        const needsRecovery = grade > 0 && grade < 5.0;

        if (needsRecovery) {
          recoverySubjects.push(sb.name);
        }

        grades[sb.code] = {
          subjectCode: sb.code,
          subjectName: sb.name,
          area: sb.area,
          mention: display,
          grade,
          absences: f,
          compensatedAbsences: ac,
          totalClasses,
          attendanceRate: attRate,
          bnccLevel: bnccLvl,
          needsRecovery,
          finalGrade: grade,
          quintaMencaoGrade: detectedBimester === '5ª Menção' ? grade : undefined,
          quintaMencaoMention: detectedBimester === '5ª Menção' ? display : undefined,
          quintaMencaoObs: detectedBimester === '5ª Menção' ? `5ª Menção da Sala do Futuro (${display})` : undefined
        };

        if (grade > 0) {
          gradeSum += grade;
          validCount++;
          areaSums[sb.area].sum += grade;
          areaSums[sb.area].count += 1;
        }
      });

      const overallAverage = validCount > 0 ? Math.round((gradeSum / validCount) * 10) / 10 : 0;
      const totalFaltas = colTf !== -1 && row[colTf] !== undefined ? parseNumber(row[colTf]) : calculatedTotalFaltas;
      
      let freqPercent = colFre !== -1 && row[colFre] !== undefined ? parseNumber(row[colFre]) : 0;
      if (freqPercent === 0 && totalAulasDadas > 0) {
        freqPercent = Math.max(0, Math.min(100, Math.round(((totalAulasDadas - totalFaltas) / totalAulasDadas) * 100)));
      }

      const ftAn = colFtAn !== -1 && row[colFtAn] !== undefined ? parseNumber(row[colFtAn]) : totalFaltas;
      const freqAn = colFreAn !== -1 && row[colFreAn] !== undefined ? parseNumber(row[colFreAn]) : freqPercent;

      const overallBnccLevel = getBnccLevel(overallAverage);
      const riskProfile = getRiskProfile(overallAverage, freqPercent, situation);

      const areaAverages: Record<KnowledgeArea, number> = {
        linguagens: areaSums.linguagens.count > 0 ? Math.round((areaSums.linguagens.sum / areaSums.linguagens.count) * 10) / 10 : overallAverage,
        matematica: areaSums.matematica.count > 0 ? Math.round((areaSums.matematica.sum / areaSums.matematica.count) * 10) / 10 : overallAverage,
        ciencias_natureza: areaSums.ciencias_natureza.count > 0 ? Math.round((areaSums.ciencias_natureza.sum / areaSums.ciencias_natureza.count) * 10) / 10 : overallAverage,
        ciencias_humanas: areaSums.ciencias_humanas.count > 0 ? Math.round((areaSums.ciencias_humanas.sum / areaSums.ciencias_humanas.count) * 10) / 10 : overallAverage,
        inova_educacao: areaSums.inova_educacao.count > 0 ? Math.round((areaSums.inova_educacao.sum / areaSums.inova_educacao.count) * 10) / 10 : overallAverage,
      };

      // 5ª Menção Deliberation determination
      let quintaStatus: QuintaMencaoStatus = 'Aprovado';
      let justification = detectedBimester === '5ª Menção'
        ? 'Deliberação importada da Planilha de 5ª Menção baixada da Sala do Futuro SP.'
        : 'Aprovado por rendimento e assiduidade regular.';

      if (situation === 'Não Comparecimento') {
        quintaStatus = 'Retido por Faltas';
        justification = 'Estudante classificado em Não Comparecimento / Abandono na SEDUC.';
      } else if (situation === 'Baixa - Transferência' || situation === 'Transferido') {
        quintaStatus = 'Pendente';
        justification = 'Matrícula transferida da unidade escolar.';
      } else if (overallAverage < 5.0 && freqPercent < 75) {
        quintaStatus = 'Retido por Rendimento e Faltas';
        justification = 'Estudante não atingiu rendimento mínimo e possui frequência inferior a 75%.';
      } else if (freqPercent < 75) {
        if (freqAn >= 75 || calculatedTotalAc > 10) {
          quintaStatus = 'Aprovado pelo Conselho';
          justification = 'Aprovado pelo Conselho de Classe mediante compensação de ausências (AC).';
        } else {
          quintaStatus = 'Retido por Faltas';
          justification = 'Infrequência escolar não superada no ano letivo.';
        }
      } else if (overallAverage < 5.0) {
        if (overallAverage >= 4.0 || recoverySubjects.length <= 2) {
          quintaStatus = 'Aprovado pelo Conselho';
          justification = 'Aprovado pelo Conselho de Classe (5ª Menção) considerando evolução pedagógica global.';
        } else {
          quintaStatus = 'Retido por Rendimento';
          justification = 'Defasagens não superadas em múltiplos componentes essenciais.';
        }
      }

      // Initialize all 4 bimesters container
      const bimestersData: Record<1 | 2 | 3 | 4, StudentBimesterData> = {
        1: createEmptyBimester(1),
        2: createEmptyBimester(2),
        3: createEmptyBimester(3),
        4: createEmptyBimester(4)
      };

      // Populate current loaded bimester
      bimestersData[bimNum] = {
        bimester: bimNum,
        grades,
        overallAverage,
        totalAbsences: totalFaltas,
        totalCompensatedAbsences: calculatedTotalAc,
        attendanceRate: freqPercent,
        annualAbsences: ftAn,
        annualAttendanceRate: freqAn,
        bnccLevel: overallBnccLevel,
        needsRecoverySubjects: recoverySubjects,
        areaAverages,
        isLoaded: true
      };

      students.push({
        id: `aluno-parsed-${number}`,
        number,
        ra: `000109${String(number * 43).padStart(5, '0')}`,
        raDigit: String((number * 3) % 10),
        raUf: 'SP',
        name: studentName,
        situation,
        classGroup,
        bimester: detectedBimester,
        year,
        bimesters: bimestersData,
        grades,
        overallAverage,
        totalAbsences: totalFaltas,
        totalCompensatedAbsences: calculatedTotalAc,
        totalClasses: totalAulasDadas,
        overallAttendanceRate: freqPercent,
        annualAbsences: ftAn,
        annualAttendanceRate: freqAn,
        overallBnccLevel,
        riskProfile,
        needsRecoverySubjects: recoverySubjects,
        areaAverages,
        councilDeliberation: (quintaStatus === 'Aprovado' || quintaStatus === 'Aprovado pelo Conselho') ? 'Aprovado' : 'Recuperação Contínua',
        quintaMencao: {
          status: quintaStatus,
          justification,
          updatedAt: new Date().toISOString(),
          isPlanilhaImported: detectedBimester === '5ª Menção',
          importedFileName: detectedBimester === '5ª Menção' ? file.name : undefined,
          importedAt: detectedBimester === '5ª Menção' ? new Date().toLocaleDateString('pt-BR') : undefined
        },
        pedagogicalOpinion: `Estudante com média ${overallAverage.toFixed(1)} e assiduidade de ${freqPercent}% no ${bimNum}º Bimestre. Situação: ${situation}.`,
        actionPlan: recoverySubjects.length > 0 ? `Participar de recuperação contínua em: ${recoverySubjects.join(', ')}.` : 'Manter rotina pedagógica regular.'
      });
    }

    return {
      success: true,
      students,
      metadata: {
        fileName: file.name,
        schoolName,
        directorName,
        goeName,
        diretoriaEnsino,
        classGroup,
        teachingType,
        bimester: detectedBimester,
        tipoFechamento,
        totalAulasDadas,
        year,
        rowsCount: students.length,
        subjectsFound,
        warnings: []
      }
    };
  } catch (err: any) {
    return {
      success: false,
      students: [],
      metadata: createEmptyMetadata(file.name),
      error: `Erro ao processar planilha: ${err?.message || 'Arquivo corrompido.'}`
    };
  }
}

// Seamlessly merges newly uploaded bimester data into existing student records
export function mergeBimesterIntoExistingStudents(
  existingStudents: StudentRecord[],
  newBimesterStudents: StudentRecord[],
  bimesterNumber: 1 | 2 | 3 | 4
): StudentRecord[] {
  if (existingStudents.length === 0) {
    return newBimesterStudents;
  }

  return existingStudents.map((existing) => {
    // Match by number or normalized name
    const match = newBimesterStudents.find(
      (n) => n.number === existing.number || normalizeStr(n.name) === normalizeStr(existing.name)
    );

    if (!match) {
      return existing;
    }

    // New bimester payload
    const newBimData: StudentBimesterData = match.bimesters[bimesterNumber] || {
      bimester: bimesterNumber,
      grades: match.grades,
      overallAverage: match.overallAverage,
      totalAbsences: match.totalAbsences,
      totalCompensatedAbsences: match.totalCompensatedAbsences,
      attendanceRate: match.overallAttendanceRate,
      annualAbsences: match.annualAbsences,
      annualAttendanceRate: match.annualAttendanceRate,
      bnccLevel: match.overallBnccLevel,
      needsRecoverySubjects: match.needsRecoverySubjects,
      areaAverages: match.areaAverages,
      isLoaded: true
    };

    const updatedBimesters = {
      ...existing.bimesters,
      [bimesterNumber]: newBimData
    };

    // Calculate aggregated annual averages and absences across all loaded bimesters
    const loadedList = Object.values(updatedBimesters).filter((b) => b.isLoaded);
    const avgSum = loadedList.reduce((acc, curr) => acc + curr.overallAverage, 0);
    const calculatedAnnualAvg = loadedList.length > 0 ? Math.round((avgSum / loadedList.length) * 10) / 10 : existing.overallAverage;
    const totalYearAbsences = loadedList.reduce((acc, curr) => acc + curr.totalAbsences, 0);
    const totalYearCompensated = loadedList.reduce((acc, curr) => acc + curr.totalCompensatedAbsences, 0);

    return {
      ...existing,
      situation: match.situation || existing.situation,
      bimesters: updatedBimesters,
      // If active displayed bimester matches, update main grades
      grades: existing.bimester === bimesterNumber ? match.grades : existing.grades,
      overallAverage: existing.bimester === bimesterNumber ? match.overallAverage : calculatedAnnualAvg,
      totalAbsences: existing.bimester === bimesterNumber ? match.totalAbsences : totalYearAbsences,
      totalCompensatedAbsences: totalYearCompensated,
      annualAbsences: match.annualAbsences || totalYearAbsences,
      annualAttendanceRate: match.annualAttendanceRate || existing.annualAttendanceRate,
      needsRecoverySubjects: match.needsRecoverySubjects
    };
  });
}

// Seamlessly merges newly uploaded 5ª Menção spreadsheet (downloaded from Sala do Futuro SP) into existing student records
export function mergeQuintaMencaoIntoExistingStudents(
  existingStudents: StudentRecord[],
  quintaStudents: StudentRecord[],
  fileName: string
): StudentRecord[] {
  if (existingStudents.length === 0) {
    return quintaStudents;
  }

  return existingStudents.map((existing) => {
    // Match student by number or normalized name
    const match = quintaStudents.find(
      (q) => q.number === existing.number || normalizeStr(q.name) === normalizeStr(existing.name)
    );

    if (!match) {
      return existing;
    }

    const updatedGrades = { ...existing.grades };
    const subjectAdjustments: Record<string, { adjustedGrade: number; reason: string }> = {};

    Object.keys(match.grades).forEach((subjCode) => {
      const qSubj = match.grades[subjCode];
      if (qSubj) {
        const existingSubj = updatedGrades[subjCode];
        updatedGrades[subjCode] = {
          ...(existingSubj || qSubj),
          quintaMencaoGrade: qSubj.grade,
          quintaMencaoMention: qSubj.mention,
          quintaMencaoObs: `5ª Menção da Sala do Futuro (${qSubj.mention})`
        };
        subjectAdjustments[subjCode] = {
          adjustedGrade: qSubj.grade,
          reason: `Nota final/5ª Menção importada da planilha (${qSubj.mention})`
        };
      }
    });

    const isAprovado = match.quintaMencao.status === 'Aprovado' || match.quintaMencao.status === 'Aprovado pelo Conselho';

    return {
      ...existing,
      situation: match.situation || existing.situation,
      grades: updatedGrades,
      annualAbsences: match.annualAbsences || existing.annualAbsences,
      annualAttendanceRate: match.annualAttendanceRate || existing.annualAttendanceRate,
      councilDeliberation: isAprovado ? 'Aprovado' : (match.quintaMencao.status.includes('Faltas') ? 'Busca Ativa' : 'Recuperação Contínua'),
      quintaMencao: {
        status: match.quintaMencao.status,
        justification: match.quintaMencao.justification || 'Deliberação importada da planilha de 5ª Menção baixada da Sala do Futuro SP.',
        updatedAt: new Date().toISOString(),
        isPlanilhaImported: true,
        importedFileName: fileName,
        importedAt: new Date().toLocaleDateString('pt-BR'),
        importedBimesterSource: 'Planilha Sala do Futuro SP',
        councilMembers: ['Equipe Docente', 'Professor Coordenador Pedagógico', 'Direção Escolar', 'GOE'],
        subjectAdjustments
      }
    };
  });
}

function createEmptyBimester(num: 1 | 2 | 3 | 4): StudentBimesterData {
  return {
    bimester: num,
    grades: {},
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
  };
}

function mapHeaderToSubject(header: string, index: number): { code: string; name: string; area: KnowledgeArea } {
  const norm = normalizeStr(header);
  if (norm.includes('arte')) return { code: 'ART', name: 'Arte', area: 'linguagens' };
  if (norm.includes('cienc')) return { code: 'CIEN', name: 'Ciências', area: 'ciencias_natureza' };
  if (norm.includes('educ')) return { code: 'EDF', name: 'Educação Física', area: 'linguagens' };
  if (norm.includes('geog')) return { code: 'GEO', name: 'Geografia', area: 'ciencias_humanas' };
  if (norm.includes('hist')) return { code: 'HIST', name: 'História', area: 'ciencias_humanas' };
  if (norm.includes('ingl')) return { code: 'ING', name: 'Língua Inglesa', area: 'linguagens' };
  if (norm.includes('port') || norm === 'lingua') return { code: 'LP', name: 'Língua Portuguesa', area: 'linguagens' };
  if (norm.includes('mat')) return { code: 'MAT', name: 'Matemática', area: 'matematica' };
  if (norm.includes('orient')) {
    if (index === 8) return { code: 'OE1', name: 'Orientação de Estudos I', area: 'inova_educacao' };
    return { code: 'OE2', name: 'Orientação de Estudos II', area: 'inova_educacao' };
  }
  if (norm.includes('vida') || norm.includes('projeto')) return { code: 'PV', name: 'Projeto de Vida', area: 'inova_educacao' };
  if (norm.includes('redac')) return { code: 'RED', name: 'Redação e Leitura', area: 'linguagens' };

  if (index < OFFICIAL_SP_SUBJECTS.length) {
    return OFFICIAL_SP_SUBJECTS[index];
  }
  return { code: `SUBJ_${index}`, name: header || `Disciplina ${index}`, area: 'linguagens' };
}

function createEmptyMetadata(fileName: string) {
  return {
    fileName,
    schoolName: '',
    directorName: '',
    goeName: '',
    diretoriaEnsino: '',
    classGroup: '',
    teachingType: '',
    bimester: 1 as const,
    tipoFechamento: '',
    totalAulasDadas: 0,
    year: 2026,
    rowsCount: 0,
    subjectsFound: [],
    warnings: []
  };
}

// Downloadable sample matching EXACTLY image_3e34e4b4.png with footer legend
export function downloadSampleExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  const metadataRows = [
    ['Registro e Controle do Rendimento Escolar'],
    ['Ano Letivo:', 2026],
    ['Diretoria:', 'São Bernardo do Campo'],
    ['Escola:', 'Maria Cristina Schmidt Miranda Profes'],
    ['Tipo de Ensino:', '14 - ENSINO FUNDAMENTAL DE 9 AN'],
    ['Turma:', '9º ANO A MANHA ANUAL'],
    ['Tipo Fechamento:', 'Conselho Primeiro Bimestre'],
    ['Total de Aulas Dadas:', 310, '', '', '', '', '', '', 'IARA KURZ GATTI', '', '', '', 'MARILI MARTIM OGEDA OLIVEIRA'],
    ['Total de Aulas Dadas Eletiva:', 0, '', '', '', '', '', '', 'Diretor', '', '', '', 'GOE'],
    []
  ];

  const subjectHeadersRow = [
    '', '',
    'ARTE', '', '', '',
    'CIENCIAS', '', '', '',
    'EDUCACAO', '', '', '',
    'GEOGRAFIA', '', '', '',
    'HISTORIA', '', '', '',
    'LINGUA INGLESA', '', '', '',
    'LINGUA', '', '', '',
    'MATEMATICA', '', '', '',
    'ORIENTAÇÃO DE', '', '', '',
    'ORIENTAÇÃO DE', '', '', '',
    'PROJETO DE', '', '', '',
    'REDAÇÃO E', '', '', '',
    'TOTAL'
  ];

  const subHeadersRow = [
    'ALUNO', 'SITUAÇÃO',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'TF', 'Fre(%)', 'FT An', 'Fre An(%)'
  ];

  const studentRows = [
    ['ANA CLARA NASCIMENTO DAS NEVES', 'Ativo', 1, 2, 1, 0, 1, 2, 10, 0, 1, 3, 7, 0, 1, 6, 5, 0, 1, 5, 11, 0, 1, 3, 6, 0, 1, 2, 8, 0, 1, 5, 16, 0, 1, 5, 5, 0, 1, 3, 2, 0, 1, 1, 4, 0, 1, 5, 0, 0, 75, '76%', 75, '76%'],
    ['ANDERSON DE SOUZA NASCIMENTO', 'Ativo', 2, 5, 1, 0, 2, 6, 2, 0, 2, 5, 1, 0, 2, 5, 2, 0, 2, 7, 4, 0, 2, 6, 4, 0, 2, 6, 4, 0, 2, 5, 4, 0, 2, 7, 0, 0, 2, 6, 2, 0, 2, 5, 0, 0, 2, 7, 0, 0, 24, '92%', 24, '92%'],
    ['ARTHUR CAMILO DOS SANTOS', 'Ativo', 3, 6, 2, 0, 3, 8, 5, 0, 3, 8, 1, 0, 3, 8, 1, 0, 3, 5, 6, 0, 3, 7, 3, 0, 3, 5, 8, 0, 3, 9, 7, 0, 3, 8, 0, 0, 3, 8, 2, 0, 3, 8, 3, 0, 3, 8, 4, 0, 42, '86%', 42, '86%'],
    ['ARTHUR RODRIGUES TOLEDO DOS SANT', 'Ativo', 4, 6, 2, 0, 4, 6, 14, 0, 4, 7, 7, 0, 4, 5, 4, 0, 4, 7, 10, 0, 4, 7, 8, 0, 4, 4, 14, 0, 4, 5, 23, 0, 4, 8, 0, 0, 4, 5, 2, 0, 4, 6, 3, 0, 4, 8, 0, 0, 87, '72%', 87, '72%'],
    ['MOISES VICTOR DUARTE COSTA', 'Não Comparecimento', 24, 2, 3, 2, 24, 2, 15, 10, 24, 2, 11, 6, 24, 5, 4, 2, 24, 2, 13, 5, 24, 1, 9, 6, 24, 5, 14, 6, 24, 5, 16, 8, 24, 5, 6, 4, 24, 3, 2, 1, 24, 2, 4, 2, 24, 5, 6, 4, 103, '67%', 47, '85%']
  ];

  const bottomRow = [
    '', '',
    'Aulas Dadas: 10', '', '', '',
    'Aulas Dadas: 40', '', '', '',
    'Aulas Dadas: 20', '', '', '',
    'Aulas Dadas: 21', '', '', '',
    'Aulas Dadas: 30', '', '', '',
    'Aulas Dadas: 19', '', '', '',
    'Aulas Dadas: 42', '', '', '',
    'Aulas Dadas: 50', '', '', '',
    'Aulas Dadas: 24', '', '', '',
    'Aulas Dadas: 20', '', '', '',
    'Aulas Dadas: 10', '', '', '',
    'Aulas Dadas: 24'
  ];

  const legendRows = [
    [],
    ['Legenda'],
    ['M - Menção (corresponde ao resultado informado no fechamento)'],
    ['  ES - Engajamento Satisfatório'],
    ['  ET - Engajamento Total'],
    ['  EP - Engajamento Parcial'],
    ['F - Frequência'],
    ['AC - Ausência Compensada']
  ];

  const fullSheetData = [
    ...metadataRows,
    subjectHeadersRow,
    subHeadersRow,
    ...studentRows,
    [],
    bottomRow,
    ...legendRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'RendimentoEscolar');
  XLSX.writeFile(wb, 'Registro_Rendimento_Escolar_SalaDoFuturo_SP.xlsx');
}

export function exportConsolidatedReportXLSX(students: StudentRecord[], classTitle: string, bimester: number | '5ª Menção'): void {
  const rows = students.map((s) => {
    const rowObj: any = {
      'Nº': s.number,
      'Nome do Estudante': s.name,
      'Situação': s.situation,
      'Média Geral': s.overallAverage,
      'Freq. (%)': `${s.overallAttendanceRate}%`,
      'Total Faltas (TF)': s.totalAbsences,
      'Ausências Comp. (AC)': s.totalCompensatedAbsences,
      'Freq. Anual (%)': `${s.annualAttendanceRate}%`,
      'Faltas Anuais (FT An)': s.annualAbsences,
      'Nível BNCC': s.overallBnccLevel.replace(/_/g, ' ').toUpperCase(),
      'Julgamento 5ª Menção (Conselho)': s.quintaMencao.status,
      'Justificativa do Conselho': s.quintaMencao.justification
    };

    Object.values(s.grades).forEach((g) => {
      rowObj[`${g.subjectName} (M)`] = g.mention;
      rowObj[`${g.subjectName} (F)`] = g.absences;
      rowObj[`${g.subjectName} (AC)`] = g.compensatedAbsences;
    });

    return rowObj;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'FechamentoOficial');
  XLSX.writeFile(wb, `Fechamento_${classTitle.replace(/\s+/g, '_')}_${bimester}.xlsx`);
}

// Download official 5ª Menção model spreadsheet as exported from Sala do Futuro SP
export function downloadQuintaMencaoExcelTemplate(): void {
  const wb = XLSX.utils.book_new();

  const metadataRows = [
    ['Registro e Controle do Rendimento Escolar - 5ª Menção e Conselho Final'],
    ['Ano Letivo:', 2026],
    ['Diretoria:', 'São Bernardo do Campo'],
    ['Escola:', 'Maria Cristina Schmidt Miranda Profes'],
    ['Tipo de Ensino:', '14 - ENSINO FUNDAMENTAL DE 9 AN'],
    ['Turma:', '9º ANO A MANHA ANUAL'],
    ['Tipo Fechamento:', 'Conselho Final - 5ª Menção'],
    ['Total de Aulas Dadas:', 1240],
    ['Total de Aulas Dadas Eletiva:', 0, '', 'IARA KURZ GATTI', 'MARILI MARTIM OGEDA OLIVEIRA'],
    ['', '', '', 'Diretor', 'GOE']
  ];

  const subjectHeadersRow = [
    'ALUNO', 'SITUAÇÃO',
    'ARTE', '', '', '',
    'CIÊNCIAS', '', '', '',
    'EDUCAÇÃO FÍSICA', '', '', '',
    'GEOGRAFIA', '', '', '',
    'HISTÓRIA', '', '', '',
    'LÍNGUA INGLESA', '', '', '',
    'LÍNGUA PORTUGUESA', '', '', '',
    'MATEMÁTICA', '', '', '',
    'ORIENTAÇÃO DE ESTUDOS I', '', '', '',
    'ORIENTAÇÃO DE ESTUDOS II', '', '', '',
    'PROJETO DE VIDA', '', '', '',
    'REDAÇÃO E LEITURA', '', '', '',
    'TOTAL', '', '', ''
  ];

  const subHeadersRow = [
    '', '',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'N°', 'M', 'F', 'AC',
    'TF', 'Fre(%)', 'FT An', 'Fre An(%)'
  ];

  const studentRows = [
    ['ANA CLARA NASCIMENTO DAS NEVES', 'Ativo', 1, 6, 2, 0, 1, 6, 8, 0, 1, 6, 5, 0, 1, 6, 4, 0, 1, 6, 6, 0, 1, 6, 4, 0, 1, 6, 5, 0, 1, 6, 10, 0, 1, 6, 2, 0, 1, 6, 2, 0, 1, 6, 2, 0, 1, 6, 0, 0, 50, '82%', 145, '85%'],
    ['ANDERSON DE SOUZA NASCIMENTO', 'Ativo', 2, 6, 1, 0, 2, 7, 2, 0, 2, 6, 1, 0, 2, 6, 2, 0, 2, 7, 3, 0, 2, 7, 2, 0, 2, 7, 3, 0, 2, 6, 3, 0, 2, 7, 0, 0, 2, 6, 1, 0, 2, 6, 0, 0, 2, 7, 0, 0, 18, '94%', 48, '93%'],
    ['ARTHUR CAMILO DOS SANTOS', 'Ativo', 3, 7, 1, 0, 3, 8, 3, 0, 3, 8, 1, 0, 3, 8, 1, 0, 3, 6, 4, 0, 3, 7, 2, 0, 3, 6, 5, 0, 3, 9, 4, 0, 3, 8, 0, 0, 3, 8, 1, 0, 3, 8, 2, 0, 3, 8, 2, 0, 26, '90%', 72, '89%'],
    ['ARTHUR RODRIGUES TOLEDO DOS SANT', 'Ativo', 4, 6, 2, 0, 4, 6, 10, 0, 4, 7, 5, 0, 4, 6, 3, 0, 4, 7, 8, 0, 4, 7, 6, 0, 4, 5, 10, 0, 4, 6, 16, 0, 4, 8, 0, 0, 4, 6, 2, 0, 4, 6, 2, 0, 4, 8, 0, 0, 64, '78%', 172, '77%'],
    ['MOISES VICTOR DUARTE COSTA', 'Não Comparecimento', 24, 2, 5, 0, 24, 2, 18, 0, 24, 2, 12, 0, 24, 4, 5, 0, 24, 2, 15, 0, 24, 1, 10, 0, 24, 4, 16, 0, 24, 4, 20, 0, 24, 4, 8, 0, 24, 2, 4, 0, 24, 2, 5, 0, 24, 4, 8, 0, 126, '58%', 310, '62%']
  ];

  const bottomRow = [
    '', '',
    'Aulas Dadas: 40', '', '', '',
    'Aulas Dadas: 160', '', '', '',
    'Aulas Dadas: 80', '', '', '',
    'Aulas Dadas: 84', '', '', '',
    'Aulas Dadas: 120', '', '', '',
    'Aulas Dadas: 76', '', '', '',
    'Aulas Dadas: 168', '', '', '',
    'Aulas Dadas: 200', '', '', '',
    'Aulas Dadas: 96', '', '', '',
    'Aulas Dadas: 80', '', '', '',
    'Aulas Dadas: 40', '', '', '',
    'Aulas Dadas: 96'
  ];

  const legendRows = [
    [],
    ['Legenda'],
    ['M - Menção (corresponde ao resultado informado no fechamento final da 5ª Menção)'],
    ['  ES - Engajamento Satisfatório'],
    ['  ET - Engajamento Total'],
    ['  EP - Engajamento Parcial'],
    ['F - Frequência'],
    ['AC - Ausência Compensada']
  ];

  const fullSheetData = [
    ...metadataRows,
    subjectHeadersRow,
    subHeadersRow,
    ...studentRows,
    [],
    bottomRow,
    ...legendRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(fullSheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'QuintaMencaoConselho');
  XLSX.writeFile(wb, 'Planilha_5a_Mencao_Conselho_Final_Sala_do_Futuro_SP.xlsx');
}
