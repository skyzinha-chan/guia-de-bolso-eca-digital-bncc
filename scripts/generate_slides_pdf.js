/**
 * Gerador Nativo de Slides em PDF Widescreen 16:9 (960x540 pt)
 * Projeto: Guia de Bolso — Cultura Digital com Direitos (ECA Digital + BNCC)
 * Gera `Apresentacao_Guia_de_Bolso_Slides.pdf` com 10 slides vetoriais,
 * incluindo os 7 QR Codes vetoriais e clicáveis no Slide 1 e no Slide 8.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const rootDir = path.resolve(__dirname, '..');
const qrVendorDir = path.join(__dirname, 'vendor', 'QRCode');
const QRCode = require(path.join(qrVendorDir, 'index.js'));
const QRErrorCorrectLevel = require(path.join(qrVendorDir, 'QRErrorCorrectLevel.js'));

function createQRMatrix(text) {
  const qr = new QRCode(-1, QRErrorCorrectLevel.M);
  qr.addData(text);
  qr.make();
  return qr.modules;
}

const qrData = [
  { label: 'ECA Digital (MJSP)', pg: 'Pág. 1 • Capa', desc: 'Portal Oficial Lei 15.211/25', url: 'https://www.gov.br/mj/pt-br/assuntos/sua-protecao/sedigi/eca-digital/eca-digital-1' },
  { label: 'Guia Antifraude', pg: 'Pág. 4 • Dicas', desc: 'Proteção contra Phishing (UFMA)', url: 'https://portalpadrao.ufma.br/sti/seh/temas/protecao-contra-phishing-e-fraudes' },
  { label: 'SaferNet Brasil', pg: 'Pág. 4 • Dicas', desc: 'Prevenção ao Ciberbullying', url: 'https://new.safernet.org.br/' },
  { label: 'Disque 100 Online', pg: 'Pág. 7 • Apoio', desc: 'Direitos Humanos (MDHC)', url: 'https://www.gov.br/mdh/pt-br/ondh' },
  { label: 'SaferNet Denúncia', pg: 'Pág. 7 • Apoio', desc: 'Canal Oficial e Helpline', url: 'https://new.safernet.org.br/denuncie' },
  { label: 'ANPD (gov.br)', pg: 'Pág. 7 • Apoio', desc: 'Proteção de Dados de Menores', url: 'https://www.gov.br/anpd/pt-br' },
  { label: 'Guia de Telas', pg: 'Pág. 7 • Apoio', desc: 'Secom / Governo Federal', url: 'https://www.gov.br/secom/pt-br/assuntos/uso-de-telas-por-criancas-e-adolescentes/guia/capitulos/conhecendo-os-riscos' }
];
for (const q of qrData) {
  q.modules = createQRMatrix(q.url);
}

// Helper for PDF drawing in top-down coordinates (960 x 540)
const W = 960;
const H = 540;

function pdfEscape(str) {
  // Replace special typography chars with WinAnsi equivalents
  const s = str
    .replace(/—/g, '\x97')
    .replace(/–/g, '\x96')
    .replace(/“/g, '\x93')
    .replace(/”/g, '\x94')
    .replace(/‘/g, '\x91')
    .replace(/’/g, '\x92')
    .replace(/•/g, '\x95')
    .replace(/→/g, '->');
  let out = '(';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code === 40 || code === 41 || code === 92) {
      out += '\\' + s[i];
    } else if (code >= 32 && code <= 126) {
      out += s[i];
    } else if (code >= 128 && code <= 255) {
      out += '\\' + code.toString(8).padStart(3, '0');
    } else {
      out += ' ';
    }
  }
  out += ')';
  return out;
}

// Approximate text width in Helvetica (in points for fontSize=1)
function measureText(str, fontSize, isBold = false) {
  let w = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if ('ilI.,:;!| '.includes(ch)) w += 0.28;
    else if ('mwMW@%'.includes(ch)) w += 0.82;
    else if (ch >= 'A' && ch <= 'Z') w += 0.68;
    else w += 0.53;
  }
  return w * fontSize * (isBold ? 1.05 : 1.0);
}

function wrapText(str, maxWidth, fontSize, isBold = false) {
  const words = str.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    const test = current ? current + ' ' + w : w;
    if (measureText(test, fontSize, isBold) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  }
  if (current) lines.push(current);
  return lines;
}

class SlideCanvas {
  constructor(slideNum, totalSlides, sectionTitle, sectionSub, badgeText, speakerText) {
    this.ops = [];
    this.links = [];
    this.slideNum = slideNum;
    this.totalSlides = totalSlides;
    // White background
    this.fillRect(0, 0, W, H, [1, 1, 1]);
    // Header
    this.drawHeader(sectionTitle, sectionSub, badgeText);
    // Footer
    this.drawFooter(speakerText);
  }

  // Top-down (x, y, w, h) -> PDF bottom-up (x, H - y - h, w, h)
  fillRect(x, y, w, h, rgb) {
    this.ops.push(`${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} rg`);
    this.ops.push(`${x.toFixed(2)} ${(H - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }

  strokeRect(x, y, w, h, rgb, lineWidth = 1, dashed = false) {
    this.ops.push('q');
    this.ops.push(`${lineWidth.toFixed(2)} w`);
    if (dashed) this.ops.push('[3 3] 0 d');
    this.ops.push(`${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} RG`);
    this.ops.push(`${x.toFixed(2)} ${(H - y - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);
    this.ops.push('Q');
  }

  // Font: F1 = Helvetica, F2 = Helvetica-Bold, F3 = Helvetica-Oblique
  text(str, x, y, size, rgb = [0.06, 0.09, 0.16], font = 'F1') {
    const pdfY = H - y;
    this.ops.push('BT');
    this.ops.push(`/${font} ${size.toFixed(2)} Tf`);
    this.ops.push(`${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} rg`);
    this.ops.push(`1 0 0 1 ${x.toFixed(2)} ${pdfY.toFixed(2)} Tm`);
    this.ops.push(`${pdfEscape(str)} Tj`);
    this.ops.push('ET');
  }

  paragraph(str, x, y, maxW, size, rgb = [0.2, 0.25, 0.33], font = 'F1', lineHeight = 1.38) {
    const isBold = font === 'F2';
    const lines = wrapText(str, maxW, size, isBold);
    let curY = y;
    for (const line of lines) {
      this.text(line, x, curY, size, rgb, font);
      curY += size * lineHeight;
    }
    return curY;
  }

  bulletList(items, x, y, maxW, size = 10.5, rgb = [0.2, 0.25, 0.33], bulletRgb = [0.016, 0.47, 0.34], gap = 5) {
    let curY = y;
    for (const item of items) {
      this.text('•', x, curY, size + 1, bulletRgb, 'F2');
      if (typeof item === 'string') {
        curY = this.paragraph(item, x + 12, curY, maxW - 12, size, rgb, 'F1', 1.35) + gap;
      } else {
        // { bold: '...', text: '...' }
        const full = item.bold + ' ' + item.text;
        const lines = wrapText(full, maxW - 12, size, false);
        // Print first line with bold prefix if fits
        this.text(item.bold, x + 12, curY, size, [0.06, 0.09, 0.16], 'F2');
        const boldW = measureText(item.bold + ' ', size, true);
        const restLines = wrapText(item.text, maxW - 12 - boldW, size, false);
        if (restLines.length === 1 && measureText(item.text, size, false) <= maxW - 12 - boldW) {
          this.text(item.text, x + 12 + boldW, curY, size, rgb, 'F1');
          curY += size * 1.35 + gap;
        } else {
          curY += size * 1.32;
          curY = this.paragraph(item.text, x + 12, curY, maxW - 12, size, rgb, 'F1', 1.32) + gap;
        }
      }
    }
    return curY;
  }

  drawCard(x, y, w, h, theme = 'green', pillText = '', titleText = '') {
    const palettes = {
      green: { bg: [0.973, 0.980, 0.988], border: [0.886, 0.910, 0.941], accent: [0.016, 0.471, 0.341], pillBg: [0.820, 0.980, 0.898], pillFg: [0.024, 0.373, 0.275] },
      blue:  { bg: [0.941, 0.976, 1.000], border: [0.729, 0.902, 0.992], accent: [0.008, 0.518, 0.780], pillBg: [0.878, 0.949, 0.996], pillFg: [0.012, 0.412, 0.631] },
      amber: { bg: [1.000, 0.984, 0.922], border: [0.992, 0.902, 0.541], accent: [0.851, 0.467, 0.024], pillBg: [0.996, 0.953, 0.780], pillFg: [0.573, 0.251, 0.055] },
      rose:  { bg: [1.000, 0.945, 0.949], border: [0.996, 0.804, 0.827], accent: [0.882, 0.114, 0.282], pillBg: [1.000, 0.894, 0.902], pillFg: [0.624, 0.071, 0.224] },
      dark:  { bg: [0.059, 0.090, 0.165], border: [0.118, 0.161, 0.231], accent: [0.063, 0.725, 0.506], pillBg: [0.024, 0.373, 0.275], pillFg: [0.655, 0.953, 0.816] }
    };
    const p = palettes[theme] || palettes.green;
    this.fillRect(x, y, w, h, p.bg);
    this.strokeRect(x, y, w, h, p.border, 1);
    this.fillRect(x, y, 4.5, h, p.accent);

    let contentY = y + 14;
    if (pillText) {
      const pw = measureText(pillText, 8, true) + 14;
      this.fillRect(x + 14, contentY - 2, pw, 14, p.pillBg);
      this.text(pillText, x + 21, contentY + 8.5, 8, p.pillFg, 'F2');
      contentY += 22;
    }
    if (titleText) {
      const titleColor = theme === 'dark' ? [0.204, 0.827, 0.600] : [0.059, 0.090, 0.165];
      contentY = this.paragraph(titleText, x + 14, contentY + 4, w - 26, 13, titleColor, 'F2', 1.25) + 4;
    }
    return contentY + 2;
  }

  drawQR(modules, x, y, size, url = null) {
    const count = modules.length;
    const margin = 2;
    const total = count + margin * 2;
    const cell = size / total;
    this.fillRect(x, y, size, size, [1, 1, 1]);
    this.ops.push('0.059 0.090 0.165 rg');
    for (let r = 0; r < count; r++) {
      let c = 0;
      while (c < count) {
        if (modules[r][c]) {
          let cEnd = c + 1;
          while (cEnd < count && modules[r][cEnd]) cEnd++;
          const rx = x + (c + margin) * cell;
          const ry = y + (r + margin) * cell;
          const rw = (cEnd - c) * cell;
          const rh = cell;
          this.ops.push(`${rx.toFixed(2)} ${(H - ry - rh).toFixed(2)} ${(rw + 0.05).toFixed(2)} ${(rh + 0.05).toFixed(2)} re`);
          c = cEnd;
        } else {
          c++;
        }
      }
    }
    this.ops.push('f');
    if (url) {
      this.links.push({ rect: [x, H - y - size - 16, x + size, H - y], url });
    }
  }

  drawHeader(title, subtitle, badge) {
    this.text(title, 40, 30, 11.5, [0.016, 0.471, 0.341], 'F2');
    this.text(subtitle, 40, 44, 9.5, [0.392, 0.455, 0.545], 'F1');
    const bw = measureText(badge, 8.5, true) + 20;
    this.fillRect(W - 40 - bw, 22, bw, 20, [0.925, 0.992, 0.961]);
    this.strokeRect(W - 40 - bw, 22, bw, 20, [0.655, 0.953, 0.816], 1);
    this.text(badge, W - 30 - bw, 35, 8.5, [0.016, 0.471, 0.341], 'F2');
    this.fillRect(40, 52, W - 80, 1.8, [0.016, 0.471, 0.341]);
  }

  drawFooter(speakerText) {
    this.fillRect(40, H - 34, W - 80, 0.8, [0.886, 0.910, 0.941]);
    this.text('Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim | Licenciatura em Computação (Tópicos Especiais II)', 40, H - 18, 8.5, [0.392, 0.455, 0.545], 'F1');
    const rightStr = `${speakerText}  •  Slide ${this.slideNum} / ${this.totalSlides}`;
    const rw = measureText(rightStr, 8.5, true) + 16;
    this.fillRect(W - 40 - rw, H - 28, rw, 16, [0.945, 0.961, 0.976]);
    this.text(rightStr, W - 32 - rw, H - 17, 8.5, [0.200, 0.255, 0.333], 'F2');
  }
}

const slides = [];
const TOTAL = 10;

// ==========================================
// SLIDE 1: CAPA
// ==========================================
{
  const s = new SlideCanvas(
    1, TOTAL,
    'MINISTÉRIO DA EDUCAÇÃO — IFMS CÂMPUS JARDIM',
    'Curso de Licenciatura em Computação | Disciplina: Tópicos Especiais II | Docente: Prof. Giovanni Netto Calixto',
    'SEMINÁRIO • ECA DIGITAL + BNCC',
    'Etapa 1: Abertura'
  );

  // Hero Banner
  s.fillRect(40, 68, W - 80, 185, [0.016, 0.471, 0.341]);
  s.fillRect(54, 84, 290, 18, [0.024, 0.373, 0.275]);
  s.text('PROPOSTA EDUCACIONAL & GUIA DE BOLSO PEDAGÓGICO', 62, 96, 8.5, [0.820, 0.980, 0.898], 'F2');
  s.text('Guia de Bolso: Cultura Digital com Direitos', 54, 132, 26, [1, 1, 1], 'F2');
  s.paragraph(
    'Orientações práticas para famílias e professores sobre o uso crítico, ético, seguro e responsável das tecnologias digitais com base no ECA Digital (Lei nº 15.211/2025) e na BNCC (Competência Geral 5).',
    54, 158, 640, 11.5, [0.925, 0.992, 0.961], 'F1', 1.4
  );
  s.text('Apresentação dos Resultados: 03 de novembro de 2026  |  Repositório: github.com/skyzinha-chan/guia-de-bolso-eca-digital-bncc', 54, 232, 9.5, [0.655, 0.953, 0.816], 'F2');

  // QR Box inside Hero Banner
  s.fillRect(765, 80, 140, 160, [1, 1, 1]);
  s.drawQR(qrData[0].modules, 785, 88, 100, qrData[0].url);
  s.text('ECA DIGITAL (MJSP)', 790, 204, 8.5, [0.016, 0.471, 0.341], 'F2');
  s.text('Página 1 da Cartilha', 795, 217, 8, [0.392, 0.455, 0.545], 'F1');
  s.text('(Clique ou Escaneie)', 795, 229, 7.5, [0.008, 0.518, 0.780], 'F1');

  // 3 Bottom Cards
  let y1 = s.drawCard(40, 270, 320, 220, 'green', 'INTEGRANTES — GRUPO 1', 'Equipe e Funções no Projeto');
  s.bulletList([
    { bold: 'Denner dos Santos Avalos:', text: 'Coordenação, Estrutura e Relatório' },
    { bold: 'Leonardo V. da Costa Gomes:', text: 'Pesquisa, Conteúdo e Slides' },
    { bold: 'João Carlos Velasquez:', text: 'Criação e Diagramação da Cartilha' },
    { bold: 'Talita Mendonça Marques:', text: 'Geração e Validação dos QR Codes' },
    { bold: 'Adriano Hazime Rodrigues:', text: 'Identidade Visual e Documentação' }
  ], 54, y1 + 4, 294, 9.2, [0.2, 0.25, 0.33], [0.016, 0.47, 0.34], 3);

  let y2 = s.drawCard(375, 270, 285, 220, 'blue', 'RECORTE TEMÁTICO', 'Eixos Integrados do Edital');
  s.bulletList([
    { bold: 'Eixo 3 — Ética e Segurança Digital:', text: 'Prevenção ao ciberbullying, golpes (phishing), proteção de dados e canais de denúncia.' },
    { bold: 'Eixo 1 e 2 — TDIC e Cultura Digital:', text: 'Mediação familiar do tempo de tela, diálogo em casa e letramento digital.' }
  ], 389, y2 + 6, 258, 9.5, [0.2, 0.25, 0.33], [0.008, 0.518, 0.780], 6);

  let y3 = s.drawCard(675, 270, 245, 220, 'amber', 'PRODUTO PRÁTICO', 'Cartilha com 7 QR Codes');
  s.bulletList([
    { bold: 'Formato:', text: 'Guia de bolso de 8 páginas em PDF (impressão e celular).' },
    { bold: 'Interatividade:', text: '7 QR Codes vetoriais e clicáveis para canais oficiais.' },
    { bold: 'Público:', text: 'Famílias e professores do Ensino Fundamental II.' }
  ], 689, y3 + 6, 218, 9.5, [0.2, 0.25, 0.33], [0.851, 0.467, 0.024], 6);

  slides.push(s);
}

// ==========================================
// SLIDE 2: TEMA, PROBLEMA E JUSTIFICATIVA
// ==========================================
{
  const s = new SlideCanvas(
    2, TOTAL,
    '1. TEMA, PROBLEMA E JUSTIFICATIVA',
    'Por que criar um Guia de Bolso sobre o ECA Digital e a BNCC para famílias e professores?',
    'PROBLEMA E JUSTIFICATIVA (2 MIN)',
    'Fala sugerida: Denner'
  );

  let yp = s.drawCard(40, 68, W - 80, 88, 'rose', 'PERGUNTA-PROBLEMA CENTRAL DO PROJETO', '');
  s.paragraph(
    '“Como a escola pode orientar famílias e professores, de forma simples e acessível, para que eles ajudem os estudantes a usar a tecnologia de modo crítico, ético, seguro e responsável?”',
    56, yp + 2, W - 112, 13.5, [0.533, 0.075, 0.216], 'F2', 1.35
  );

  let yL = s.drawCard(40, 172, 430, 318, 'green', 'DIAGNÓSTICO DO PROBLEMA (SEÇÃO 2)', 'A Lacuna entre a Legislação e as Famílias');
  s.bulletList([
    { bold: 'Novo Marco Legal (Lei nº 15.211/25):', text: 'O ECA Digital instituiu o princípio da responsabilidade compartilhada entre família, escola, Estado e plataformas digitais.' },
    { bold: 'Desconhecimento Prático:', text: 'Muitas famílias e professores conhecem pouco os direitos previstos na lei e não sabem como supervisionar ou agir diante de golpes, phishing, ciberbullying, aliciamento e exposição de dados.' },
    { bold: 'Ações Escolares Pontuais:', text: 'Iniciativas tradicionais costumam se limitar a palestras isoladas ou avisos que raramente chegam às famílias de forma contínua.' }
  ], 54, yL + 8, 400, 10, [0.2, 0.25, 0.33], [0.016, 0.47, 0.34], 8);

  let yR = s.drawCard(490, 172, 430, 318, 'blue', 'JUSTIFICATIVA PEDAGÓGICA (SEÇÃO 3)', 'Por que uma Cartilha de Bolso com QR Codes?');
  s.bulletList([
    { bold: 'Preparação dos Adultos de Referência:', text: 'A orientação do adolescente é muito mais efetiva quando pais e professores estão preparados para dialogar, mediar e agir com segurança.' },
    { bold: 'Superação da Linguagem Jurídica:', text: 'Textos técnicos e leis extensas afastam o público leigo. O Guia de Bolso traduz o ECA Digital em exemplos curtos do cotidiano.' },
    { bold: 'Porta de Entrada Acessível:', text: 'Material de baixo custo, leitura rápida (8 páginas) e fácil distribuição em reuniões de pais, eventos escolares e grupos de WhatsApp, usando QR Codes para aprofundamento seguro.' }
  ], 504, yR + 8, 400, 10, [0.2, 0.25, 0.33], [0.008, 0.518, 0.780], 8);

  slides.push(s);
}

// ==========================================
// SLIDE 3: PÚBLICO-ALVO, OBJETIVOS E DIFERENCIAL
// ==========================================
{
  const s = new SlideCanvas(
    3, TOTAL,
    '2. PÚBLICO-ALVO, OBJETIVOS E DIFERENCIAL METODOLÓGICO',
    'Alinhamento ao Edital e Comparativo com Tópicos Especiais III (Seção 7 da Estrutura do Guia)',
    'PÚBLICO E OBJETIVOS (2 MIN)',
    'Fala sugerida: Denner / Leonardo'
  );

  let y1 = s.drawCard(40, 68, 420, 148, 'green', 'PÚBLICO-ALVO DEFINIDO', 'Quem o Guia de Bolso Atende?');
  s.bulletList([
    { bold: 'Público Principal:', text: 'Famílias e responsáveis de estudantes do Ensino Fundamental II (6º ao 9º ano).' },
    { bold: 'Público Secundário:', text: 'Professores e equipe pedagógica (uso em reuniões, rodas de conversa e aulas).' },
    { bold: 'Beneficiários Indiretos:', text: 'Os próprios estudantes.' }
  ], 54, y1 + 4, 392, 9.6, [0.2, 0.25, 0.33], [0.016, 0.47, 0.34], 5);

  let y2 = s.drawCard(40, 230, 420, 260, 'blue', 'OBJETIVO GERAL E ESPECÍFICOS (SEÇÃO 4)', 'Metas Pedagógicas do Projeto');
  s.paragraph(
    'Objetivo Geral: Elaborar uma proposta educacional, na forma de cartilha de bolso com QR codes, que oriente famílias e professores sobre o uso crítico, ético, seguro e responsável das tecnologias digitais (ECA Digital + CG 5 da BNCC).',
    54, y2 + 2, 392, 9.5, [0.06, 0.09, 0.16], 'F2', 1.32
  );
  s.bulletList([
    'Traduzir os principais pontos do ECA Digital para linguagem simples;',
    'Relacionar cada tema às competências e habilidades da BNCC;',
    'Reunir, via QR Codes, canais oficiais de informação e denúncia;',
    'Propor atividades curtas de diálogo entre família, alunos e escola;',
    'Apresentar plano de uso escolar e plano de validação futura.'
  ], 54, y2 + 58, 392, 9.3, [0.2, 0.25, 0.33], [0.008, 0.518, 0.780], 4);

  // Right Table Card: Tópicos III vs Tópicos II
  let y3 = s.drawCard(480, 68, 440, 422, 'amber', 'DIFERENCIAL DE ABORDAGEM (SEÇÃO 7 DA ESTRUTURA)', 'Comparativo: Tópicos Especiais III vs. Tópicos Especiais II');
  s.paragraph(
    'Para garantir projetos distintos e complementares, este trabalho foca na formação para a cultura digital mediada pelos adultos de referência:',
    494, y3 + 2, 412, 9.8, [0.2, 0.25, 0.33], 'F1', 1.35
  );

  // Draw comparison table
  const tx = 494, ty = y3 + 42, tw = 412;
  const colW = [92, 155, 165];
  const rows = [
    ['Aspecto', 'Tópicos III (Feed Seguro)', 'Tópicos II (Guia de Bolso)'],
    ['Foco', 'Solução tecnológica', 'Proposta educacional'],
    ['Público-Alvo', 'Adolescentes (alunos)', 'Famílias e professores'],
    ['Produto Final', 'Quiz / simulador web', 'Cartilha de bolso + QR Codes'],
    ['Papel da BNCC', 'Não é o foco central', 'Elemento obrigatório central'],
    ['Dinâmica de Uso', 'O estudante joga online', 'A escola distribui e media'],
    ['Papel Docente', 'Desenvolvedor de software', 'Mediador entre lei, tecnologia e comunidade escolar']
  ];
  let curTy = ty;
  for (let r = 0; r < rows.length; r++) {
    const rh = r === 6 ? 42 : 34;
    if (r === 0) {
      s.fillRect(tx, curTy, tw, rh, [0.016, 0.471, 0.341]);
    } else {
      s.fillRect(tx, curTy, tw, rh, r % 2 === 1 ? [1, 1, 1] : [0.945, 0.961, 0.976]);
      s.strokeRect(tx, curTy, tw, rh, [0.82, 0.85, 0.90], 0.6);
    }
    let cx = tx;
    for (let c = 0; c < 3; c++) {
      const color = r === 0 ? [1, 1, 1] : (c === 2 ? [0.016, 0.471, 0.341] : [0.15, 0.2, 0.28]);
      const font = (r === 0 || c === 0 || c === 2) ? 'F2' : 'F1';
      s.paragraph(rows[r][c], cx + 8, curTy + 13, colW[c] - 14, 9.2, color, font, 1.25);
      cx += colW[c];
    }
    curTy += rh;
  }

  slides.push(s);
}

// ==========================================
// SLIDE 4: FUNDAMENTAÇÃO - ECA DIGITAL
// ==========================================
{
  const s = new SlideCanvas(
    4, TOTAL,
    '3. FUNDAMENTAÇÃO TEÓRICA — O ECA DIGITAL EM PONTOS-CHAVE',
    'Lei nº 15.211/2025 (Estatuto Digital da Criança e do Adolescente) — Trabalhada na Página 2 da Cartilha',
    'ECA DIGITAL (3 MIN)',
    'Fala sugerida: Leonardo'
  );

  const cards = [
    {
      theme: 'green', pill: 'EIXO 1 • PRINCÍPIO CENTRAL', title: '1. Responsabilidade Compartilhada',
      text: 'A proteção de crianças e adolescentes no ambiente digital não é dever exclusivo da família: exige atuação conjunta entre família, escola, sociedade, Estado e plataformas.'
    },
    {
      theme: 'blue', pill: 'EIXO 2 • PRIVACIDADE NATIVA', title: '2. Segurança por Padrão',
      text: 'Redes sociais e jogos devem vir pré-configurados no mais alto nível de privacidade e proteção para contas de menores, sem exigir ajustes técnicos complexos da família.'
    },
    {
      theme: 'green', pill: 'EIXO 3 • MEDIAÇÃO ATIVA', title: '3. Supervisão Parental com Diálogo',
      text: 'As plataformas devem ofertar ferramentas gratuitas de controle e acompanhamento, que precisam ser utilizadas com diálogo constante e não apenas como vigilância.'
    },
    {
      theme: 'blue', pill: 'EIXO 4 • BARREIRA ETÁRIA', title: '4. Aferição de Idade Real',
      text: 'A simples autodeclaração de idade (“marque aqui se tem mais de 13 anos”) deixa de ser suficiente, exigindo mecanismos mais eficazes para barrar conteúdos inadequados.'
    },
    {
      theme: 'amber', pill: 'EIXO 5 • DADOS E ALGORITMOS', title: '5. Proteção de Dados e Publicidade',
      text: 'Vedação à coleta excessiva de dados pessoais sem consentimento, ao rastreamento e ao perfilamento comportamental de crianças para fins publicitários.'
    },
    {
      theme: 'rose', pill: 'EIXO 6 • REPORTE E SANÇÕES', title: '6. Denúncia e Fiscalização (ANPD)',
      text: 'Mecanismos acessíveis para reportar exploração, abuso, aliciamento e ciberbullying. O descumprimento sujeita as plataformas a sanções e multas da ANPD.'
    }
  ];

  const cw = 280, ch = 198, gapX = 20, gapY = 20;
  cards.forEach((c, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 40 + col * (cw + gapX);
    const y = 72 + row * (ch + gapY);
    const cy = s.drawCard(x, y, cw, ch, c.theme, c.pill, c.title);
    s.paragraph(c.text, x + 14, cy + 6, cw - 28, 10, [0.2, 0.25, 0.33], 'F1', 1.42);
  });

  slides.push(s);
}

// ==========================================
// SLIDE 5: RELAÇÃO COM A BNCC
// ==========================================
{
  const s = new SlideCanvas(
    5, TOTAL,
    '4. RELAÇÃO COM A BNCC E A CULTURA DIGITAL',
    'Competência Geral 5 como eixo central e Competências Pedagógicas de Apoio (Página 3 da Cartilha)',
    'BNCC E CULTURA DIGITAL (3 MIN)',
    'Fala sugerida: Leonardo'
  );

  let yHero = s.drawCard(40, 68, W - 80, 118, 'blue', 'EIXO CENTRAL DO PROJETO — COMPETÊNCIA GERAL 5 DA BNCC', 'Cultura Digital: Uso Crítico, Significativo, Reflexivo e Ético');
  s.paragraph(
    '“Compreender, utilizar e criar tecnologias digitais de informação e comunicação de forma crítica, significativa, reflexiva e ética nas diversas práticas sociais (incluindo as escolares) para se comunicar, acessar e disseminar informações, produzir conhecimentos, resolver problemas e exercer protagonismo e autoria na vida pessoal e coletiva.”',
    54, yHero + 2, W - 110, 10.5, [0.15, 0.2, 0.28], 'F3', 1.38
  );

  const supp = [
    {
      theme: 'green', pill: 'COMPETÊNCIA GERAL 9', title: 'Empatia e Cooperação',
      text: 'Promover respeito e acolhimento no convívio online, prevenção ativa do ciberbullying e combate ao discurso de ódio em grupos e redes sociais.'
    },
    {
      theme: 'green', pill: 'COMPETÊNCIA GERAL 10', title: 'Responsabilidade e Cidadania',
      text: 'Agir pessoal e coletivamente com autonomia, responsabilidade e princípios éticos e democráticos: fundamenta os combinados de uso de telas e a denúncia de violações.'
    },
    {
      theme: 'green', pill: 'COMPETÊNCIA GERAL 4', title: 'Comunicação',
      text: 'Utilizar diferentes linguagens, inclusive a digital, para se expressar e partilhar informações e sentimentos: estrutura o roteiro de conversa entre família e escola.'
    }
  ];

  supp.forEach((c, idx) => {
    const x = 40 + idx * 300;
    const cy = s.drawCard(x, 202, 280, 190, c.theme, c.pill, c.title);
    s.paragraph(c.text, x + 14, cy + 6, 252, 10, [0.2, 0.25, 0.33], 'F1', 1.4);
  });

  let yBot = s.drawCard(40, 408, W - 80, 82, 'amber', 'COMPLEMENTO — COMPUTAÇÃO NA EDUCAÇÃO BÁSICA (BNCC COMPUTAÇÃO)', '');
  s.paragraph(
    'Dialoga diretamente com os eixos Cultura Digital e Mundo Digital, formando estudantes e famílias para o ciclo completo proposto na disciplina:  usar  ->  compreender  ->  questionar  ->  proteger-se  ->  criar  ->  participar  de maneira responsável no ambiente virtual.',
    54, yBot, W - 110, 10.2, [0.2, 0.25, 0.33], 'F2', 1.38
  );

  slides.push(s);
}

// ==========================================
// SLIDE 6: ESTRUTURA DA CARTILHA
// ==========================================
{
  const s = new SlideCanvas(
    6, TOTAL,
    '5. DESENVOLVIMENTO E ESTRUTURA DA CARTILHA (8 PÁGINAS)',
    'Mapeamento página a página do Guia de Bolso, Competências da BNCC e QR Codes (Seção 7.1 do Relatório)',
    'ESTRUTURA DO PRODUTO (2 MIN)',
    'Fala sugerida: João Carlos / Adriano'
  );

  const tx = 40, ty = 68, tw = W - 80;
  const colW = [65, 435, 145, 235];
  const rows = [
    ['Página', 'Conteúdo da Seção na Cartilha', 'Competência BNCC', 'QR Code Associado'],
    ['Pág. 1', 'Capa e visão geral: para que serve o guia e público-alvo', 'CG 5', '1 QR: Versão digital / ECA Digital'],
    ['Pág. 2', 'O ECA Digital em linguagem simples (6 eixos práticos)', 'CG 5 e CG 10', '—'],
    ['Pág. 3', 'Conexão com a BNCC: Competência 5 e apoio (9, 10 e 4)', 'CG 4, 5, 9 e 10', '—'],
    ['Pág. 4', 'Dicas práticas: privacidade (o que não compartilhar) e phishing', 'CG 5', '2 QRs: Guia Antifraude e SaferNet'],
    ['Pág. 5', 'Combinados da família (acordo de telas) e perguntas para casa', 'CG 4, 9 e 10', '—'],
    ['Pág. 6', 'Passo a passo diante de riscos e denúncias (5 etapas)', 'CG 10', '—'],
    ['Pág. 7', 'Canais oficiais de apoio e denúncia: Disque 100, SaferNet, ANPD, Secom', 'CG 10', '4 QRs: 1 QR Code para cada canal'],
    ['Pág. 8', 'Plano de uso no contexto escolar, créditos e ficha técnica', '—', '—']
  ];

  let curY = ty;
  for (let r = 0; r < rows.length; r++) {
    const rh = r === 0 ? 30 : 34;
    if (r === 0) {
      s.fillRect(tx, curY, tw, rh, [0.016, 0.471, 0.341]);
    } else {
      s.fillRect(tx, curY, tw, rh, r % 2 === 1 ? [1, 1, 1] : [0.96, 0.975, 0.99]);
      s.strokeRect(tx, curY, tw, rh, [0.85, 0.88, 0.92], 0.6);
    }
    let cx = tx;
    for (let c = 0; c < 4; c++) {
      const isHeader = r === 0;
      const hasQr = c === 3 && rows[r][c].startsWith(('1', '2', '4')) || (c === 3 && rows[r][c].includes('QR'));
      const color = isHeader ? [1, 1, 1] : (hasQr && !isHeader ? [0.016, 0.471, 0.341] : [0.15, 0.2, 0.28]);
      const font = (isHeader || c === 0 || (hasQr && !isHeader)) ? 'F2' : 'F1';
      s.text(rows[r][c], cx + 8, curY + 20, 9.5, color, font);
      cx += colW[c];
    }
    curY += rh;
  }

  let yD1 = s.drawCard(40, 388, 430, 102, 'green', 'IDENTIDADE VISUAL (SEÇÃO 7.3)', 'Design Sóbrio e Acolhedor para Adultos');
  s.paragraph(
    'Predominância do verde institucional do IFMS, destaques em azul, cartões informativos com bordas coloridas e caixas tracejadas para os QR Codes, facilitando leitura no papel e no celular.',
    54, yD1 + 2, 400, 9.5, [0.2, 0.25, 0.33], 'F1', 1.35
  );

  let yD2 = s.drawCard(490, 388, 430, 102, 'blue', 'REPOSITÓRIO GITHUB DOCUMENTADO', 'Código, Cartilha PDF e Roteiros no GitHub');
  s.paragraph(
    'Todo o ciclo de desenvolvimento, os arquivos PDF, os 7 QR Codes em PNG e o código-fonte em Node.js estão disponíveis em: github.com/skyzinha-chan/guia-de-bolso-eca-digital-bncc',
    504, yD2 + 2, 400, 9.5, [0.2, 0.25, 0.33], 'F2', 1.35
  );

  slides.push(s);
}

// ==========================================
// SLIDE 7: DEMONSTRAÇÃO DO CONTEÚDO PRÁTICO
// ==========================================
{
  const s = new SlideCanvas(
    7, TOTAL,
    '6. DEMONSTRAÇÃO DO PRODUTO — ORIENTAÇÕES PRÁTICAS (PÁGS. 4, 5 E 6)',
    'Exemplos do cotidiano, quadro de combinados familiares e protocolo de ação rápida diante de riscos',
    'DEMONSTRAÇÃO DA CARTILHA (1,5 MIN)',
    'Fala sugerida: João Carlos'
  );

  let yL = s.drawCard(40, 68, 430, 215, 'green', 'PÁGINA 4 • DICAS DE SEGURANÇA E PROTEÇÃO', 'Privacidade e Verificação Anti-Phishing');
  s.bulletList([
    { bold: 'O que NÃO compartilhar:', text: 'Fotos do uniforme escolar, fachada da casa ou locais de rotina; documentos (CPF/RG), senhas e dados bancários; localização em tempo real em redes públicas.' },
    { bold: 'Checklist antes de clicar em links (Phishing):', text: '(1) A fonte é conhecida e confiável? (2) O título promete prêmios exagerados? (3) Pede envio urgente para vários contatos?' }
  ], 54, yL + 6, 400, 9.6, [0.2, 0.25, 0.33], [0.016, 0.47, 0.34], 6);

  let yR = s.drawCard(490, 68, 430, 215, 'blue', 'PÁGINA 5 • COMBINADOS E DIÁLOGO EM CASA', 'Acordo Familiar de Telas e Roda de Conversa');
  s.bulletList([
    { bold: 'Modelo de Acordo Familiar:', text: 'Horários sem tela (refeições e até 1h antes de dormir); uso em áreas comuns da casa; perfis sempre privados/restritos; avisar os pais ao menor desconforto.' },
    { bold: 'Perguntas para Iniciar Conversa:', text: '“Quais jogos/apps você mais gosta hoje?”, “Alguém desconhecido já puxou assunto?”, “Sabe a quem recorrer se receber mensagem ameaçadora?”' }
  ], 504, yR + 6, 400, 9.6, [0.2, 0.25, 0.33], [0.008, 0.518, 0.780], 6);

  let yB = s.drawCard(40, 298, W - 80, 192, 'rose', 'PÁGINA 6 • PASSO A PASSO DIANTE DE RISCOS E DENÚNCIAS (COMPETÊNCIA 10 BNCC)', 'Protocolo de Ação Rápida para Ciberbullying, Assédio, Aliciamento, Vazamentos ou Golpes');

  const steps = [
    { n: '1. Acolher', d: 'Manter a calma e escutar o estudante sem julgá-lo nem culpá-lo.' },
    { n: '2. Guardar Provas', d: 'Tirar prints, salvar URLs, datas, horários e perfis sem apagar conversas.' },
    { n: '3. Bloquear no App', d: 'Usar as ferramentas nativas da rede social ou jogo para denunciar.' },
    { n: '4. Escola e Conselho', d: 'Comunicar a coordenação pedagógica e acionar o Conselho Tutelar.' },
    { n: '5. Canais Oficiais', d: 'Denunciar na SaferNet ou Disque 100 (e B.O. na Polícia Civil em crimes graves).' }
  ];
  steps.forEach((st, i) => {
    const sx = 54 + i * 172;
    const sy = yB + 8;
    s.fillRect(sx, sy, 162, 104, [1, 1, 1]);
    s.strokeRect(sx, sy, 162, 104, [0.99, 0.75, 0.78], 1);
    s.text(st.n, sx + 10, sy + 20, 10.5, [0.882, 0.114, 0.282], 'F2');
    s.paragraph(st.d, sx + 10, sy + 38, 142, 9.2, [0.2, 0.25, 0.33], 'F1', 1.32);
  });

  slides.push(s);
}

// ==========================================
// SLIDE 8: OS 7 QR CODES (FALA DA TALITA)
// ==========================================
{
  const s = new SlideCanvas(
    8, TOTAL,
    '7. OS 7 QR CODES DA CARTILHA — PONTE PARA CANAIS OFICIAIS',
    'Curadoria de Fontes Governamentais, Geração Automatizada em Node.js e Injeção Vetorial + Clicável no PDF',
    'DEMONSTRAÇÃO DOS QR CODES • TALITA (2,5 MIN)',
    'Apresentadora: Talita'
  );

  // 7 QR Code Cards across the top
  const qw = 116, qh = 205, qGap = 11.3;
  qrData.forEach((q, idx) => {
    const qx = 40 + idx * (qw + qGap);
    const qy = 68;
    s.fillRect(qx, qy, qw, qh, [0.973, 0.980, 0.988]);
    s.strokeRect(qx, qy, qw, qh, [0.58, 0.64, 0.72], 1, true);
    // Page badge
    s.fillRect(qx + 12, qy + 8, qw - 24, 15, [0.878, 0.949, 0.996]);
    s.text(q.pg, qx + 22, qy + 18.5, 8, [0.012, 0.412, 0.631], 'F2');
    // Vector QR
    s.drawQR(q.modules, qx + 13, qy + 28, 90, q.url);
    // Label and Desc
    s.paragraph(q.label, qx + 6, qy + 132, qw - 12, 9.2, [0.059, 0.090, 0.165], 'F2', 1.2);
    s.paragraph(q.desc, qx + 6, qy + 158, qw - 12, 8.2, [0.35, 0.42, 0.50], 'F1', 1.25);
  });

  // 3 Explanation Cards at the bottom for Talita's presentation
  let y1 = s.drawCard(40, 290, 280, 200, 'green', '1. PAPEL PEDAGÓGICO DOS QR CODES', 'Ponte entre Guia Curto e Fontes Oficiais');
  s.bulletList([
    'Mantém o Guia de Bolso enxuto (8 páginas) e acolhedor para famílias leigas;',
    'Evita excesso de texto jurídico, levando direto ao canal de aprofundamento ou denúncia;',
    'Conecta a leitura física ao ecossistema digital seguro (Competências 5 e 10 da BNCC).'
  ], 54, y1 + 4, 252, 9.2, [0.2, 0.25, 0.33], [0.016, 0.47, 0.34], 4);

  let y2 = s.drawCard(340, 290, 280, 200, 'blue', '2. SOLUÇÃO TÉCNICA DESENVOLVIDA', 'Geração em Node.js + PDF Vetorial Clicável');
  s.bulletList([
    'Script próprio (generate_qrcodes_and_pdf.js) em Node.js sem dependências externas;',
    'Exporta os 7 PNGs em alta resolução e injeta os QR Codes vetorialmente no PDF;',
    'Adiciona links clicáveis (/URI): funciona tanto escaneando no papel quanto tocando na tela pelo WhatsApp.'
  ], 354, y2 + 4, 252, 9.2, [0.2, 0.25, 0.33], [0.008, 0.518, 0.780], 4);

  let y3 = s.drawCard(640, 290, 280, 200, 'amber', '3. CURADORIA E MANUTENÇÃO', 'Confiabilidade e Revisão Periódica');
  s.bulletList([
    'Seleção exclusiva de canais institucionais oficiais (gov.br, MJSP, MDHC, ANPD, Secom, UFMA e SaferNet);',
    'Conferência prática de leitura em dispositivos móveis;',
    'Alerta importante no relatório: links externos podem mudar e devem ser revisados periodicamente pela escola.'
  ], 654, y3 + 4, 252, 9.2, [0.2, 0.25, 0.33], [0.851, 0.467, 0.024], 4);

  slides.push(s);
}

// ==========================================
// SLIDE 9: APLICAÇÃO PRÁTICA E VALIDAÇÃO
// ==========================================
{
  const s = new SlideCanvas(
    9, TOTAL,
    '8. APLICAÇÃO PRÁTICA NA ESCOLA E PLANO DE VALIDAÇÃO',
    'Como a escola utilizaria o Guia de Bolso (Seção 7.4) e proposta de leitura assistida (Seção 7.5)',
    'APLICAÇÃO E VALIDAÇÃO (3 MIN)',
    'Fala sugerida: Adriano'
  );

  let yL = s.drawCard(40, 68, 430, 422, 'green', 'SEÇÃO 7.4 • PROPOSTA DE USO NA ESCOLA', '5 Momentos de Integração Escolar');
  s.paragraph(
    'O Guia de Bolso foi planejado para ser utilizado pela escola como ferramenta contínua de mediação pedagógica:',
    54, yL + 2, 400, 9.8, [0.2, 0.25, 0.33], 'F1', 1.35
  );
  s.bulletList([
    { bold: '1. Reunião de Pais e Mestres:', text: 'Entrega da cartilha impressa com apresentação de 10 minutos pela coordenação pedagógica.' },
    { bold: '2. Grupos de Comunicação da Turma:', text: 'Envio do PDF interativo no WhatsApp das turmas com mensagem de boas-vindas.' },
    { bold: '3. Semana da Cultura Digital:', text: 'Distribuição articulada com murais, cartazes e vídeos informativos produzidos pelos estudantes.' },
    { bold: '4. Formação de Professores:', text: 'Material de apoio nas reuniões pedagógicas para alinhamento sobre o ECA Digital.' },
    { bold: '5. Rodas de Conversa em Sala:', text: 'Uso da seção “Conversa em casa” (Pág. 5) pelo professor como roteiro de debate com os alunos.' }
  ], 54, yL + 38, 400, 9.6, [0.2, 0.25, 0.33], [0.016, 0.47, 0.34], 7);

  let yR = s.drawCard(490, 68, 430, 422, 'blue', 'SEÇÃO 7.5 • VALIDAÇÃO DO PRODUTO', 'Situação Atual e Plano de Leitura Assistida');
  s.paragraph(
    'Situação Atual: Em razão do prazo da disciplina, a verificação concentrou-se na revisão interna pela equipe (conteúdo, linguagem, diagramação e teste dos 7 QR Codes). As afirmações sobre clareza e utilidade constituem hipóteses de projeto a serem validadas em campo.',
    504, yR + 2, 400, 9.6, [0.15, 0.2, 0.28], 'F1', 1.35
  );
  s.text('Ciclo de Validação Proposto (Leitura Assistida com 3 a 5 pais/professores):', 504, yR + 68, 10, [0.008, 0.518, 0.780], 'F2');
  s.bulletList([
    { bold: 'Etapa 1 — Leitura Livre:', text: 'Apresentar a cartilha impressa ou em PDF no celular e deixar o participante lê-la livremente.' },
    { bold: 'Etapa 2 — Roteiro de Perguntas:', text: 'Avaliar: (a) O texto é fácil de entender? (b) Você saberia o que fazer numa situação de risco após ler? (c) Os QR Codes abriram corretamente? (d) O que você mudaria?' },
    { bold: 'Etapa 3 — Síntese e Ajuste:', text: 'Registrar respostas, sintetizar pontos recorrentes e refinar a cartilha.' },
    { bold: 'Etapa 4 — Escala Real:', text: 'Repetir o ciclo de aplicação em uma reunião real com famílias na escola.' }
  ], 504, yR + 88, 400, 9.5, [0.2, 0.25, 0.33], [0.008, 0.518, 0.780], 6);

  slides.push(s);
}

// ==========================================
// SLIDE 10: CONCLUSÕES E PRÓXIMOS PASSOS
// ==========================================
{
  const s = new SlideCanvas(
    10, TOTAL,
    '9. DIFICULDADES, LIMITAÇÕES, CONCLUSÕES E PRÓXIMOS PASSOS',
    'Balanço crítico do desenvolvimento, contribuições para a Licenciatura em Computação e referências (Seções 8 a 10)',
    'CONCLUSÃO E PERGUNTAS (2 MIN)',
    'Fala sugerida: Denner / Equipe'
  );

  let y1 = s.drawCard(40, 68, 280, 290, 'amber', 'SEÇÕES 8.1 E 9 • DESAFIOS', 'Dificuldades e Limitações');
  s.bulletList([
    { bold: 'Síntese Jurídica:', text: 'Traduzir o vocabulário técnico do ECA Digital para apenas 8 páginas sem perder a precisão legal.' },
    { bold: 'Curadoria de Links:', text: 'Selecionar apenas fontes oficiais confiáveis e ativas (que exigem conferência periódica).' },
    { bold: 'Prazo para Campo:', text: 'Impossibilidade de aplicar leitura assistida com famílias reais dentro do cronograma.' },
    { bold: 'Detalhamento BNCC:', text: 'Necessidade de conferir códigos exatos de habilidades específicas por componente.' }
  ], 54, y1 + 4, 252, 9.2, [0.2, 0.25, 0.33], [0.851, 0.467, 0.024], 5);

  let y2 = s.drawCard(340, 68, 280, 290, 'green', 'SEÇÃO 10 • SÍNTESE FINAL', 'Conclusões do Trabalho');
  s.bulletList([
    { bold: 'Objetivo Cumprido:', text: 'O Guia de Bolso traduz o ECA Digital em orientações práticas conectadas à Competência Geral 5 e às competências 4, 9 e 10 da BNCC.' },
    { bold: 'Acesso Facilitado:', text: 'Os 7 QR Codes servem como porta de entrada direta para canais oficiais e de denúncia.' },
    { bold: 'Papel do Licenciado:', text: 'Demonstra como o professor de Computação atua como mediador entre tecnologia, legislação e família.' }
  ], 354, y2 + 4, 252, 9.2, [0.2, 0.25, 0.33], [0.016, 0.47, 0.34], 5);

  let y3 = s.drawCard(640, 68, 280, 290, 'blue', 'CONTINUIDADE DO PROJETO', 'Próximos Passos');
  s.bulletList([
    { bold: '1. Leitura Assistida:', text: 'Aplicar o roteiro da Seção 7.5 com 3 a 5 responsáveis e professores.' },
    { bold: '2. Reuniões Reais:', text: 'Distribuir a cartilha em reuniões de pais e coletar devolutivas em maior escala.' },
    { bold: '3. Habilidades BNCC:', text: 'Incluir códigos de habilidades por página (Língua Portuguesa, Ciências Humanas e Computação).' },
    { bold: '4. Expansão Escolar:', text: 'Produzir cartazes e vídeos para a Semana da Cultura Digital.' }
  ], 654, y3 + 4, 252, 9.2, [0.2, 0.25, 0.33], [0.008, 0.518, 0.780], 5);

  // Dark Banner Footer
  s.drawCard(40, 374, W - 80, 116, 'dark', 'REFERÊNCIAS OFICIAIS UTILIZADAS & ENCERRAMENTO', 'Obrigado pela atenção! Estamos abertos a perguntas.');
  s.paragraph(
    'Referências: BRASIL (Lei nº 15.211/2025 — ECA Digital) • MEC (Base Nacional Comum Curricular — BNCC) • Ministério da Justiça e Segurança Pública (gov.br/mj) • ANPD (gov.br/anpd) • Secom/Gov.br (Guia de Uso de Telas) • CETIC.br (Pesquisa TIC Kids Online Brasil) • SaferNet Brasil (new.safernet.org.br) • UFMA (Cartilha de Proteção contra Phishing e Fraudes).',
    54, 452, W - 110, 8.8, [0.80, 0.84, 0.90], 'F1', 1.32
  );

  slides.push(s);
}

// ==========================================
// BUILD PDF FILE
// ==========================================
const objects = [];
function addObj(id, bodyBuf) {
  objects.push({ id, bodyBuf: Buffer.isBuffer(bodyBuf) ? bodyBuf : Buffer.from(bodyBuf, 'latin1') });
}

// 1: Catalog, 2: Pages, 3: F1 (Helvetica), 4: F2 (Helvetica-Bold), 5: F3 (Helvetica-Oblique)
addObj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
addObj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
addObj(5, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>');

let nextId = 6;
const pageIds = [];

for (const sl of slides) {
  const pageId = nextId++;
  const streamId = nextId++;
  pageIds.push(pageId);

  const annotIds = [];
  for (const lnk of sl.links) {
    const aid = nextId++;
    annotIds.push(aid);
    const [llx, lly, urx, ury] = lnk.rect.map(n => n.toFixed(2));
    addObj(aid, `<< /Type /Annot /Subtype /Link /Rect [${llx} ${lly} ${urx} ${ury}] /Border [0 0 0] /A << /Type /Action /S /URI /URI (${lnk.url}) >> >>`);
  }

  const streamContent = sl.ops.join('\n');
  const comp = zlib.deflateSync(Buffer.from(streamContent, 'latin1'), { level: 9 });
  const streamObjBuf = Buffer.concat([
    Buffer.from(`<< /Filter /FlateDecode /Length ${comp.length} >>\nstream\n`, 'latin1'),
    comp,
    Buffer.from('\nendstream', 'latin1')
  ]);
  addObj(streamId, streamObjBuf);

  const annotsStr = annotIds.length ? `/Annots [${annotIds.map(a => `${a} 0 R`).join(' ')}]` : '';
  addObj(
    pageId,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${streamId} 0 R ${annotsStr} >>`
  );
}

addObj(1, '<< /Type /Catalog /Pages 2 0 R >>');
addObj(2, `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map(p => `${p} 0 R`).join(' ')}] >>`);

objects.sort((a, b) => a.id - b.id);

const parts = [];
let offset = 0;
function push(buf) {
  parts.push(buf);
  offset += buf.length;
}

push(Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'latin1'));
const offsets = {};
for (const o of objects) {
  offsets[o.id] = offset;
  push(Buffer.from(`${o.id} 0 obj\n`, 'latin1'));
  push(o.bodyBuf);
  push(Buffer.from('\nendobj\n', 'latin1'));
}

const maxId = objects[objects.length - 1].id;
const xrefStart = offset;
const xrefLines = [`xref\n0 ${maxId + 1}\n0000000000 65535 f \n`];
for (let i = 1; i <= maxId; i++) {
  xrefLines.push(String(offsets[i] || 0).padStart(10, '0') + ' 00000 n \n');
}
xrefLines.push(`trailer\n<< /Size ${maxId + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);
push(Buffer.from(xrefLines.join(''), 'latin1'));

const outPdfPath = path.join(rootDir, 'Apresentacao_Guia_de_Bolso_Slides.pdf');
fs.writeFileSync(outPdfPath, Buffer.concat(parts));
console.log('[PDF] Apresentacao_Guia_de_Bolso_Slides.pdf gerado com sucesso:', outPdfPath);
