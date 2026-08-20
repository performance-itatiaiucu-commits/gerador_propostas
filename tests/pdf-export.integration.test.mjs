/**
 * Teste de integração da exportação PDF (v3.0.5).
 *
 * Carrega o index.html e o src/js/script.js REAIS em um DOM (jsdom) e executa
 * o fluxo de download de verdade, com um html2pdf falso no lugar da biblioteca.
 * Assim validamos comportamento — qual elemento é capturado, em que ordem o
 * canvas é validado, o que acontece quando o canvas sai em branco — e não
 * apenas a presença de trechos de código.
 *
 * Requer jsdom. Sem ele, o teste se declara ignorado (exit 0).
 * Uso: node tests/pdf-export.integration.test.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch (_) {
  console.log('\n  Integração da exportação PDF — ignorada (jsdom não instalado)');
  console.log('  Instale com: npm i -D jsdom\n');
  process.exit(0);
}

const html = read('index.html');
const scriptSrc = read('src/js/script.js');

/* ---------- runner ---------- */
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const assert = (c, m) => { if (!c) throw new Error(m || 'asserção falhou'); };
const assertEqual = (a, e, m) => {
  if (a !== e) throw new Error(`${m || 'valores diferentes'} — esperado ${JSON.stringify(e)}, recebido ${JSON.stringify(a)}`);
};

/* ---------- ambiente ---------- */

// Canvas falso: `blank` produz uma chapa branca (o bug), senão há "tinta".
function fakeCanvas({ blank = false, width = 1466, height = 2000 } = {}) {
  return {
    width,
    height,
    getContext: () => ({
      getImageData(x, y) {
        const px = blank || y < 100 ? [255, 255, 255, 255] : [15, 42, 68, 255];
        return { data: Uint8ClampedArray.from(px) };
      }
    })
  };
}

/**
 * Monta o DOM com o script real carregado e um html2pdf instrumentado.
 * `canvasFactory` decide o canvas devolvido por toCanvas().
 */
async function boot({ canvasFactory = () => fakeCanvas(), failCanvas = false } = {}) {
  const dom = new JSDOM(html, {
    url: 'https://example.com/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    virtualConsole: new (await import('jsdom')).VirtualConsole() // silencia ruído
  });
  const { window } = dom;

  // jsdom não implementa scroll nem fontes; registramos as chamadas.
  const scrolls = [];
  window.scrollTo = (x, y) => { scrolls.push([x, y]); window.scrollX = x; window.scrollY = y; };
  window.scrollX = 0;
  window.scrollY = 0;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.confirm = () => true;

  // Registro de tudo o que a exportação faz.
  const calls = {
    from: [],
    set: [],
    toCanvas: 0,
    save: 0,
    // estado do DOM no instante da captura
    snapshotAtCapture: null,
    scrolls
  };

  const record = () => {
    const doc = window.document.getElementById('proposalDoc');
    const sticky = window.document.getElementById('previewSticky');
    calls.snapshotAtCapture = {
      targetIsProposalDoc: calls.from[0] === doc,
      hasExportClass: doc.classList.contains('pdf-export-target'),
      bodyExporting: window.document.body.classList.contains('is-exporting-pdf'),
      stickyDisplay: sticky.style.display,
      sandboxPresent: !!window.document.getElementById('pdf-export-sandbox'),
      wrapPresent: !!window.document.getElementById('pdf-export-wrap'),
      // nenhum ancestral pode estar fora da viewport
      offscreenAncestor: (() => {
        for (let el = doc; el && el.tagName !== 'HTML'; el = el.parentElement) {
          if ((el.style.left || '').includes('-10000')) return el.tagName;
        }
        return null;
      })()
    };
  };

  // Worker html2pdf falso, com a mesma superfície usada pelo script.
  function makeWorker() {
    let canvas = null;
    const worker = {
      set(opt) { calls.set.push(opt); return worker; },
      from(el) { calls.from.push(el); return worker; },
      async toCanvas() {
        calls.toCanvas++;
        record();
        if (failCanvas) throw new Error('falha simulada no html2canvas');
        canvas = canvasFactory();
        return worker;
      },
      async get(key) { return key === 'canvas' ? canvas : undefined; },
      async save() { calls.save++; return worker; }
    };
    return worker;
  }
  window.html2pdf = () => makeWorker();

  // Executa o script real da aplicação.
  window.eval(scriptSrc);

  return { dom, window, calls };
}

// Preenche o formulário com dados válidos e libera o preview.
function fillForm(window) {
  const d = window.document;
  const set = (id, v) => { const el = d.getElementById(id); el.value = v; };
  set('company', 'Empresa Teste LTDA');
  set('contractType', 'Matriz / Contrato nº 123');
  set('responsible', 'Filipe Goulart');
  set('phone', '(31) 99999-0000');
  d.getElementById('triggerPreview').click();
}

/**
 * Dispara o download e espera a exportação terminar de fato.
 * O fluxo real é assíncrono (aguarda imagens, fontes e dois requestAnimationFrame),
 * então esperamos o botão voltar ao estado ocioso em vez de contar microtasks.
 */
async function clickDownload(window, { timeout = 15000 } = {}) {
  const btn = window.document.getElementById('downloadBtn');
  const wasDisabled = btn.disabled;
  btn.click();

  const started = Date.now();
  // Se o clique nem iniciou a exportação (preview bloqueado), sai rápido.
  await new Promise((r) => setTimeout(r, 20));
  if (wasDisabled && btn.disabled) return;

  while (Date.now() - started < timeout) {
    if (!btn.disabled && !/Gerando/.test(btn.textContent)) return;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error('a exportação não terminou dentro do tempo esperado');
}

/* ---------- testes ---------- */

test('a exportação captura o #proposalDoc visível (não um clone offscreen)', async () => {
  const { window, calls } = await boot();
  fillForm(window);
  await clickDownload(window);

  assertEqual(calls.from.length, 1, 'html2pdf deve receber exatamente uma origem');
  const snap = calls.snapshotAtCapture;
  assert(snap, 'a captura deve ter ocorrido');
  assert(snap.targetIsProposalDoc, 'o elemento capturado deve ser o #proposalDoc da tela');
});

test('durante a captura nada fica fora da viewport', async () => {
  const { window, calls } = await boot();
  fillForm(window);
  await clickDownload(window);

  const snap = calls.snapshotAtCapture;
  assertEqual(snap.offscreenAncestor, null, 'nenhum ancestral pode ter left:-10000px');
  assert(!snap.sandboxPresent, '#pdf-export-sandbox não deve ser criado');
  assert(!snap.wrapPresent, '#pdf-export-wrap não deve ser criado');
});

test('durante a captura o preview está visível e com o layout de exportação', async () => {
  const { window, calls } = await boot();
  fillForm(window);
  await clickDownload(window);

  const snap = calls.snapshotAtCapture;
  assert(snap.hasExportClass, 'o documento deve receber .pdf-export-target');
  assert(snap.bodyExporting, 'o body deve receber .is-exporting-pdf');
  assertEqual(snap.stickyDisplay, 'block', 'o painel do preview deve estar visível');
});

test('a largura útil A4 de 680px é enviada ao html2canvas', async () => {
  const { window, calls } = await boot();
  fillForm(window);
  await clickDownload(window);

  const opt = calls.set.find((o) => o && o.html2canvas);
  assert(opt, 'as opções do html2canvas devem ser configuradas');
  assertEqual(opt.html2canvas.width, 680, 'width do html2canvas');
  assertEqual(opt.html2canvas.windowWidth, 680, 'windowWidth do html2canvas');
  assertEqual(opt.margin, 15, 'margem A4 em mm');
  assertEqual(opt.jsPDF.format, 'a4', 'formato do jsPDF');
});

test('o canvas é gerado e validado antes de salvar', async () => {
  const { window, calls } = await boot();
  fillForm(window);
  await clickDownload(window);

  assertEqual(calls.toCanvas, 1, 'o canvas deve ser gerado explicitamente');
  assertEqual(calls.save, 1, 'com canvas válido, o arquivo deve ser salvo');
});

test('canvas em branco ABORTA o download (o bug original)', async () => {
  const { window, calls } = await boot({ canvasFactory: () => fakeCanvas({ blank: true }) });
  fillForm(window);
  await clickDownload(window);

  assertEqual(calls.toCanvas, 1, 'o canvas foi gerado');
  assertEqual(calls.save, 0, 'NENHUM arquivo pode ser salvo a partir de um canvas em branco');
});

test('canvas sem dimensões ABORTA o download', async () => {
  const { window, calls } = await boot({ canvasFactory: () => fakeCanvas({ width: 0, height: 0 }) });
  fillForm(window);
  await clickDownload(window);
  assertEqual(calls.save, 0, 'canvas 0x0 não pode virar PDF');
});

test('o DOM é restaurado após uma exportação bem-sucedida', async () => {
  const { window } = await boot();
  fillForm(window);
  await clickDownload(window);

  const doc = window.document.getElementById('proposalDoc');
  assert(!doc.classList.contains('pdf-export-target'), '.pdf-export-target deve sair após a exportação');
  assert(!window.document.body.classList.contains('is-exporting-pdf'), '.is-exporting-pdf deve sair');
});

test('o DOM é restaurado mesmo quando a captura falha', async () => {
  const { window, calls } = await boot({ failCanvas: true });
  fillForm(window);
  await clickDownload(window);

  const doc = window.document.getElementById('proposalDoc');
  assert(!doc.classList.contains('pdf-export-target'), '.pdf-export-target deve sair mesmo com erro');
  assert(!window.document.body.classList.contains('is-exporting-pdf'), '.is-exporting-pdf deve sair mesmo com erro');
  assertEqual(calls.save, 0, 'nada é salvo quando a captura falha');
});

test('o scroll do usuário é restaurado após exportar', async () => {
  const { window, calls } = await boot();
  fillForm(window);
  window.scrollX = 0;
  window.scrollY = 420;
  await clickDownload(window);

  const last = calls.scrolls[calls.scrolls.length - 1];
  assert(last, 'window.scrollTo deve ser chamado');
  assertEqual(last[1], 420, 'a posição de scroll anterior deve ser restaurada');
});

test('o botão de download é reabilitado ao final', async () => {
  const { window } = await boot();
  fillForm(window);
  await clickDownload(window);

  const btn = window.document.getElementById('downloadBtn');
  assertEqual(btn.disabled, false, 'o botão deve voltar a ficar utilizável');
  assert(/Baixar PDF/.test(btn.textContent), 'o rótulo original deve voltar');
});

test('exportar sem preview liberado não chama o html2pdf', async () => {
  const { window, calls } = await boot();
  // sem preencher o formulário nem liberar o preview
  await clickDownload(window);
  assertEqual(calls.from.length, 0, 'a exportação não deve iniciar com preview bloqueado');
  assertEqual(calls.save, 0, 'nada deve ser salvo');
});

/* ---------- execução ---------- */

const run = async () => {
  let pass = 0;
  const failures = [];
  console.log('\n  Integração — exportação PDF em DOM real\n');

  for (const { name, fn } of tests) {
    try {
      await fn();
      pass++;
      console.log(`  \x1b[32m✓\x1b[0m ${name}`);
    } catch (err) {
      failures.push(name);
      console.log(`  \x1b[31m✗\x1b[0m ${name}`);
      console.log(`      \x1b[31m${err.message}\x1b[0m`);
    }
  }

  console.log(`\n  ${pass}/${tests.length} testes de integração passaram\n`);
  if (failures.length) process.exit(1);
};

run();
