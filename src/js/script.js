// Helper selectors
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

/* Elements */
const proposalDate = $("#proposalDate");
const docDate = $("#docDate");

const wizardSteps = $$(".wizard-step");
const formSteps = $$(".step");

const company = $("#company");
const contractType = $("#contractType");
const responsible = $("#responsible");
const phone = $("#phone");
const email = $("#email");
const taxId = $("#taxId");
const address = $("#address");
const city = $("#city");
const state = $("#state");
const notes = $("#notes");
const clientLogoInput = $("#clientLogo");

const itemsBody = $("#itemsBody");
const addItemBtn = $("#addItem");
const discountEl = $("#discount");
const totalDisplay = $("#totalDisplay");

const paymentMethod = $("#paymentMethod");
const billingDays = $("#billingDays");
const billingDaysInput = $("#billingDaysInput");
const leadTime = $("#leadTime");

const generatePreviewBtn = $("#generatePreview");
const saveDraftBtn = $("#saveDraft");
const loadDraftBtn = $("#loadDraft");
const clearDraftBtn = $("#clearDraft");
const printBtn = $("#printBtn");

const docLogo = $("#docLogo");
const pd_company = $("#pd_company");
const pd_client_logo = $("#pd_client_logo");
const pd_contact = $("#pd_contact");
const pd_contract = $("#pd_contract");
const pd_email = $("#pd_email");
const pd_items = $("#pd_items tbody");
const pd_subtotal = $("#pd_subtotal");
const pd_discount_value = $("#pd_discount_value");
const pd_discount_pct = $("#pd_discount_pct");
const pd_total = $("#pd_total");
const additionalInfo = $("#additionalInfo");

/* Init dates */
const now = new Date();
proposalDate.textContent = now.toLocaleDateString("pt-BR");
docDate.textContent = now.toLocaleDateString("pt-BR");

/* Wizard navigation - CORRIGIDO */
wizardSteps.forEach((btn) => {
  btn.addEventListener("click", () => {
    const step = btn.dataset.step;
    setStep(step);
  });
});

function setStep(step) {
  wizardSteps.forEach((b) =>
    b.classList.toggle("active", b.dataset.step === String(step))
  );
  formSteps.forEach(
    (s) =>
      (s.style.display = s.dataset.step === String(step) ? "block" : "none")
  );
}

// Next/Previous step navigation - CORRIGIDO
$$(".next-step").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const nextStep = btn.dataset.next;
    setStep(nextStep);
  });
});

$$(".prev-step").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const prevStep = btn.dataset.prev;
    setStep(prevStep);
  });
});

/* Items handling with careful arithmetic (cents) */
function createItemRow(data = { desc: "", qty: 1, unit: 0 }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
        <td class="idx"></td>
        <td><input class="desc" type="text" value="${escapeHtml(
          data.desc
        )}" placeholder="Descrição"></td>
        <td><input class="qty" type="number" min="0" step="1" value="${
          Number(data.qty) || 0
        }" style="width:90px"></td>
        <td><input class="unit" type="number" min="0" step="0.01" value="${
          Number(data.unit) || 0
        }" style="width:120px"></td>
        <td class="subtotal right">0,00</td>
        <td><button type="button" class="btn ghost remove"><i class="fa-solid fa-trash"></i></button></td>
    `;
  itemsBody.appendChild(tr);

  const inputs = $$(".desc, .qty, .unit", tr);
  inputs.forEach((i) => i.addEventListener("input", updateTotals));
  $(".remove", tr).addEventListener("click", () => {
    tr.remove();
    renumber();
    updateTotals();
  });

  renumber();
  updateTotals();
}

function renumber() {
  $$(".items-table tbody tr").forEach((tr, i) => {
    $(".idx", tr).textContent = i + 1;
  });
}

function getItems() {
  return $$(".items-table tbody tr").map((tr) => {
    const desc = $(".desc", tr).value.trim();
    const qty = Number($(".qty", tr).value) || 0;
    const unit = Number($(".unit", tr).value) || 0;
    const subtotal = Math.round(qty * unit * 100) / 100;
    return { desc, qty, unit, subtotal };
  });
}

function updateTotals() {
  const items = getItems();
  // sum in cents
  let totalCents = 0;
  items.forEach((it, idx) => {
    const cents = Math.round(it.subtotal * 100);
    totalCents += cents;
    const disp = (cents / 100).toFixed(2).replace(".", ",");
    itemsBody.children[idx].querySelector(".subtotal").textContent = disp;
  });
  const total = totalCents / 100;
  const discountPct = Math.min(Math.max(Number(discountEl.value) || 0, 0), 100);
  const discountValue = Math.round(total * (discountPct / 100) * 100) / 100;
  const totalAfter = Math.round((total - discountValue) * 100) / 100;
  totalDisplay.textContent = String(totalAfter.toFixed(2)).replace(".", ",");
}

/* Start with a sample row */
createItemRow({ desc: "Treinamento NR-06", qty: 1, unit: 350.0 });
createItemRow({ desc: "Exames ocupacionais", qty: 3, unit: 120.0 });

/* Controls */
addItemBtn.addEventListener("click", () => createItemRow());
discountEl.addEventListener("input", updateTotals);

/* Payment toggle */
paymentMethod.addEventListener("change", () => {
  billingDays.style.display =
    paymentMethod.value === "Faturamento" ? "block" : "none";
});

/* Client logo upload */
let clientLogoData = "";
clientLogoInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    clientLogoData = reader.result;
    // Atualiza apenas a logo do cliente no preview, não a logo da Performance
    pd_client_logo.src = clientLogoData;
    pd_client_logo.style.display = "inline";
  };
  reader.readAsDataURL(file);
});

/* Preview builder */
function escapeHtml(str) {
  return (str || "").replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        s
      ])
  );
}

function buildPreview() {
  // map fields
  pd_company.textContent = company.value || "—";
  pd_contact.textContent =
    (responsible.value ? responsible.value : "—") +
    (phone.value ? " • " + phone.value : "");
  pd_contract.textContent = contractType.value || "—";
  pd_email.textContent = email.value || "—";

  // Mostra/oculta a logo do cliente conforme exista valor
  if (company.value && clientLogoData) {
    pd_client_logo.style.display = "inline";
  } else {
    pd_client_logo.style.display = "none";
  }

  // Adicionar informações adicionais se preenchidas
  let additionalInfoHTML = "";
  if (taxId.value || address.value || city.value || state.value) {
    additionalInfoHTML = '<div class="doc-kv" style="margin-top: 15px;">';
    if (taxId.value)
      additionalInfoHTML += `<div><span class="kv-key">CNPJ/CPF</span><div>${escapeHtml(
        taxId.value
      )}</div></div>`;
    if (address.value)
      additionalInfoHTML += `<div><span class="kv-key">Endereço</span><div>${escapeHtml(
        address.value
      )}</div></div>`;
    if (city.value || state.value) {
      additionalInfoHTML += `<div><span class="kv-key">Cidade/UF</span><div>${escapeHtml(
        city.value + (city.value && state.value ? "/" : "") + state.value
      )}</div></div>`;
    }
    additionalInfoHTML += "</div>";
  }
  additionalInfo.innerHTML = additionalInfoHTML;

  // Informações de pagamento e entrega - REMOVER DUPLICAÇÕES
  // Primeiro, remova qualquer seção de pagamento existente
  const existingPaymentInfo = document.querySelector('.payment-info-section');
  if (existingPaymentInfo) {
      existingPaymentInfo.remove();
  }

  // Format payment method text
  let paymentText = paymentMethod.value || "—";
  if (paymentMethod.value === "Faturamento" && billingDaysInput.value) {
      paymentText = `Faturamento em ${billingDaysInput.value} dias`;
  }

  // Criar nova seção apenas se houver informações
  if (paymentMethod.value || leadTime.value) {
      const paymentInfo = `
          <div class="doc-kv payment-info-section" style="margin-top: 15px;">
              <div>
                  <span class="kv-key">Forma de Pagamento</span>
                  <div>${escapeHtml(paymentText)}</div>
              </div>
              <div>
                  <span class="kv-key">Prazo de Entrega</span>
                  <div>${escapeHtml(leadTime.value || "A combinar")}</div>
              </div>
          </div>
      `;
      
      // Adiciona as informações de pagamento e entrega após additionalInfo
      additionalInfo.insertAdjacentHTML('afterend', paymentInfo);
  }

  // items
  const items = getItems();
  pd_items.innerHTML = items
    .map(
      (it) => `
        <tr>
            <td>${escapeHtml(it.desc)}</td>
            <td style="text-align:right">${it.qty}</td>
            <td style="text-align:right">R$ ${String(
              it.unit.toFixed(2)
            ).replace(".", ",")}</td>
            <td style="text-align:right">R$ ${String(
              it.subtotal.toFixed(2)
            ).replace(".", ",")}</td>
        </tr>
    `
    )
    .join("");

  // totals
  const subtotal = items.reduce((s, it) => s + it.subtotal, 0);
  const discountPct = Math.min(Math.max(Number(discountEl.value) || 0, 0), 100);
  const discountVal = Math.round(subtotal * (discountPct / 100) * 100) / 100;
  const total = Math.round((subtotal - discountVal) * 100) / 100;

  pd_subtotal.textContent = String(subtotal.toFixed(2)).replace(".", ",");
  pd_discount_value.textContent = String(discountVal.toFixed(2)).replace(
    ".",
    ","
  );
  pd_discount_pct.textContent = String(discountPct);
  pd_total.textContent = String(total.toFixed(2)).replace(".", ",");

  // doc logo fallback
  if (!clientLogoData) docLogo.src = $("#brandLogo").src;
}

/* LocalStorage save/load */
const STORAGE_KEY = "performance_proposal_draft_v1";
saveDraftBtn.addEventListener("click", () => {
  // Validar campos obrigatórios antes de salvar
  const requiredFields = [company, contractType, responsible, phone];
  let isValid = true;

  requiredFields.forEach((field) => {
    if (!validateField(field)) isValid = false;
  });

  if (!isValid) {
    showNotification(
      "Por favor, preencha todos os campos obrigatórios antes de salvar.",
      "error"
    );
    return;
  }

  const payload = {
    meta: {
      savedAt: new Date().toISOString(),
      version: "1.1"
    },
    company: company.value,
    contractType: contractType.value,
    responsible: responsible.value,
    phone: phone.value,
    email: email.value,
    taxId: taxId.value,
    address: address.value,
    city: city.value,
    state: state.value,
    notes: notes.value,
    logo: clientLogoData, // Agora salva apenas a logo do cliente
    items: getItems(),
    discount: discountEl.value,
    payment: paymentMethod.value,
    billingDays: billingDaysInput.value,
    leadTime: leadTime.value
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // Feedback visual
    saveDraftBtn.innerHTML = '<i class="fa-solid fa-check"></i> Salvo!';
    saveDraftBtn.classList.add("saved");

    setTimeout(() => {
      saveDraftBtn.innerHTML =
        '<i class="fa-regular fa-floppy-disk"></i> Salvar';
      saveDraftBtn.classList.remove("saved");
    }, 2000);

    showNotification("Rascunho salvo com sucesso.", "success");
  } catch (e) {
    console.error("Erro ao salvar:", e);
    showNotification(
      "Erro ao salvar o rascunho. O localStorage pode estar cheio.",
      "error"
    );
  }
});

loadDraftBtn.addEventListener("click", () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    showNotification("Nenhum rascunho encontrado.", "info");
    return;
  }

  try {
    const d = JSON.parse(raw);

    // Verificar versão compatível
    if (d.meta && d.meta.version !== "1.1") {
      if (
        !confirm(
          "Este rascunho foi salvo em uma versão anterior. Deseja carregá-lo mesmo assim?"
        )
      ) {
        return;
      }
    }

    company.value = d.company || "";
    contractType.value = d.contractType || "";
    responsible.value = d.responsible || "";
    phone.value = d.phone || "";
    email.value = d.email || "";
    taxId.value = d.taxId || "";
    address.value = d.address || "";
    city.value = d.city || "";
    state.value = d.state || "";
    notes.value = d.notes || "";
    discountEl.value = d.discount || 0;
    paymentMethod.value = d.payment || "À vista";
    paymentMethod.dispatchEvent(new Event("change"));
    billingDaysInput.value = d.billingDays || "";
    leadTime.value = d.leadTime || "";

    // rebuild items
    itemsBody.innerHTML = "";
    (d.items || []).forEach((it) => createItemRow(it));

    // Carrega a logo do cliente se existir
    if (d.logo) {
      clientLogoData = d.logo;
      pd_client_logo.src = clientLogoData;
      pd_client_logo.style.display = "inline";
    } else {
      pd_client_logo.style.display = "none";
    }

    updateTotals();
    buildPreview();

    showNotification("Rascunho carregado com sucesso.", "success");
  } catch (e) {
    console.error(e);
    showNotification(
      "Erro ao carregar rascunho. Os dados podem estar corrompidos.",
      "error"
    );
  }
});

clearDraftBtn.addEventListener("click", () => {
  if (confirm("Remover rascunho salvo localmente?")) {
    localStorage.removeItem(STORAGE_KEY);
    showNotification("Rascunho removido.", "info");
  }
});

/* Validação de formulário */
function setupValidation() {
  const requiredFields = [company, contractType, responsible, phone];

  requiredFields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => clearValidation(field));
  });

  // Validação de email
  email.addEventListener("blur", () => {
    if (email.value && !isValidEmail(email.value)) {
      showError(email, "Email inválido");
    } else {
      clearValidation(email);
    }
  });

  // Validação de telefone
  phone.addEventListener("blur", () => {
    if (phone.value && !isValidPhone(phone.value)) {
      showError(phone, "Telefone inválido");
    } else {
      clearValidation(phone);
    }
  });

  // Formatação automática para CNPJ
  taxId.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length <= 11) {
      // Formata CPF (000.000.000-00)
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d)/, "$1.$2");
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // Formata CNPJ (00.000.000/0000-00)
      value = value.replace(/^(\d{2})(\d)/, "$1.$2");
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
      value = value.replace(/(\d{4})(\d)/, "$1-$2");
    }

    e.target.value = value;
  });

  // Transformar automaticamente o estado para maiúsculas
  state.addEventListener("input", function (e) {
    e.target.value = e.target.value.toUpperCase();
  });
}

function validateField(field) {
  if (field.hasAttribute("required") && !field.value.trim()) {
    showError(field, "Este campo é obrigatório");
    return false;
  }
  return true;
}

function showError(field, message) {
  clearValidation(field);
  field.classList.add("error");

  let errorElement = field.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains("error-message")) {
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }

  errorElement.textContent = message;
}

function clearValidation(field) {
  field.classList.remove("error");
  const errorElement = field.nextElementSibling;
  if (errorElement && errorElement.classList.contains("error-message")) {
    errorElement.remove();
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  // Remove caracteres não numéricos e verifica se tem pelo menos 10 dígitos
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10;
}

/* Sistema de notificação */
function showNotification(message, type = "info") {
  // Remove notificações existentes
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((n) => n.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  // Estilos para la notificación
  Object.assign(notification.style, {
    position: "fixed",
    top: "30px",
    right: "30px",
    padding: "18px 26px",
    borderRadius: "16px",
    color: "white",
    fontWeight: "600",
    zIndex: "10000",
    boxShadow: "0 15px 30px -5px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)"
  });

  if (type === "success") {
    notification.style.background =
      "linear-gradient(135deg, var(--success) 0%, var(--accent-dark) 100%)";
  } else if (type === "error") {
    notification.style.background =
      "linear-gradient(135deg, var(--error) 0%, #dc2626 100%)";
  } else if (type === "info") {
    notification.style.background =
      "linear-gradient(135deg, var(--info) 0%, var(--primary-dark) 100%)";
  } else {
    notification.style.background =
      "linear-gradient(135deg, var(--warning) 0%, #d97706 100%)";
  }

  document.body.appendChild(notification);

  // Auto-remover após 3 segundos
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/* Configurar impressão */
printBtn.addEventListener("click", () => {
  buildPreview();
  const printContent = document.getElementById("proposalDoc").innerHTML;
  const originalContent = document.body.innerHTML;

  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;

  // Recarregar a página para restaurar a funcionalidade
  window.location.reload();
});

/* Inicialização */
function init() {
  setupValidation();

  // Configurar eventos dos botões
  generatePreviewBtn.addEventListener("click", () => {
    buildPreview();
    showNotification("Preview atualizado.", "success");
  });

  // Inicializar com o primeiro passo
  setStep(1);
  updateTotals();
  buildPreview();
}

// Inicializar quando o documento estiver carregado
document.addEventListener("DOMContentLoaded", init);
