/**
 * Testes da correção do PDF em branco (v3.0.10).
 *
 * Rodam sem dependências externas: um mini-runner + jsdom quando disponível.
 * Cobrem as cinco garantias da correção:
 *   1. a exportação captura diretamente o preview visível (#proposalDoc);
 *   2. não existe mais sandbox posicionado fora da viewport;
 *   3. o canvas é validado antes do download;
 *   4. a largura útil A4 é 680px (margens 15mm);
 *   5. CSS e JS carregam com cache busting ?v=3.0.10.
 *
 * Uso: node tests/pdf-export.test.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const html = read('index.html');
const js = read('src/js/script.js');
const css = read('src/css/style.css');

/* ---------- mini test runner ---------- */
const tests = [];
const test = (name, fn) => tests.push({ name, fn });

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'asserção falhou');
}
function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'valores diferentes'} — esperado ${JSON.stringify(expected)}, recebido ${JSON.stringify(actual)}`);
  }
}
function assertMatch(str, re, msg) {
  assert(re.test(str), `${msg || 'padrão não encontrado'}: ${re}`);
}
function assertNoMatch(str, re, msg) {
  assert(!re.test(str), `${msg || 'padrão não deveria existir'}: ${re}`);
}

/* ---------- 1. captura direta do preview visível ---------- */

test('exportPDF envia o #proposalDoc visível ao html2pdf (from(proposalDoc))', () => {
  assertMatch(js, /\.from\(\s*proposalDoc\s*\)/,
    'a origem da exportação deve ser o elemento de preview visível');
  assertNoMatch(js, /\.from\(\s*wrap\s*\)/,
    'não deve mais exportar a partir de um wrapper clonado');
});

test('exportPDF não clona mais o documento para exportar', () => {
  assertNoMatch(js, /proposalDoc\.cloneNode/,
    'o clone offscreen foi removido em favor da captura direta');
});

test('exportPDF garante o preview renderizado antes de capturar', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /previewSticky\.style\.display\s*=\s*'block'/,
    'o painel de preview precisa estar visível durante a captura');
  assertMatch(body, /previewEmpty\.style\.display\s*=\s*'none'/,
    'o estado vazio precisa sair da tela durante a captura');
});

test('exportPDF aguarda imagens e fontes antes do canvas', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /await\s+waitForImages\(\s*proposalDoc\s*\)/,
    'as imagens do documento precisam estar carregadas antes da captura');
  assertMatch(body, /document\.fonts\.ready/,
    'as fontes precisam estar prontas antes da captura');
});

test('exportPDF restaura o estado da página ao final (finally)', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /finally\s*\{[\s\S]*pdf-export-target[\s\S]*\}/,
    'a classe de exportação deve ser removida mesmo em caso de erro');
  assertMatch(body, /finally\s*\{[\s\S]*window\.scrollTo\(prevScrollX, prevScrollY\)[\s\S]*\}/,
    'o scroll do usuário deve ser restaurado');
});

/* ---------- 2. sandbox fora da viewport removido ---------- */

test('não há mais sandbox de exportação no JS', () => {
  assertNoMatch(js, /pdf-export-sandbox/, 'o sandbox foi removido do JS');
  assertNoMatch(js, /pdf-export-wrap/, 'o wrapper de exportação foi removido do JS');
});

test('não há mais sandbox de exportação no CSS', () => {
  assertNoMatch(css, /#pdf-export-sandbox/, 'o sandbox foi removido do CSS');
  assertNoMatch(css, /#pdf-export-wrap/, 'o wrapper foi removido do CSS');
});

test('nenhuma regra de exportação posiciona conteúdo fora da viewport', () => {
  // left:-10000px em qualquer elemento capturado é exatamente a causa do PDF em branco.
  // Comentários explicam o bug e podem citar o valor — só as regras reais importam.
  assertNoMatch(stripComments(css), /-10000px/,
    'nenhuma regra CSS pode jogar o conteúdo exportado para fora da tela');
  assertNoMatch(stripComments(js), /-10000px/,
    'o JS não pode reposicionar o documento para fora da tela');
});

test('o alvo de exportação usa posicionamento em fluxo, não sticky', () => {
  assertMatch(css, /body\.is-exporting-pdf \.preview-sticky\s*\{\s*position:\s*static/,
    'o sticky deve virar static durante a exportação');
});

/* ---------- 3. validação do canvas antes do download ---------- */

test('existe uma função de validação de canvas', () => {
  assertMatch(js, /function assertCanvasHasContent\(canvas\)/,
    'a validação do canvas precisa existir');
});

test('o canvas é validado ANTES de save()', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  const idxToCanvas = body.indexOf('worker.toCanvas()');
  const idxAssert = body.indexOf('assertCanvasHasContent(canvas)');
  const idxSave = body.indexOf('worker.save()');
  assert(idxToCanvas > -1, 'o canvas deve ser gerado explicitamente com toCanvas()');
  assert(idxAssert > -1, 'o canvas gerado deve ser validado');
  assert(idxSave > -1, 'o arquivo deve ser salvo com save()');
  assert(idxToCanvas < idxAssert, 'a validação vem depois de gerar o canvas');
  assert(idxAssert < idxSave, 'a validação precisa ocorrer ANTES do download');
});

test('a validação rejeita canvas sem dimensões', () => {
  const fn = loadCanvasValidator();
  let threw = false;
  try { fn(null); } catch (e) { threw = true; }
  assert(threw, 'canvas nulo deve ser rejeitado');

  threw = false;
  try { fn({ width: 0, height: 0 }); } catch (e) { threw = true; }
  assert(threw, 'canvas 0x0 deve ser rejeitado');
});

test('a validação rejeita canvas totalmente branco (o bug original)', () => {
  const fn = loadCanvasValidator();
  const blank = makeFakeCanvas(800, 1100, () => [255, 255, 255, 255]);
  let msg = '';
  try { fn(blank); } catch (e) { msg = e.message; }
  assertMatch(msg, /branco/i, 'o erro deve explicar que o PDF sairia em branco');
});

test('a validação aceita canvas com conteúdo real', () => {
  const fn = loadCanvasValidator();
  // Metade branca, metade com "tinta" — documento renderizado de verdade.
  const withInk = makeFakeCanvas(800, 1100, (x, y) => (y > 400 ? [15, 42, 68, 255] : [255, 255, 255, 255]));
  fn(withInk); // não deve lançar
});

test('a validação não quebra se getImageData for bloqueado (canvas tainted)', () => {
  const fn = loadCanvasValidator();
  const tainted = {
    width: 800,
    height: 1100,
    getContext: () => ({
      getImageData() { throw new Error('SecurityError: tainted canvas'); }
    })
  };
  fn(tainted); // deve seguir o fluxo sem lançar
});

/* ---------- 4. largura útil A4 = 680px (margens 15mm) ---------- */

test('a constante de largura útil A4 é 680px', () => {
  const m = js.match(/const A4_CONTENT_WIDTH\s*=\s*(\d+)/);
  assert(m, 'A4_CONTENT_WIDTH deve estar definida');
  assertEqual(Number(m[1]), 680, 'largura útil A4');
});

test('html2canvas recebe a largura útil A4', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /windowWidth:\s*A4_CONTENT_WIDTH/, 'windowWidth deve usar a largura útil');
  assertMatch(body, /width:\s*A4_CONTENT_WIDTH/, 'width deve usar a largura útil');
  assertNoMatch(body, /windowWidth:\s*1200/, 'a largura desktop de 1200px foi substituída');
});

test('o CSS de exportação aplica 680px ao documento', () => {
  const block = css.match(/#proposalDoc\.pdf-export-target\s*\{[^}]*\}/);
  assert(block, 'o bloco de exportação do #proposalDoc deve existir');
  assertMatch(block[0], /width:\s*680px/, 'a largura de exportação deve ser 680px');
  assertNoMatch(block[0], /width:\s*794px/, '794px é a folha inteira, não a largura útil');
});

test('680px corresponde a A4 menos as margens configuradas (15mm)', () => {
  // 210mm @96dpi ≈ 794px; margem 15mm de cada lado ≈ 57px por lado.
  const A4_FULL = Math.round(210 * 96 / 25.4);        // 794
  const marginPx = Math.round(15 * 96 / 25.4);         // 57
  const usable = A4_FULL - marginPx * 2;               // 680
  assert(Math.abs(usable - 680) <= 1,
    `a largura útil declarada (680px) deve bater com o cálculo A4 (${usable}px)`);
  assertMatch(js, /const PDF_MARGIN_MM\s*=\s*15/, 'a margem do html2pdf deve ser 15mm');
});

/* ---------- 4b. proporção A4 (v3.0.10) ---------- */

test('exportPDF injeta o fix de layout do container do html2pdf (left:0)', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /html2pdf-layout-fix/, 'o id do estilo de fix deve existir');
  assertMatch(body, /\.html2pdf__container\s*\{left:\s*0!important/, 'o container deve ser fixado à esquerda');
  assertMatch(body, /\.html2pdf__overlay\s*\{left:\s*0!important/, 'o overlay deve ser fixado à esquerda');
  assertMatch(body, /getElementById\('html2pdf-layout-fix'\)/, 'o estilo deve ser removido ao final');
});

test('o avoid de quebra não inclui mais .pd-table tr (evita divs inválidos no tbody)', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertNoMatch(body, /\.pd-table tr/, 'a tabela não deve entrar no avoid de quebra');
  assertMatch(body, /avoid:\s*\[[^\]]*\.doc-header/, 'os blocos críticos continuam protegidos');
});

test('o CSS de exportação não marca .doc-items/.pd-table tr com page-break-inside', () => {
  // Extrai apenas blocos de regra (seletor + chaves + page-break-inside), sem comentários.
  const rules = css.match(/#proposalDoc\.pdf-export-target[^{]*\{[^}]*page-break-inside:\s*avoid;[^}]*\}/g) || [];
  assert(rules.length > 0, 'deve existir ao menos um bloco protegido no CSS de exportação');
  rules.forEach((r) => {
    assertNoMatch(r, /\.doc-items/, '.doc-items não pode ser evitado (causa buraco na página)');
    assertNoMatch(r, /\.pd-table tr/, '.pd-table tr não pode ser evitado (div inválido no tbody)');
  });
  const combined = rules.join('');
  assertMatch(combined, /\.doc-totals/, 'os totais continuam protegidos');
  assertMatch(combined, /\.doc-accept/, 'o aceite continua protegido');
});

test('nenhuma regra do CSS marca .doc-items/.pd-table tr com page-break-inside', () => {
  // Varre TODOS os blocos de regra com page-break-inside: avoid (exportação E impressão).
  // stripComments evita que os comentários explicativos (que citam os seletores) contaminem a checagem.
  const cleanCss = stripComments(css);
  const rules = cleanCss.match(/[^{}]*\{[^}]*page-break-inside:\s*avoid;[^}]*\}/g) || [];
  assert(rules.length > 0, 'deve haver blocos protegidos no CSS');
  rules.forEach((r) => {
    assertNoMatch(r, /\.doc-items/, '.doc-items não pode ser evitado em nenhuma regra');
    assertNoMatch(r, /\.pd-table tr/, '.pd-table tr não pode ser evitado em nenhuma regra');
  });
  const combined = rules.join('');
  assertMatch(combined, /\.doc-totals/, 'os totais continuam protegidos');
  assertMatch(combined, /\.doc-accept/, 'o aceite continua protegido');
});

/* ---------- 5. cache busting ?v=3.0.10 ---------- */

test('o CSS é carregado com ?v=3.0.10', () => {
  assertMatch(html, /href="src\/css\/style\.css\?v=3\.0\.10"/, 'cache busting do CSS');
});

test('o JS é carregado com ?v=3.0.10', () => {
  assertMatch(html, /src="src\/js\/script\.js\?v=3\.0\.10"/, 'cache busting do JS');
});

test('não restam referências sem versão aos assets locais', () => {
  assertNoMatch(html, /href="src\/css\/style\.css"/, 'CSS sem query de versão');
  assertNoMatch(html, /src="src\/js\/script\.js"/, 'JS sem query de versão');
});

test('o rodapé exibe a versão 3.0.10', () => {
  assertMatch(html, /v3\.0\.10/, 'a versão visível deve ser 3.0.10');
});

test('o CHANGELOG documenta a versão 3.0.10', () => {
  assertMatch(read('CHANGELOG.md'), /##\s*\[3\.0\.10\]/, 'entrada 3.0.10 no CHANGELOG');
});


/* ---------- 5b. campos de assinatura (v3.0.10) ---------- */

test('o formulário tem campos de assinatura para Performance Ocupacional e empresa cliente', () => {
  assertMatch(html, /id="sigPerformance"/, 'campo Performance Ocupacional');
  assertMatch(html, /id="sigClient"/, 'campo empresa cliente');
  assertMatch(html, /value="PERFORMANCE SAÚDE E SEGURANCA OCUPACIONAL LTDA"/,
    'a razão social da Performance vem pré-preenchida');
});

test('o documento tem duas linhas de assinatura com os nomes configuráveis', () => {
  assertMatch(html, /id="pd_sig_performance"/, 'nome Performance Ocupacional no documento');
  assertMatch(html, /id="pd_sig_client"/, 'nome da empresa cliente no documento');
  assertMatch(html, /id="docSignatures"/, 'bloco de assinaturas');
});

test('o PDF mantém as duas assinaturas lado a lado mesmo no viewport de 680px', () => {
  const exportRule = css.match(/#proposalDoc\.pdf-export-target \.doc-signatures\s*\{[^}]*\}/);
  assert(exportRule, 'deve existir uma regra específica para as assinaturas no alvo do PDF');
  assertMatch(exportRule[0], /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
    'o breakpoint mobile não pode empilhar e ocultar a assinatura do cliente no PDF');
});

test('a empresa cliente é preenchida automaticamente a partir do campo Empresa', () => {
  assertMatch(js, /function syncSigClientFromCompany/, 'função de preenchimento automático');
  assertMatch(js, /sigClient\.value\s*=\s*\(company\.value/, 'copia o nome da empresa');
  assertMatch(js, /sigClientManual/, 'respeita edição manual do campo');
});

test('buildPreview aplica os dois nomes de assinatura no documento', () => {
  const body = js.slice(js.indexOf('function buildPreview'));
  assertMatch(body, /pd_sig_performance\.textContent/, 'preenche Performance Ocupacional no PDF');
  assertMatch(body, /pd_sig_client\.textContent/, 'preenche empresa cliente no PDF');
});

test('o rascunho persiste os campos de assinatura', () => {
  assertMatch(js, /sigPerformance:\s*sigPerformance/, 'salva Performance Ocupacional');
  assertMatch(js, /sigClient:\s*sigClient/, 'salva empresa cliente');
});

test('a assinatura da Performance usa a razão social completa', () => {
  assertMatch(js, /const DEFAULT_SIG_PERFORMANCE = 'PERFORMANCE SAÚDE E SEGURANCA OCUPACIONAL LTDA'/,
    'padrão do JS com a razão social');
  assertMatch(html, /id="pd_sig_performance">PERFORMANCE SAÚDE E SEGURANCA OCUPACIONAL LTDA</,
    'documento (preview/PDF) com a razão social');
  assertMatch(js, /function normalizeSigPerformance/, 'migração dos rascunhos antigos');
});

/* ---------- 6. rodapé paginado e quebra condicional (v3.0.10) ---------- */

test('existe a função de carimbo do rodapé paginado', () => {
  assertMatch(js, /function stampPdfFooters\(pdf, info/,
    'stampPdfFooters precisa existir');
});

test('o rodapé é carimbado entre toPdf() e save()', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  const idxToPdf = body.indexOf('worker.toPdf()');
  const idxStamp = body.indexOf('stampPdfFooters(pdf');
  const idxSave = body.indexOf('worker.save()');
  assert(idxToPdf > -1, 'a paginação precisa ser disparada com toPdf()');
  assert(idxStamp > -1, 'o rodapé precisa ser carimbado');
  assert(idxToPdf < idxStamp, 'sem toPdf() não existe total de páginas para carimbar');
  assert(idxStamp < idxSave, 'o carimbo precisa ocorrer ANTES do save()');
});

test('o carimbo escreve "Página X de Y" em TODAS as páginas', () => {
  const stamp = loadFn('stampPdfFooters', ['PDF_MARGIN_MM', 'A4_PAGE_WIDTH_MM', 'A4_PAGE_HEIGHT_MM']);
  const pdf = makeFakePdf(3);
  const total = stamp(pdf, { leftText: 'Proposta Nº PC-2026-0007' });

  assertEqual(total, 3, 'o total de páginas deve ser devolvido');
  assertEqual(pdf.pagesVisited.join(','), '1,2,3', 'todas as páginas devem ser visitadas');
  [1, 2, 3].forEach((n) => {
    const texts = pdf.textsByPage[n] || [];
    assert(texts.some((t) => t.text === `Página ${n} de 3`),
      `a página ${n} deve receber "Página ${n} de 3" (recebeu: ${JSON.stringify(texts.map((t) => t.text))})`);
    assert(texts.some((t) => /Proposta Nº PC-2026-0007/.test(t.text)),
      `a página ${n} deve identificar a proposta`);
  });
});

test('o rodapé fica dentro da folha A4 (não invade nem estoura a margem)', () => {
  const stamp = loadFn('stampPdfFooters', ['PDF_MARGIN_MM', 'A4_PAGE_WIDTH_MM', 'A4_PAGE_HEIGHT_MM']);
  const pdf = makeFakePdf(1);
  stamp(pdf, {});
  const texts = pdf.textsByPage[1];
  texts.forEach((t) => {
    assert(t.y > 297 - 15 && t.y < 297,
      `o rodapé deve ficar na margem inferior (y=${t.y})`);
    assert(t.x >= 15 && t.x <= 210 - 15,
      `o rodapé deve respeitar as margens laterais (x=${t.x})`);
  });
});

test('o carimbo grava os metadados do PDF', () => {
  const stamp = loadFn('stampPdfFooters', ['PDF_MARGIN_MM', 'A4_PAGE_WIDTH_MM', 'A4_PAGE_HEIGHT_MM']);
  const pdf = makeFakePdf(1);
  stamp(pdf, { title: 'Proposta Comercial PC-1 — ACME' });
  assert(pdf.properties, 'setProperties deve ser chamado');
  assertMatch(pdf.properties.title, /Proposta Comercial/, 'título do arquivo');
  assertEqual(pdf.properties.author, 'Grupo Performance Ocupacional', 'autor do arquivo');
});

test('o carimbo nunca derruba a exportação (jsPDF mínimo ou com erro)', () => {
  const stamp = loadFn('stampPdfFooters', ['PDF_MARGIN_MM', 'A4_PAGE_WIDTH_MM', 'A4_PAGE_HEIGHT_MM']);
  assertEqual(stamp(null, {}), 0, 'pdf ausente deve ser ignorado');
  assertEqual(stamp({}, {}), 0, 'pdf sem internal deve ser ignorado');

  // jsPDF sem setProperties e com text() que lança: não pode propagar erro.
  const hostile = {
    internal: { getNumberOfPages: () => 2, pageSize: { width: 210, height: 297 } },
    setPage() {},
    text() { throw new Error('sem suporte'); }
  };
  assertEqual(stamp(hostile, {}), 2, 'o fluxo continua mesmo se o texto falhar');
});

test('a quebra antes das assinaturas é condicional (função de medida)', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(js, /function needsPageBreakBeforeSignatures/,
    'a decisão de quebra precisa ser calculada');
  assertMatch(body, /before:\s*breakBeforeSignatures\s*\?\s*\['\.doc-signatures'\]\s*:\s*\[\]/,
    'o before só deve conter as assinaturas quando a quebra for necessária');
  assertNoMatch(body, /before:\s*\['\.doc-signatures'\]/,
    'a quebra incondicional da v3.0.6 foi substituída');
});

test('a medida decide certo: cabe → sem quebra; não cabe → quebra', () => {
  const fits = loadFn('needsPageBreakBeforeSignatures', ['A4_CONTENT_HEIGHT_PX', 'PAGE_FIT_TOLERANCE_PX']);
  const PAGE = 1008;
  const doc = { getBoundingClientRect: () => ({ top: 0 }) };
  const sigAt = (top, height) => ({ getBoundingClientRect: () => ({ top, height }) });

  // Proposta curta: assinaturas a 500px do topo, bloco de 200px → sobram 508px.
  assertEqual(fits(doc, sigAt(500, 200), PAGE), false, 'cabendo na página, não deve quebrar');
  // Assinaturas quase no fim da página: sobram 58px para um bloco de 200px.
  assertEqual(fits(doc, sigAt(950, 200), PAGE), true, 'sem espaço, deve quebrar');
  // Segunda página: 1200 % 1008 = 192px usados, sobram 816px.
  assertEqual(fits(doc, sigAt(1200, 200), PAGE), false, 'a conta vale para qualquer página');
  // Bloco maior que a folha inteira: quebrar não resolveria.
  assertEqual(fits(doc, sigAt(300, 1200), PAGE), false, 'bloco gigante não ganha quebra inútil');
  // Sem medidas confiáveis, mantém o comportamento seguro.
  assertEqual(fits(doc, sigAt(0, 0), PAGE), true, 'sem altura medida, quebra por segurança');
  assertEqual(fits(doc, null, PAGE), true, 'sem elemento, quebra por segurança');
});

test('a altura útil da página bate com o A4 (297mm − 2×15mm)', () => {
  const m = js.match(/const A4_CONTENT_HEIGHT_PX\s*=\s*Math\.floor\(([^;]+)\);/);
  assert(m, 'A4_CONTENT_HEIGHT_PX deve ser derivada, não um número mágico');
  const mmPerPx = (210 - 15 * 2) / 680;
  const expected = Math.floor((297 - 15 * 2) / mmPerPx);
  assert(Math.abs(expected - 1008) <= 2, `altura útil esperada ≈1008px (calculado ${expected})`);
});

test('o CSS só quebra a página com a classe .force-signature-break', () => {
  assertMatch(css, /#proposalDoc\.pdf-export-target\.force-signature-break \.doc-signatures\s*\{[^}]*page-break-before:\s*always/,
    'a quebra deve depender da classe aplicada pelo JS');
  const unconditional = stripComments(css)
    .match(/#proposalDoc\.pdf-export-target \.doc-signatures\s*\{[^}]*\}/g) || [];
  unconditional.forEach((r) => {
    assertNoMatch(r, /page-break-before:\s*always/,
      'não pode restar quebra incondicional antes das assinaturas');
  });
  assertMatch(js, /classList\.toggle\('force-signature-break'/, 'o JS liga/desliga a classe');
  assertMatch(js, /classList\.remove\('force-signature-break'\)/, 'a classe deve ser limpa no finally');
});

test('a impressão nativa não desperdiça uma folha com as assinaturas', () => {
  // Recorta apenas o bloco @media print (o CSS de exportação vem depois dele).
  const printStart = css.indexOf('@media print');
  const printBlock = css.slice(printStart, css.indexOf('#proposalDoc.pdf-export-target', printStart));
  const rule = stripComments(printBlock).match(/\.doc-signatures\s*\{[^}]*\}/g) || [];
  rule.forEach((r) => {
    assertNoMatch(r, /page-break-before:\s*always/,
      'o fallback de impressão também deixou de forçar página nova');
  });
});

test('o PDF é gerado comprimido', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /jsPDF:\s*\{[^}]*compress:\s*true/, 'compress: true reduz o tamanho do arquivo');
});

test('a margem do PDF usa a constante compartilhada', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /margin:\s*PDF_MARGIN_MM/, 'a margem deve vir da constante');
  assertMatch(js, /const PDF_MARGIN_MM\s*=\s*15/, 'PDF_MARGIN_MM = 15mm');
});

test('o .gitignore ignora node_modules e artefatos locais', () => {
  const ignore = read('.gitignore');
  assertNoMatch(ignore, /^\(empty\)$/m, 'o placeholder "(empty)" foi substituído por regras reais');
  assertMatch(ignore, /^node_modules\/$/m, 'node_modules deve ser ignorado (jsdom dos testes)');
  assertMatch(ignore, /\.DS_Store/, 'artefatos de SO devem ser ignorados');
});

/* ---------- integração em DOM real (jsdom, se disponível) ---------- */


test('[dom] o documento exportado fica dentro da viewport com 680px', async () => {
  const dom = await makeDom();
  if (!dom) return skip('jsdom indisponível');
  const { document } = dom.window;

  const doc = document.getElementById('proposalDoc');
  assert(doc, '#proposalDoc deve existir no index.html');

  // Simula o que exportPDF faz com o DOM.
  document.getElementById('previewSticky').style.display = 'block';
  document.body.classList.add('is-exporting-pdf');
  doc.classList.add('pdf-export-target');

  assert(doc.classList.contains('pdf-export-target'), 'a classe de exportação é aplicada');

  // Nenhum ancestral pode empurrar o elemento para fora da tela.
  for (let el = doc; el && el.tagName !== 'HTML'; el = el.parentElement) {
    const left = el.style.left || '';
    assert(!left.includes('-10000'), `ancestral <${el.tagName.toLowerCase()}> fora da viewport`);
  }

  // O sandbox não deve ser criado em lugar nenhum.
  assertEqual(document.getElementById('pdf-export-sandbox'), null, 'sandbox não existe');
  assertEqual(document.getElementById('pdf-export-wrap'), null, 'wrapper não existe');
});

test('[dom] index.html referencia CSS e JS versionados', async () => {
  const dom = await makeDom();
  if (!dom) return skip('jsdom indisponível');
  const { document } = dom.window;

  const link = document.querySelector('link[href^="src/css/style.css"]');
  const script = document.querySelector('script[src^="src/js/script.js"]');
  assert(link, 'o CSS local deve estar referenciado');
  assert(script, 'o JS local deve estar referenciado');
  assertEqual(link.getAttribute('href'), 'src/css/style.css?v=3.0.10', 'href do CSS');
  assertEqual(script.getAttribute('src'), 'src/js/script.js?v=3.0.10', 'src do JS');
});

/* ---------- helpers ---------- */

// Extrai assertCanvasHasContent do script real e a avalia isoladamente,
// para testar a lógica de verdade em vez de uma reimplementação.
function loadCanvasValidator() {
  return loadFn('assertCanvasHasContent');
}

// Extrai uma função do script real (pelo nome) e a avalia isolada, junto com as
// constantes de que ela depende. Testa o código de produção, não uma cópia.
function loadFn(name, constants = []) {
  const src = extractFn(name);
  const seen = new Set();
  const consts = constants.map((c) => extractConst(c, seen)).join('\n');
  // eslint-disable-next-line no-new-func
  return new Function(`${consts}\n${src}\n; return ${name};`)();
}

function extractFn(name) {
  const start = js.indexOf(`function ${name}(`);
  assert(start > -1, `${name} não encontrada no script`);

  // Pula a lista de parâmetros: valores default como `info = {}` têm chaves
  // próprias e enganariam o contador do corpo da função.
  let i = js.indexOf('(', start);
  let parens = 0;
  for (; i < js.length; i++) {
    if (js[i] === '(') parens++;
    else if (js[i] === ')') { parens--; if (parens === 0) { i++; break; } }
  }

  let depth = 0, end = -1, started = false;
  for (; i < js.length; i++) {
    if (js[i] === '{') { depth++; started = true; }
    else if (js[i] === '}') { depth--; if (started && depth === 0) { end = i + 1; break; } }
  }
  assert(end > -1, `não foi possível delimitar ${name}`);
  return js.slice(start, end);
}

function extractConst(name, seen = new Set()) {
  if (seen.has(name)) return '';
  seen.add(name);
  const m = js.match(new RegExp(`const ${name}\\s*=[^;]+;`));
  assert(m, `constante ${name} não encontrada`);
  // Constantes podem depender de outras: resolve recursivamente as conhecidas.
  const deps = ['A4_PAGE_WIDTH_MM', 'A4_PAGE_HEIGHT_MM', 'PDF_MARGIN_MM', 'A4_CONTENT_WIDTH', 'MM_PER_PX']
    .filter((d) => d !== name && new RegExp(`\\b${d}\\b`).test(m[0]));
  return [...deps.map((d) => extractConst(d, seen)), m[0]].filter(Boolean).join('\n');
}

// jsPDF falso: registra páginas visitadas, textos e metadados.
function makeFakePdf(pages = 1) {
  const pdf = {
    pagesVisited: [],
    textsByPage: {},
    properties: null,
    current: 1,
    internal: {
      getNumberOfPages: () => pages,
      pageSize: { getWidth: () => 210, getHeight: () => 297 }
    },
    setPage(n) { pdf.current = n; pdf.pagesVisited.push(n); },
    setFont() {},
    setFontSize() {},
    setTextColor() {},
    text(text, x, y, opts) {
      (pdf.textsByPage[pdf.current] = pdf.textsByPage[pdf.current] || []).push({ text, x, y, opts });
    },
    setProperties(p) { pdf.properties = p; }
  };
  return pdf;
}

// Remove comentários /* */ e // para que asserções olhem só o código efetivo.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

// Canvas falso com getImageData baseado numa função de cor por pixel.
function makeFakeCanvas(width, height, colorAt) {
  return {
    width,
    height,
    getContext: () => ({
      getImageData(x, y) {
        return { data: Uint8ClampedArray.from(colorAt(x, y)) };
      }
    })
  };
}

let jsdomModule;
let jsdomTried = false;
async function makeDom() {
  if (!jsdomTried) {
    jsdomTried = true;
    try { jsdomModule = await import('jsdom'); } catch (_) { jsdomModule = null; }
  }
  if (!jsdomModule) return null;
  return new jsdomModule.JSDOM(html, { url: 'https://example.com/' });
}

let skipped = 0;
function skip(reason) {
  skipped++;
  process.stdout.write(`    ↳ ignorado (${reason})\n`);
}

/* ---------- execução ---------- */

const run = async () => {
  let pass = 0;
  const failures = [];

  console.log('\n  Correção do PDF em branco — v3.0.10\n');
  for (const { name, fn } of tests) {
    try {
      await fn();
      pass++;
      console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } catch (err) {
      failures.push({ name, err });
      console.log(`  \x1b[31m✗\x1b[0m ${name}`);
      console.log(`      \x1b[31m${err.message}\x1b[0m`);
    }
  }

  console.log(`\n  ${pass}/${tests.length} testes passaram${skipped ? ` (${skipped} verificação(ões) de DOM ignorada(s))` : ''}\n`);
  if (failures.length) process.exit(1);
};

run();
