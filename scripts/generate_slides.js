/**
 * Gerador dos Slides da Apresentação (HTML Interativo + PDF 16:9) e Roteiro Completo
 * Baseado em:
 * - Estrutura do Guia de Bolso (Seção 10: Roteiro de 20 min)
 * - Relatório Acadêmico (Guia de Bolso: Cultura Digital com Direitos)
 * - Cartilha PDF com QR Codes (8 páginas)
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const qrDir = path.join(rootDir, 'qrcodes');

function getQrDataUri(filename) {
  const p = path.join(qrDir, filename);
  const b64 = fs.readFileSync(p).toString('base64');
  return `data:image/png;base64,${b64}`;
}

const qrImgs = {
  p1_eca: getQrDataUri('01_p1_eca_digital.png'),
  p4_antifraude: getQrDataUri('02_p4_guia_antifraude.png'),
  p4_safernet: getQrDataUri('03_p4_safernet_ciberbullying.png'),
  p7_disque100: getQrDataUri('04_p7_disque_100.png'),
  p7_safernet: getQrDataUri('05_p7_safernet_denuncia.png'),
  p7_anpd: getQrDataUri('06_p7_anpd.png'),
  p7_secom: getQrDataUri('07_p7_secom_guia_telas.png')
};

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Apresentação — Guia de Bolso: Cultura Digital com Direitos (ECA Digital + BNCC)</title>
  <style>
    @page {
      size: 1280px 720px;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #1e293b;
      overflow: hidden;
    }
    .deck {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .slide {
      width: 1280px;
      height: 720px;
      background: #ffffff;
      position: relative;
      display: none;
      flex-direction: column;
      justify-content: space-between;
      padding: 42px 56px 34px 56px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
      overflow: hidden;
      page-break-after: always;
    }
    .slide.active {
      display: flex;
    }
    /* Top Header */
    .slide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #047857;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .slide-header .inst {
      font-size: 13px;
      font-weight: 700;
      color: #047857;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .slide-header .inst span {
      display: block;
      font-size: 11.5px;
      font-weight: 500;
      color: #64748b;
      text-transform: none;
      margin-top: 2px;
    }
    .slide-header .badge-top {
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 12px;
      border-radius: 20px;
    }
    /* Slide Title */
    .slide-title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .slide-subtitle {
      font-size: 15px;
      color: #475569;
      margin-bottom: 18px;
      line-height: 1.4;
    }
    .slide-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
    }
    /* Grid helpers */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 14px;
    }
    /* Cards */
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 5px solid #047857;
      border-radius: 10px;
      padding: 16px 18px;
    }
    .card.blue {
      border-left-color: #0284c7;
      background: #f0f9ff;
      border-color: #bae6fd;
    }
    .card.amber {
      border-left-color: #d97706;
      background: #fffbeb;
      border-color: #fde68a;
    }
    .card.rose {
      border-left-color: #e11d48;
      background: #fff1f2;
      border-color: #fecdd3;
    }
    .card h3 {
      font-size: 16.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .card p, .card li {
      font-size: 14px;
      color: #334155;
      line-height: 1.45;
    }
    .card ul {
      padding-left: 18px;
    }
    .card li + li {
      margin-top: 5px;
    }
    .pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 3px 9px;
      border-radius: 999px;
      margin-bottom: 6px;
      background: #d1fae5;
      color: #065f46;
    }
    .pill.blue { background: #e0f2fe; color: #0369a1; }
    .pill.amber { background: #fef3c7; color: #92400e; }
    .pill.rose { background: #ffe4e6; color: #9f1239; }
    /* Tables */
    table.clean-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
    }
    table.clean-table th {
      background: #047857;
      color: #ffffff;
      text-align: left;
      padding: 9px 12px;
      font-weight: 700;
    }
    table.clean-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    table.clean-table tr:nth-child(even) td {
      background: #f8fafc;
    }
    /* Cover Hero */
    .hero-banner {
      background: linear-gradient(135deg, #065f46 0%, #047857 60%, #0f766e 100%);
      color: white;
      border-radius: 16px;
      padding: 34px 40px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 28px;
    }
    .hero-banner .tag {
      display: inline-block;
      background: rgba(255,255,255,0.18);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12.5px;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .hero-banner h1 {
      font-size: 38px;
      font-weight: 800;
      margin-bottom: 10px;
      line-height: 1.15;
    }
    .hero-banner p {
      font-size: 16.5px;
      opacity: 0.94;
      line-height: 1.45;
      max-width: 760px;
    }
    .hero-qr-box {
      background: white;
      color: #0f172a;
      padding: 14px;
      border-radius: 12px;
      text-align: center;
      min-width: 155px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    .hero-qr-box img {
      width: 115px;
      height: 115px;
      display: block;
      margin: 0 auto 6px auto;
    }
    .hero-qr-box span {
      font-size: 11px;
      font-weight: 800;
      color: #047857;
      display: block;
    }
    /* Footer */
    .slide-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      margin-top: 12px;
      font-size: 12px;
      color: #64748b;
    }
    .speaker-chip {
      background: #f1f5f9;
      color: #334155;
      padding: 3px 10px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 11.5px;
    }
    /* QR Grid on Slide 8 */
    .qr-showcase {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 10px;
    }
    .qr-item {
      background: #f8fafc;
      border: 1.5px dashed #94a3b8;
      border-radius: 10px;
      padding: 10px 8px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .qr-item img {
      width: 104px;
      height: 104px;
      margin: 4px 0;
    }
    .qr-item .qr-pg {
      font-size: 10.5px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 10px;
      background: #e0f2fe;
      color: #0369a1;
    }
    .qr-item .qr-name {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 2px;
    }
    .qr-item .qr-desc {
      font-size: 10.5px;
      color: #475569;
      line-height: 1.25;
    }
    /* Controls bar (hidden in print) */
    .controls {
      position: fixed;
      bottom: 16px;
      right: 24px;
      display: flex;
      gap: 8px;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.85);
      padding: 8px 12px;
      border-radius: 999px;
      backdrop-filter: blur(6px);
    }
    .controls button {
      background: #047857;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
    }
    .controls button:hover {
      background: #059669;
    }
    .notes-drawer {
      position: fixed;
      bottom: 64px;
      left: 24px;
      right: 24px;
      background: rgba(15, 23, 42, 0.95);
      color: #f8fafc;
      padding: 16px 22px;
      border-radius: 12px;
      border-left: 5px solid #10b981;
      font-size: 14px;
      line-height: 1.5;
      display: none;
      z-index: 999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .notes-drawer.open {
      display: block;
    }
    .notes-drawer strong {
      color: #34d399;
    }
    @media print {
      body {
        background: white;
        overflow: visible;
      }
      .deck {
        display: block;
        width: auto;
        height: auto;
      }
      .slide {
        display: flex !important;
        box-shadow: none;
        page-break-after: always;
        break-after: page;
      }
      .controls, .notes-drawer {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="deck">

    <!-- SLIDE 1: CAPA -->
    <section class="slide active" data-notes="<strong>Roteiro (Denner / Abertura — 1 min):</strong> Olá a todos, professor Giovanni e colegas. Nós somos o Grupo 1 e hoje apresentaremos o projeto prático 'Guia de Bolso: Cultura Digital com Direitos'. Enquanto em Tópicos Especiais III trabalhamos com uma ferramenta tecnológica direta para o aluno, aqui em Tópicos Especiais II desenvolvemos uma proposta pedagógica voltada para famílias e professores, traduzindo a Lei nº 15.211/25 (ECA Digital) e conectando-a à Competência Geral 5 da BNCC por meio de uma cartilha de bolso interativa com QR Codes.">
      <div class="slide-header">
        <div class="inst">
          Ministério da Educação — Instituto Federal de Mato Grosso do Sul (IFMS) — Câmpus Jardim
          <span>Curso de Licenciatura em Computação | Disciplina: Tópicos Especiais II | Docente: Prof. Giovanni Netto Calixto</span>
        </div>
        <div class="badge-top">SEMINÁRIO • ECA DIGITAL + BNCC</div>
      </div>

      <div class="slide-body">
        <div class="hero-banner">
          <div>
            <span class="tag">Proposta Educacional &amp; Guia de Bolso Pedagógico</span>
            <h1>Guia de Bolso:<br/>Cultura Digital com Direitos</h1>
            <p>Orientações práticas para famílias e professores sobre o uso crítico, ético, seguro e responsável das tecnologias digitais com base no <strong>ECA Digital (Lei nº 15.211/2025)</strong> e na <strong>BNCC (Competência Geral 5)</strong>.</p>
          </div>
          <div class="hero-qr-box">
            <img src="${qrImgs.p1_eca}" alt="QR Code ECA Digital" />
            <span>ECA DIGITAL (MJSP)</span>
            <small style="font-size:10px;color:#64748b;">Página 1 da Cartilha</small>
          </div>
        </div>

        <div class="grid-3">
          <div class="card">
            <span class="pill">Integrantes — Grupo 1</span>
            <ul>
              <li><strong>Denner dos Santos Avalos</strong> <em>(Coordenador e Relatório)</em></li>
              <li><strong>Leonardo Vinicius da Costa Gomes</strong> <em>(Pesquisa, Conteúdo e Slides)</em></li>
              <li><strong>João Carlos Velasquez</strong> <em>(Criação e Diagramação da Cartilha)</em></li>
              <li><strong>Talita Mendonça Marques</strong> <em>(Geração e Validação dos QR Codes)</em></li>
              <li><strong>Adriano Hazime Rodrigues</strong> <em>(Identidade Visual e Documentação)</em></li>
            </ul>
          </div>
          <div class="card blue">
            <span class="pill blue">Recorte Temático</span>
            <h3>Eixos Combinados</h3>
            <p><strong>• Ética e Segurança Digital:</strong> prevenção ao ciberbullying, phishing, privacidade e canais de denúncia.<br/>
            <strong>• TDIC &amp; Sociedade Digital:</strong> mediação familiar, tempo de tela e letramento digital.</p>
          </div>
          <div class="card amber">
            <span class="pill amber">Produto Prático</span>
            <h3>Cartilha de Bolso com QR Codes</h3>
            <p>Material de <strong>8 páginas em PDF</strong> (para impressão A5/dobrável e envio por WhatsApp), conectando orientações diretas a <strong>7 canais oficiais</strong> via QR Code.</p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — Apresentação: 03/11/2026</span>
        <span class="speaker-chip">Etapa 1: Abertura • Slide 1 / 10</span>
      </div>
    </section>

    <!-- SLIDE 2: TEMA, PROBLEMA E JUSTIFICATIVA -->
    <section class="slide" data-notes="<strong>Roteiro (Denner — 2 min):</strong> Qual é o problema real que nosso projeto enfrenta? Com a aprovação do ECA Digital (Lei 15.211/25), ficou estabelecido que proteger crianças e adolescentes na internet é uma responsabilidade compartilhada entre família, escola, Estado e plataformas. Porém, na prática, famílias e professores conhecem pouco a lei e não sabem como agir diante de golpes, ciberbullying ou aliciamento. Além disso, textos jurídicos longos afastam o público leigo. Por isso justificamos a criação de um Guia de Bolso curto, visual e com QR Codes: ele funciona como uma porta de entrada simples e de baixo custo.">
      <div class="slide-header">
        <div class="inst">1. Tema, Problema e Justificativa<span>Por que abordar o ECA Digital junto às famílias e professores?</span></div>
        <div class="badge-top">APRESENTAÇÃO DO PROBLEMA (2 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="card rose" style="padding: 18px 22px;">
          <span class="pill rose">Pergunta-Problema Central</span>
          <h3 style="font-size: 20px; color: #881337;">“Como a escola pode orientar famílias e professores, de forma simples e acessível, para que eles ajudem os estudantes a usar a tecnologia de modo crítico, ético, seguro e responsável?”</h3>
        </div>

        <div class="grid-2">
          <div class="card">
            <span class="pill">Diagnóstico do Problema</span>
            <h3>Lacuna entre a Lei e o Cotidiano Escolar</h3>
            <ul>
              <li>O <strong>ECA Digital (Lei nº 15.211/25)</strong> instituiu o dever de proteção compartilhada entre família, escola, Estado e plataformas.</li>
              <li>Na prática, <strong>famílias e professores conhecem pouco os direitos previstos na lei</strong> e têm dúvidas sobre como supervisionar ou denunciar riscos (golpes, <em>phishing</em>, ciberbullying, aliciamento e exposição de dados).</li>
              <li>As ações escolares costumam ser <strong>pontuais</strong> (uma palestra isolada ou aviso) e raramente chegam de forma contínua às famílias.</li>
            </ul>
          </div>

          <div class="card blue">
            <span class="pill blue">Justificativa Pedagógica</span>
            <h3>Por que um Guia de Bolso com QR Codes?</h3>
            <ul>
              <li><strong>Preparação dos adultos de referência:</strong> A conscientização do adolescente é muito mais efetiva quando pais e professores sabem dialogar, mediar e agir.</li>
              <li><strong>Barreira da linguagem jurídica:</strong> Textos legais extensos afastam o público leigo; uma cartilha curta (8 páginas) traduz a lei em situações do dia a dia.</li>
              <li><strong>Porta de entrada acessível:</strong> Baixo custo para impressão em reuniões de pais e fácil distribuição em PDF nos grupos de mensagens da escola.</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
        <span class="speaker-chip">Apresentador sugerido: Denner • Slide 2 / 10</span>
      </div>
    </section>

    <!-- SLIDE 3: PÚBLICO-ALVO, OBJETIVOS E DIFERENCIAL -->
    <section class="slide" data-notes="<strong>Roteiro (Denner / Leonardo — 2 min):</strong> Nosso público-alvo principal são as famílias de alunos do 6º ao 9º ano (Ensino Fundamental II), tendo os professores como público secundário e os estudantes como beneficiários indiretos. Aqui na tabela à direita destacamos a diferença fundamental em relação a Tópicos Especiais III (Feed Seguro): lá o foco era uma solução tecnológica (quiz web) para o adolescente jogar; aqui em Tópicos II o foco é uma proposta educacional com elemento obrigatório da BNCC, onde a escola distribui e media o diálogo com os adultos.">
      <div class="slide-header">
        <div class="inst">2. Público-Alvo, Objetivos e Diferencial da Abordagem<span>Alinhamento ao Edital de Tópicos Especiais II</span></div>
        <div class="badge-top">PÚBLICO E OBJETIVOS (2 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="grid-2">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div class="card">
              <span class="pill">Público-Alvo Definido</span>
              <ul>
                <li><strong>Principal:</strong> Famílias e responsáveis por estudantes do <strong>Ensino Fundamental II (6º ao 9º ano)</strong>.</li>
                <li><strong>Secundário:</strong> Professores e equipe pedagógica (apoio em reuniões, rodas de conversa e aulas).</li>
                <li><strong>Beneficiários Indiretos:</strong> Os próprios estudantes.</li>
              </ul>
            </div>

            <div class="card blue">
              <span class="pill blue">Objetivo Geral e Específicos</span>
              <p style="margin-bottom:6px;"><strong>Objetivo Geral:</strong> Elaborar uma proposta educacional (cartilha de bolso com QR codes) que oriente famílias e professores sobre o uso crítico, ético, seguro e responsável das TDICs (ECA Digital + CG 5 da BNCC).</p>
              <ul>
                <li>Traduzir o ECA Digital para linguagem acessível e cotidiana;</li>
                <li>Vincular cada seção às competências da BNCC;</li>
                <li>Reunir canais oficiais de orientação e denúncia via QR Codes;</li>
                <li>Propor combinados familiares, plano de uso escolar e validação.</li>
              </ul>
            </div>
          </div>

          <div class="card amber" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <span class="pill amber">Diferencial Metodológico (Seção 7 da Estrutura)</span>
              <h3>Comparativo: Tópicos Especiais III vs. Tópicos Especiais II</h3>
              <p style="margin-bottom:12px;">O projeto adota um recorte pedagógico complementar, focado no papel do futuro docente de Computação como mediador comunitário:</p>
              <table class="clean-table">
                <thead>
                  <tr>
                    <th>Aspecto</th>
                    <th>Tópicos III (Feed Seguro)</th>
                    <th>Tópicos II (Guia de Bolso)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Foco</strong></td>
                    <td>Solução tecnológica</td>
                    <td><strong>Proposta educacional</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Público</strong></td>
                    <td>Adolescentes</td>
                    <td><strong>Famílias e professores</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Produto</strong></td>
                    <td>Quiz / simulador web</td>
                    <td><strong>Cartilha de bolso com QR Codes</strong></td>
                  </tr>
                  <tr>
                    <td><strong>BNCC</strong></td>
                    <td>Não é o foco central</td>
                    <td><strong>Elemento obrigatório estruturante</strong></td>
                  </tr>
                  <tr>
                    <td><strong>Dinâmica</strong></td>
                    <td>O aluno joga e interage</td>
                    <td><strong>A escola distribui, forma e media</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
        <span class="speaker-chip">Apresentador sugerido: Denner / Leonardo • Slide 3 / 10</span>
      </div>
    </section>

    <!-- SLIDE 4: FUNDAMENTAÇÃO - ECA DIGITAL -->
    <section class="slide" data-notes="<strong>Roteiro (Leonardo — 3 min):</strong> Na fundamentação teórica e na Página 2 da nossa cartilha, traduzimos o Estatuto Digital da Criança e do Adolescente (Lei nº 15.211/2025) em 6 eixos práticos. O primeiro é a Responsabilidade Compartilhada. O segundo é a Segurança por Padrão: jogos e redes devem vir configurados no nível máximo de privacidade para menores. O terceiro é a Supervisão Parental Ativa, unindo ferramentas gratuitas e diálogo. O quarto é a Aferição de Idade Real, superando o simples 'clique aqui se tem 13 anos'. O quinto proíbe o perfilamento comportamental infantil para publicidade. E o sexto garante canais de denúncia e fiscalização pela ANPD.">
      <div class="slide-header">
        <div class="inst">3. Fundamentação Teórica — ECA Digital (Lei nº 15.211/2025)<span>Os 6 eixos do Estatuto Digital trabalhados na Página 2 da Cartilha</span></div>
        <div class="badge-top">FUNDAMENTAÇÃO: ECA DIGITAL (3 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="grid-3">
          <div class="card">
            <span class="pill">Eixo 1 • Art. Estruturante</span>
            <h3>1. Responsabilidade Compartilhada</h3>
            <p>A proteção online não é dever isolado da família: exige atuação conjunta entre <strong>família, escola, sociedade, Estado e plataformas digitais</strong>.</p>
          </div>

          <div class="card blue">
            <span class="pill blue">Eixo 2 • Privacidade Nativa</span>
            <h3>2. Segurança por Padrão</h3>
            <p>Redes sociais e jogos devem vir <strong>pré-configurados no mais alto nível de privacidade</strong> e proteção para contas de menores, sem exigir ajustes complexos dos pais.</p>
          </div>

          <div class="card">
            <span class="pill">Eixo 3 • Mediação Familiar</span>
            <h3>3. Supervisão Parental Ativa</h3>
            <p>Oferta obrigatória de ferramentas gratuitas de acompanhamento conjugadas com <strong>diálogo constante</strong>, superando o modelo focado apenas em vigilância ou proibição.</p>
          </div>

          <div class="card blue">
            <span class="pill blue">Eixo 4 • Barreira de Acesso</span>
            <h3>4. Aferição de Idade Real</h3>
            <p>A simples autodeclaração (<em>"marque aqui se tem mais de 13 anos"</em>) deixa de ser suficiente. Exigem-se <strong>mecanismos eficazes de verificação etária</strong>.</p>
          </div>

          <div class="card amber">
            <span class="pill amber">Eixo 5 • Dados e Algoritmos</span>
            <h3>5. Proteção de Dados e Publicidade</h3>
            <p>Vedação à coleta excessiva de dados pessoais, ao rastreamento e ao <strong>perfilamento comportamental de crianças para fins publicitários</strong>.</p>
          </div>

          <div class="card rose">
            <span class="pill rose">Eixo 6 • Regulação e Sanções</span>
            <h3>6. Denúncia, Reporte e ANPD</h3>
            <p>Canais acessíveis contra exploração, aliciamento e ciberbullying. O descumprimento sujeita plataformas à fiscalização e multas da <strong>ANPD</strong>.</p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
        <span class="speaker-chip">Apresentador sugerido: Leonardo • Slide 4 / 10</span>
      </div>
    </section>

    <!-- SLIDE 5: RELAÇÃO COM A BNCC -->
    <section class="slide" data-notes="<strong>Roteiro (Leonardo — 3 min):</strong> Como o edital destaca, o projeto não é apenas 'sobre tecnologia', mas sobre formação cidadã alinhada à BNCC (Página 3 da cartilha). Nosso eixo central é a Competência Geral 5 (Cultura Digital): compreender, utilizar e criar tecnologias de forma crítica, reflexiva e ética. E articulamos três competências de apoio: a Competência 9 (Empatia e Cooperação, no combate ao ciberbullying), a Competência 10 (Responsabilidade e Cidadania, nas regras e denúncias) e a Competência 4 (Comunicação, no diálogo entre família e escola), além dos eixos Cultura Digital e Mundo Digital da Computação na Educação Básica.">
      <div class="slide-header">
        <div class="inst">4. Relação com a BNCC e a Cultura Digital<span>Articulação Pedagógica trabalhada na Página 3 da Cartilha</span></div>
        <div class="badge-top">RELAÇÃO COM A BNCC (3 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="card blue" style="padding: 18px 22px;">
          <span class="pill blue">Competência Geral 5 da BNCC — Eixo Central do Projeto</span>
          <h3 style="font-size: 19px;">Cultura Digital</h3>
          <p style="font-size: 15px;">“Compreender, utilizar e criar tecnologias digitais de informação e comunicação de forma <strong>crítica, significativa, reflexiva e ética</strong> nas diversas práticas sociais (incluindo as escolares) para se comunicar, acessar e disseminar informações, produzir conhecimentos, resolver problemas e exercer protagonismo e autoria na vida pessoal e coletiva.”</p>
        </div>

        <div class="grid-3">
          <div class="card">
            <span class="pill">Competência Geral 9</span>
            <h3>Empatia e Cooperação</h3>
            <p>Exercitar a empatia, o diálogo e a resolução de conflitos: fundamenta na cartilha a <strong>promoção do respeito no convívio online, prevenção ativa ao ciberbullying e combate ao discurso de ódio</strong>.</p>
          </div>

          <div class="card">
            <span class="pill">Competência Geral 10</span>
            <h3>Responsabilidade e Cidadania</h3>
            <p>Agir pessoal e coletivamente com autonomia e responsabilidade: embasa os <strong>combinados de uso de telas, a proteção de dados e o protocolo de denúncia de violações</strong>.</p>
          </div>

          <div class="card">
            <span class="pill">Competência Geral 4</span>
            <h3>Comunicação</h3>
            <p>Utilizar diferentes linguagens, inclusive a digital, para partilhar informações e sentimentos: estrutura o <strong>roteiro de perguntas abertas para conversa em casa e na escola</strong>.</p>
          </div>
        </div>

        <div class="card amber" style="padding: 12px 18px;">
          <p><strong>Complemento — Computação na Educação Básica (BNCC Computação):</strong> Dialoga diretamente com os eixos <strong>Cultura Digital</strong> (letramento, ética e segurança) e <strong>Mundo Digital</strong> (compreensão de dados, redes e algoritmos), preparando o estudante para: <em>usar → compreender → questionar → proteger-se → criar → participar</em>.</p>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
        <span class="speaker-chip">Apresentador sugerido: Leonardo • Slide 5 / 10</span>
      </div>
    </section>

    <!-- SLIDE 6: ESTRUTURA DA CARTILHA E DESIGN -->
    <section class="slide" data-notes="<strong>Roteiro (João Carlos / Adriano — 2 min):</strong> Passando para a construção do produto: nós estruturamos a cartilha com exatamente 8 páginas em formato PDF, pensada tanto para impressão quanto para leitura rápida na tela do celular. Adotamos uma identidade visual acolhedora e sóbria voltada para adultos, com o verde institucional do IFMS, cartões organizados por cores e caixas tracejadas para os QR Codes. Nesta tabela vemos como cada uma das 8 páginas se conecta diretamente a uma Competência da BNCC e aos QR Codes.">
      <div class="slide-header">
        <div class="inst">5. Desenvolvimento do Produto e Estrutura da Cartilha<span>Arquitetura de 8 Páginas, Identidade Visual e Mapeamento BNCC (Seção 7.1 do Relatório)</span></div>
        <div class="badge-top">DESENVOLVIMENTO DO PRODUTO (2 MIN)</div>
      </div>

      <div class="slide-body">
        <table class="clean-table">
          <thead>
            <tr>
              <th style="width:70px;">Página</th>
              <th>Conteúdo Estruturado na Cartilha</th>
              <th style="width:160px;">Competência BNCC</th>
              <th style="width:230px;">Recurso QR Code</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Pág. 1</strong></td>
              <td><strong>Capa e Visão Geral:</strong> Para que serve o guia, público-alvo (Ens. Fundamental II) e acesso digital</td>
              <td>CG 5</td>
              <td><strong>1 QR Code:</strong> ECA Digital (MJSP)</td>
            </tr>
            <tr>
              <td><strong>Pág. 2</strong></td>
              <td><strong>O ECA Digital em Linguagem Simples:</strong> Responsabilidade, segurança por padrão, supervisão, dados e idade</td>
              <td>CG 5 e CG 10</td>
              <td>—</td>
            </tr>
            <tr>
              <td><strong>Pág. 3</strong></td>
              <td><strong>Conexão com a BNCC:</strong> Eixo central (Competência 5) e competências de apoio (9, 10 e 4)</td>
              <td>CG 4, 5, 9 e 10</td>
              <td>—</td>
            </tr>
            <tr>
              <td><strong>Pág. 4</strong></td>
              <td><strong>Dicas Práticas de Segurança:</strong> O que NÃO compartilhar (privacidade) e checklist contra <em>Phishing</em>/Golpes</td>
              <td>CG 5</td>
              <td><strong>2 QR Codes:</strong> Guia Antifraude (UFMA) e SaferNet (Ciberbullying)</td>
            </tr>
            <tr>
              <td><strong>Pág. 5</strong></td>
              <td><strong>Combinados da Família &amp; Diálogo:</strong> Quadro-modelo de acordo de uso de telas e perguntas para conversa</td>
              <td>CG 4, 9 e 10</td>
              <td>—</td>
            </tr>
            <tr>
              <td><strong>Pág. 6</strong></td>
              <td><strong>Passo a Passo Diante de Riscos:</strong> Protocolo rápido de 5 etapas (acolher, preservar provas, bloquear, escola, denunciar)</td>
              <td>CG 10</td>
              <td>—</td>
            </tr>
            <tr>
              <td><strong>Pág. 7</strong></td>
              <td><strong>Canais Oficiais de Apoio e Denúncia:</strong> Disque 100, SaferNet Brasil, ANPD e Guia de Telas Secom</td>
              <td>CG 10</td>
              <td><strong>4 QR Codes:</strong> 1 QR Code direto para cada canal oficial</td>
            </tr>
            <tr>
              <td><strong>Pág. 8</strong></td>
              <td><strong>Plano de Uso no Contexto Escolar:</strong> Estratégias para a escola, créditos institucionais e ficha técnica</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>

        <div class="grid-2">
          <div class="card">
            <h3>Identidade Visual e Diagramação (João Carlos &amp; Adriano)</h3>
            <p>Layout limpo com predominância do <strong>verde institucional do IFMS</strong>, destaques em azul, cartões informativos com bordas semânticas e leitura escaneável em menos de 5 minutos.</p>
          </div>
          <div class="card blue">
            <h3>Repositório Oficial e Código Aberto</h3>
            <p>Todo o projeto, a cartilha em PDF e o código gerador estão documentados no GitHub:<br/>
            <strong>github.com/skyzinha-chan/guia-de-bolso-eca-digital-bncc</strong></p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
        <span class="speaker-chip">Apresentador sugerido: João Carlos / Adriano • Slide 6 / 10</span>
      </div>
    </section>

    <!-- SLIDE 7: DEMONSTRAÇÃO DO CONTEÚDO PRÁTICO -->
    <section class="slide" data-notes="<strong>Roteiro (João Carlos — 1,5 min):</strong> Aqui mostramos como traduzimos a teoria em ferramentas práticas nas páginas 4, 5 e 6 da cartilha. Na página 4, damos exemplos diretos do que não compartilhar — como fotos com uniforme da escola ou localização em tempo real — e 3 perguntas simples para identificar golpes (phishing). Na página 5, entregamos um Modelo de Acordo Familiar de Uso de Telas e 4 perguntas abertas para os pais puxarem conversa sem tom de interrogatório. E na página 6, um protocolo de 5 passos claros para agir diante de qualquer risco online.">
      <div class="slide-header">
        <div class="inst">6. Demonstração da Cartilha — Orientações Práticas (Páginas 4, 5 e 6)<span>Tradução do ECA Digital e da BNCC em ferramentas de diálogo e prevenção</span></div>
        <div class="badge-top">DEMONSTRAÇÃO DA CARTILHA (1,5 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="grid-2">
          <div class="card">
            <span class="pill">Página 4 • Prevenção Cotidiana</span>
            <h3>Privacidade e Verificação Anti-Phishing</h3>
            <ul>
              <li><strong>O que NÃO compartilhar:</strong> Fotos do uniforme escolar, fachada de casa/rotina; documentos (CPF/RG), senhas ou dados bancários; localização em tempo real em redes abertas.</li>
              <li><strong>Três perguntas antes de clicar em um link:</strong>
                <ol style="padding-left:18px; margin-top:4px;">
                  <li>A fonte da notícia é conhecida e confiável?</li>
                  <li>O título é apelativo ou promete prêmios exagerados?</li>
                  <li>A mensagem pede envio urgente para vários contatos?</li>
                </ol>
              </li>
            </ul>
          </div>

          <div class="card blue">
            <span class="pill blue">Página 5 • Mediação Ativa</span>
            <h3>Combinados da Família e Roda de Conversa</h3>
            <ul>
              <li><strong>Acordo de Uso de Telas:</strong> Sem telas nas refeições e até 1h antes de dormir; uso prioritário em áreas comuns; perfis sempre privados/restritos.</li>
              <li><strong>Perguntas para Conversa em Casa (e na Escola):</strong>
                <ul style="margin-top:4px;">
                  <li><em>"Quais jogos ou apps você e seus colegas mais gostam hoje?"</em></li>
                  <li><em>"Alguém desconhecido já tentou puxar assunto com você?"</em></li>
                  <li><em>"Se receber algo estranho ou ameaçador, sabe a quem recorrer?"</em></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>

        <div class="card rose">
          <span class="pill rose">Página 6 • Protocolo de Ação Rápida Diante de Riscos e Violações</span>
          <h3>Passo a Passo para Famílias e Educadores (5 Etapas)</h3>
          <div class="grid-4" style="grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 8px;">
            <div style="background:white; padding:10px; border-radius:8px; border:1px solid #fecdd3;">
              <strong>1. Acolher</strong><br/><span style="font-size:12.5px;">Manter a calma e escutar o jovem sem culpá-lo.</span>
            </div>
            <div style="background:white; padding:10px; border-radius:8px; border:1px solid #fecdd3;">
              <strong>2. Guardar Provas</strong><br/><span style="font-size:12.5px;">Tirar prints, salvar URLs, datas, horários e perfis sem apagar nada.</span>
            </div>
            <div style="background:white; padding:10px; border-radius:8px; border:1px solid #fecdd3;">
              <strong>3. Bloquear no App</strong><br/><span style="font-size:12.5px;">Usar a ferramenta nativa da rede/jogo para reportar o infrator.</span>
            </div>
            <div style="background:white; padding:10px; border-radius:8px; border:1px solid #fecdd3;">
              <strong>4. Escola e Conselho</strong><br/><span style="font-size:12.5px;">Comunicar a coordenação pedagógica e o Conselho Tutelar.</span>
            </div>
            <div style="background:white; padding:10px; border-radius:8px; border:1px solid #fecdd3;">
              <strong>5. Canais Oficiais</strong><br/><span style="font-size:12.5px;">SaferNet, Disque 100 e B.O. na Polícia Civil em casos graves.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
        <span class="speaker-chip">Apresentador sugerido: João Carlos • Slide 7 / 10</span>
      </div>
    </section>

    <!-- SLIDE 8: DEMONSTRAÇÃO DOS 7 QR CODES (FALA DA TALITA) -->
    <section class="slide" data-notes="<strong>Roteiro (Talita — 2,5 min):</strong> Pessoal, a minha função no projeto foi realizar a curadoria, geração e conferência dos 7 QR Codes da cartilha. Por que eles são essenciais aqui? Porque para o Guia de Bolso continuar curto e visual (8 páginas), os QR Codes funcionam como uma ponte direta entre o guia impresso e os canais oficiais. Nós distribuímos os 7 códigos em três momentos: na Página 1 (portal do ECA Digital no Ministério da Justiça); na Página 4 (Guia Antifraude da UFMA contra phishing e SaferNet contra ciberbullying); e na Página 7, que funciona como um cartão de emergência com 4 QR Codes diretos: Disque 100 Online, Canal de Denúncias da SaferNet, ANPD e Guia de Uso de Telas da Secom. Desenvolvemos um script em Node.js que gerou os PNGs e também injetou os QR Codes em formato vetorial e com links clicáveis direto no PDF — assim funciona tanto escaneando no papel quanto clicando na tela pelo WhatsApp!">
      <div class="slide-header">
        <div class="inst">7. Os 7 QR Codes da Cartilha — Ponte para Canais Oficiais<span>Curadoria de Fontes Governamentais, Geração Automatizada em Node.js e Injeção Vetorial no PDF</span></div>
        <div class="badge-top">DEMONSTRAÇÃO DOS QR CODES • TALITA (2,5 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="qr-showcase">
          <div class="qr-item">
            <span class="qr-pg">Página 1 • Capa</span>
            <img src="${qrImgs.p1_eca}" alt="QR 1" />
            <div class="qr-name">ECA Digital</div>
            <div class="qr-desc">Portal Oficial do Ministério da Justiça (Lei 15.211/25)</div>
          </div>
          <div class="qr-item">
            <span class="qr-pg">Página 4 • Dicas</span>
            <img src="${qrImgs.p4_antifraude}" alt="QR 2" />
            <div class="qr-name">Guia Antifraude</div>
            <div class="qr-desc">Cartilha UFMA de Proteção contra Phishing e Golpes</div>
          </div>
          <div class="qr-item">
            <span class="qr-pg">Página 4 • Dicas</span>
            <img src="${qrImgs.p4_safernet}" alt="QR 3" />
            <div class="qr-name">SaferNet Brasil</div>
            <div class="qr-desc">Materiais de Prevenção ao Ciberbullying</div>
          </div>
          <div class="qr-item">
            <span class="qr-pg">Página 7 • Apoio</span>
            <img src="${qrImgs.p7_disque100}" alt="QR 4" />
            <div class="qr-name">Disque 100 Online</div>
            <div class="qr-desc">Ouvidoria Nacional de Direitos Humanos (MDHC)</div>
          </div>
          <div class="qr-item">
            <span class="qr-pg">Página 7 • Apoio</span>
            <img src="${qrImgs.p7_safernet}" alt="QR 5" />
            <div class="qr-name">SaferNet Denúncia</div>
            <div class="qr-desc">Canal Oficial de Denúncias e Helpline Gratuito</div>
          </div>
          <div class="qr-item">
            <span class="qr-pg">Página 7 • Apoio</span>
            <img src="${qrImgs.p7_anpd}" alt="QR 6" />
            <div class="qr-name">ANPD (gov.br)</div>
            <div class="qr-desc">Autoridade Nacional de Proteção de Dados</div>
          </div>
          <div class="qr-item">
            <span class="qr-pg">Página 7 • Apoio</span>
            <img src="${qrImgs.p7_secom}" alt="QR 7" />
            <div class="qr-name">Guia de Telas</div>
            <div class="qr-desc">Guia Oficial Secom / Gov.br (Saúde Mental e Telas)</div>
          </div>
        </div>

        <div class="grid-3">
          <div class="card">
            <span class="pill">1. Papel Pedagógico</span>
            <h3>Ponte para Aprofundamento</h3>
            <p>Mantém a cartilha enxuta e acolhedora para famílias leigas, oferecendo acesso imediato a guias completos e canais de denúncia com um único escaneamento.</p>
          </div>
          <div class="card blue">
            <span class="pill blue">2. Solução Técnica (Node.js)</span>
            <h3>QR Codes Vetoriais + Links Clicáveis</h3>
            <p>Script próprio (<code>generate_qrcodes_and_pdf.js</code>) que injeta os códigos <strong>vetorialmente no PDF</strong> (nitidez total na impressão) e adiciona <strong>anotações clicáveis</strong> para uso no celular.</p>
          </div>
          <div class="card amber">
            <span class="pill amber">3. Curadoria e Manutenção</span>
            <h3>Fontes 100% Institucionais</h3>
            <p>Seleção restrita a domínios oficiais (<code>gov.br</code>, ANPD, Secom, UFMA e SaferNet), com recomendação de conferência periódica dos links pela escola.</p>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — Aponte a câmera do celular para testar qualquer QR Code!</span>
        <span class="speaker-chip">Apresentadora: Talita • Slide 8 / 10</span>
      </div>
    </section>

    <!-- SLIDE 9: APLICAÇÃO PRÁTICA NA ESCOLA E PLANO DE VALIDAÇÃO -->
    <section class="slide" data-notes="<strong>Roteiro (Adriano — 3 min):</strong> Como a escola pode utilizar este Guia de Bolso na prática? Na Página 8 da cartilha e na Seção 7.4 do relatório, propomos 5 momentos de aplicação: entrega impressa na Reunião de Pais e Mestres com 10 minutos de mediação; envio do PDF nos grupos de WhatsApp das turmas; uso na Semana da Cultura Digital; formação de professores; e rodas de conversa em sala usando as perguntas da página 5. Também deixamos claro com transparência metodológica que, pelo prazo curto da disciplina, a cartilha passou por validação interna da equipe e deixamos estruturado um Plano de Validação em 4 etapas por leitura assistida com 3 a 5 pais e professores.">
      <div class="slide-header">
        <div class="inst">8. Aplicação Prática na Escola e Plano de Validação<span>Proposta de Uso no Contexto Escolar (Seção 7.4) e Validação por Leitura Assistida (Seção 7.5)</span></div>
        <div class="badge-top">APLICAÇÃO NA ESCOLA E VALIDAÇÃO (3 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="grid-2">
          <div class="card">
            <span class="pill">Seção 7.4 • Aplicação Prática na Escola</span>
            <h3>5 Estratégias de Uso Escolar</h3>
            <ul>
              <li><strong>1. Reunião de Pais e Mestres:</strong> Entrega da cartilha impressa acompanhada de apresentação de 10 minutos pela coordenação pedagógica.</li>
              <li><strong>2. Grupos de Comunicação da Turma (WhatsApp):</strong> Envio do PDF interativo (com QR Codes clicáveis) junto a uma mensagem de boas-vindas.</li>
              <li><strong>3. Semana da Cultura Digital:</strong> Distribuição conjunta com murais, cartazes e vídeos curtos produzidos pelos próprios alunos.</li>
              <li><strong>4. Formação de Professores:</strong> Material de apoio em reuniões pedagógicas sobre o ECA Digital e a BNCC.</li>
              <li><strong>5. Rodas de Conversa em Sala:</strong> Uso da seção <em>"Conversa em casa"</em> (Pág. 5) pelo docente como roteiro de debate com as turmas.</li>
            </ul>
          </div>

          <div class="card blue">
            <span class="pill blue">Seção 7.5 • Validação do Produto</span>
            <h3>Situação Atual e Plano de Leitura Assistida</h3>
            <p style="margin-bottom:8px;"><strong>Situação Atual:</strong> Em razão do prazo da disciplina, realizou-se a <strong>verificação interna pela equipe</strong> (revisão textual, adequação ao ECA Digital/BNCC, diagramação e teste de todos os 7 QR Codes em dispositivos móveis).</p>
            <p style="margin-bottom:6px;"><strong>Plano de Validação Proposto (Etapa Futura com 3 a 5 responsáveis/professores):</strong></p>
            <ol style="padding-left:18px; font-size:13.8px; color:#334155; line-height:1.45;">
              <li>Entregar a cartilha (impressa ou PDF) para leitura livre pelo participante;</li>
              <li>Aplicar roteiro avaliativo: <em>O texto é fácil de entender? Você saberia agir diante de um risco após ler? Os QR Codes abriram corretamente? O que mudaria?</em></li>
              <li>Registrar respostas, sintetizar pontos recorrentes e ajustar a cartilha;</li>
              <li>Repetir o ciclo em uma reunião real de pais na escola.</li>
            </ol>
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — IFMS Câmpus Jardim</span>
        <span class="speaker-chip">Apresentador sugerido: Adriano • Slide 9 / 10</span>
      </div>
    </section>

    <!-- SLIDE 10: DIFICULDADES, CONCLUSÕES E PRÓXIMOS PASSOS -->
    <section class="slide" data-notes="<strong>Roteiro (Conclusão — Denner / Todos — 2 min):</strong> Para concluir: nosso principal desafio foi traduzir o vocabulário jurídico da Lei 15.211/25 para apenas 8 páginas sem perder rigor, selecionando exclusivamente canais oficiais e garantindo que os QR Codes funcionassem perfeitamente. Como limitação, registramos que o material ainda aguarda aplicação empírica em campo. Concluímos que o Guia de Bolso cumpre seu objetivo pedagógico ao conectar família, escola, ECA Digital e BNCC, reforçando o papel do futuro professor de Computação como mediador cidadão. Muito obrigado! Estamos abertos às perguntas.">
      <div class="slide-header">
        <div class="inst">9. Dificuldades, Limitações, Conclusões e Próximos Passos<span>Síntese Final do Projeto Prático (Seções 8, 9 e 10 do Relatório)</span></div>
        <div class="badge-top">CONCLUSÃO E PERGUNTAS (2 MIN)</div>
      </div>

      <div class="slide-body">
        <div class="grid-3">
          <div class="card amber">
            <span class="pill amber">Seções 8.1 e 9 • Desafios</span>
            <h3>Dificuldades e Limitações</h3>
            <ul>
              <li><strong>Tradução da linguagem jurídica:</strong> Sintetizar o ECA Digital em 8 páginas acessíveis sem perder a precisão conceitual.</li>
              <li><strong>Curadoria de links externos:</strong> Reunir apenas canais oficiais ativos (que exigem revisão periódica pela escola).</li>
              <li><strong>Ausência de teste empírico:</strong> Prazo curto impediu aplicação real com famílias antes da apresentação.</li>
            </ul>
          </div>

          <div class="card">
            <span class="pill">Seção 10 • Síntese</span>
            <h3>Conclusões do Projeto</h3>
            <ul>
              <li>O <strong>Guia de Bolso</strong> operacionaliza o ECA Digital e a Competência Geral 5 da BNCC em orientações práticas para famílias e professores.</li>
              <li>Os <strong>7 QR Codes</strong> cumprem o papel de porta de entrada rápida para fontes oficiais e canais de denúncia.</li>
              <li>Reforça o papel do <strong>Licenciado em Computação</strong> como mediador entre tecnologia, legislação e comunidade escolar.</li>
            </ul>
          </div>

          <div class="card blue">
            <span class="pill blue">Continuidade</span>
            <h3>Próximos Passos</h3>
            <ul>
              <li>Realizar a <strong>leitura assistida</strong> com pais e professores conforme o plano da Seção 7.5;</li>
              <li>Aplicar a cartilha em reuniões de pais reais e coletar devolutivas em maior escala;</li>
              <li>Detalhar códigos de habilidades específicas da BNCC por página e criar cartazes/vídeos para a <strong>Semana da Cultura Digital</strong>.</li>
            </ul>
          </div>
        </div>

        <div class="card" style="background:#0f172a; color:white; border:none; padding:16px 24px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="color:#34d399; font-size:18px; margin-bottom:4px;">Obrigado pela atenção! Estamos abertos a perguntas.</h3>
            <p style="color:#cbd5e1; font-size:13.5px;"><strong>Referências principais:</strong> Lei nº 15.211/2025 (ECA Digital) • MEC (BNCC) • MJSP (gov.br/mj) • ANPD • Secom/Gov.br • Cetic.br (TIC Kids Online) • SaferNet Brasil • UFMA.</p>
          </div>
          <div style="text-align:right; font-size:12.5px; color:#94a3b8;">
            <strong style="color:white;">Grupo 1 — Licenciatura em Computação</strong><br/>
            IFMS Câmpus Jardim • Novembro/2026
          </div>
        </div>
      </div>

      <div class="slide-footer">
        <span>Guia de Bolso: Cultura Digital com Direitos — Repositório: github.com/skyzinha-chan/guia-de-bolso-eca-digital-bncc</span>
        <span class="speaker-chip">Encerramento &amp; Perguntas • Slide 10 / 10</span>
      </div>
    </section>

  </div>

  <!-- Painel de Notas do Apresentador (Roteiro embutido) -->
  <div id="notesDrawer" class="notes-drawer"></div>

  <!-- Controles de Navegação -->
  <div class="controls">
    <button onclick="prevSlide()" title="Slide Anterior (Seta Esquerda)">◀ Anterior</button>
    <button id="slideCounter" style="background:#1e293b; cursor:default;">1 / 10</button>
    <button onclick="nextSlide()" title="Próximo Slide (Seta Direita)">Próximo ▶</button>
    <button onclick="toggleNotes()" style="background:#0284c7;" title="Mostrar/Ocultar Roteiro de Fala (Tecla N)">🎤 Roteiro (N)</button>
    <button onclick="toggleFullScreen()" style="background:#475569;" title="Tela Cheia (Tecla F)">⛶ Tela Cheia</button>
  </div>

  <script>
    const slides = Array.from(document.querySelectorAll('.slide'));
    const counter = document.getElementById('slideCounter');
    const notesDrawer = document.getElementById('notesDrawer');
    let current = 0;

    function updateSlide() {
      slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
      counter.textContent = (current + 1) + ' / ' + slides.length;
      notesDrawer.innerHTML = slides[current].getAttribute('data-notes') || '';
    }

    function nextSlide() {
      if (current < slides.length - 1) {
        current++;
        updateSlide();
      }
    }

    function prevSlide() {
      if (current > 0) {
        current--;
        updateSlide();
      }
    }

    function toggleNotes() {
      notesDrawer.classList.toggle('open');
    }

    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'n' || e.key === 'N') {
        toggleNotes();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullScreen();
      }
    });

    updateSlide();
  </script>
</body>
</html>`;

const outHtmlPath = path.join(rootDir, 'Apresentacao_Guia_de_Bolso_Slides.html');
fs.writeFileSync(outHtmlPath, htmlContent, 'utf8');
console.log('[HTML] Slides interativos gerados em:', outHtmlPath);
