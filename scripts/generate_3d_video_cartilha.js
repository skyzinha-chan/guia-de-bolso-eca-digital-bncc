/**
 * Gerador da Animação 3D Estilo Vídeo Curto da Cartilha (Guia de Bolso)
 * Arquivo gerado: `Video_Animacao_Cartilha_3D.html`
 *
 * Roteiro visual da animação (30 segundos + modo interativo):
 * - Cena 1 (0s - 4s): Mãe/Pai segurando a cartilha fechada em ambiente familiar acolhedor.
 * - Cena 2 (4s - 7.5s): Close-up cinematográfico na Capa (Página 1 idêntica ao PDF + QR Code ECA Digital).
 * - Cena 3 (7.5s - 13s): Cartilha abre/desdobra em 3D mostrando Páginas 2 (ECA Digital) e 3 (BNCC).
 * - Cena 4 (13s - 19s): Folheia em 3D para Páginas 4 (Dicas + 2 QR Codes) e 5 (Combinados da Família).
 * - Cena 5 (19s - 25.5s): Folheia em 3D para Páginas 6 (Passo a Passo) e 7 (Canais Oficiais + 4 QR Codes com zoom).
 * - Cena 6 (25.5s - 30s): Mostra a Página 8 (Plano de Uso na Escola e Créditos IFMS) e visão geral.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const qrDir = path.join(rootDir, 'qrcodes');

function getQrDataUri(filename) {
  const p = path.join(qrDir, filename);
  return `data:image/png;base64,${fs.readFileSync(p).toString('base64')}`;
}

const qr = {
  p1_eca: getQrDataUri('01_p1_eca_digital.png'),
  p4_antifraude: getQrDataUri('02_p4_guia_antifraude.png'),
  p4_safernet: getQrDataUri('03_p4_safernet_ciberbullying.png'),
  p7_disque100: getQrDataUri('04_p7_disque_100.png'),
  p7_safernet: getQrDataUri('05_p7_safernet_denuncia.png'),
  p7_anpd: getQrDataUri('06_p7_anpd.png'),
  p7_secom: getQrDataUri('07_p7_secom_guia_telas.png')
};

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vídeo Animação 3D — Guia de Bolso: Cultura Digital com Direitos</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
    }
    body {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #090d16;
      color: #1e293b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    /* Warm Living Room Bokeh Background */
    .stage {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 1800px;
      background:
        radial-gradient(circle at 20% 25%, rgba(251, 191, 36, 0.22) 0%, transparent 40%),
        radial-gradient(circle at 80% 30%, rgba(16, 185, 129, 0.20) 0%, transparent 45%),
        radial-gradient(circle at 50% 80%, rgba(217, 119, 6, 0.18) 0%, transparent 50%),
        linear-gradient(180deg, #1e293b 0%, #0f172a 55%, #1c1917 100%);
    }

    /* Ambient floating bokeh lights */
    .bokeh {
      position: absolute;
      border-radius: 50%;
      filter: blur(18px);
      opacity: 0.45;
      pointer-events: none;
      animation: floatBokeh 8s ease-in-out infinite alternate;
    }
    .b1 { width: 180px; height: 180px; background: #fbbf24; top: 10%; left: 15%; }
    .b2 { width: 220px; height: 220px; background: #34d399; top: 18%; right: 14%; animation-delay: -2s; }
    .b3 { width: 140px; height: 140px; background: #f59e0b; bottom: 20%; left: 22%; animation-delay: -4s; }
    .b4 { width: 160px; height: 160px; background: #38bdf8; bottom: 18%; right: 20%; animation-delay: -1s; }

    @keyframes floatBokeh {
      0% { transform: translateY(0px) scale(1); }
      100% { transform: translateY(-22px) scale(1.08); }
    }

    /* Cozy wooden table / living room surface */
    .table-surface {
      position: absolute;
      bottom: -15vh;
      width: 140vw;
      height: 52vh;
      background: linear-gradient(180deg, rgba(68, 44, 28, 0.55) 0%, rgba(28, 19, 13, 0.92) 100%);
      transform: rotateX(65deg);
      border-top: 2px solid rgba(251, 191, 36, 0.2);
      box-shadow: 0 -30px 80px rgba(0,0,0,0.7);
      pointer-events: none;
    }

    /* Camera Rig that zooms, pans, and tilts */
    .camera-rig {
      position: relative;
      transform-style: preserve-3d;
      transition: transform 1.6s cubic-bezier(0.22, 1, 0.36, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Parent's Hands SVG Container holding the booklet */
    .hands-layer {
      position: absolute;
      width: 980px;
      height: 760px;
      pointer-events: none;
      z-index: 30;
      transition: all 1.5s cubic-bezier(0.22, 1, 0.36, 1);
      transform: translateZ(25px);
    }
    .hand-left, .hand-right {
      position: absolute;
      bottom: -35px;
      transition: transform 1.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 1.4s ease;
      filter: drop-shadow(0 18px 28px rgba(0,0,0,0.55));
    }
    .hand-left {
      left: 165px;
      transform-origin: bottom left;
    }
    .hand-right {
      right: 165px;
      transform-origin: bottom right;
    }

    /* When booklet opens wide, hands move outward and support the open folder */
    .stage.state-open .hand-left {
      transform: translate3d(-210px, 45px, 0) rotate(-8deg);
      opacity: 0.88;
    }
    .stage.state-open .hand-right {
      transform: translate3d(210px, 45px, 0) rotate(8deg);
      opacity: 0.88;
    }
    .stage.state-zoom-qr .hand-left,
    .stage.state-zoom-qr .hand-right {
      opacity: 0.25;
      transform: translate3d(0, 140px, 0);
    }

    /* ==========================================
       3D BOOKLET / FOLDER ENGINE
       Each page is 420px wide x 594px high (A4/A5 ratio 1 : 1.414)
       ========================================== */
    .book {
      position: relative;
      width: 420px;
      height: 594px;
      transform-style: preserve-3d;
      transition: transform 1.5s cubic-bezier(0.22, 1, 0.36, 1);
    }
    /* When open, shift the book right by half a page (210px) so the 2-page spread (840px) is centered! */
    .book.is-open {
      transform: translateX(210px);
    }
    .book.is-back {
      transform: translateX(420px);
    }

    /* Book drop shadow */
    .book-shadow {
      position: absolute;
      top: 15px;
      left: -420px;
      width: 840px;
      height: 594px;
      background: rgba(0, 0, 0, 0.55);
      filter: blur(28px);
      transform: translateZ(-25px);
      border-radius: 16px;
      transition: all 1.5s ease;
      pointer-events: none;
    }
    .book:not(.is-open):not(.is-back) .book-shadow {
      left: 0;
      width: 420px;
    }

    /* Each physical sheet (has front and back pages) */
    .sheet {
      position: absolute;
      top: 0;
      left: 0;
      width: 420px;
      height: 594px;
      transform-origin: left center;
      transform-style: preserve-3d;
      transition: transform 1.45s cubic-bezier(0.32, 0.08, 0.24, 1);
      cursor: pointer;
    }

    .sheet.flipped {
      transform: rotateY(-180deg);
    }

    /* Z-index layering for 4 sheets */
    #sheet1 { z-index: 4; }
    #sheet2 { z-index: 3; }
    #sheet3 { z-index: 2; }
    #sheet4 { z-index: 1; }

    #sheet1.flipped { z-index: 1; }
    #sheet2.flipped { z-index: 2; }
    #sheet3.flipped { z-index: 3; }
    #sheet4.flipped { z-index: 4; }

    .page {
      position: absolute;
      inset: 0;
      width: 420px;
      height: 594px;
      background: #ffffff;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      padding: 22px 24px 18px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }

    .page-front {
      border-radius: 3px 10px 10px 3px;
      box-shadow: inset 14px 0 24px -12px rgba(0,0,0,0.18);
    }
    .page-back {
      transform: rotateY(180deg);
      border-radius: 10px 3px 3px 10px;
      box-shadow: inset -14px 0 24px -12px rgba(0,0,0,0.18);
    }

    /* Spine crease highlight */
    .page-front::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 6px;
      background: linear-gradient(90deg, rgba(0,0,0,0.18), transparent);
      pointer-events: none;
    }
    .page-back::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 6px;
      background: linear-gradient(-90deg, rgba(0,0,0,0.18), transparent);
      pointer-events: none;
    }

    /* ==========================================
       EXACT CARTILHA PAGE STYLING (Pages 1 to 8)
       ========================================== */
    .p-top-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1.5px solid #047857;
      padding-bottom: 6px;
      margin-bottom: 10px;
    }
    .p-top-header .mec {
      font-size: 9px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
    }
    .p-top-header .mec span {
      display: block;
      font-weight: 500;
      color: #475569;
      font-size: 8px;
    }
    .p-top-header .eca-tag {
      font-size: 8.5px;
      font-weight: 800;
      color: #047857;
    }

    .p-hero-green {
      background: #047857;
      color: white;
      border-radius: 8px;
      padding: 16px 16px;
      margin-bottom: 10px;
    }
    .p-hero-green .sub {
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.8px;
      color: #a7f3d0;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .p-hero-green h1 {
      font-size: 19px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .p-hero-green p {
      font-size: 9.2px;
      line-height: 1.38;
      color: #ecfdf5;
    }

    .p-sec-title {
      font-size: 13.5px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-bottom: 8px;
    }
    .p-intro {
      font-size: 9px;
      color: #334155;
      line-height: 1.38;
      margin-bottom: 9px;
    }

    .p-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 8px;
    }

    .p-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3.5px solid #047857;
      border-radius: 6px;
      padding: 8px 9px;
    }
    .p-card.blue {
      border-left-color: #0284c7;
      background: #f0f9ff;
      border-color: #bae6fd;
    }
    .p-card.amber {
      border-left-color: #d97706;
    }
    .p-card.rose {
      border-left-color: #e11d48;
      background: #fff1f2;
      border-color: #fecdd3;
    }
    .p-badge {
      display: inline-block;
      font-size: 7px;
      font-weight: 700;
      padding: 1.5px 6px;
      border-radius: 10px;
      background: #e0f2fe;
      color: #0369a1;
      margin-bottom: 4px;
    }
    .p-badge.green { background: #d1fae5; color: #065f46; }
    .p-badge.rose { background: #ffe4e6; color: #9f1239; }
    .p-badge.amber { background: #fef3c7; color: #92400e; }

    .p-card h3 {
      font-size: 9.8px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 3px;
    }
    .p-card p, .p-card li {
      font-size: 8.2px;
      color: #334155;
      line-height: 1.35;
    }
    .p-card ul, .p-card ol {
      padding-left: 13px;
    }

    .p-qr-banner {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
    .p-qr-box {
      border: 1px dashed #64748b;
      background: white;
      border-radius: 6px;
      padding: 5px;
      text-align: center;
      min-width: 72px;
    }
    .p-qr-box img {
      width: 54px;
      height: 54px;
      display: block;
      margin: 0 auto 2px auto;
    }
    .p-qr-box span {
      font-size: 6.8px;
      font-weight: 800;
      color: #0f172a;
      display: block;
    }

    .p-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #64748b;
      margin-top: auto;
    }

    /* Step list on Page 6 */
    .step-row {
      display: flex;
      align-items: flex-start;
      gap: 7px;
      margin-bottom: 6px;
    }
    .step-num {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #047857;
      color: white;
      font-size: 8px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .step-row h4 {
      font-size: 9px;
      font-weight: 800;
      color: #0f172a;
    }
    .step-row p {
      font-size: 8px;
      color: #475569;
      line-height: 1.3;
    }

    /* Table on Page 5 */
    .mini-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
      margin-top: 4px;
    }
    .mini-table th {
      background: #047857;
      color: white;
      text-align: left;
      padding: 4px 6px;
    }
    .mini-table td {
      padding: 4px 6px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    /* ==========================================
       CINEMATIC VIDEO HUD & SUBTITLES
       ========================================== */
    .top-video-badge {
      position: fixed;
      top: 18px;
      left: 24px;
      background: rgba(15, 23, 42, 0.82);
      border: 1px solid rgba(52, 211, 153, 0.4);
      color: #ecfdf5;
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 9px;
      z-index: 100;
      backdrop-filter: blur(8px);
    }
    .rec-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
      animation: pulseDot 1.2s infinite alternate;
    }
    @keyframes pulseDot {
      from { opacity: 0.4; transform: scale(0.85); }
      to { opacity: 1; transform: scale(1.15); }
    }

    .subtitle-bar {
      position: fixed;
      bottom: 76px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.88);
      border: 1px solid rgba(255,255,255,0.15);
      color: #ffffff;
      padding: 12px 26px;
      border-radius: 14px;
      font-size: 15.5px;
      font-weight: 600;
      text-align: center;
      max-width: 820px;
      width: 90%;
      z-index: 100;
      backdrop-filter: blur(10px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.45);
      transition: opacity 0.4s ease, transform 0.4s ease;
    }
    .subtitle-bar span {
      color: #34d399;
      font-weight: 800;
    }

    /* Video Player Controls Bar */
    .player-bar {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      border: 1px solid rgba(255,255,255,0.12);
      padding: 8px 16px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 100;
      backdrop-filter: blur(10px);
    }
    .player-bar button {
      background: #047857;
      color: white;
      border: none;
      padding: 6px 13px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
    }
    .player-bar button:hover {
      background: #059669;
    }
    .player-bar button.sec {
      background: #1e293b;
      border: 1px solid #334155;
    }
    .player-bar button.sec:hover {
      background: #334155;
    }
    .progress-wrap {
      width: 180px;
      height: 6px;
      background: #334155;
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #10b981, #38bdf8);
      transition: width 0.25s linear;
    }
  </style>
</head>
<body>

  <div class="top-video-badge">
    <div class="rec-dot"></div>
    <span id="sceneLabel">CENA 1/6 • Na Mão da Família (Guia de Bolso Fechado)</span>
  </div>

  <div class="stage" id="stage">
    <div class="bokeh b1"></div>
    <div class="bokeh b2"></div>
    <div class="bokeh b3"></div>
    <div class="bokeh b4"></div>
    <div class="table-surface"></div>

    <!-- CAMERA RIG -->
    <div class="camera-rig" id="cameraRig">

      <!-- 3D BOOKLET (4 sheets = 8 pages) -->
      <div class="book" id="book">
        <div class="book-shadow"></div>

        <!-- ==========================
             SHEET 1: Page 1 (Front) & Page 2 (Back)
             ========================== -->
        <div class="sheet" id="sheet1" onclick="stepForward()">
          <!-- PAGE 1: CAPA -->
          <div class="page page-front">
            <div>
              <div class="p-top-header">
                <div class="mec">MINISTÉRIO DA EDUCAÇÃO — IFMS CÂMPUS JARDIM<span>Licenciatura em Computação | Tópicos Especiais II</span></div>
                <div class="eca-tag">ECA DIGITAL + BNCC</div>
              </div>

              <div class="p-hero-green">
                <div class="sub">GUIA DE BOLSO PEDAGÓGICO</div>
                <h1>Cultura Digital com Direitos</h1>
                <p>Orientações práticas para famílias e professores sobre a proteção de crianças e adolescentes no ambiente virtual com base no ECA Digital (Lei nº 15.211/25) e na BNCC.</p>
              </div>

              <div class="p-grid-2" style="margin-bottom:12px;">
                <div class="p-card">
                  <span class="p-badge">Visão Geral</span>
                  <h3>Para que serve este guia?</h3>
                  <p>Funciona como uma porta de entrada acessível para conectar famílias, escola e estudantes no uso crítico, ético, seguro e responsável das tecnologias digitais.</p>
                </div>
                <div class="p-card blue">
                  <span class="p-badge">Público-Alvo</span>
                  <h3>Famílias &amp; Educadores</h3>
                  <p>Foco principal nos responsáveis por estudantes do Ensino Fundamental II (6º ao 9º ano) e apoio pedagógico para reuniões e rodas de conversa escolares.</p>
                </div>
              </div>

              <div class="p-qr-banner">
                <div>
                  <h3 style="font-size:10.5px;font-weight:800;color:#0f172a;margin-bottom:3px;">Acesse a Versão Digital Oficial</h3>
                  <p style="font-size:8.2px;color:#475569;line-height:1.35;">Escaneie o código ao lado para acessar o repositório oficial com materiais complementares do Ministério da Justiça e IFMS.</p>
                </div>
                <div class="p-qr-box">
                  <img src="${qr.p1_eca}" alt="QR ECA Digital" />
                  <span>ECA DIGITAL</span>
                </div>
              </div>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 1</span>
            </div>
          </div>

          <!-- PAGE 2: ECA DIGITAL EM LINGUAGEM SIMPLES -->
          <div class="page page-back">
            <div>
              <div class="p-sec-title">1. O ECA Digital em Linguagem Simples</div>
              <p class="p-intro">A Lei nº 15.211/2025 (ECA Digital) atualizou a proteção de crianças e adolescentes para a era conectada, estabelecendo deveres claros para a sociedade, o Estado, as famílias e as plataformas de tecnologia.</p>

              <div class="p-grid-2">
                <div class="p-card">
                  <h3>Responsabilidade Compartilhada</h3>
                  <p>A proteção digital não é dever exclusivo da família. Plataformas digitais, escolas, órgãos públicos e responsáveis devem atuar juntos na mitigação de riscos online.</p>
                </div>
                <div class="p-card">
                  <h3>Segurança por Padrão</h3>
                  <p>Redes e jogos devem vir pré-configurados com o mais alto nível de privacidade e proteção para contas de menores, sem exigir ajustes complexos da família.</p>
                </div>
                <div class="p-card">
                  <h3>Supervisão Parental Ativa</h3>
                  <p>Incentivo ao uso de ferramentas gratuitas de acompanhamento conjugadas com diálogo constante, superando o modelo focado apenas na vigilância.</p>
                </div>
                <div class="p-card">
                  <h3>Proteção de Dados &amp; Publicidade</h3>
                  <p>Proibição do perfilamento comportamental de crianças para fins publicitários e restrição à coleta excessiva de dados pessoais sem consentimento.</p>
                </div>
              </div>

              <div class="p-card" style="background:#ecfdf5;border-color:#a7f3d0;">
                <h3 style="color:#065f46;">Aferição de Idade Real</h3>
                <p>A simples autodeclaração de idade ("marque aqui se tem mais de 13 anos") deixa de ser suficiente. As plataformas precisam adotar métodos mais eficientes para barrar o acesso de menores a conteúdos inadequados.</p>
              </div>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 2</span>
            </div>
          </div>
        </div>

        <!-- ==========================
             SHEET 2: Page 3 (Front) & Page 4 (Back)
             ========================== -->
        <div class="sheet" id="sheet2" onclick="stepForward()">
          <!-- PAGE 3: CONEXÃO COM A BNCC -->
          <div class="page page-front">
            <div>
              <div class="p-sec-title">2. Conexão com a BNCC</div>
              <p class="p-intro">A Base Nacional Comum Curricular (BNCC) estabelece que a formação de crianças e jovens deve incluir a capacidade de interagir no mundo digital com responsabilidade, ética e espírito crítico.</p>

              <div class="p-card blue" style="margin-bottom:10px;padding:10px;">
                <span class="p-badge" style="background:#0284c7;color:white;">Competência Geral 5 — Eixo Central</span>
                <h3 style="font-size:11px;">Cultura Digital</h3>
                <p style="font-style:italic;">"Compreender, utilizar e criar tecnologias digitais de forma crítica, significativa, reflexiva e ética nas diversas práticas sociais para se comunicar, acessar e disseminar informações, produzir conhecimentos, resolver problemas e exercer protagonismo."</p>
              </div>

              <div style="font-size:10px;font-weight:800;color:#047857;margin-bottom:6px;">Competências Pedagógicas de Apoio</div>

              <div class="p-card" style="margin-bottom:6px;">
                <p><strong>Competência 9 — Empatia e Cooperação:</strong> Promoção de respeito e acolhimento no convívio online, prevenção ativa do ciberbullying e combate ao discurso de ódio.</p>
              </div>
              <div class="p-card" style="margin-bottom:6px;">
                <p><strong>Competência 10 — Responsabilidade e Cidadania:</strong> Agir com autonomia, responsabilidade, flexibilidade e princípios éticos democráticos no ambiente virtual.</p>
              </div>
              <div class="p-card" style="margin-bottom:8px;">
                <p><strong>Competência 4 — Comunicação:</strong> Utilizar diferentes linguagens, inclusive a digital, para se expressar e partilhar informações e sentimentos.</p>
              </div>

              <p style="font-size:7.8px;color:#64748b;font-style:italic;">*Complementado pelas diretrizes de Computação na Educação Básica (Eixo Cultura Digital e Mundo Digital).</p>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 3</span>
            </div>
          </div>

          <!-- PAGE 4: DICAS PRÁTICAS DE SEGURANÇA -->
          <div class="page page-back">
            <div>
              <div class="p-sec-title">3. Dicas Práticas de Segurança e Proteção</div>

              <div class="p-card" style="margin-bottom:9px;">
                <h3>Privacidade e Dados Pessoais: O que NÃO compartilhar</h3>
                <ul>
                  <li>Fotos do uniforme escolar, fachadas da casa ou locais de rotina frequente.</li>
                  <li>Documentos (CPF, RG), senhas ou dados bancários dos responsáveis.</li>
                  <li>Localização em tempo real ativada em redes sociais de acesso público.</li>
                </ul>
              </div>

              <div class="p-card blue" style="margin-bottom:10px;">
                <h3>Fake News e Golpes (Phishing)</h3>
                <p style="font-weight:700;margin-bottom:3px;">Antes de clicar ou compartilhar um link, oriente o jovem a verificar:</p>
                <ol>
                  <li>A fonte da notícia é conhecida e confiável?</li>
                  <li>O título é muito apelativo ou promete prêmios exagerados?</li>
                  <li>A mensagem pede envio urgente para múltiplos contatos?</li>
                </ol>
              </div>

              <div class="p-grid-2">
                <div class="p-qr-box" style="padding:8px;">
                  <img src="${qr.p4_antifraude}" alt="QR Guia Antifraude" style="width:64px;height:64px;" />
                  <span style="color:#0284c7;font-size:8px;">Guia Antifraude</span>
                  <small style="font-size:7px;color:#64748b;">Proteção contra Phishing</small>
                </div>
                <div class="p-qr-box" style="padding:8px;">
                  <img src="${qr.p4_safernet}" alt="QR SaferNet" style="width:64px;height:64px;" />
                  <span style="color:#047857;font-size:8px;">SaferNet Brasil</span>
                  <small style="font-size:7px;color:#64748b;">Prevenção ao Ciberbullying</small>
                </div>
              </div>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 4</span>
            </div>
          </div>
        </div>

        <!-- ==========================
             SHEET 3: Page 5 (Front) & Page 6 (Back)
             ========================== -->
        <div class="sheet" id="sheet3" onclick="stepForward()">
          <!-- PAGE 5: COMBINADOS DA FAMÍLIA -->
          <div class="page page-front">
            <div>
              <div class="p-sec-title">4. Combinados da Família &amp; Diálogo em Casa</div>
              <p class="p-intro">Construa regras claras em conjunto com os estudantes. A mediação baseada no diálogo é mais eficaz que a simples proibição.</p>

              <div class="p-card" style="margin-bottom:10px;">
                <h3 style="color:#047857;margin-bottom:4px;">Modelo de Acordo Familiar de Uso de Telas</h3>
                <table class="mini-table">
                  <thead>
                    <tr><th>Item do Acordo</th><th>Combinado Definido</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Horários sem tela</strong></td><td>Durante as refeições e até 1h antes de dormir.</td></tr>
                    <tr><td><strong>Locais de uso</strong></td><td>Preferencialmente em áreas comuns da casa.</td></tr>
                    <tr><td><strong>Privacidade</strong></td><td>Perfis em redes mantidos como privados / restritos.</td></tr>
                    <tr><td><strong>Desconforto online</strong></td><td>Avisar os pais imediatamente se algo estranho ocorrer.</td></tr>
                  </tbody>
                </table>
              </div>

              <div class="p-card">
                <h3>Perguntas para Iniciar uma Conversa em Casa</h3>
                <ul>
                  <li>"Quais são os jogos ou aplicativos que você e seus colegas mais gostam hoje?"</li>
                  <li>"Alguém desconhecido já tentou puxar assunto com você num jogo ou rede?"</li>
                  <li>"O que você faz quando vê alguém sendo chateado ou xingado num grupo de mensagem?"</li>
                  <li>"Se você receber uma mensagem estranha ou ameaçadora, sabe a quem recorrer?"</li>
                </ul>
              </div>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 5</span>
            </div>
          </div>

          <!-- PAGE 6: PASSO A PASSO DIANTE DE RISCOS -->
          <div class="page page-back">
            <div>
              <div class="p-sec-title">5. Passo a Passo Diante de Riscos e Denúncias</div>
              <p class="p-intro">Ao identificar ciberbullying, assédio, aliciamento, vazamento de imagens ou golpes, siga este protocolo de ação rápida:</p>

              <div class="step-row">
                <div class="step-num">1</div>
                <div><h4>Manter a calma e acolher o estudante</h4><p>Escute sem julgar ou culpar a vítima, garantindo apoio emocional imediato.</p></div>
              </div>
              <div class="step-row">
                <div class="step-num">2</div>
                <div><h4>Preservar as provas do ocorrido</h4><p>Tire capturas de tela (prints), guarde links (URLs), datas, horários e nomes de perfis. Não apague as conversas.</p></div>
              </div>
              <div class="step-row">
                <div class="step-num">3</div>
                <div><h4>Bloquear e denunciar no aplicativo</h4><p>Utilize as ferramentas nativas da própria rede social ou jogo para reportar o usuário infrator.</p></div>
              </div>
              <div class="step-row">
                <div class="step-num">4</div>
                <div><h4>Comunicar a Escola e o Conselho Tutelar</h4><p>Informe a coordenação pedagógica para mediação escolar e acione o Conselho se houver violação de direitos.</p></div>
              </div>
              <div class="step-row" style="margin-bottom:10px;">
                <div class="step-num">5</div>
                <div><h4>Registrar denúncia nos canais oficiais</h4><p>Acesse plataformas especializadas como a SaferNet (canaldedenuncia.org.br) ou ligue para o Disque 100.</p></div>
              </div>

              <div class="p-card rose">
                <p style="color:#9f1239;"><strong>Em caso de crimes graves ou risco imediato:</strong> Registre um Boletim de Ocorrência (B.O.) na Polícia Civil / Delegacia de Crimes Cibernéticos.</p>
              </div>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 6</span>
            </div>
          </div>
        </div>

        <!-- ==========================
             SHEET 4: Page 7 (Front) & Page 8 (Back)
             ========================== -->
        <div class="sheet" id="sheet4" onclick="stepForward()">
          <!-- PAGE 7: CANAIS OFICIAIS DE APOIO E DENÚNCIA -->
          <div class="page page-front">
            <div>
              <div class="p-sec-title">6. Canais Oficiais de Apoio e Denúncia</div>
              <p class="p-intro">Tenha sempre à mão estes contatos para relatar incidentes ou buscar orientação sobre segurança na internet:</p>

              <div class="p-grid-2">
                <div class="p-card">
                  <span class="p-badge rose">Emergência / Direitos</span>
                  <h3>Disque 100</h3>
                  <p style="margin-bottom:5px;">Mobilizado pelo Governo Federal para violações de direitos humanos.</p>
                  <div class="p-qr-box">
                    <img src="${qr.p7_disque100}" alt="QR Disque 100" />
                    <span>Disque 100 Online</span>
                  </div>
                </div>

                <div class="p-card">
                  <span class="p-badge">Orientação e Denúncia</span>
                  <h3>SaferNet Brasil</h3>
                  <p style="margin-bottom:5px;">Canal de denúncia de crimes cibernéticos e helpline gratuito.</p>
                  <div class="p-qr-box">
                    <img src="${qr.p7_safernet}" alt="QR SaferNet Denúncia" />
                    <span>safernet.org.br</span>
                  </div>
                </div>

                <div class="p-card">
                  <span class="p-badge">Proteção de Dados</span>
                  <h3>ANPD</h3>
                  <p style="margin-bottom:5px;">Autoridade Nacional de Proteção de Dados (guias para menores).</p>
                  <div class="p-qr-box">
                    <img src="${qr.p7_anpd}" alt="QR ANPD" />
                    <span>gov.br/anpd</span>
                  </div>
                </div>

                <div class="p-card">
                  <span class="p-badge amber">Uso Consciente de Telas</span>
                  <h3>Secom / Gov.br</h3>
                  <p style="margin-bottom:5px;">Guia oficial com orientações de tempo de tela e saúde mental.</p>
                  <div class="p-qr-box">
                    <img src="${qr.p7_secom}" alt="QR Guia de Telas" />
                    <span>Guia de Telas</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 7</span>
            </div>
          </div>

          <!-- PAGE 8: PLANO DE USO NA ESCOLA E CRÉDITOS -->
          <div class="page page-back">
            <div>
              <div class="p-sec-title">7. Plano de Uso do Guia no Contexto Escolar</div>

              <div class="p-card" style="margin-bottom:12px;">
                <h3 style="color:#047857;margin-bottom:5px;">Como a Escola Pode Utilizar Este Guia</h3>
                <ul>
                  <li><strong>Reunião de Pais e Mestres:</strong> Entrega da cartilha física com apresentação de 10 min pela coordenação.</li>
                  <li><strong>Grupos de Comunicação da Turma:</strong> Disseminação do arquivo PDF com mensagem de boas-vindas.</li>
                  <li><strong>Semana da Cultura Digital:</strong> Distribuição acompanhada de murais e vídeos informativos produzidos pelos estudantes.</li>
                  <li><strong>Formação de Professores:</strong> Material de apoio para momentos de planejamento pedagógico.</li>
                </ul>
              </div>

              <div style="background:#0f172a;color:white;border-radius:8px;padding:14px;">
                <h3 style="color:#38bdf8;font-size:10.5px;margin-bottom:6px;">Créditos e Ficha Técnica</h3>
                <p style="font-size:8.2px;line-height:1.5;color:#e2e8f0;">
                  <strong>Projeto:</strong> Tópicos Especiais II — ECA Digital + BNCC + Cultura Digital<br/>
                  <strong>Instituição:</strong> Instituto Federal de Mato Grosso do Sul (IFMS) — Câmpus Jardim<br/>
                  <strong>Curso:</strong> Licenciatura em Computação | <strong>Docente:</strong> Prof. Giovanni<br/>
                  <strong>Equipe:</strong> Adriano Hazime, Denner Avalos, João Carlos Velasquez, Leonardo Gomes e Talita Marques<br/>
                  <strong>Apresentação:</strong> 03/11/2026
                </p>
              </div>
            </div>

            <div class="p-footer">
              <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
              <span>Página 8</span>
            </div>
          </div>
        </div>

      </div>

      <!-- REALISTIC ILLUSTRATED PARENT HANDS HOLDING THE POCKET GUIDE -->
      <div class="hands-layer" id="handsLayer">
        <!-- Left Hand -->
        <svg class="hand-left" width="210" height="260" viewBox="0 0 210 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Sleeve -->
          <path d="M10 260 L40 165 L125 190 L95 260 Z" fill="#1e3a8a"/>
          <path d="M36 168 L122 192" stroke="#60a5fa" stroke-width="4"/>
          <!-- Palm & Fingers -->
          <path d="M45 170 C35 120, 55 65, 95 45 C115 35, 132 52, 122 75 L105 115 C128 98, 162 96, 172 115 C180 130, 155 152, 125 162 L115 195 Z" fill="#e0a98b" stroke="#b87d5e" stroke-width="2.5"/>
          <!-- Thumb resting over booklet bottom-left margin -->
          <path d="M92 122 C118 98, 158 96, 170 114 C178 126, 156 146, 122 154" fill="#eab699" stroke="#b87d5e" stroke-width="2"/>
          <!-- Thumbnail -->
          <ellipse cx="156" cy="116" rx="9" ry="6" transform="rotate(-12 156 116)" fill="#f7d6c4"/>
        </svg>

        <!-- Right Hand -->
        <svg class="hand-right" width="210" height="260" viewBox="0 0 210 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Sleeve -->
          <path d="M200 260 L170 165 L85 190 L115 260 Z" fill="#1e3a8a"/>
          <path d="M174 168 L88 192" stroke="#60a5fa" stroke-width="4"/>
          <!-- Palm & Fingers -->
          <path d="M165 170 C175 120, 155 65, 115 45 C95 35, 78 52, 88 75 L105 115 C82 98, 48 96, 38 115 C30 130, 55 152, 85 162 L95 195 Z" fill="#e0a98b" stroke="#b87d5e" stroke-width="2.5"/>
          <!-- Thumb resting over booklet bottom-right margin -->
          <path d="M118 122 C92 98, 52 96, 40 114 C32 126, 54 146, 88 154" fill="#eab699" stroke="#b87d5e" stroke-width="2"/>
          <!-- Thumbnail -->
          <ellipse cx="54" cy="116" rx="9" ry="6" transform="rotate(12 54 116)" fill="#f7d6c4"/>
        </svg>
      </div>

    </div>
  </div>

  <!-- Subtitle Caption -->
  <div class="subtitle-bar" id="subtitleBar">
    <span>Cena 1:</span> Na correria do cotidiano, uma mãe ou pai recebe na escola o <span>Guia de Bolso: Cultura Digital com Direitos</span>.
  </div>

  <!-- Video Controls -->
  <div class="player-bar">
    <button id="playBtn" onclick="togglePlay()">⏸ Pausar Vídeo</button>
    <button class="sec" onclick="restartVideo()">↺ Reiniciar</button>
    <div class="progress-wrap"><div class="progress-fill" id="progressFill"></div></div>
    <button class="sec" onclick="stepBack()" title="Voltar Cena">◀ Voltar</button>
    <button class="sec" onclick="stepForward()" title="Avançar / Desdobrar">Avançar / Abrir ▶</button>
    <button class="sec" onclick="toggleFullScreen()">⛶ Tela Cheia</button>
  </div>

  <script>
    const stage = document.getElementById('stage');
    const cameraRig = document.getElementById('cameraRig');
    const book = document.getElementById('book');
    const sheet1 = document.getElementById('sheet1');
    const sheet2 = document.getElementById('sheet2');
    const sheet3 = document.getElementById('sheet3');
    const sheet4 = document.getElementById('sheet4');
    const subtitleBar = document.getElementById('subtitleBar');
    const sceneLabel = document.getElementById('sceneLabel');
    const playBtn = document.getElementById('playBtn');
    const progressFill = document.getElementById('progressFill');

    // 7 Cinematic Keyframe Scenes
    const scenes = [
      {
        label: 'CENA 1/7 • Na Mão da Família (Guia de Bolso em Mãos)',
        sub: '<span>Na mão de mães, pais e educadores:</span> Como orientar crianças e adolescentes na internet de forma simples e sem juridiquês?',
        cam: 'translate3d(0px, -15px, -180px) rotateX(18deg) rotateY(-12deg) rotateZ(-2deg) scale(0.86)',
        openState: 'closed',
        flipped: [false, false, false, false],
        duration: 4200
      },
      {
        label: 'CENA 2/7 • Close-up na Capa (Página 1 Original + QR Code ECA Digital)',
        sub: '<span>Close na Capa (Página 1):</span> O Guia de Bolso conecta família e escola com acesso imediato via <span>QR Code oficial</span>.',
        cam: 'translate3d(0px, -10px, 160px) rotateX(4deg) rotateY(0deg) rotateZ(0deg) scale(1.08)',
        openState: 'closed',
        flipped: [false, false, false, false],
        duration: 4500
      },
      {
        label: 'CENA 3/7 • Abrindo / Desdobrando a Cartilha (Páginas 2 e 3: ECA Digital + BNCC)',
        sub: '<span>Desdobrando o Guia (Págs. 2 e 3):</span> Os 6 eixos do <span>ECA Digital (Lei 15.211/25)</span> em linguagem simples + <span>Competência 5 da BNCC</span>.',
        cam: 'translate3d(0px, -12px, 60px) rotateX(10deg) rotateY(4deg) scale(0.96)',
        openState: 'open',
        flipped: [true, false, false, false],
        duration: 5500
      },
      {
        label: 'CENA 4/7 • Folheando: Dicas Práticas, QR Codes e Acordo Familiar (Páginas 4 e 5)',
        sub: '<span>Páginas 4 e 5:</span> O que NÃO compartilhar, checklist contra golpes, <span>QR Codes (UFMA e SaferNet)</span> e quadro de Combinados da Família.',
        cam: 'translate3d(0px, -8px, 75px) rotateX(8deg) rotateY(-4deg) scale(0.98)',
        openState: 'open',
        flipped: [true, true, false, false],
        duration: 5500
      },
      {
        label: 'CENA 5/7 • Passo a Passo Diante de Riscos e Canais Oficiais (Páginas 6 e 7)',
        sub: '<span>Páginas 6 e 7:</span> Protocolo rápido em 5 passos diante de riscos + <span>4 QR Codes de Emergência</span> (Disque 100, SaferNet, ANPD e Secom).',
        cam: 'translate3d(0px, -8px, 75px) rotateX(8deg) rotateY(3deg) scale(0.98)',
        openState: 'open',
        flipped: [true, true, true, false],
        duration: 5500
      },
      {
        label: 'CENA 6/7 • Super Close nos 4 QR Codes de Denúncia e Apoio (Página 7)',
        sub: '<span>Destaque dos QR Codes (Página 7):</span> Basta apontar a câmera do celular ou tocar no PDF pelo WhatsApp para abrir o canal oficial!',
        cam: 'translate3d(-190px, -18px, 240px) rotateX(2deg) rotateY(-3deg) scale(1.16)',
        openState: 'zoom-qr',
        flipped: [true, true, true, false],
        duration: 4800
      },
      {
        label: 'CENA 7/7 • Fechamento: Plano de Uso Escolar e Ficha Técnica IFMS (Página 8)',
        sub: '<span>Página 8 (Contracapa):</span> Plano de aplicação na escola — Reunião de Pais, Grupos de Turma e Semana da Cultura Digital (IFMS Câmpus Jardim).',
        cam: 'translate3d(180px, -10px, 110px) rotateX(6deg) rotateY(8deg) scale(1.0)',
        openState: 'back',
        flipped: [true, true, true, true],
        duration: 5000
      }
    ];

    let currentScene = 0;
    let isPlaying = true;
    let timer = null;

    function applyScene(idx) {
      currentScene = idx;
      const sc = scenes[idx];
      sceneLabel.textContent = sc.label;
      subtitleBar.innerHTML = sc.sub;
      cameraRig.style.transform = sc.cam;

      stage.classList.remove('state-open', 'state-zoom-qr');
      book.classList.remove('is-open', 'is-back');

      if (sc.openState === 'open') {
        stage.classList.add('state-open');
        book.classList.add('is-open');
      } else if (sc.openState === 'zoom-qr') {
        stage.classList.add('state-zoom-qr');
        book.classList.add('is-open');
      } else if (sc.openState === 'back') {
        stage.classList.add('state-open');
        book.classList.add('is-back');
      }

      [sheet1, sheet2, sheet3, sheet4].forEach((sh, i) => {
        sh.classList.toggle('flipped', sc.flipped[i]);
      });

      const pct = ((idx + 1) / scenes.length) * 100;
      progressFill.style.width = pct + '%';

      if (timer) clearTimeout(timer);
      if (isPlaying) {
        timer = setTimeout(() => {
          const next = (currentScene + 1) % scenes.length;
          applyScene(next);
        }, sc.duration);
      }
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? '⏸ Pausar Vídeo' : '▶ Continuar Vídeo';
      if (isPlaying) {
        applyScene(currentScene);
      } else if (timer) {
        clearTimeout(timer);
      }
    }

    function restartVideo() {
      isPlaying = true;
      playBtn.textContent = '⏸ Pausar Vídeo';
      applyScene(0);
    }

    function stepForward() {
      const next = (currentScene + 1) % scenes.length;
      applyScene(next);
    }

    function stepBack() {
      const prev = (currentScene - 1 + scenes.length) % scenes.length;
      applyScene(prev);
    }

    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') stepForward();
      else if (e.key === 'ArrowLeft') stepBack();
      else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
      else if (e.key === 'f' || e.key === 'F') toggleFullScreen();
    });

    applyScene(0);
  </script>
</body>
</html>`;

const outPath = path.join(rootDir, 'Video_Animacao_Cartilha_3D.html');
fs.writeFileSync(outPath, html, 'utf8');
console.log('[3D VIDEO HTML] Gerado com sucesso em:', outPath);
