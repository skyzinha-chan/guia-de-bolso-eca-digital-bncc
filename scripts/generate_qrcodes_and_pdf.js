/**
 * Script de Geração dos QR Codes e Atualização Vetorial da Cartilha PDF
 * Projeto: Guia de Bolso — Cultura Digital com Direitos (ECA Digital + BNCC)
 * Disciplina: Tópicos Especiais II — Licenciatura em Computação (IFMS Câmpus Jardim)
 * Responsável pelos QR Codes: Talita Mendonça Marques
 *
 * O que este script faz:
 * 1. Gera 7 matrizes QR Code (nível de correção M) para os canais oficiais da cartilha.
 * 2. Exporta cada QR Code como imagem PNG de alta resolução na pasta `qrcodes/`.
 * 3. Abre o PDF original da cartilha (`docs/Cartilha_Original_Template.pdf`), localiza
 *    os 7 placeholders nas páginas 1, 4 e 7, substitui-os por gráficos vetoriais
 *    nítidos diretamente nos fluxos de conteúdo PDF e adiciona anotações clicáveis (/Link).
 * 4. Salva o PDF final em `Guia_de_Bolso_Cultura_Digital_com_Direitos_QRCodes.pdf`.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const rootDir = path.resolve(__dirname, '..');
const qrVendorDir = path.join(__dirname, 'vendor', 'QRCode');
const QRCode = require(path.join(qrVendorDir, 'index.js'));
const QRErrorCorrectLevel = require(path.join(qrVendorDir, 'QRErrorCorrectLevel.js'));

const qrOutDir = path.join(rootDir, 'qrcodes');
if (!fs.existsSync(qrOutDir)) {
  fs.mkdirSync(qrOutDir, { recursive: true });
}

// Mapeamento dos 7 QR Codes da Cartilha
const qrItems = [
  {
    id: '01_p1_eca_digital',
    page: 1,
    pageObjId: 2,
    streamObjId: 23,
    ty: 0,
    matchIndex: 0,
    title: 'Página 1 — ECA Digital (Versão Digital / Página Oficial MJSP)',
    label: 'ECA DIGITAL',
    url: 'https://www.gov.br/mj/pt-br/assuntos/sua-protecao/sedigi/eca-digital/eca-digital-1'
  },
  {
    id: '02_p4_guia_antifraude',
    page: 4,
    pageObjId: 36,
    streamObjId: 41,
    ty: -10537.5,
    matchIndex: 0,
    title: 'Página 4 — Guia Antifraude (Proteção contra Phishing - UFMA)',
    label: 'Guia Antifraude',
    url: 'https://portalpadrao.ufma.br/sti/seh/temas/protecao-contra-phishing-e-fraudes'
  },
  {
    id: '03_p4_safernet_ciberbullying',
    page: 4,
    pageObjId: 36,
    streamObjId: 41,
    ty: -10537.5,
    matchIndex: 1,
    title: 'Página 4 — SaferNet Brasil (Prevenção ao Ciberbullying)',
    label: 'SaferNet Brasil',
    url: 'https://new.safernet.org.br/'
  },
  {
    id: '04_p7_disque_100',
    page: 7,
    pageObjId: 52,
    streamObjId: 61,
    ty: -21075,
    matchIndex: 0,
    title: 'Página 7 — Disque 100 Online (Direitos Humanos - MDHC)',
    label: 'Disque 100 Online',
    url: 'https://www.gov.br/mdh/pt-br/ondh'
  },
  {
    id: '05_p7_safernet_denuncia',
    page: 7,
    pageObjId: 52,
    streamObjId: 61,
    ty: -21075,
    matchIndex: 1,
    title: 'Página 7 — SaferNet Brasil (Canal de Denúncia e Helpline)',
    label: 'safernet.org.br',
    url: 'https://new.safernet.org.br/denuncie'
  },
  {
    id: '06_p7_anpd',
    page: 7,
    pageObjId: 52,
    streamObjId: 61,
    ty: -21075,
    matchIndex: 2,
    title: 'Página 7 — ANPD (Autoridade Nacional de Proteção de Dados)',
    label: 'gov.br/anpd',
    url: 'https://www.gov.br/anpd/pt-br'
  },
  {
    id: '07_p7_secom_guia_telas',
    page: 7,
    pageObjId: 52,
    streamObjId: 61,
    ty: -21075,
    matchIndex: 3,
    title: 'Página 7 — Guia de Uso de Telas (Secom / Governo Federal)',
    label: 'Guia de Telas',
    url: 'https://www.gov.br/secom/pt-br/assuntos/uso-de-telas-por-criancas-e-adolescentes/guia/capitulos/conhecendo-os-riscos'
  }
];

function createQRMatrix(text) {
  const qr = new QRCode(-1, QRErrorCorrectLevel.M);
  qr.addData(text);
  qr.make();
  return qr.modules;
}

// Codificador PNG nativo usando zlib
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function matrixToPng(modules, scale = 16, margin = 3) {
  const count = modules.length;
  const size = (count + margin * 2) * scale;
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8-bit grayscale
  ihdr[9] = 0;

  const rowLen = size + 1;
  const raw = Buffer.alloc(rowLen * size, 255);
  for (let y = 0; y < size; y++) {
    const rowStart = y * rowLen;
    raw[rowStart] = 0;
    const my = Math.floor(y / scale) - margin;
    if (my >= 0 && my < count) {
      for (let mx = 0; mx < count; mx++) {
        if (modules[my][mx]) {
          const pxStart = rowStart + 1 + (mx + margin) * scale;
          raw.fill(15, pxStart, pxStart + scale);
        }
      }
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// 1. Gerar os 7 arquivos PNG
for (const item of qrItems) {
  const modules = createQRMatrix(item.url);
  item.modules = modules;
  const pngBuf = matrixToPng(modules, 16, 3);
  const outPath = path.join(qrOutDir, `${item.id}.png`);
  fs.writeFileSync(outPath, pngBuf);
  console.log(`[PNG] Gerado: qrcodes/${item.id}.png (${modules.length}x${modules.length} módulos)`);
}

// 2. Atualizar o PDF da Cartilha
const pdfInPath = path.join(rootDir, 'docs', 'Cartilha_Original_Template.pdf');
const pdfBuf = fs.readFileSync(pdfInPath);
const pdfStr = pdfBuf.toString('latin1');

function getStreamBytes(cid) {
  const cRe = new RegExp('(?:^|\\n)' + cid + ' 0 obj\\s*<<[\\s\\S]*?>>\\s*stream\\r?\\n');
  const m = cRe.exec(pdfStr);
  const start = m.index + m[0].length;
  const end = pdfStr.indexOf('endstream', start);
  let slice = pdfBuf.subarray(start, end);
  if (slice[slice.length - 1] === 0x0a) {
    if (slice[slice.length - 2] === 0x0d) slice = slice.subarray(0, slice.length - 2);
    else slice = slice.subarray(0, slice.length - 1);
  }
  return zlib.inflateSync(slice).toString('latin1');
}

function matrixToPdfOps(modules, x0, y0, boxSize) {
  const count = modules.length;
  const margin = 2;
  const total = count + margin * 2;
  const cell = boxSize / total;
  const ops = [];
  ops.push('1 1 1 RG 1 1 1 rg');
  ops.push('/G3 gs');
  ops.push(`${x0.toFixed(3)} ${y0.toFixed(3)} ${boxSize.toFixed(3)} ${boxSize.toFixed(3)} re f`);
  ops.push('.0588 .0902 .1647 RG .0588 .0902 .1647 rg');
  for (let r = 0; r < count; r++) {
    let c = 0;
    while (c < count) {
      if (modules[r][c]) {
        let cEnd = c + 1;
        while (cEnd < count && modules[r][cEnd]) cEnd++;
        const rx = x0 + (c + margin) * cell;
        const ry = y0 + (r + margin) * cell;
        const rw = (cEnd - c) * cell;
        const rh = cell;
        ops.push(`${rx.toFixed(3)} ${ry.toFixed(3)} ${(rw + 0.02).toFixed(3)} ${(rh + 0.02).toFixed(3)} re`);
        c = cEnd;
      } else {
        c++;
      }
    }
  }
  ops.push('f');
  return ops.join('\n');
}

const updatedStreams = {};

for (const streamObjId of [23, 41, 61]) {
  let dec = getStreamBytes(streamObjId);
  const itemsForStream = qrItems.filter(it => it.streamObjId === streamObjId);
  const qrRe = /\.0588 \.0902 \.1647 RG \.0588 \.0902 \.1647 rg\r?\n\/G3 gs\r?\n(\d+) (\d+) m[\s\S]*?<34> Tj[\s\S]*?<28> Tj\r?\nET/g;
  let idx = 0;
  dec = dec.replace(qrRe, (fullMatch, xStr, yStr) => {
    const item = itemsForStream[idx++];
    const origX = parseFloat(xStr);
    const origYTop = parseFloat(yStr) - 46;
    const boxSize = 56;
    const x0 = origX - 3;
    const y0 = origYTop - 4;
    const llx = 0.75 * x0;
    const urx = 0.75 * (x0 + boxSize);
    const ury = 842.88 - 0.75 * y0 - 0.24 * item.ty;
    const lly = 842.88 - 0.75 * (y0 + boxSize + 18) - 0.24 * item.ty;
    item.pdfRect = [llx, lly, urx, ury];
    return matrixToPdfOps(item.modules, x0, y0, boxSize);
  });
  updatedStreams[streamObjId] = zlib.deflateSync(Buffer.from(dec, 'latin1'), { level: 9 });
}

const objRegex = /(\d+) 0 obj\r?\n/g;
const objPositions = [];
let m;
while ((m = objRegex.exec(pdfStr)) !== null) {
  if (m.index === 0 || pdfStr[m.index - 1] === '\n' || pdfStr[m.index - 1] === '\r') {
    objPositions.push({ id: parseInt(m[1], 10), start: m.index });
  }
}

const origMaxId = Math.max(...objPositions.map(o => o.id));
let nextAnnotObjId = origMaxId + 1;
const pageAnnots = {};
for (const item of qrItems) {
  item.annotObjId = nextAnnotObjId++;
  if (!pageAnnots[item.pageObjId]) pageAnnots[item.pageObjId] = [];
  pageAnnots[item.pageObjId].push(item.annotObjId);
}

const newPdfParts = [];
let currentOffset = 0;
function pushBuf(b) {
  newPdfParts.push(b);
  currentOffset += b.length;
}

pushBuf(pdfBuf.subarray(0, objPositions[0].start));

const newOffsets = {};
for (let i = 0; i < objPositions.length; i++) {
  const { id, start } = objPositions[i];
  const endObjIdx = pdfStr.indexOf('endobj', start);
  let nextStart = endObjIdx + 6;
  if (pdfStr[nextStart] === '\r') nextStart++;
  if (pdfStr[nextStart] === '\n') nextStart++;

  newOffsets[id] = currentOffset;

  if (updatedStreams[id]) {
    const newComp = updatedStreams[id];
    const objBuf = Buffer.concat([
      Buffer.from(`${id} 0 obj\n<</Filter /FlateDecode /Length ${newComp.length}>>\nstream\n`, 'latin1'),
      newComp,
      Buffer.from(`\nendstream\nendobj\n`, 'latin1')
    ]);
    pushBuf(objBuf);
  } else if (pageAnnots[id]) {
    let pageObjStr = pdfBuf.subarray(start, nextStart).toString('latin1');
    const annotsArr = pageAnnots[id].map(aid => `${aid} 0 R`).join(' ');
    pageObjStr = pageObjStr.replace('/Parent 69 0 R>>', `/Annots [${annotsArr}]\n/Parent 69 0 R>>`);
    pushBuf(Buffer.from(pageObjStr, 'latin1'));
  } else {
    pushBuf(pdfBuf.subarray(start, nextStart));
  }
}

for (const item of qrItems) {
  const id = item.annotObjId;
  newOffsets[id] = currentOffset;
  const [llx, lly, urx, ury] = item.pdfRect.map(n => n.toFixed(2));
  const annotStr = `${id} 0 obj\n<</Type /Annot /Subtype /Link /Rect [${llx} ${lly} ${urx} ${ury}] /Border [0 0 0] /A <</Type /Action /S /URI /URI (${item.url})>>>>\nendobj\n`;
  pushBuf(Buffer.from(annotStr, 'latin1'));
}

const maxId = Math.max(...Object.keys(newOffsets).map(Number));
const xrefOffset = currentOffset;
const xrefLines = [`xref\n0 ${maxId + 1}\n0000000000 65535 f \n`];
for (let id = 1; id <= maxId; id++) {
  const off = newOffsets[id] || 0;
  xrefLines.push(String(off).padStart(10, '0') + ' 00000 n \n');
}
const trailerMatch = pdfStr.match(/trailer\s*(<<[\s\S]*?>>)/);
let trailerDict = trailerMatch ? trailerMatch[1] : `<</Size ${maxId + 1} /Root 68 0 R /Info 1 0 R>>`;
trailerDict = trailerDict.replace(/\/Size \d+/, `/Size ${maxId + 1}`);
xrefLines.push(`trailer\n${trailerDict}\nstartxref\n${xrefOffset}\n%%EOF\n`);
pushBuf(Buffer.from(xrefLines.join(''), 'latin1'));

const outPdfPath = path.join(rootDir, 'Guia_de_Bolso_Cultura_Digital_com_Direitos_QRCodes.pdf');
fs.writeFileSync(outPdfPath, Buffer.concat(newPdfParts));
console.log(`[PDF] Cartilha atualizada salva em: Guia_de_Bolso_Cultura_Digital_com_Direitos_QRCodes.pdf`);
