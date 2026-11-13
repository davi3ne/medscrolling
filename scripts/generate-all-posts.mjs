import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, '..');
const mdPath = path.resolve(appDir, '..', 'medfeed-conteudo', 'temas', 'psiquiatria.md');
const postsPath = path.join(appDir, 'src', 'data', 'posts.json');

const existingPosts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
const handcraftedIds = new Set([
  'ISRS-05', 'BZD-05', 'EH-04', 'BZD-08', 'AP-01',
  'ADT-21', 'ADT-03', 'EH-11', 'AP-12', 'BZD-26',
  'ISRS-21', 'AP-21', 'EH-21', 'ISRS-16', 'ADT-13',
]);
const handcraftedMap = new Map();
for (const p of existingPosts) {
  if (handcraftedIds.has(p.id)) {
    const { likes, timeAgo, ...clean } = p;
    handcraftedMap.set(p.id, clean);
  }
}

const md = fs.readFileSync(mdPath, 'utf-8');
const lines = md.split(/\r?\n/);

let currentProfile = null;
const fichas = [];
let cur = null;
let inDadosDuros = false;

const PROFILE_MAP = {
  isrs_e_duais: 'isrs_e_duais',
  antidepressivos_classicos_e_atipicos: 'antidepressivos_classicos_e_atipicos',
  antipsicoticos_e_neurolepticos: 'antipsicoticos_e_neurolepticos',
  estabilizadores_do_humor: 'estabilizadores_do_humor',
  sedativos_e_ansioliticos: 'sedativos_e_ansioliticos',
  depressao_maior_e_unipolar: 'depressao_maior_e_unipolar',
};

function flushFicha() {
  if (!cur) return;
  fichas.push(cur);
  cur = null;
  inDadosDuros = false;
}

for (const rawLine of lines) {
  const line = rawLine.trimEnd();

  const profMatch = line.match(/^###\s+\d+\.\d+\s+`@([a-z0-9_]+)`/i);
  if (profMatch) {
    flushFicha();
    currentProfile = PROFILE_MAP[profMatch[1]] || profMatch[1];
    continue;
  }

  const fichaMatch = line.match(/^#####\s+`([A-Z]+-\d+)`\s+[—-]\s+(.+)$/);
  if (fichaMatch) {
    flushFicha();
    cur = {
      id: fichaMatch[1].trim(),
      profile: currentProfile,
      title: fichaMatch[2].trim(),
      tag: '#Psicofarmacologia',
      prereq: '',
      resumoCard: '',
      explanation: '',
      dadosDuros: [],
      pegadinha: '',
      source: '',
    };
    continue;
  }

  if (!cur) continue;

  if (line.startsWith('* **Tag do Perfil:**')) {
    inDadosDuros = false;
    const m = line.match(/`([^`]+)`/);
    cur.tag = m ? m[1].trim() : line.replace('* **Tag do Perfil:**', '').trim();
  } else if (line.startsWith('* **Pré-requisito:**')) {
    inDadosDuros = false;
    cur.prereq = line.replace('* **Pré-requisito:**', '').trim();
  } else if (/^[\*\-]\s+\*\*Resumo Pronto para Card:\*\*/.test(line)) {
    inDadosDuros = false;
    cur.resumoCard = line.replace(/^[\*\-]\s+\*\*Resumo Pronto para Card:\*\*\s*/, '').trim();
  } else if (line.startsWith('* **Explicação Mastigada:**')) {
    inDadosDuros = false;
    cur.explanation = line.replace('* **Explicação Mastigada:**', '').trim();
  } else if (line.startsWith('* **Dados Duros')) {
    inDadosDuros = true;
  } else if (line.startsWith('* **Pegadinha de Prova')) {
    inDadosDuros = false;
    cur.pegadinha = line.replace(/^\*\s+\*\*Pegadinha de Prova[^:]*:\*\*\s*/, '').trim();
  } else if (line.startsWith('* **Fonte Exata:**')) {
    inDadosDuros = false;
    cur.source = line.replace('* **Fonte Exata:**', '').trim().replace(/\*/g, '');
  } else if (inDadosDuros && /^\s+[\*\-]\s+/.test(line)) {
    const bullet = line.replace(/^\s+[\*\-]\s+/, '').trim().replace(/\*\*/g, '');
    if (bullet) cur.dadosDuros.push(bullet);
  }
}
flushFicha();

function cleanMd(str) {
  return String(str || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSentences(text) {
  const clean = cleanMd(text);
  // Avoid splitting on "ex.", "Dr.", "p. ex.", decimal numbers
  const protectedText = clean
    .replace(/\bex\.:/gi, 'ex__COLON__')
    .replace(/\bp\.\s*ex\./gi, 'p__ex__')
    .replace(/(\d)\.(\d)/g, '$1__DOT__$2');
  const parts = protectedText.match(/[^.!?]+[.!?]+/g) || [protectedText];
  return parts
    .map((s) =>
      s
        .replace(/ex__COLON__/g, 'ex.:')
        .replace(/p__ex__/g, 'p. ex.')
        .replace(/__DOT__/g, '.')
        .trim()
    )
    .filter(Boolean);
}

function stripParentheticals(text) {
  return cleanMd(text).replace(/\s*\([^)]{15,}\)/g, '').replace(/\s+/g, ' ').trim();
}

function ensurePeriod(s) {
  const t = s.trim();
  if (!t) return '';
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

// Fits complete sentences without EVER cutting mid-sentence with "..."
function fitCompleteText(rawText, maxLen) {
  const sentences = splitSentences(rawText);
  let out = '';
  for (const s of sentences) {
    const candidate = out ? `${out} ${s}` : s;
    if (candidate.length <= maxLen) {
      out = candidate;
    } else if (!out) {
      // First sentence itself is too long: simplify parentheticals or split at semicolon
      const noParen = stripParentheticals(s);
      if (noParen.length <= maxLen) {
        out = noParen;
      } else {
        const clause = noParen.split(';')[0].trim();
        out = clause.length <= maxLen ? ensurePeriod(clause) : ensurePeriod(noParen.split(',')[0].trim());
      }
      break;
    } else {
      break;
    }
  }
  return ensurePeriod(out || stripParentheticals(rawText));
}

function fitBullet(rawBullet, maxLen) {
  let b = cleanMd(rawBullet);
  if (b.length <= maxLen) return b;
  b = stripParentheticals(b);
  if (b.length <= maxLen) return b;
  const firstClause = b.split(';')[0].trim();
  if (firstClause.length <= maxLen) return firstClause;
  return b.split(',')[0].trim();
}

function clinicalScore(sentence) {
  const s = sentence.toLowerCase();
  let score = 0;
  // Prefer practical clinical language
  if (/paciente|conduta|risco|evitar|prescrev|dose|mg|mEq|ms|semana|dia|hora|exame|ecg|litemia|hemograma|gesta|idoso|emerg|crise|alerta|sinal|efeito|sintoma|troca|suspender|iniciar/.test(s)) {
    score += 3;
  }
  // Penalize heavy molecular/receptor jargon on the feed surface
  if (/autorreceptor|somatodendrít|downregulation|exocitose|vesicula|genômic|bdnf|monoaminérg|alostéric|isoforma|alfa-1|alfa-2|5-ht1a|5-ht2|histaminérg|muscarín/.test(s)) {
    score -= 2;
  }
  return score;
}

function pickClinicalSentences(sentences) {
  if (sentences.length <= 2) return sentences;
  const ranked = sentences.map((s, i) => ({ s, i, score: clinicalScore(s) }));
  const clinical = ranked.filter((x) => x.score >= 1).map((x) => x.s);
  if (clinical.length >= 2) return clinical;
  // Fallback: skip overly academic sentence 0 if sentence 1+ are better
  return ranked.sort((a, b) => b.score - a.score || a.i - b.i).map((x) => x.s);
}

function pickBgImage(ficha) {
  const hay = `${ficha.title} ${ficha.tag} ${ficha.explanation} ${ficha.pegadinha}`.toLowerCase();
  if (/qtc|ecg|arritmia|torsades|cardio|iam|bloqueio av|qrs/.test(hay)) return '/images/bg-ecg.jpg';
  if (/gesta|gravid|lacta|teratog|ebstein|feto|parto/.test(hay)) return '/images/bg-maternal.jpg';
  if (/snm|maligna|serotoninérgica|uti|rabdomiólise|coma|depressão respiratória|flumazenil/.test(hay)) return '/images/bg-icu.jpg';
  if (/emergência|intoxicação|overdose|samu|agitação|contenção|delirium tremens/.test(hay)) return '/images/bg-er.jpg';
  if (/litemia|sódio|hiponatremia|siadh|hemograma|agranulocitose|hepát|renal|tsh|enzim|cyp/.test(hay)) return '/images/bg-lab.jpg';
  if (/sono|insônia|sedação|zolpidem|zopiclona|melatonina/.test(hay)) return '/images/bg-sleep.jpg';
  if (/via |dopamin|receptor|sináp|gaba|seroton|muscarín|histamín/.test(hay)) return '/images/bg-neuro.jpg';
  if (/isrs|irsn|tricíclico|imao|lítio|valproato|carbamazepina|lamotrigina|clozapina|haloperidol/.test(hay)) return '/images/bg-pharma.jpg';
  return '/images/bg-clinic.jpg';
}

function inferLocation(ficha) {
  const hay = `${ficha.title} ${ficha.tag}`.toLowerCase();
  if (/emerg|intox|snm|serotonin|agita|delirium|qrs|torsades/.test(hay)) return 'Pronto-Socorro · Sala Vermelha';
  if (/gesta|lacta/.test(hay)) return 'Pré-Natal · Psiquiatria Perinatal';
  if (/litemia|clozapina|hemograma|siadh|qtc/.test(hay)) return 'Monitorização & Exames';
  if (/sono|insôn/.test(hay)) return 'Medicina do Sono';
  return 'Ambulatório · Prescrição Clínica';
}

const SLIDE2_TITLES = [
  'O que importa na prática',
  'Como conduzir no consultório',
  'Resumo clínico direto',
  'Ponto-chave da prescrição',
];

const CURIOSIDADE_BADGES = [
  'RADAR CLÍNICO',
  'POUCA GENTE SABE',
  'PONTO FORA DA CURVA',
];

const CURIOSIDADE_PRIORITY_IDS = new Set([
  'DM-03', 'DM-06', 'DM-09', 'DM-15', 'DM-17', 'DM-24', 'DM-27',
]);

function buildGeneratedPost(ficha, idx) {
  const rawSentences = splitSentences(ficha.explanation);
  const resumoSentences = ficha.resumoCard ? splitSentences(ficha.resumoCard) : [];
  const clinicalSentences =
    resumoSentences.length > 0 ? resumoSentences : pickClinicalSentences(rawSentences);
  const pegadinhaClean = cleanMd(ficha.pegadinha);
  const dadosClean = ficha.dadosDuros.map(cleanMd);
  const bgImage = pickBgImage(ficha);
  const location = inferLocation(ficha);

  const hardDataText =
    dadosClean.length > 0
      ? dadosClean.map((d) => `• ${d}`).join('\n')
      : `• ${cleanMd(pegadinhaClean || ficha.explanation)}`;

  const fullCard = {
    title: `${ficha.id} — ${cleanMd(ficha.title)}`,
    explanation: cleanMd(ficha.explanation),
    hardData: hardDataText,
    source: cleanMd(ficha.source),
  };

  const useCuriosidade =
    CURIOSIDADE_PRIORITY_IDS.has(ficha.id) || idx % 3 === 2;
  const useRedFlag = !useCuriosidade && idx % 3 === 1 && pegadinhaClean.length > 20;

  if (useCuriosidade) {
    const factSource =
      resumoSentences.length > 0
        ? ficha.resumoCard
        : clinicalSentences.slice(0, 2).join(' ') || ficha.explanation;
    const factText = fitCompleteText(factSource, 230);
    const takeawaySource =
      dadosClean[0] || pegadinhaClean || clinicalSentences[clinicalSentences.length - 1] || ficha.title;
    const takeawayText = fitCompleteText(takeawaySource, 130);

    return {
      id: ficha.id,
      profile: ficha.profile,
      format: 'curiosidade',
      tag: ficha.tag,
      location,
      bgImage,
      content: {
        badge: CURIOSIDADE_BADGES[idx % CURIOSIDADE_BADGES.length],
        hook: cleanMd(ficha.title),
        fact: factText,
        takeaway: takeawayText,
      },
      caption: fitCompleteText(`${factText} ${pegadinhaClean}`, 240),
      fullCard,
    };
  }

  if (useRedFlag) {
    const pegSentences = splitSentences(pegadinhaClean);
    const trapText = fitCompleteText(pegSentences[0] || pegadinhaClean, 165);
    const revealSource =
      pegSentences.slice(1).join(' ') || clinicalSentences[0] || rawSentences[0] || ficha.explanation;
    const revealText = fitCompleteText(revealSource, 195);
    const hardNumbers =
      dadosClean.length > 0
        ? dadosClean.slice(0, 2).map((d) => fitBullet(d, 58))
        : [fitBullet(clinicalSentences[0] || ficha.title, 58)];

    return {
      id: ficha.id,
      profile: ficha.profile,
      format: 'red_flag',
      tag: ficha.tag,
      location,
      bgImage,
      content: {
        badge: 'PEGADINHA CLÍNICA',
        headline: cleanMd(ficha.title),
        trapLabel: 'Erro comum no plantão ou na prova:',
        trapText,
        revealLabel: 'Conduta correta:',
        revealText,
        hardNumbers,
      },
      caption: fitCompleteText(`${pegadinhaClean} ${dadosClean[0] ? `${dadosClean[0]}.` : ''}`, 240),
      fullCard,
    };
  }

  // Carrossel format (3 slides) — concise, complete sentences, clinical-first
  const coverSub = fitCompleteText(clinicalSentences[0] || rawSentences[0] || ficha.explanation, 135);
  const slide2Source =
    clinicalSentences.slice(1).join(' ') || clinicalSentences[0] || rawSentences[0] || ficha.explanation;
  const slide2Text = fitCompleteText(slide2Source, 200);
  const slide2Highlight = dadosClean[0]
    ? fitBullet(dadosClean[0], 110)
    : fitCompleteText(clinicalSentences[clinicalSentences.length - 1] || '', 110);

  const slide3Text = fitCompleteText(
    pegadinhaClean || dadosClean.slice(1).join('. ') || ficha.explanation,
    200
  );
  const slide3Highlight = dadosClean[1]
    ? fitBullet(dadosClean[1], 110)
    : dadosClean[0]
      ? fitBullet(dadosClean[0], 110)
      : 'Veja os detalhes completos na Ficha abaixo.';

  return {
    id: ficha.id,
    profile: ficha.profile,
    format: 'carrossel',
    tag: ficha.tag,
    location,
    bgImage,
    content: {
      slides: [
        {
          type: 'cover',
          kicker: ficha.tag.replace(/^#/, ''),
          title: cleanMd(ficha.title),
          subtitle: coverSub,
        },
        {
          step: 'Na prática',
          title: SLIDE2_TITLES[idx % SLIDE2_TITLES.length],
          text: slide2Text,
          highlight: slide2Highlight,
        },
        {
          step: 'Atenção ao erro',
          title: 'Não caia nessa pegadinha',
          text: slide3Text,
          highlight: slide3Highlight,
        },
      ],
    },
    caption: fitCompleteText(`${clinicalSentences[0] || ''} ${pegadinhaClean}`, 240),
    fullCard,
  };
}

const finalPosts = [];
for (const [, post] of handcraftedMap) {
  finalPosts.push(post);
}

let genIdx = 0;
for (const ficha of fichas) {
  if (handcraftedMap.has(ficha.id)) continue;
  finalPosts.push(buildGeneratedPost(ficha, genIdx++));
}

fs.writeFileSync(postsPath, JSON.stringify(finalPosts, null, 2) + '\n', 'utf-8');
const ellipsisCount = finalPosts.filter((p) => JSON.stringify(p.content).includes('...')).length;
console.log(`Generated ${finalPosts.length} posts cleanly (posts with "..." inside content: ${ellipsisCount}).`);
