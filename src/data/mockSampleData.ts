import { 
  StudentRecord, 
  ClassAnalysisSummary, 
  KnowledgeArea, 
  StudentSituation, 
  QuintaMencaoStatus, 
  StudentBimesterData 
} from '../types/education.ts';
import { OFFICIAL_SP_SUBJECTS, getBnccLevel, getRiskProfile } from './bnccCurriculoPaulista.ts';

interface RawRowData {
  num: number;
  name: string;
  situation: StudentSituation;
  grades: number[]; // 12 subjects
  absences: number[]; // 12 subjects
  ac: number[]; // 12 subjects
  tf: number;
  freq: number;
  ftAn: number;
  freqAn: number;
}

// Exactly extracted from user's uploaded spreadsheet image (image_3e34e4b4.png)
const RAW_STUDENTS: RawRowData[] = [
  { num: 1, name: 'ANA CLARA NASCIMENTO DAS NEVES', situation: 'Ativo', grades: [2, 2, 7, 6, 5, 3, 2, 5, 5, 3, 1, 5], absences: [1, 10, 0, 5, 11, 6, 8, 16, 5, 2, 4, 0], ac: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 75, freq: 76, ftAn: 75, freqAn: 76 },
  { num: 2, name: 'ANDERSON DE SOUZA NASCIMENTO', situation: 'Ativo', grades: [5, 6, 5, 5, 7, 6, 6, 5, 7, 6, 5, 7], absences: [1, 2, 1, 2, 4, 4, 4, 4, 0, 2, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 24, freq: 92, ftAn: 24, freqAn: 92 },
  { num: 3, name: 'ARTHUR CAMILO DOS SANTOS', situation: 'Ativo', grades: [6, 8, 8, 8, 5, 7, 5, 9, 8, 8, 8, 8], absences: [2, 5, 1, 1, 6, 3, 8, 7, 0, 2, 3, 4], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 42, freq: 86, ftAn: 42, freqAn: 86 },
  { num: 4, name: 'ARTHUR RODRIGUES TOLEDO DOS SANT', situation: 'Ativo', grades: [6, 6, 7, 5, 7, 7, 4, 4, 8, 5, 6, 8], absences: [2, 14, 7, 4, 10, 8, 14, 23, 0, 2, 3, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 87, freq: 72, ftAn: 87, freqAn: 72 },
  { num: 5, name: 'CAMILY MARIA GODOI DE CARVALHO', situation: 'Ativo', grades: [6, 8, 8, 8, 5, 6, 5, 7, 7, 7, 9, 8], absences: [0, 5, 0, 1, 3, 3, 2, 3, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 12, freq: 96, ftAn: 12, freqAn: 96 },
  { num: 6, name: 'CHRISTOPHER WALLACE RODRIGUES LIN', situation: 'Ativo', grades: [5, 8, 6, 8, 7, 7, 6, 6, 5, 6, 4, 6], absences: [1, 4, 1, 0, 6, 2, 8, 9, 2, 0, 2, 5], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], tf: 37, freq: 88, ftAn: 37, freqAn: 88 },
  { num: 7, name: 'CICERA MIRELLY DUARTE DE SOUSA', situation: 'Ativo', grades: [9, 9, 10, 9, 9, 7, 7, 10, 10, 7, 10, 9], absences: [1, 2, 2, 5, 3, 10, 8, 7, 0, 0, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 29, freq: 91, ftAn: 29, freqAn: 91 },
  { num: 8, name: 'ELISABETH ALVES DAS CHAGAS', situation: 'Ativo', grades: [5, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8], absences: [1, 9, 3, 3, 6, 6, 12, 16, 6, 2, 3, 8], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], tf: 68, freq: 78, ftAn: 68, freqAn: 78 },
  { num: 9, name: 'ERIC MOREIRA SARMENTO DA SILVA', situation: 'Ativo', grades: [4, 9, 9, 9, 9, 9, 9, 9, 9, 9, 3, 8], absences: [0, 0, 0, 0, 0, 3, 2, 5, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0], tf: 4, freq: 99, ftAn: 4, freqAn: 99 },
  { num: 10, name: 'GABRIELA NICOLE SOARES SANTOS', situation: 'Baixa - Transferência', grades: [0, 3, 0, 1, 6, 4, 7, 5, 4, 0, 0, 4], absences: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 34, freq: 89, ftAn: 34, freqAn: 89 },
  { num: 11, name: 'GABRIELI FERREIRA DA SILVA', situation: 'Ativo', grades: [7, 11, 9, 6, 11, 11, 11, 11, 8, 11, 11, 11], absences: [2, 3, 3, 2, 4, 3, 10, 9, 0, 2, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 38, freq: 88, ftAn: 38, freqAn: 88 },
  { num: 12, name: 'GIOVANNA FERREIRA MORENO', situation: 'Ativo', grades: [5, 8, 7, 8, 12, 12, 12, 12, 12, 12, 12, 12], absences: [0, 1, 0, 0, 2, 1, 4, 6, 0, 0, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 11, freq: 96, ftAn: 11, freqAn: 96 },
  { num: 13, name: 'GUILHERME ANDREY DOS SANTOS COST', situation: 'Ativo', grades: [3, 7, 5, 7, 5, 4, 3, 5, 7, 5, 4, 5], absences: [4, 16, 10, 6, 14, 9, 19, 16, 5, 2, 2, 8], ac: [2, 13, 0, 4, 7, 5, 9, 7, 7, 1, 1, 5], tf: 115, freq: 63, ftAn: 53, freqAn: 83 },
  { num: 14, name: 'GUILHERMY BEZERRA DE MATOS', situation: 'Ativo', grades: [5, 5, 9, 6, 9, 5, 6, 7, 5, 5, 9, 5], absences: [1, 1, 0, 3, 0, 1, 0, 4, 0, 0, 0, 0], ac: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 20, freq: 94, ftAn: 20, freqAn: 94 },
  { num: 15, name: 'HELOISA ROMAM MORATTI MODA', situation: 'Ativo', grades: [8, 9, 9, 8, 9, 7, 8, 10, 7, 15, 9, 7], absences: [1, 5, 3, 1, 5, 4, 4, 6, 0, 2, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 32, freq: 90, ftAn: 32, freqAn: 90 },
  { num: 16, name: 'JHULIA ALVES GONCALVES', situation: 'Ativo', grades: [5, 7, 6, 7, 9, 4, 6, 5, 7, 5, 5, 6], absences: [0, 7, 4, 3, 5, 5, 10, 18, 4, 2, 2, 2], ac: [0, 4, 2, 2, 3, 3, 7, 10, 2, 1, 1, 1], tf: 66, freq: 79, ftAn: 28, freqAn: 91 },
  { num: 17, name: 'JULIO CESAR FRANCA MORAIS', situation: 'Ativo', grades: [9, 9, 10, 8, 9, 8, 8, 7, 9, 8, 9, 8], absences: [1, 5, 2, 2, 7, 5, 4, 5, 2, 3, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0], tf: 36, freq: 88, ftAn: 36, freqAn: 88 },
  { num: 18, name: 'LUCAS FERREIRA DO NASCIMENTO', situation: 'Ativo', grades: [5, 7, 10, 7, 6, 7, 7, 6, 9, 9, 8, 5], absences: [1, 4, 2, 1, 2, 2, 2, 3, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 18, freq: 94, ftAn: 18, freqAn: 94 },
  { num: 19, name: 'MARCIO VINICIUS CASSIANO OLIVEIRA', situation: 'Ativo', grades: [5, 5, 7, 5, 5, 5, 5, 7, 5, 6, 8, 5], absences: [1, 6, 2, 0, 4, 5, 6, 7, 0, 0, 0, 0], ac: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0], tf: 29, freq: 91, ftAn: 29, freqAn: 91 },
  { num: 20, name: 'MARIA CLARA RODRIGUES DO NASCIME', situation: 'Ativo', grades: [7, 8, 9, 7, 7, 7, 8, 6, 8, 7, 9, 8], absences: [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 2, freq: 99, ftAn: 2, freqAn: 99 },
  { num: 21, name: 'MELISSA SANCHEZ SILVESTRE', situation: 'Ativo', grades: [8, 5, 5, 6, 10, 6, 5, 5, 6, 6, 7, 5], absences: [1, 5, 3, 1, 2, 6, 16, 12, 1, 0, 1, 4], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 60, freq: 81, ftAn: 60, freqAn: 81 },
  { num: 22, name: 'MIGUEL FABIANO TEIXEIRA DOS SANTOS', situation: 'Ativo', grades: [8, 6, 7, 7, 5, 8, 5, 8, 8, 5, 10, 7], absences: [1, 8, 4, 3, 9, 6, 8, 13, 0, 2, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 51, freq: 84, ftAn: 51, freqAn: 84 },
  { num: 23, name: 'MOISES VICTOR DUARTE COSTA', situation: 'Não Comparecimento', grades: [3, 2, 2, 5, 2, 1, 5, 5, 5, 3, 2, 5], absences: [2, 15, 11, 4, 13, 9, 14, 16, 6, 2, 4, 6], ac: [2, 10, 6, 2, 5, 6, 6, 8, 4, 1, 2, 4], tf: 103, freq: 67, ftAn: 47, freqAn: 85 },
  { num: 24, name: 'NICOLAS DA SILVA ROCHA', situation: 'Ativo', grades: [8, 9, 5, 8, 6, 7, 8, 7, 7, 5, 9, 7], absences: [0, 3, 2, 0, 3, 1, 0, 1, 0, 2, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 12, freq: 96, ftAn: 12, freqAn: 96 },
  { num: 25, name: 'NICOLAS REGIS MELO DE LIRA', situation: 'Ativo', grades: [5, 4, 6, 7, 5, 5, 6, 5, 6, 6, 3, 5], absences: [1, 1, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 6, freq: 98, ftAn: 6, freqAn: 98 },
  { num: 26, name: 'PEDRO HENRIQUE SILVA MARTINS', situation: 'Ativo', grades: [5, 9, 7, 7, 5, 7, 7, 7, 8, 5, 7, 8], absences: [1, 4, 2, 0, 4, 3, 3, 8, 1, 2, 2, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 30, freq: 90, ftAn: 30, freqAn: 90 },
  { num: 27, name: 'RAFAELLA DE JESUS ROCHA', situation: 'Ativo', grades: [5, 5, 8, 8, 5, 6, 6, 9, 6, 5, 9, 8], absences: [0, 3, 3, 1, 4, 3, 4, 2, 0, 2, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 22, freq: 93, ftAn: 22, freqAn: 93 },
  { num: 28, name: 'RICARDO ADAO LEROI JUNIOR', situation: 'Ativo', grades: [4, 7, 8, 6, 6, 4, 3, 6, 6, 4, 3, 6], absences: [3, 11, 4, 4, 9, 7, 10, 9, 0, 0, 5, 2], ac: [0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0], tf: 61, freq: 80, ftAn: 61, freqAn: 80 },
  { num: 29, name: 'SAMYRA CARVALHO SILVA', situation: 'Ativo', grades: [6, 7, 9, 7, 6, 6, 6, 6, 7, 5, 5, 6], absences: [1, 4, 0, 1, 2, 4, 6, 7, 0, 1, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 26, freq: 92, ftAn: 26, freqAn: 92 },
  { num: 30, name: 'SARAH BERNARDO FRAGA', situation: 'Ativo', grades: [8, 9, 8, 7, 8, 7, 5, 6, 7, 5, 7, 8], absences: [1, 2, 0, 1, 2, 1, 4, 3, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 14, freq: 95, ftAn: 14, freqAn: 95 },
  { num: 31, name: 'THAYNARA FEITOZA SANTOS', situation: 'Baixa - Transferência', grades: [0, 3, 0, 2, 4, 3, 4, 3, 1, 0, 0, 0], absences: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0], tf: 20, freq: 94, ftAn: 20, freqAn: 94 },
  { num: 32, name: 'THIAGO ALVES LIMA', situation: 'Ativo', grades: [1, 3, 5, 3, 1, 3, 3, 5, 5, 5, 3, 5], absences: [6, 15, 7, 6, 12, 9, 20, 21, 2, 0, 5, 7], ac: [3, 10, 4, 4, 6, 6, 12, 13, 1, 0, 3, 4], tf: 110, freq: 65, ftAn: 44, freqAn: 86 },
  { num: 33, name: 'THYEGO HENRIQUE SILVA OLIVEIRA', situation: 'Transferido', grades: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], absences: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 0, freq: 100, ftAn: 0, freqAn: 100 },
  { num: 34, name: 'YASMIN BARBOSA DOS SANTOS SILVA', situation: 'Ativo', grades: [4, 8, 10, 8, 7, 9, 6, 7, 8, 7, 5, 8], absences: [0, 9, 2, 1, 1, 2, 4, 5, 2, 0, 3, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 33, freq: 89, ftAn: 33, freqAn: 89 },
  { num: 35, name: 'YASMIN BRITO', situation: 'Ativo', grades: [9, 8, 7, 8, 8, 10, 7, 9, 10, 6, 10, 9], absences: [0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 4, freq: 99, ftAn: 4, freqAn: 99 },
  { num: 36, name: 'YURI NEGREIROS GUILHERME', situation: 'Ativo', grades: [2, 7, 5, 7, 7, 7, 7, 5, 5, 5, 7, 5], absences: [1, 2, 0, 5, 7, 3, 4, 9, 2, 0, 5, 2], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 46, freq: 85, ftAn: 46, freqAn: 85 },
  { num: 37, name: 'MATHEUS VINICIUS CABRAL DO CARMO', situation: 'Baixa - Transferência', grades: [5, 8, 6, 7, 7, 8, 8, 5, 5, 4, 5, 5], absences: [0, 5, 2, 2, 7, 5, 11, 18, 0, 0, 1, 0], ac: [0, 1, 1, 1, 3, 3, 6, 10, 0, 0, 1, 0], tf: 57, freq: 82, ftAn: 25, freqAn: 92 },
  { num: 38, name: 'SOPHIA COSTA BIZZI ROSSINI', situation: 'Transferido', grades: [5, 7, 6, 5, 3, 5, 5, 9, 6, 2, 3, 6], absences: [2, 7, 3, 2, 7, 3, 8, 6, 2, 1, 3, 4], ac: [2, 3, 2, 1, 4, 2, 6, 6, 1, 0, 1, 4], tf: 52, freq: 83, ftAn: 20, freqAn: 94 },
  { num: 39, name: 'ALICE MOREIRA DOS SANTOS GUILHERM', situation: 'Ativo', grades: [6, 7, 5, 6, 6, 6, 5, 5, 6, 5, 5, 6], absences: [1, 2, 0, 3, 3, 2, 4, 3, 0, 0, 0, 2], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 19, freq: 94, ftAn: 19, freqAn: 94 },
  { num: 40, name: 'JÚNIOR DA SILVA BARBOSA', situation: 'Ativo', grades: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], absences: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 0, freq: 100, ftAn: 0, freqAn: 100 },
  { num: 41, name: 'MARIAH CLARA NUNES DE JESUS', situation: 'Não Comparecimento', grades: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], absences: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 0, freq: 100, ftAn: 0, freqAn: 100 },
  { num: 42, name: 'ANA CLARA FREITAS DE SOUZA', situation: 'Ativo', grades: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], absences: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], ac: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], tf: 0, freq: 100, ftAn: 0, freqAn: 100 }
];

export function generateSampleClassData(): { students: StudentRecord[]; summary: ClassAnalysisSummary } {
  const schoolName = 'Maria Cristina Schmidt Miranda Profes';
  const directorName = 'IARA KURZ GATTI';
  const goeName = 'MARILI MARTIM OGEDA OLIVEIRA';
  const diretoriaEnsino = 'São Bernardo do Campo';
  const classGroup = '9º ANO A MANHA ANUAL';
  const teachingType = '14 - ENSINO FUNDAMENTAL DE 9 AN';
  const bimester: 1 = 1;
  const tipoFechamento = 'Conselho Primeiro Bimestre';
  const totalAulasDadas = 310;
  const year = 2026;

  const students: StudentRecord[] = RAW_STUDENTS.map((raw) => {
    // Generate 1º Bimestre data directly from raw data
    const bim1 = createBimesterPayload(raw, 1, 0);
    // Generate 2º, 3º, 4º Bimestre simulated progress
    const bim2 = createBimesterPayload(raw, 2, 0.4);
    const bim3 = createBimesterPayload(raw, 3, 0.7);
    const bim4 = createBimesterPayload(raw, 4, 0.9);

    const bimestersData: Record<1 | 2 | 3 | 4, StudentBimesterData> = {
      1: bim1,
      2: bim2,
      3: bim3,
      4: bim4
    };

    // Calculate annual average across all 4 bimesters
    const annualAvg = Math.round(((bim1.overallAverage + bim2.overallAverage + bim3.overallAverage + bim4.overallAverage) / 4) * 10) / 10;
    const totalYearAbsences = bim1.totalAbsences + bim2.totalAbsences + bim3.totalAbsences + bim4.totalAbsences;
    const totalYearAc = bim1.totalCompensatedAbsences + bim2.totalCompensatedAbsences + bim3.totalCompensatedAbsences + bim4.totalCompensatedAbsences;
    const annualFreq = raw.freqAn;

    // 5ª Menção Deliberation determination
    let quintaStatus: QuintaMencaoStatus = 'Aprovado';
    let justification = 'Aprovado por rendimento e assiduidade regular.';

    if (raw.situation === 'Não Comparecimento') {
      quintaStatus = 'Retido por Faltas';
      justification = 'Estudante classificado em Não Comparecimento / Abandono na SEDUC.';
    } else if (raw.situation === 'Baixa - Transferência' || raw.situation === 'Transferido') {
      quintaStatus = 'Pendente';
      justification = 'Matrícula transferida da unidade escolar.';
    } else if (annualAvg < 5.0 && annualFreq < 75) {
      quintaStatus = 'Retido por Rendimento e Faltas';
      justification = 'Estudante não atingiu rendimento mínimo e possui frequência inferior a 75%.';
    } else if (annualFreq < 75) {
      if (annualFreq >= 70 && totalYearAc > 10) {
        quintaStatus = 'Aprovado pelo Conselho';
        justification = 'Aprovado pelo Conselho de Classe mediante compensação de ausências (AC).';
      } else {
        quintaStatus = 'Retido por Faltas';
        justification = 'Infrequência escolar anual superior a 25% não superada no ano letivo.';
      }
    } else if (annualAvg < 5.0) {
      if (annualAvg >= 4.0 || bim1.needsRecoverySubjects.length <= 2) {
        quintaStatus = 'Aprovado pelo Conselho';
        justification = 'Aprovado pelo Conselho de Classe (5ª Menção) considerando evolução pedagógica global.';
      } else {
        quintaStatus = 'Retido por Rendimento';
        justification = 'Defasagens não superadas em múltiplos componentes essenciais.';
      }
    }

    const raNum = String(109840000 + raw.num * 31).padStart(9, '0');
    const raDigit = String((raw.num * 2) % 10);

    return {
      id: `aluno-${raw.num}`,
      number: raw.num,
      ra: raNum,
      raDigit,
      raUf: 'SP',
      name: raw.name,
      situation: raw.situation,
      classGroup,
      bimester,
      year,
      bimesters: bimestersData,
      grades: bim1.grades,
      overallAverage: bim1.overallAverage,
      totalAbsences: bim1.totalAbsences,
      totalCompensatedAbsences: bim1.totalCompensatedAbsences,
      totalClasses: totalAulasDadas,
      overallAttendanceRate: bim1.attendanceRate,
      annualAbsences: totalYearAbsences,
      annualAttendanceRate: annualFreq,
      overallBnccLevel: bim1.bnccLevel,
      riskProfile: getRiskProfile(bim1.overallAverage, bim1.attendanceRate, raw.situation),
      needsRecoverySubjects: bim1.needsRecoverySubjects,
      areaAverages: bim1.areaAverages,
      councilDeliberation: (quintaStatus === 'Aprovado' || quintaStatus === 'Aprovado pelo Conselho') ? 'Aprovado' : 'Recuperação Contínua',
      quintaMencao: {
        status: quintaStatus,
        justification,
        updatedAt: '2026-11-05'
      },
      pedagogicalOpinion: `Estudante com média ${bim1.overallAverage.toFixed(1)} e assiduidade de ${bim1.attendanceRate}% no 1º Bimestre. Situação: ${raw.situation}.`,
      actionPlan: bim1.needsRecoverySubjects.length > 0 ? `Participar de recuperação contínua em: ${bim1.needsRecoverySubjects.join(', ')}.` : 'Manter rotina pedagógica regular.'
    };
  });

  const summary = calculateClassSummary(
    students, 
    schoolName, 
    classGroup, 
    bimester, 
    year, 
    directorName, 
    goeName, 
    diretoriaEnsino, 
    teachingType, 
    tipoFechamento, 
    totalAulasDadas
  );

  return { students, summary };
}

function createBimesterPayload(raw: RawRowData, bimNumber: 1 | 2 | 3 | 4, progressDelta: number): StudentBimesterData {
  const grades: Record<string, any> = {};
  let gradeSum = 0;
  let validGradeCount = 0;
  let totalCompensated = 0;
  let totalFaltas = 0;
  const recoverySubjects: string[] = [];

  const areaSums: Record<KnowledgeArea, { sum: number; count: number }> = {
    linguagens: { sum: 0, count: 0 },
    matematica: { sum: 0, count: 0 },
    ciencias_natureza: { sum: 0, count: 0 },
    ciencias_humanas: { sum: 0, count: 0 },
    inova_educacao: { sum: 0, count: 0 }
  };

  OFFICIAL_SP_SUBJECTS.forEach((subj, idx) => {
    let baseG = raw.grades[idx] || 0;
    let baseF = raw.absences[idx] || 0;
    let baseAc = raw.ac[idx] || 0;

    // Apply small variation for later bimesters if student is active
    if (bimNumber > 1 && baseG > 0 && raw.situation === 'Ativo') {
      baseG = Math.min(10, Math.max(1, Math.round((baseG + (Math.random() * 1.2 - 0.4) + progressDelta) * 10) / 10));
      baseF = Math.max(0, Math.round(baseF * 0.85));
    }

    totalCompensated += baseAc;
    totalFaltas += baseF;

    const effectiveAbsences = Math.max(0, baseF - baseAc);
    const attRate = Math.max(0, Math.min(100, Math.round(((subj.totalAulas - effectiveAbsences) / subj.totalAulas) * 100)));
    const bnccLvl = getBnccLevel(baseG);
    const needsRec = baseG > 0 && baseG < 5.0;

    if (needsRec) {
      recoverySubjects.push(subj.name);
    }

    grades[subj.code] = {
      subjectCode: subj.code,
      subjectName: subj.name,
      area: subj.area,
      mention: String(baseG),
      grade: baseG,
      absences: baseF,
      compensatedAbsences: baseAc,
      totalClasses: subj.totalAulas,
      attendanceRate: attRate,
      bnccLevel: bnccLvl,
      needsRecovery: needsRec,
      finalGrade: baseG
    };

    if (baseG > 0) {
      gradeSum += baseG;
      validGradeCount++;
      areaSums[subj.area as KnowledgeArea].sum += baseG;
      areaSums[subj.area as KnowledgeArea].count += 1;
    }
  });

  const overallAverage = validGradeCount > 0 ? Math.round((gradeSum / validGradeCount) * 10) / 10 : 0;
  const overallBnccLevel = getBnccLevel(overallAverage);
  const freq = bimNumber === 1 ? raw.freq : Math.min(100, Math.round(raw.freq + bimNumber * 1.5));

  const areaAverages: Record<KnowledgeArea, number> = {
    linguagens: areaSums.linguagens.count > 0 ? Math.round((areaSums.linguagens.sum / areaSums.linguagens.count) * 10) / 10 : overallAverage,
    matematica: areaSums.matematica.count > 0 ? Math.round((areaSums.matematica.sum / areaSums.matematica.count) * 10) / 10 : overallAverage,
    ciencias_natureza: areaSums.ciencias_natureza.count > 0 ? Math.round((areaSums.ciencias_natureza.sum / areaSums.ciencias_natureza.count) * 10) / 10 : overallAverage,
    ciencias_humanas: areaSums.ciencias_humanas.count > 0 ? Math.round((areaSums.ciencias_humanas.sum / areaSums.ciencias_humanas.count) * 10) / 10 : overallAverage,
    inova_educacao: areaSums.inova_educacao.count > 0 ? Math.round((areaSums.inova_educacao.sum / areaSums.inova_educacao.count) * 10) / 10 : overallAverage,
  };

  return {
    bimester: bimNumber,
    grades,
    overallAverage,
    totalAbsences: bimNumber === 1 ? raw.tf : totalFaltas,
    totalCompensatedAbsences: totalCompensated,
    attendanceRate: freq,
    annualAbsences: raw.ftAn,
    annualAttendanceRate: raw.freqAn,
    bnccLevel: overallBnccLevel,
    needsRecoverySubjects: recoverySubjects,
    areaAverages,
    isLoaded: true
  };
}

export function calculateClassSummary(
  students: StudentRecord[], 
  schoolName: string, 
  classGroup: string, 
  bimester: number | '5ª Menção', 
  year: number,
  directorName: string = 'IARA KURZ GATTI',
  goeName: string = 'MARILI MARTIM OGEDA OLIVEIRA',
  diretoriaEnsino: string = 'São Bernardo do Campo',
  teachingType: string = '14 - ENSINO FUNDAMENTAL DE 9 AN',
  tipoFechamento: string = 'Conselho Primeiro Bimestre',
  totalAulasDadas: number = 310
): ClassAnalysisSummary {
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.situation === 'Ativo');
  const activeCount = Math.max(1, activeStudents.length);

  let totalAverageSum = 0;
  let totalAttendanceSum = 0;
  let totalAnnualAttendanceSum = 0;
  let inRecovery = 0;
  let atRiskAbsences = 0;
  let criticalRisk = 0;
  let highPerforming = 0;

  const bnccDist = {
    abaixo_do_basico: 0,
    basico: 0,
    adequado: 0,
    avancado: 0
  };

  const quintaDist = {
    aprovadosDiretos: 0,
    aprovadosPeloConselho: 0,
    retidosRendimento: 0,
    retidosFaltas: 0,
    retidosDuplo: 0,
    pendentes: 0
  };

  const areaAgg: Record<KnowledgeArea, { sum: number; count: number; failures: number; totalEntries: number }> = {
    linguagens: { sum: 0, count: 0, failures: 0, totalEntries: 0 },
    matematica: { sum: 0, count: 0, failures: 0, totalEntries: 0 },
    ciencias_natureza: { sum: 0, count: 0, failures: 0, totalEntries: 0 },
    ciencias_humanas: { sum: 0, count: 0, failures: 0, totalEntries: 0 },
    inova_educacao: { sum: 0, count: 0, failures: 0, totalEntries: 0 }
  };

  const subjectAgg: Record<string, { name: string; sum: number; count: number; failing: number }> = {};

  students.forEach((s) => {
    if (s.quintaMencao.status === 'Aprovado') quintaDist.aprovadosDiretos++;
    else if (s.quintaMencao.status === 'Aprovado pelo Conselho') quintaDist.aprovadosPeloConselho++;
    else if (s.quintaMencao.status === 'Retido por Rendimento') quintaDist.retidosRendimento++;
    else if (s.quintaMencao.status === 'Retido por Faltas') quintaDist.retidosFaltas++;
    else if (s.quintaMencao.status === 'Retido por Rendimento e Faltas') quintaDist.retidosDuplo++;
    else quintaDist.pendentes++;

    if (s.situation === 'Ativo') {
      totalAverageSum += s.overallAverage;
      totalAttendanceSum += s.overallAttendanceRate;
      totalAnnualAttendanceSum += s.annualAttendanceRate;
      bnccDist[s.overallBnccLevel] += 1;

      if (s.overallAverage < 5.0 || s.needsRecoverySubjects.length > 0) inRecovery += 1;
      if (s.overallAttendanceRate < 75) atRiskAbsences += 1;
      if (s.riskProfile === 'risco_critico') criticalRisk += 1;
      if (s.riskProfile === 'excelencia') highPerforming += 1;

      Object.values(s.grades).forEach((g) => {
        if (g.grade > 0) {
          areaAgg[g.area as KnowledgeArea].sum += g.grade;
          areaAgg[g.area as KnowledgeArea].count += 1;
          areaAgg[g.area as KnowledgeArea].totalEntries += 1;
          if (g.grade < 5.0) areaAgg[g.area as KnowledgeArea].failures += 1;

          if (!subjectAgg[g.subjectCode]) {
            subjectAgg[g.subjectCode] = { name: g.subjectName, sum: 0, count: 0, failing: 0 };
          }
          subjectAgg[g.subjectCode].sum += g.grade;
          subjectAgg[g.subjectCode].count += 1;
          if (g.grade < 5.0) subjectAgg[g.subjectCode].failing += 1;
        }
      });
    }
  });

  const areaPerformance: Record<KnowledgeArea, any> = {
    linguagens: {
      areaName: 'Linguagens',
      averageGrade: Math.round((areaAgg.linguagens.sum / (areaAgg.linguagens.count || 1)) * 10) / 10,
      failureRate: Math.round((areaAgg.linguagens.failures / (areaAgg.linguagens.totalEntries || 1)) * 100)
    },
    matematica: {
      areaName: 'Matemática',
      averageGrade: Math.round((areaAgg.matematica.sum / (areaAgg.matematica.count || 1)) * 10) / 10,
      failureRate: Math.round((areaAgg.matematica.failures / (areaAgg.matematica.totalEntries || 1)) * 100)
    },
    ciencias_natureza: {
      areaName: 'Ciências da Natureza',
      averageGrade: Math.round((areaAgg.ciencias_natureza.sum / (areaAgg.ciencias_natureza.count || 1)) * 10) / 10,
      failureRate: Math.round((areaAgg.ciencias_natureza.failures / (areaAgg.ciencias_natureza.totalEntries || 1)) * 100)
    },
    ciencias_humanas: {
      areaName: 'Ciências Humanas',
      averageGrade: Math.round((areaAgg.ciencias_humanas.sum / (areaAgg.ciencias_humanas.count || 1)) * 10) / 10,
      failureRate: Math.round((areaAgg.ciencias_humanas.failures / (areaAgg.ciencias_humanas.totalEntries || 1)) * 100)
    },
    inova_educacao: {
      areaName: 'Inova Educação',
      averageGrade: Math.round((areaAgg.inova_educacao.sum / (areaAgg.inova_educacao.count || 1)) * 10) / 10,
      failureRate: Math.round((areaAgg.inova_educacao.failures / (areaAgg.inova_educacao.totalEntries || 1)) * 100)
    }
  };

  const criticalSubjects = Object.values(subjectAgg)
    .map((s) => ({
      subjectName: s.name,
      averageGrade: Math.round((s.sum / (s.count || 1)) * 10) / 10,
      failingStudentsCount: s.failing,
      failingRate: Math.round((s.failing / (s.count || 1)) * 100)
    }))
    .sort((a, b) => b.failingRate - a.failingRate);

  return {
    schoolName,
    directorName,
    goeName,
    diretoriaEnsino,
    classGroup,
    teachingType,
    bimester,
    tipoFechamento,
    totalAulasDadas,
    year,
    totalStudents,
    totalActiveStudents: activeStudents.length,
    totalTransferredStudents: students.filter((s) => s.situation === 'Transferido' || s.situation === 'Baixa - Transferência').length,
    totalNonAttendingStudents: students.filter((s) => s.situation === 'Não Comparecimento').length,
    classAverage: Math.round((totalAverageSum / activeCount) * 10) / 10,
    averageAttendanceRate: Math.round(totalAttendanceSum / activeCount),
    averageAnnualAttendanceRate: Math.round(totalAnnualAttendanceSum / activeCount),
    totalStudentsInRecovery: inRecovery,
    totalStudentsAtRiskAbsences: atRiskAbsences,
    totalStudentsCriticalRisk: criticalRisk,
    totalStudentsHighPerforming: highPerforming,
    loadedBimesters: [1, 2, 3, 4],
    bnccLevelDistribution: bnccDist,
    quintaMencaoDistribution: quintaDist,
    areaPerformance,
    criticalSubjects
  };
}
