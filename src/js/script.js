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

/* Logo upload com validação 2MB */
let clientLogoData='';
const MAX_LOGO_BYTES = 2*1024*1024;
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
  reader.onload = ()=>{ clientLogoData = reader.result; if(previewUnlocked) buildPreview(); };
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

  if(clientLogoData){ pd_client_logo.src = clientLogoData; pd_client_logo.style.display='inline'; } else { pd_client_logo.style.display='none'; }

  // additional info
  let html='';
  if(taxId.value || address.value || city.value || stateEl.value){
    html='<div class="doc-kv" style="margin-top:10px">';
    if(taxId.value) html+=`<div><span class="kv-key">CNPJ/CPF</span><div>${escapeHtml(taxId.value)}</div></div>`;
    if(address.value) html+=`<div><span class="kv-key">Endereço</span><div>${escapeHtml(address.value)}</div></div>`;
    if(city.value || stateEl.value) html+=`<div><span class="kv-key">Cidade/UF</span><div>${escapeHtml(city.value + (city.value && stateEl.value ? '/' : '') + stateEl.value)}</div></div>`;
    if(notes.value) html+=`<div><span class="kv-key">Observações</span><div>${escapeHtml(notes.value)}</div></div>`;
    html+='</div>';
  }
  additionalInfo.innerHTML = html;

  // remove old payment section
  const existing = document.querySelector('.payment-info-section');
  if(existing) existing.remove();
  let paymentText = paymentMethod.value || '—';
  if(paymentMethod.value==='Faturamento' && billingDaysInput.value) paymentText = `Faturamento em ${billingDaysInput.value} dias`;
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
    if(d.logo){ clientLogoData=d.logo; pd_client_logo.src=clientLogoData; if(fileLabelText) fileLabelText.textContent='Logo carregada'; }
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

/* PDF Download - substitui Imprimir */
downloadBtn.addEventListener('click', async ()=>{
  if(!previewUnlocked){ showNotification('Clique em Carregar & Preview primeiro.', 'warning'); return; }
  buildPreview();
  const filename = `Proposta-${(company.value||'Cliente').replace(/[^a-zA-Z0-9]/g,'_')}-${currentDocNumber}.pdf`;
  downloadBtn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Gerando...';
  downloadBtn.disabled=true;
  try{
    const opt={
      margin: [8,8,8,8],
      filename,
      image:{ type:'jpeg', quality:0.98 },
      html2canvas:{ scale:2, useCORS:true, backgroundColor:'#ffffff' },
      jsPDF:{ unit:'mm', format:'a4', orientation:'portrait' },
      pagebreak:{ mode:['css','legacy'] }
    };
    await html2pdf().set(opt).from(proposalDoc).save();
    showNotification('PDF baixado: '+filename, 'success');
    // gera novo número para próxima proposta
    currentDocNumber = genDocNumber();
    docNumber.textContent = currentDocNumber;
    docNumberLabel.textContent = currentDocNumber;
  }catch(e){
    console.error(e);
    // fallback: print
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
