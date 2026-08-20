// Gerador de Proposta 3.0 Corporativo
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

/* Elements */
const proposalDate = $('#proposalDate');
const docDate = $('#docDate');
const docNumber = $('#docNumber');
const docNumberLabel = $('#docNumberLabel');
const footerDate = $('#footerDate');
const progressFill = $('#progressFill');

const wizardSteps = $$('.wizard-step');
const formSteps = $$('.step');

const company = $('#company');
const contractType = $('#contractType');
const responsible = $('#responsible');
const phone = $('#phone');
const email = $('#email');
const taxId = $('#taxId');
const address = $('#address');
const city = $('#city');
const stateEl = $('#state');
const notes = $('#notes');
const notesCount = $('#notesCount');
const clientLogoInput = $('#clientLogo');
const fileLabelText = $('#fileLabelText');
const fileHint = $('#fileHint');

const itemsBody = $('#itemsBody');
const addItemBtn = $('#addItem');
const discountEl = $('#discount');
const totalDisplay = $('#totalDisplay');

const paymentMethod = $('#paymentMethod');
const billingDays = $('#billingDays');
const billingDaysInput = $('#billingDaysInput');
const leadTime = $('#leadTime');

const saveDraftBtn = $('#saveDraft');
const loadDraftBtn = $('#loadDraft');
const clearDraftBtn = $('#clearDraft');
const downloadBtn = $('#downloadBtn');
const triggerPreviewBtn = $('#triggerPreview');

const docLogo = $('#docLogo');
const pd_company = $('#pd_company');
const pd_client_logo = $('#pd_client_logo');
const pd_contact = $('#pd_contact');
const pd_contract = $('#pd_contract');
const pd_email = $('#pd_email');
const pd_items = $('#pd_items tbody');
const pd_subtotal = $('#pd_subtotal');
const pd_discount_value = $('#pd_discount_value');
const pd_discount_pct = $('#pd_discount_pct');
const pd_total = $('#pd_total');
const additionalInfo = $('#additionalInfo');
const pd_sig_client = $('#pd_sig_client');

const previewEmpty = $('#previewEmpty');
const previewSticky = $('#previewSticky');
const previewColumn = $('#previewColumn');
const proposalDoc = $('#proposalDoc');

let previewUnlocked = false;

/* Dates & doc number */
const now = new Date();
const fmtDate = now.toLocaleDateString('pt-BR');
proposalDate.textContent = fmtDate;
docDate.textContent = fmtDate;
footerDate.textContent = fmtDate;
function genDocNumber(){
  const d = new Date();
  const y = d.getFullYear();
  const rand = Math.floor(100+Math.random()*900);
  return `PROP-${y}-${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${rand}`;
}
let currentDocNumber = genDocNumber();
docNumber.textContent = currentDocNumber;
docNumberLabel.textContent = currentDocNumber;

/* Wizard */
function setStep(step){
  wizardSteps.forEach(b=> b.classList.toggle('active', b.dataset.step===String(step)));
  formSteps.forEach(s=> s.style.display = s.dataset.step===String(step) ? 'block' : 'none');
  const pct = (Number(step)/4)*100;
  progressFill.style.width = pct+'%';
  // update review summary when going to 4
  if(String(step)==='4') updateReviewSummary();
  window.scrollTo({top:0, behavior:'smooth'});
}
wizardSteps.forEach(btn=> btn.addEventListener('click', ()=> setStep(btn.dataset.step)));
$$('.next-step').forEach(btn=> btn.addEventListener('click', e=>{ e.preventDefault(); setStep(btn.dataset.next); }));
$$('.prev-step').forEach(btn=> btn.addEventListener('click', e=>{ e.preventDefault(); setStep(btn.dataset.prev); }));

function updateReviewSummary(){
  $('#review_company').textContent = company.value || '—';
  const contact = (responsible.value||'—') + (phone.value ? ' • '+phone.value : '');
  $('#review_contact').textContent = contact;
  $('#review_contract').textContent = contractType.value || '—';
  const total = totalDisplay ? totalDisplay.textContent : '0,00';
  $('#review_total').textContent = 'R$ '+ total;
}

/* Items */
function escapeHtml(str){
  return (str||'').replace(/[&<>"']/g, s=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
function createItemRow(data={desc:'', qty:1, unit:0}){
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="idx"></td>
    <td><input class="desc" type="text" value="${escapeHtml(data.desc)}" placeholder="Descrição"></td>
    <td><input class="qty" type="number" min="0" step="1" value="${Number(data.qty)||0}" style="width:100%"></td>
    <td><input class="unit" type="number" min="0" step="0.01" value="${Number(data.unit)||0}" style="width:100%"></td>
    <td class="subtotal right">0,00</td>
    <td><button type="button" class="btn ghost remove" title="Remover"><i class="fa-solid fa-trash"></i></button></td>
  `;
  itemsBody.appendChild(tr);
  $$('.desc, .qty, .unit', tr).forEach(i=> i.addEventListener('input', updateTotals));
  $('.remove', tr).addEventListener('click', ()=>{ tr.remove(); renumber(); updateTotals(); if(previewUnlocked) buildPreview(); });
  renumber(); updateTotals();
}
function renumber(){ $$('.items-table tbody tr').forEach((tr,i)=> $('.idx', tr).textContent = i+1); }
function getItems(){
  return $$('.items-table tbody tr').map(tr=> {
    const desc = $('.desc', tr).value.trim();
    const qty = Number($('.qty', tr).value)||0;
    const unit = Number($('.unit', tr).value)||0;
    const subtotal = Math.round(qty*unit*100)/100;
    return {desc, qty, unit, subtotal};
  });
}
function updateTotals(){
  const items = getItems();
  let totalCents=0;
  items.forEach((it,idx)=>{
    const cents = Math.round(it.subtotal*100);
    totalCents+=cents;
    const disp=(cents/100).toFixed(2).replace('.',',');
    if(itemsBody.children[idx]) itemsBody.children[idx].querySelector('.subtotal').textContent=disp;
  });
  const total= totalCents/100;
  const discountPct= Math.min(Math.max(Number(discountEl.value)||0,0),100);
  const discountValue= Math.round(total*(discountPct/100)*100)/100;
  const totalAfter= Math.round((total-discountValue)*100)/100;
  totalDisplay.textContent = totalAfter.toFixed(2).replace('.',',');
  if(previewUnlocked) buildPreview();
  updateReviewSummary();
}
createItemRow({desc:'Treinamento NR-06', qty:1, unit:350.00});
createItemRow({desc:'Exames ocupacionais', qty:3, unit:120.00});
addItemBtn.addEventListener('click', ()=> createItemRow());
discountEl.addEventListener('input', updateTotals);
paymentMethod.addEventListener('change', ()=>{ billingDays.style.display = paymentMethod.value==='Faturamento' ? 'block' : 'none'; if(previewUnlocked) buildPreview(); });
billingDaysInput.addEventListener('input', ()=>{ if(previewUnlocked) buildPreview(); });
leadTime.addEventListener('input', ()=>{ if(previewUnlocked) buildPreview(); });

/* Logo upload com validação 2MB — 96px (máx. 270px) no preview e no PDF */
let clientLogoData='';
const MAX_LOGO_BYTES = 2*1024*1024;
function applyClientLogo(){
  if(!pd_client_logo) return;
  const clientKv = proposalDoc ? proposalDoc.querySelector('.doc-client-kv') : null;
  if(clientLogoData){
    pd_client_logo.src = clientLogoData;
    pd_client_logo.hidden = false;
    pd_client_logo.classList.add('is-visible');
    pd_client_logo.style.display = 'inline-block';
    if(clientKv) clientKv.classList.add('logo-present');
  } else {
    pd_client_logo.removeAttribute('src');
    pd_client_logo.hidden = true;
    pd_client_logo.classList.remove('is-visible');
    pd_client_logo.style.display = 'none';
    if(clientKv) clientKv.classList.remove('logo-present');
  }
}
clientLogoInput.addEventListener('change', e=>{
  const file = e.target.files && e.target.files[0];
  if(!file) return;
  if(!['image/png','image/jpeg','image/webp','image/jpg'].includes(file.type)){
    showNotification('Formato inválido. Use PNG ou JPG.', 'error'); e.target.value=''; return;
  }
  if(file.size > MAX_LOGO_BYTES){ showNotification('Arquivo muito grande (máx 2MB).', 'error'); e.target.value=''; return; }
  fileLabelText.textContent = file.name;
  fileHint.textContent = `${file.name} • ${(file.size/1024).toFixed(0)} KB`;
  const reader = new FileReader();
  reader.onload = ()=>{ clientLogoData = reader.result; applyClientLogo(); if(previewUnlocked) buildPreview(); };
  reader.readAsDataURL(file);
});

/* Notes counter */
notes.addEventListener('input', ()=>{ notesCount.textContent = notes.value.length; });

/* Build preview (corporativo) */
function buildPreview(){
  pd_company.textContent = company.value || '—';
  pd_contact.textContent = (responsible.value ? responsible.value : '—') + (phone.value ? ' • '+phone.value : '');
  pd_contract.textContent = contractType.value || '—';
  pd_email.textContent = email.value || '—';

  applyClientLogo();
  if(pd_sig_client){
    pd_sig_client.textContent = company.value.trim() || '—';
  }

  // additional info
  let html='';
  if(taxId.value || address.value || city.value || stateEl.value){
    html='<div class="doc-kv" style="margin-top:10px">';
    if(taxId.value) html+=`<div><span class="kv-key">CNPJ/CPF</span><div>${escapeHtml(taxId.value)}</div></div>`;
    if(address.value) html+=`<div><span class="kv-key">Endereço</span><div>${escapeHtml(address.value)}</div></div>`;
    if(city.value || stateEl.value) html+=`<div><span class="kv-key">Cidade/UF</span><div>${escapeHtml(city.value + (city.value && stateEl.value ? '/' : '') + stateEl.value)}</div></div>`;
    html+='</div>';
  }
  additionalInfo.innerHTML = html;

  // remove old payment section
  const existing = document.querySelector('.payment-info-section');
  if(existing) existing.remove();
  let paymentText = paymentMethod.value || '—';
  if(paymentMethod.value==='Faturamento' && billingDaysInput.value.trim()){
    const billingTerm = billingDaysInput.value.trim();
    paymentText = `Faturamento em ${billingTerm}${/dias?$/i.test(billingTerm) ? '' : ' dias'}`;
  }
  if(paymentMethod.value || leadTime.value){
    const sec = `<div class="doc-kv payment-info-section" style="margin-top:10px"><div><span class="kv-key">Forma de Pagamento</span><div>${escapeHtml(paymentText)}</div></div><div><span class="kv-key">Prazo de Entrega</span><div>${escapeHtml(leadTime.value || 'A combinar')}</div></div></div>`;
    additionalInfo.insertAdjacentHTML('afterend', sec);
  }

  const items = getItems();
  pd_items.innerHTML = items.map(it=> `<tr><td>${escapeHtml(it.desc)||'—'}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">R$ ${it.unit.toFixed(2).replace('.',',')}</td><td style="text-align:right">R$ ${it.subtotal.toFixed(2).replace('.',',')}</td></tr>`).join('') || `<tr><td colspan="4" style="text-align:center;color:var(--muted)">Nenhum item adicionado</td></tr>`;

  const subtotal = items.reduce((s,it)=> s+it.subtotal, 0);
  const discountPct= Math.min(Math.max(Number(discountEl.value)||0,0),100);
  const discountVal= Math.round(subtotal*(discountPct/100)*100)/100;
  const total= Math.round((subtotal-discountVal)*100)/100;
  pd_subtotal.textContent = subtotal.toFixed(2).replace('.',',');
  pd_discount_value.textContent = discountVal.toFixed(2).replace('.',',');
  pd_discount_pct.textContent = String(discountPct);
  pd_total.textContent = total.toFixed(2).replace('.',',');

  docNumber.textContent = currentDocNumber;
  docNumberLabel.textContent = currentDocNumber;
  if(!clientLogoData) docLogo.src = $('#brandLogo').src;
}

/* Preview controlado: só libera ao final */
function validateRequired(showToast=true){
  const required = [company, contractType, responsible, phone];
  let ok=true;
  required.forEach(f=>{
    clearValidation(f);
    if(!f.value.trim()){ showError(f, 'Obrigatório'); ok=false; }
  });
  if(!ok && showToast) showNotification('Preencha os campos obrigatórios (Empresa, Unidade, Responsável, Telefone).', 'error');
  // valida itens: ao menos 1 com descrição
  const items = getItems();
  const hasItem = items.some(i=> i.desc && i.qty>0);
  if(!hasItem){ if(showToast) showNotification('Adicione ao menos um item válido.', 'warning'); ok=false; }
  return ok;
}
function revealPreview(){
  if(!validateRequired()) return;
  buildPreview();
  previewEmpty.style.display='none';
  previewSticky.style.display='block';
  previewUnlocked = true;
  downloadBtn.disabled = false;
  downloadBtn.title = 'Baixar PDF da proposta';
  // scroll to preview on mobile
  if(window.innerWidth<1100){ previewColumn.scrollIntoView({behavior:'smooth', block:'start'}); }
  showNotification('Preview corporativo liberado. Confira e clique em Baixar PDF.', 'success');
}

function lockPreview(){
  previewEmpty.style.display='block';
  previewSticky.style.display='none';
  previewUnlocked=false;
  downloadBtn.disabled=true;
}

/* Storage 3.0 */
const STORAGE_KEY = 'performance_proposal_draft_v3';
saveDraftBtn.addEventListener('click', ()=>{
  if(!validateRequired()) return;
  const payload={
    meta:{savedAt:new Date().toISOString(), version:'3.0', docNumber: currentDocNumber},
    company:company.value, contractType:contractType.value, responsible:responsible.value, phone:phone.value,
    email:email.value, taxId:taxId.value, address:address.value, city:city.value, state:stateEl.value, notes:notes.value,
    logo:clientLogoData, items:getItems(), discount:discountEl.value, payment:paymentMethod.value, billingDays:billingDaysInput.value, leadTime:leadTime.value
  };
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    saveDraftBtn.innerHTML='<i class="fa-solid fa-check"></i> Salvo!';
    saveDraftBtn.classList.add('saved');
    setTimeout(()=>{ saveDraftBtn.innerHTML='<i class="fa-regular fa-floppy-disk"></i> Salvar'; saveDraftBtn.classList.remove('saved'); },2000);
    showNotification('Rascunho salvo (v3.0).', 'success');
  }catch(e){ showNotification('Erro ao salvar. LocalStorage cheio.', 'error'); }
});

function loadDraftInternal(silent=false){
  const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('performance_proposal_draft_v1');
  if(!raw){ if(!silent) showNotification('Nenhum rascunho encontrado.', 'info'); return false; }
  try{
    const d=JSON.parse(raw);
    company.value=d.company||''; contractType.value=d.contractType||''; responsible.value=d.responsible||''; phone.value=d.phone||'';
    email.value=d.email||''; taxId.value=d.taxId||''; address.value=d.address||''; city.value=d.city||''; stateEl.value=d.state||''; notes.value=d.notes||''; if(notesCount) notesCount.textContent=(d.notes||'').length;
    discountEl.value=d.discount||0; paymentMethod.value=d.payment||'À vista'; paymentMethod.dispatchEvent(new Event('change')); billingDaysInput.value=d.billingDays||''; leadTime.value=d.leadTime||'';
    itemsBody.innerHTML=''; (d.items||[]).forEach(it=> createItemRow(it));
    if(d.logo){ clientLogoData=d.logo; applyClientLogo(); if(fileLabelText) fileLabelText.textContent='Logo carregada'; }
    else { clientLogoData=''; applyClientLogo(); }
    if(d.meta && d.meta.docNumber){ currentDocNumber=d.meta.docNumber; docNumber.textContent=currentDocNumber; docNumberLabel.textContent=currentDocNumber; }
    updateTotals();
    if(!silent) showNotification('Rascunho carregado.', 'success');
    return true;
  }catch(e){ showNotification('Erro ao carregar rascunho.', 'error'); return false; }
}

/* Carregar & Preview = carrega draft (se existir) + revela preview */
loadDraftBtn.addEventListener('click', ()=>{
  const hadDraft = loadDraftInternal(true);
  if(hadDraft){ /* já carregou */ }
  // mesmo sem draft, tenta revelar preview com dados atuais
  // Se não há dados obrigatórios, valida vai barrar
  revealPreview();
  if(hadDraft) showNotification('Dados carregados e preview liberado.', 'success');
});
if(triggerPreviewBtn) triggerPreviewBtn.addEventListener('click', revealPreview);

clearDraftBtn.addEventListener('click', ()=>{
  if(confirm('Remover rascunho salvo localmente?')){
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('performance_proposal_draft_v1');
    if(previewUnlocked) lockPreview();
    showNotification('Rascunho removido.', 'info');
  }
});

/* PDF Download — captura o preview visível.
   Regra de ouro: nada que será renderizado pode estar fora da viewport.
   O html2canvas mede o elemento com getBoundingClientRect() e reaplica essas
   coordenadas no clone interno; um ancestral com `left:-10000px` faz a captura
   cair fora da área desenhada e o PDF sai em branco. Por isso exportamos o
   próprio #proposalDoc, apenas alargado temporariamente para a largura útil A4. */

/* Largura útil A4 @96dpi: 210mm ≈ 794px menos as margens de 15mm de cada lado
   (15mm ≈ 56,7px → ≈ 113,4px no total) ≈ 680px. Margens de 15mm deixam o
   documento visualmente centralizado na folha A4 (enquadramento equilibrado).
   Capturar na largura útil, e não nos 794px da folha inteira, evita que o
   html2pdf reescale o canvas para caber na área imprimível — reescala que
   cortava a lateral direita do documento. */
const A4_CONTENT_WIDTH = 680;

/* Geometria da folha em mm e a conversão px→mm derivada da largura de captura.
   Serve para raciocinar sobre PAGINAÇÃO em pixels do preview: o html2pdf fatia
   o canvas a cada "altura útil de página", então saber quantos px cabem em uma
   página é o que permite decidir uma quebra com critério. */
const A4_PAGE_WIDTH_MM = 210;
const A4_PAGE_HEIGHT_MM = 297;
const PDF_MARGIN_MM = 15;
const MM_PER_PX = (A4_PAGE_WIDTH_MM - PDF_MARGIN_MM * 2) / A4_CONTENT_WIDTH; // 180mm / 680px
/* Altura útil de uma página, já em pixels do documento capturado (≈1008px). */
const A4_CONTENT_HEIGHT_PX = Math.floor((A4_PAGE_HEIGHT_MM - PDF_MARGIN_MM * 2) / MM_PER_PX);
/* Folga para não colar o bloco no limite exato do corte. */
const PAGE_FIT_TOLERANCE_PX = 24;

function waitForImages(root, timeout=2000){
  const pending = $$('img', root).filter(img=> !img.complete);
  if(!pending.length) return Promise.resolve();

  return Promise.race([
    Promise.all(pending.map(img=> new Promise(resolve=>{
      img.addEventListener('load', resolve, {once:true});
      img.addEventListener('error', resolve, {once:true});
    }))),
    new Promise(resolve=> setTimeout(resolve, timeout))
  ]);
}

/* Barreira final contra o PDF em branco: inspeciona o canvas gerado pelo
   html2canvas antes de deixá-lo virar arquivo. Amostra pixels em uma grade
   (varrer tudo seria caro em documentos longos); se todos forem idênticos, o
   canvas é uma chapa lisa — branca — e a exportação é abortada. */
function assertCanvasHasContent(canvas){
  if(!canvas || !canvas.width || !canvas.height){
    throw new Error('Canvas vazio: o preview não pôde ser capturado.');
  }

  let ctx;
  try { ctx = canvas.getContext('2d'); } catch(_){ ctx = null; }
  if(!ctx) return; // sem contexto 2d não há como validar; segue o fluxo normal.

  const stepX = Math.max(1, Math.floor(canvas.width / 64));
  const stepY = Math.max(1, Math.floor(canvas.height / 64));
  let reference = null;

  for(let y=0; y<canvas.height; y+=stepY){
    for(let x=0; x<canvas.width; x+=stepX){
      let pixel;
      try { pixel = ctx.getImageData(x, y, 1, 1).data; } catch(_){ return; }
      const key = pixel[0]+','+pixel[1]+','+pixel[2]+','+pixel[3];
      if(reference === null){ reference = key; continue; }
      if(key !== reference) return; // encontrou conteúdo: canvas válido.
    }
  }

  throw new Error('O PDF sairia em branco: o preview não foi renderizado a tempo.');
}

/* Quebra inteligente antes das assinaturas (v3.0.7).
   Até a v3.0.6 a seção de assinaturas era SEMPRE empurrada para uma página nova
   (`page-break-before: always`). Isso protegia o bloco de ser cortado ao meio,
   mas em propostas curtas gerava uma última página quase vazia — só com as duas
   linhas de assinatura.
   Agora medimos: se o bloco inteiro cabe no espaço que resta na página atual,
   não há motivo para quebrar (o `page-break-inside: avoid` já impede o corte).
   Só forçamos a quebra quando o bloco realmente não caberia. */
function needsPageBreakBeforeSignatures(docEl, sigEl, pageHeightPx = A4_CONTENT_HEIGHT_PX){
  if(!docEl || !sigEl || typeof sigEl.getBoundingClientRect !== 'function') return true;

  const docRect = docEl.getBoundingClientRect();
  const sigRect = sigEl.getBoundingClientRect();
  const height = sigRect.height;
  const top = sigRect.top - docRect.top;

  // Sem medidas confiáveis (jsdom, display:none) mantemos o comportamento seguro.
  if(!height || !isFinite(height) || !isFinite(top) || top < 0) return true;
  // Bloco maior que uma página inteira: quebrar não resolveria nada.
  if(height + PAGE_FIT_TOLERANCE_PX >= pageHeightPx) return false;

  const usedOnCurrentPage = top % pageHeightPx;
  const remaining = pageHeightPx - usedOnCurrentPage;
  return remaining < height + PAGE_FIT_TOLERANCE_PX;
}

/* Rodapé paginado (v3.0.7): "Página X de Y" + identificação da proposta em
   TODAS as páginas do PDF. Desenhado com o jsPDF depois da paginação (por isso
   sabemos o total real de páginas) e dentro da margem de 15mm, sem sobrepor o
   conteúdo capturado. Também grava os metadados do arquivo. */
function stampPdfFooters(pdf, info = {}){
  if(!pdf || !pdf.internal || typeof pdf.setPage !== 'function') return 0;

  const total = typeof pdf.internal.getNumberOfPages === 'function'
    ? pdf.internal.getNumberOfPages()
    : (pdf.internal.pages ? pdf.internal.pages.length - 1 : 0);
  if(!total) return 0;

  const size = pdf.internal.pageSize || {};
  const pageWidth = typeof size.getWidth === 'function' ? size.getWidth() : (size.width || A4_PAGE_WIDTH_MM);
  const pageHeight = typeof size.getHeight === 'function' ? size.getHeight() : (size.height || A4_PAGE_HEIGHT_MM);
  const baseline = pageHeight - PDF_MARGIN_MM / 2.5; // dentro da margem inferior
  const left = info.leftText || 'Grupo Performance Ocupacional';

  for(let page=1; page<=total; page++){
    pdf.setPage(page);
    try {
      if(typeof pdf.setFont === 'function') pdf.setFont('helvetica', 'normal');
      if(typeof pdf.setFontSize === 'function') pdf.setFontSize(7.5);
      if(typeof pdf.setTextColor === 'function') pdf.setTextColor(120, 128, 140);
      pdf.text(left, PDF_MARGIN_MM, baseline);
      pdf.text(`Página ${page} de ${total}`, pageWidth - PDF_MARGIN_MM, baseline, { align: 'right' });
    } catch(_){ /* rodapé é cosmético: nunca pode derrubar a exportação */ }
  }

  if(typeof pdf.setProperties === 'function'){
    try {
      pdf.setProperties({
        title: info.title || 'Proposta Comercial',
        subject: 'Proposta Comercial — Saúde e Segurança Ocupacional',
        author: 'Grupo Performance Ocupacional',
        creator: 'Gerador de Proposta — Grupo Performance Ocupacional',
        keywords: 'proposta, comercial, performance ocupacional, sst'
      });
    } catch(_){ /* metadados são opcionais */ }
  }

  return total;
}

async function exportPDF(){
  buildPreview();

  if(typeof window.html2pdf !== 'function'){
    throw new Error('Biblioteca html2pdf não foi carregada. Verifique a conexão com a internet.');
  }

  const filename = `Proposta-${(company.value||'Cliente').replace(/[^a-zA-Z0-9]/g,'_')}-${currentDocNumber}.pdf`;

  // O preview precisa estar realmente renderizado: sem caixa visível não há o que capturar.
  if(previewSticky) previewSticky.style.display = 'block';
  if(previewEmpty) previewEmpty.style.display = 'none';

  // Garante que a fonte Inter esteja carregada antes do canvas (evita fonte errada no PDF)
  try { await Promise.race([document.fonts.ready, new Promise(r=>setTimeout(r,1500))]); } catch(_){}

  // Aguarda todas as imagens do documento exportado, inclusive a marca corporativa.
  await waitForImages(proposalDoc);

  // Fixa a largura útil A4 no próprio elemento visível durante a captura.
  // Sem posicionamento fora da tela: o documento continua na viewport, que é
  // exatamente o que o html2canvas consegue desenhar.
  document.body.classList.add('is-exporting-pdf');
  proposalDoc.classList.add('pdf-export-target');

  // Correção da proporção A4 (v3.0.5): o html2pdf monta um overlay fixo e
  // centraliza o container no meio da viewport REAL do navegador. Como o
  // html2canvas recebe windowWidth/width iguais à largura útil A4, tudo que
  // passasse dessa coluna era cortado do canvas — o PDF saía com o conteúdo
  // espremido na metade esquerda da página. Este estilo fixa o container do
  // html2pdf na coluna 0 (left:0), alinhando o clone à janela de captura e
  // fazendo o documento ocupar a largura útil inteira.
  const pdfLayoutFix = document.createElement('style');
  pdfLayoutFix.id = 'html2pdf-layout-fix';
  pdfLayoutFix.textContent = [
    '.html2pdf__overlay{left:0!important;right:0!important}',
    '.html2pdf__container{left:0!important;right:auto!important;margin:0!important}'
  ].join('');
  document.head.appendChild(pdfLayoutFix);

  // Rola até o topo do documento; scrollX/scrollY:0 abaixo só é coerente se a
  // página estiver de fato no topo quando o clone é montado.
  const prevScrollX = window.scrollX || window.pageXOffset || 0;
  const prevScrollY = window.scrollY || window.pageYOffset || 0;
  window.scrollTo(0, 0);

  // Deixa o browser aplicar o layout de exportação antes de medir/desenhar.
  await new Promise(r=> requestAnimationFrame(()=> requestAnimationFrame(r)));

  // Decide a quebra antes das assinaturas COM O LAYOUT DE EXPORTAÇÃO JÁ APLICADO
  // (a medida só vale a 680px de largura, que é como o documento será capturado).
  const signaturesEl = document.getElementById('docSignatures');
  const breakBeforeSignatures = needsPageBreakBeforeSignatures(proposalDoc, signaturesEl);
  proposalDoc.classList.toggle('force-signature-break', breakBeforeSignatures);
  if(breakBeforeSignatures){
    // Reaplica o layout depois de ligar a regra de quebra.
    await new Promise(r=> requestAnimationFrame(r));
  }

  const opt = {
    margin: PDF_MARGIN_MM,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: A4_CONTENT_WIDTH,
      width: A4_CONTENT_WIDTH,
      scrollX: 0,
      scrollY: 0,
      logging: false
    },
    // compress reduz bastante o tamanho do arquivo enviado por e-mail/WhatsApp
    // sem perda visível (a imagem já é JPEG de alta qualidade).
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    pagebreak: {
      mode: ['css', 'legacy'],
      // v3.0.7: a quebra antes das assinaturas deixou de ser incondicional.
      // Ela só entra quando o bloco não cabe no que resta da página — assim
      // nenhuma proposta curta termina com uma página quase vazia, e o bloco
      // continua protegido de cortes pelo `avoid` abaixo.
      before: breakBeforeSignatures ? ['.doc-signatures'] : [],
      // Blocos que NUNCA devem ser quebrados no meio. A tabela (`.pd-table`)
      // ficou de fora porque o plugin tenta aplicar `page-break-inside`
      // via `mode: 'css'` e acaba injetando divs dentro do <tbody>,
      // criando buracos enormes. A tabela quebra naturalmente entre linhas
      // (seguro, pois cada linha é uma unidade completa de informação).
      avoid: ['.doc-header', '.doc-kv', '.doc-totals', '.billing-info', '.billing-section', '.doc-accept', '.doc-signatures', '.sig-block', '.payment-info-section']
    }
  };

  try{
    const worker = window.html2pdf().set(opt).from(proposalDoc);

    // Valida o canvas ANTES de salvar: um canvas sem dimensão (ou totalmente
    // uniforme) gera justamente o PDF em branco que queremos impedir.
    await worker.toCanvas();
    const canvas = await worker.get('canvas');
    assertCanvasHasContent(canvas);

    // Pagina o documento e carimba o rodapé "Página X de Y" em cada folha.
    // Precisa acontecer entre toPdf() e save(): antes da paginação não existe
    // total de páginas; depois de salvar já é tarde.
    await worker.toPdf();
    const pdf = await worker.get('pdf');
    stampPdfFooters(pdf, {
      title: `Proposta Comercial ${currentDocNumber} — ${company.value || 'Cliente'}`,
      leftText: `Proposta Nº ${currentDocNumber} • Grupo Performance Ocupacional`
    });

    await worker.save();
    showNotification('PDF baixado: '+filename, 'success');
    // gera novo número para próxima proposta
    currentDocNumber = genDocNumber();
    docNumber.textContent = currentDocNumber;
    docNumberLabel.textContent = currentDocNumber;
  } finally {
    const fixEl = document.getElementById('html2pdf-layout-fix');
    if(fixEl) fixEl.remove();
    proposalDoc.classList.remove('force-signature-break');
    proposalDoc.classList.remove('pdf-export-target');
    document.body.classList.remove('is-exporting-pdf');
    window.scrollTo(prevScrollX, prevScrollY);
  }
}

downloadBtn.addEventListener('click', async ()=>{
  if(!previewUnlocked){ showNotification('Clique em Carregar & Preview primeiro.', 'warning'); return; }
  downloadBtn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Gerando...';
  downloadBtn.disabled=true;
  try{
    await exportPDF();
  }catch(e){
    console.error(e);
    // fallback: impressão do navegador
    window.print();
    showNotification('Falha no gerador PDF — abrindo impressão.', 'warning');
  }finally{
    downloadBtn.innerHTML='<i class="fa-solid fa-file-arrow-down"></i> Baixar PDF';
    downloadBtn.disabled=false;
  }
});

/* Validation helpers */
function setupValidation(){
  const required=[company, contractType, responsible, phone];
  required.forEach(f=>{
    f.addEventListener('blur', ()=> validateField(f));
    f.addEventListener('input', ()=> clearValidation(f));
  });
  email.addEventListener('blur', ()=>{
    if(email.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) showError(email,'E-mail inválido'); else clearValidation(email);
  });
  phone.addEventListener('blur', ()=>{
    const clean = phone.value.replace(/\D/g,'');
    if(phone.value && clean.length<10) showError(phone,'Telefone inválido'); else clearValidation(phone);
  });
  taxId.addEventListener('input', e=>{
    let v=e.target.value.replace(/\D/g,'');
    if(v.length<=11){ v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d)/,'$1.$2'); v=v.replace(/(\d{3})(\d{1,2})$/,'$1-$2'); }
    else { v=v.replace(/^(\d{2})(\d)/,'$1.$2'); v=v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3'); v=v.replace(/\.(\d{3})(\d)/,'.$1/$2'); v=v.replace(/(\d{4})(\d)/,'$1-$2'); }
    e.target.value=v;
  });
  stateEl.addEventListener('input', e=> e.target.value=e.target.value.toUpperCase());
}
function validateField(f){ if(f.hasAttribute('required') && !f.value.trim()){ showError(f,'Obrigatório'); return false;} return true; }
function showError(field,msg){
  clearValidation(field); field.classList.add('error');
  let el= field.nextElementSibling;
  if(!el || !el.classList.contains('error-message')){ el=document.createElement('div'); el.className='error-message'; field.parentNode.insertBefore(el, field.nextSibling); }
  el.textContent=msg;
}
function clearValidation(field){
  field.classList.remove('error');
  const el= field.nextElementSibling;
  if(el && el.classList.contains('error-message')) el.remove();
}
function showNotification(message, type='info'){
  document.querySelectorAll('.notification').forEach(n=> n.remove());
  const n=document.createElement('div'); n.className=`notification ${type}`;
  n.innerHTML=`<i class="fa-solid ${type==='success'?'fa-circle-check':type==='error'?'fa-circle-xmark':type==='warning'?'fa-triangle-exclamation':'fa-circle-info'}"></i><span>${message}</span>`;
  document.body.appendChild(n);
  setTimeout(()=>{ n.style.animation='slideOut .3s ease-in'; setTimeout(()=> n.remove(),300); },3200);
}

/* Init */
function init(){
  setupValidation();
  // Auto-lock preview at start; if there's a saved draft, don't auto-unlock
  lockPreview();
  setStep(1);
  updateTotals();
  // tenta pré-preencher review sem liberar preview
  updateReviewSummary();
}
document.addEventListener('DOMContentLoaded', init);
