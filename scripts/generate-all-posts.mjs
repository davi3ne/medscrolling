import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, '..');
const mdPath = path.resolve(appDir, '..', 'medfeed-conteudo', 'temas', 'psiquiatria.md');
const postsPath = path.join(appDir, 'src', 'data', 'posts.json');

const existingPosts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
const handcraftedMap = new Map();
for (const p of existingPosts) {
  const { likes, timeAgo, ...clean } = p;
  handcraftedMap.set(p.id, clean);
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
    .trim();
}

function splitSentences(text) {
  const clean = cleanMd(text);
  const parts = clean.match(/[^.!?]+[.!?]+/g);
  return parts ? parts.map((s) => s.trim()).filter(Boolean) : [clean];
}

function truncateText(text, maxLen) {
  const clean = cleanMd(text);
  if (clean.length <= maxLen) return clean;
  const cut = clean.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + '...';
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

function buildGeneratedPost(ficha, idx) {
  const sentences = splitSentences(ficha.explanation);
  const pegadinhaClean = cleanMd(ficha.pegadinha);
  const dadosClean = ficha.dadosDuros.map(cleanMd);
  const bgImage = pickBgImage(ficha);
  const location = inferLocation(ficha);

  const hardDataText =
    dadosClean.length > 0
      ? dadosClean.map((d) => `• ${d}`).join('\n')
      : `• ${truncateText(pegadinhaClean || ficha.explanation, 180)}`;

  const fullCard = {
    title: `${ficha.id} — ${cleanMd(ficha.title)}`,
    explanation: cleanMd(ficha.explanation),
    hardData: hardDataText,
    source: cleanMd(ficha.source),
  };

  // Alternate between red_flag (when pegadinha is strong) and carrossel
  const useRedFlag = idx % 2 === 1 && pegadinhaClean.length > 20;

  if (useRedFlag) {
    const pegSentences = splitSentences(pegadinhaClean);
    const trapText = truncateText(pegSentences[0] || pegadinhaClean, 155);
    const revealText = truncateText(
      pegSentences.slice(1).join(' ') || sentences[0] || ficha.explanation,
      195
    );
    const hardNumbers =
      dadosClean.length > 0
        ? dadosClean.slice(0, 3).map((d) => truncateText(d, 54))
        : [truncateText(sentences[sentences.length - 1] || ficha.title, 54)];

    return {
      id: ficha.id,
      profile: ficha.profile,
      format: 'red_flag',
      tag: ficha.tag,
      location,
      bgImage,
      content: {
        badge: 'PEGADINHA CLÍNICA',
        headline: truncateText(cleanMd(ficha.title), 88),
        trapLabel: 'Erro clássico no plantão ou na prova:',
        trapText,
        revealLabel: 'Conduta correta:',
        revealText,
        hardNumbers,
      },
      caption: truncateText(`${pegadinhaClean} ${dadosClean[0] ? `(${dadosClean[0]})` : ''}`, 240),
      fullCard,
    };
  }

  // Carrossel format (3 slides)
  const slide1Subtitle = truncateText(sentences[0] || ficha.explanation, 130);
  const slide2Text = truncateText(
    sentences.slice(1, 3).join(' ') || sentences[0] || ficha.explanation,
    210
  );
  const slide2Highlight = dadosClean[0]
    ? truncateText(dadosClean[0], 110)
    : truncateText(sentences[sentences.length - 1] || '', 110);

  const slide3Text = truncateText(
    pegadinhaClean || dadosClean.slice(1).join(' · ') || ficha.explanation,
    210
  );
  const slide3Highlight = dadosClean[1]
    ? truncateText(dadosClean[1], 110)
    : dadosClean[0]
      ? truncateText(dadosClean[0], 110)
      : 'Confira os números exatos na Ficha Completa';

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
          kicker: ficha.tag.replace(/^#/, ''),
          title: truncateText(cleanMd(ficha.title), 78),
          subtitle: slide1Subtitle,
        },
        {
          step: 'Na prática',
          title: 'O que define a conduta',
          text: slide2Text,
          highlight: slide2Highlight,
        },
        {
          step: 'Atenção à pegadinha',
          title: 'Não caia nesse erro',
          text: slide3Text,
          highlight: slide3Highlight,
        },
      ],
    },
    caption: truncateText(`${sentences[0] || ''} ${pegadinhaClean}`, 240),
    fullCard,
  };
}

// Keep handcrafted posts first in curated order, then add the rest in clinical order
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
console.log(`Parsed ${fichas.length} fichas from psiquiatria.md.`);
console.log(`Preserved ${handcraftedMap.size} handcrafted posts + generated ${genIdx} posts.`);
console.log(`Total posts written to src/data/posts.json: ${finalPosts.length}`);
