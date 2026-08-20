/**
 * Testes da correção do PDF em branco (v3.0.5).
 *
 * Rodam sem dependências externas: um mini-runner + jsdom quando disponível.
 * Cobrem as cinco garantias da correção:
 *   1. a exportação captura diretamente o preview visível (#proposalDoc);
 *   2. não existe mais sandbox posicionado fora da viewport;
 *   3. o canvas é validado antes do download;
 *   4. a largura útil A4 é 733px;
 *   5. CSS e JS carregam com cache busting ?v=3.0.5.
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

/* ---------- 4. largura útil A4 = 733px ---------- */

test('a constante de largura útil A4 é 733px', () => {
  const m = js.match(/const A4_CONTENT_WIDTH\s*=\s*(\d+)/);
  assert(m, 'A4_CONTENT_WIDTH deve estar definida');
  assertEqual(Number(m[1]), 733, 'largura útil A4');
});

test('html2canvas recebe a largura útil A4', () => {
  const body = js.slice(js.indexOf('async function exportPDF'));
  assertMatch(body, /windowWidth:\s*A4_CONTENT_WIDTH/, 'windowWidth deve usar a largura útil');
  assertMatch(body, /width:\s*A4_CONTENT_WIDTH/, 'width deve usar a largura útil');
  assertNoMatch(body, /windowWidth:\s*1200/, 'a largura desktop de 1200px foi substituída');
});

test('o CSS de exportação aplica 733px ao documento', () => {
  const block = css.match(/#proposalDoc\.pdf-export-target\s*\{[^}]*\}/);
  assert(block, 'o bloco de exportação do #proposalDoc deve existir');
  assertMatch(block[0], /width:\s*733px/, 'a largura de exportação deve ser 733px');
  assertNoMatch(block[0], /width:\s*794px/, '794px é a folha inteira, não a largura útil');
});

test('733px corresponde a A4 menos as margens configuradas', () => {
  // 210mm @96dpi ≈ 794px; margem 8mm de cada lado ≈ 30px por lado.
  const A4_FULL = Math.round(210 * 96 / 25.4);        // 794
  const marginPx = Math.round(8 * 96 / 25.4);          // 30
  const usable = A4_FULL - marginPx * 2;               // 734
  assert(Math.abs(usable - 733) <= 1,
    `a largura útil declarada (733px) deve bater com o cálculo A4 (${usable}px)`);
  assertMatch(js, /margin:\s*8/, 'a margem do html2pdf deve continuar em 8mm');
});

/* ---------- 4b. proporção A4 (v3.0.5) ---------- */

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

/* ---------- 5. cache busting ?v=3.0.5 ---------- */

test('o CSS é carregado com ?v=3.0.5', () => {
  assertMatch(html, /href="src\/css\/style\.css\?v=3\.0\.5"/, 'cache busting do CSS');
});

test('o JS é carregado com ?v=3.0.5', () => {
  assertMatch(html, /src="src\/js\/script\.js\?v=3\.0\.5"/, 'cache busting do JS');
});

test('não restam referências sem versão aos assets locais', () => {
  assertNoMatch(html, /href="src\/css\/style\.css"/, 'CSS sem query de versão');
  assertNoMatch(html, /src="src\/js\/script\.js"/, 'JS sem query de versão');
});

test('o rodapé exibe a versão 3.0.5', () => {
  assertMatch(html, /v3\.0\.5/, 'a versão visível deve ser 3.0.5');
});

test('o CHANGELOG documenta a versão 3.0.5', () => {
  assertMatch(read('CHANGELOG.md'), /##\s*\[3\.0\.5\]/, 'entrada 3.0.5 no CHANGELOG');
});

/* ---------- integração em DOM real (jsdom, se disponível) ---------- */

test('[dom] o documento exportado fica dentro da viewport com 733px', async () => {
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
  assertEqual(link.getAttribute('href'), 'src/css/style.css?v=3.0.5', 'href do CSS');
  assertEqual(script.getAttribute('src'), 'src/js/script.js?v=3.0.5', 'src do JS');
});

/* ---------- helpers ---------- */

// Extrai assertCanvasHasContent do script real e a avalia isoladamente,
// para testar a lógica de verdade em vez de uma reimplementação.
function loadCanvasValidator() {
  const start = js.indexOf('function assertCanvasHasContent');
  assert(start > -1, 'assertCanvasHasContent não encontrada no script');
  // Encontra o fim da função equilibrando chaves.
  let depth = 0, end = -1, started = false;
  for (let i = start; i < js.length; i++) {
    if (js[i] === '{') { depth++; started = true; }
    else if (js[i] === '}') { depth--; if (started && depth === 0) { end = i + 1; break; } }
  }
  assert(end > -1, 'não foi possível delimitar assertCanvasHasContent');
  const src = js.slice(start, end);
  // eslint-disable-next-line no-new-func
  return new Function(`${src}; return assertCanvasHasContent;`)();
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

  console.log('\n  Correção do PDF em branco — v3.0.5\n');
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
