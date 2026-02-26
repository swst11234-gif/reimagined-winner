const WRAP_ADDON = 200;
const PLACEHOLDER_IMAGE = "assets/placeholder-1.svg";

const CONFIG = {
  shopName: "Тюльпаны",
  city: "Астрахань",
  phone: "+7 937 820 0672",
  callLink: "tel:+79378200672",
  whatsappNumber: "79378200672",
  telegramUsernameOrLink: "https://t.me/a777ye198",
  currency: "₽",
};

const COLOR_OPTIONS = [
  { key: "white", name: "Белый", swatch: "#FFFFFF", border: true },
  { key: "red", name: "Красный", swatch: "#D11A2A" },
  { key: "pink_center", name: "Розово-белый", swatch: "#FF5AA5", border: true },
  { key: "pink", name: "Розовый", swatch: "#FF5AA5" },
  { key: "yellow", name: "Жёлтый", swatch: "#F7C948" },
  { key: "purple", name: "Фиолетовый", swatch: "#6D28D9" },
];

const WIZARD_STEPS = [
  { key: "forWhom", question: "Для кого букет?", type: "text", placeholder: "Например: для мамы" },
  { key: "occasion", question: "Повод", type: "text", placeholder: "Например: день рождения" },
  { key: "palette", question: "Цветы или цветовая гамма", type: "textarea", placeholder: "Например: нежные, пастельные" },
  { key: "budget", question: "Бюджет", type: "select", options: ["До 2000 ₽", "2000–4000 ₽", "4000–7000 ₽", "7000+ ₽"] },
  { key: "wishes", question: "Пожелания (опционально)", type: "textarea", placeholder: "Упаковка, открытка, лента, доставка..." },
];

const MIX_QTY = [7, 9, 13, 21, 31, 51, 101];
const MIX_STYLES = [
  { key: "soft", label: "Нежный", image: "assets/mix_examples/soft.svg" },
  { key: "bright", label: "Яркий", image: "assets/mix_examples/bright.svg" },
  { key: "contrast", label: "Контрастный", image: "assets/mix_examples/contrast.svg" },
  { key: "florist_choice", label: "Доверяю флористу", image: "assets/mix_examples/florist_choice.svg" },
];

// Чтобы включить галерею, добавьте 4–6 фото в /images/gallery и пропишите их в массиве GALLERY.
const GALLERY = [
  { src: "images/gallery/work-1.svg", alt: "Букет 31 тюльпан, микс, крафт", caption: "31 • микс • крафт" },
  { src: "images/gallery/work-2.svg", alt: "Букет 21 тюльпан, белые, без упаковки", caption: "21 • белые • без" },
  { src: "images/gallery/work-3.svg", alt: "Букет 51 тюльпан, яркий микс", caption: "51 • яркий микс • крафт" },
  { src: "images/gallery/work-4.svg", alt: "Букет 13 тюльпанов, розовые", caption: "13 • розовые • без" },
];

const state = {
  products: [],
  currentProduct: null,
  selectionById: {},
  filters: { search: "", category: "all", occasion: "", popularSize: null },
  pendingMessage: "",
  wizard: { step: 0, answers: {}, finalMode: false },
  mix: { qty: 21, colors: ["white", "pink"], style: "florist_choice", wrapMode: "nowrap" },
  orderDraft: null,
  orderStep: "summary",
  budget: { value: "", wrapMode: "wrap", color: "white", recommendations: [] },
  galleryIndex: 0,
  galleryTouchStartX: null,
};

const el = {
  shopTitle: document.getElementById("shop-title"),
  shopMeta: document.getElementById("shop-meta"),
  contactLinks: document.getElementById("contact-links"),
  catalogGrid: document.getElementById("catalog-grid"),
  resultsCount: document.getElementById("results-count"),
  emptyState: document.getElementById("empty-state"),
  searchInput: document.getElementById("search"),
  categorySelect: document.getElementById("category"),
  cardTemplate: document.getElementById("card-template"),
  occasionButtons: document.querySelectorAll("#occasions button"),
  occasionIndicator: document.getElementById("occasion-indicator"),
  popularSizeButtons: document.querySelectorAll("[data-popular-size]"),
  popularSizeIndicator: document.getElementById("popular-size-indicator"),
  catalogSection: document.getElementById("catalog-section"),

  budgetInput: document.getElementById("budget-input"),
  budgetPresets: document.querySelectorAll("[data-budget-preset]"),
  budgetWrap: document.getElementById("budget-wrap"),
  budgetColor: document.getElementById("budget-color"),
  budgetRecommendations: document.getElementById("budget-recommendations"),

  galleryGrid: document.getElementById("gallery-grid"),
  gallerySection: document.getElementById("gallery-section"),

  openWizard: document.getElementById("open-wizard"),
  openMix: document.getElementById("open-mix"),
  openContact: document.getElementById("open-contact"),
  guaranteesSection: document.getElementById("guarantees"),
  faqItems: document.querySelectorAll("#faq .faq-item"),

  modal: document.getElementById("product-modal"),
  modalClose: document.getElementById("modal-close"),
  modalImage: document.getElementById("modal-image"),
  modalMissingHint: document.getElementById("modal-missing-hint"),
  modalCategory: document.getElementById("modal-category"),
  modalTitle: document.getElementById("modal-title"),
  modalPrice: document.getElementById("modal-price"),
  modalDescription: document.getElementById("modal-description"),
  modalColorName: document.getElementById("modal-color-name"),
  modalSwatches: document.getElementById("modal-swatches"),
  modalWrapToggle: document.getElementById("modal-wrap-toggle"),
  orderButton: document.getElementById("order-button"),
  copyButton: document.getElementById("copy-button"),

  wizardModal: document.getElementById("wizard-modal"),
  wizardClose: document.getElementById("wizard-close"),
  wizardProgress: document.getElementById("wizard-progress"),
  wizardProgressFill: document.getElementById("wizard-progress-bar-fill"),
  wizardQuestion: document.getElementById("wizard-question"),
  wizardInputWrap: document.getElementById("wizard-input-wrap"),
  wizardInput: document.getElementById("wizard-input"),
  wizardTextarea: document.getElementById("wizard-textarea"),
  wizardSelect: document.getElementById("wizard-select"),
  wizardSkip: document.getElementById("wizard-skip"),
  wizardNext: document.getElementById("wizard-next"),
  wizardFinal: document.getElementById("wizard-final"),
  wizardPreview: document.getElementById("wizard-preview"),
  wizardHint: document.getElementById("wizard-hint"),
  wizardStepActions: document.getElementById("wizard-step-actions"),
  wizardFinalActions: document.getElementById("wizard-final-actions"),
  wizardCopy: document.getElementById("wizard-copy"),
  wizardContact: document.getElementById("wizard-contact"),

  mixModal: document.getElementById("mix-modal"),
  mixClose: document.getElementById("mix-close"),
  mixQty: document.getElementById("mix-qty"),
  mixColors: document.getElementById("mix-colors"),
  mixColorsText: document.getElementById("mix-colors-text"),
  mixStyles: document.getElementById("mix-styles"),
  mixWrap: document.getElementById("mix-wrap"),
  mixExampleImg: document.getElementById("mix-example-img"),
  mixSummary: document.getElementById("mix-summary"),
  mixOrder: document.getElementById("mix-order"),

  orderSummaryModal: document.getElementById("order-summary-modal"),
  orderSummaryClose: document.getElementById("order-summary-close"),
  orderSummaryStep: document.getElementById("order-summary-step"),
  orderSummaryList: document.getElementById("order-summary-list"),
  orderDate: document.getElementById("order-date"),
  orderComment: document.getElementById("order-comment"),
  orderSummaryActions: document.getElementById("order-summary-actions"),
  orderEdit: document.getElementById("order-edit"),
  orderContinue: document.getElementById("order-continue"),
  orderConfirmStep: document.getElementById("order-confirm-step"),
  orderConfirmActions: document.getElementById("order-confirm-actions"),
  orderBack: document.getElementById("order-back"),
  orderDone: document.getElementById("order-done"),
  orderId: document.getElementById("order-id"),
  orderIdCopy: document.getElementById("order-id-copy"),
  orderTelegram: document.getElementById("order-telegram"),
  orderWhatsapp: document.getElementById("order-whatsapp"),
  orderCall: document.getElementById("order-call"),
  orderCopyText: document.getElementById("order-copy-text"),
  orderCopyFallback: document.getElementById("order-copy-fallback"),

  messengerModal: document.getElementById("messenger-modal"),
  messengerTitle: document.getElementById("messenger-title"),
  messengerDescription: document.getElementById("messenger-description"),
  messengerClose: document.getElementById("messenger-close"),
  messengerTelegram: document.getElementById("messenger-telegram"),
  messengerWhatsapp: document.getElementById("messenger-whatsapp"),
  messengerCall: document.getElementById("messenger-call"),

  galleryLightbox: document.getElementById("gallery-lightbox"),
  galleryClose: document.getElementById("gallery-close"),
  galleryPrev: document.getElementById("gallery-prev"),
  galleryNext: document.getElementById("gallery-next"),
  galleryLightboxImage: document.getElementById("gallery-lightbox-image"),
  galleryLightboxCaption: document.getElementById("gallery-lightbox-caption"),
  galleryLightboxFallback: document.getElementById("gallery-lightbox-fallback"),

  toast: document.getElementById("toast"),
};

const formatPrice = (v) => `${new Intl.NumberFormat("ru-RU").format(v)} ${CONFIG.currency}`;
const telegramLink = () => (CONFIG.telegramUsernameOrLink.startsWith("http") ? CONFIG.telegramUsernameOrLink : `https://t.me/${CONFIG.telegramUsernameOrLink.replace("@", "")}`);
const normalizeImagePath = (p) => encodeURI((p || PLACEHOLDER_IMAGE).trim().replace(/\\/g, "/"));

function showToast(text) {
  el.toast.textContent = text;
  el.toast.classList.remove("hidden");
  setTimeout(() => el.toast.classList.add("hidden"), 1600);
}

async function copyText(text, notify = true) {
  try {
    await navigator.clipboard.writeText(text);
    if (notify) showToast("Скопировано ✅");
    return true;
  } catch {
    if (notify) showToast("Не удалось скопировать");
    return false;
  }
}

function updateImageWithFade(img, hintNode, srcPath) {
  const finalSrc = normalizeImagePath(srcPath);
  img.style.opacity = "0";
  const probe = new Image();
  probe.onload = () => {
    img.src = finalSrc;
    img.style.opacity = "1";
    hintNode?.classList.add("hidden");
  };
  probe.onerror = () => {
    img.src = PLACEHOLDER_IMAGE;
    img.style.opacity = "1";
    hintNode?.classList.remove("hidden");
  };
  probe.src = finalSrc;
}

function getSelection(id) {
  if (!state.selectionById[id]) state.selectionById[id] = { color: "white", wrapMode: "nowrap" };
  return state.selectionById[id];
}

function getColorMeta(key) {
  return COLOR_OPTIONS.find((c) => c.key === key) || COLOR_OPTIONS[0];
}

function getCurrentPrice(product, selection) {
  return selection.wrapMode === "wrap" ? product.price + WRAP_ADDON : product.price;
}

function resolveImage(product, selection) {
  const base = product.imageBase || PLACEHOLDER_IMAGE;
  const colorImage = product.colorImages?.[selection.color];
  return colorImage || base;
}

function renderHeader() {
  el.shopTitle.textContent = `${CONFIG.shopName} • ${CONFIG.city}`;
  el.shopMeta.textContent = CONFIG.phone;
  el.contactLinks.innerHTML = `
    <a href="${CONFIG.callLink}">Позвонить</a>
    <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a href="${telegramLink()}" target="_blank" rel="noreferrer">Telegram</a>
  `;
}

function applySegmentState(container, mode) {
  container.querySelectorAll("button[data-wrap]").forEach((button) => {
    const active = button.dataset.wrap === mode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderSwatches(container, selected, onSelect, maxSelect = 1) {
  container.innerHTML = "";
  COLOR_OPTIONS.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch";
    b.style.background = c.swatch;
    b.dataset.colorKey = c.key;
    if (Array.isArray(selected) ? selected.includes(c.key) : selected === c.key) b.classList.add("is-selected");
    if (c.border) b.style.borderColor = "#D0D0D0";
    b.setAttribute("aria-label", `Цвет: ${c.name}`);
    b.addEventListener("click", () => onSelect(c.key, maxSelect));
    container.appendChild(b);
  });
}

function makeOrderText(product, sel) {
  return `Здравствуйте! Хочу заказать: ${product.title}. Цвет: ${getColorMeta(sel.color).name}. Упаковка: ${sel.wrapMode === "wrap" ? "крафт" : "без бумаги"}. Цена: ${formatPrice(getCurrentPrice(product, sel))}. Дата/время: __. Адрес: __.`;
}

function openMessengerChoice(title, desc, message) {
  state.pendingMessage = typeof message === "string" ? message : "Здравствуйте!";
  el.messengerTitle.textContent = title;
  el.messengerDescription.textContent = desc || "";
  el.messengerModal.showModal();
}


function availableSizesWithPrice(wrapMode = "wrap") {
  const byQty = new Map();
  state.products.forEach((product) => {
    const qty = productQty(product);
    const price = getCurrentPrice(product, { wrapMode, color: state.budget.color });
    if (!byQty.has(qty) || price < byQty.get(qty)) byQty.set(qty, price);
  });
  return [...byQty.entries()]
    .map(([qty, price]) => ({ qty: Number(qty), price: Number(price) }))
    .sort((a, b) => a.qty - b.qty);
}

function getBudgetRecommendations(budgetValue, wrapMode = "wrap") {
  const budget = Number(budgetValue);
  if (!Number.isFinite(budget) || budget <= 0) return [];
  const sizes = availableSizesWithPrice(wrapMode);
  return sizes
    .map((item) => ({ ...item, diff: Math.abs(item.price - budget) }))
    .sort((a, b) => (a.diff - b.diff) || (a.qty - b.qty))
    .slice(0, 3);
}

function scrollToCatalogIfNeeded() {
  const top = el.catalogSection.getBoundingClientRect().top;
  if (top > 80) el.catalogSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderBudgetRecommendations() {
  const recs = getBudgetRecommendations(el.budgetInput.value, state.budget.wrapMode);
  state.budget.recommendations = recs;
  el.budgetRecommendations.innerHTML = "";
  if (!recs.length) {
    el.budgetRecommendations.innerHTML = '<span class="muted">Введите бюджет, чтобы увидеть рекомендации.</span>';
    return;
  }

  recs.forEach((rec) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "budget-recommend";
    btn.innerHTML = `Рекомендуем: <b>${rec.qty}</b> · ${formatPrice(rec.price)}`;
    btn.addEventListener("click", () => {
      state.filters.popularSize = rec.qty;
      renderPopularSizeIndicator();
      renderCatalog();
      scrollToCatalogIfNeeded();
    });
    el.budgetRecommendations.appendChild(btn);
  });
}

function renderBudgetColorOptions() {
  el.budgetColor.innerHTML = COLOR_OPTIONS.map((c) => `<option value="${c.key}">${c.name}</option>`).join("");
  el.budgetColor.value = state.budget.color;
}

async function renderGallery() {
  if (!el.galleryGrid || !el.gallerySection) return;
  if (!GALLERY.length) {
    el.gallerySection.classList.add("hidden");
    return;
  }

  const checks = await Promise.all(GALLERY.map((item) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = normalizeImagePath(item.src);
  })));

  const visibleItems = GALLERY.filter((_, idx) => checks[idx]);
  if (!visibleItems.length) {
    el.gallerySection.classList.add("hidden");
    el.galleryGrid.innerHTML = "";
    return;
  }

  el.gallerySection.classList.remove("hidden");
  el.galleryGrid.innerHTML = "";
  visibleItems.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-tile";
    button.innerHTML = `
      <div class="gallery-tile-media">
        <img src="${normalizeImagePath(item.src)}" alt="${item.alt}" loading="lazy" />
      </div>
      <p class="gallery-tile-caption">${item.caption}</p>
    `;
    button.addEventListener("click", () => {
      state.galleryIndex = GALLERY.findIndex((x) => x.src === item.src);
      openGalleryLightbox(state.galleryIndex);
    });
    el.galleryGrid.appendChild(button);
  });
}

function renderGalleryLightbox() {
  const current = GALLERY[state.galleryIndex];
  if (!current) return;
  el.galleryLightboxImage.classList.remove("hidden");
  el.galleryLightboxFallback.classList.add("hidden");
  el.galleryLightboxImage.alt = current.alt;
  el.galleryLightboxImage.src = normalizeImagePath(current.src);
  el.galleryLightboxCaption.textContent = current.caption;
  el.galleryLightboxImage.onerror = () => {
    el.galleryLightboxImage.classList.add("hidden");
    el.galleryLightboxFallback.classList.remove("hidden");
  };
}

function openGalleryLightbox(index) {
  state.galleryIndex = index;
  renderGalleryLightbox();
  el.galleryLightbox.showModal();
}

function shiftGallery(step) {
  if (!GALLERY.length) return;
  state.galleryIndex = (state.galleryIndex + step + GALLERY.length) % GALLERY.length;
  renderGalleryLightbox();
}

async function copyOrderTextWithFallback() {
  if (!state.orderDraft) return;
  const text = buildOrderMessage(state.orderDraft);
  const copied = await copyText(text, false);
  if (copied) {
    el.orderCopyFallback.classList.add("hidden");
    showToast("Скопировано ✅");
    return;
  }
  el.orderCopyFallback.value = text;
  el.orderCopyFallback.classList.remove("hidden");
  el.orderCopyFallback.focus();
  el.orderCopyFallback.select();
  showToast("Скопируйте текст вручную из поля ниже");
}

function formatOrderDate(value) {
  if (!value) return "без";
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString("ru-RU");
  } catch {
    return value;
  }
}

function buildOrderMessage(order) {
  return [
    "Здравствуйте!",
    "Хочу заказать букет:",
    "",
    `Номер: ${order.id}`,
    `Размер: ${order.qty} тюльпан${order.qty === 1 ? "" : "ов"}`,
    `Цвет: ${getColorMeta(order.color).name.toLowerCase()}`,
    `Упаковка: ${order.wrapMode === "wrap" ? "крафтовая бумага" : "без"}`,
    `Цена: ${formatPrice(order.price)}`,
    `Дата: ${formatOrderDate(order.date)}`,
    `Комментарий: ${order.comment || "без"}`,
  ].concat(["Спасибо!"]).join("\n");
}

function renderOrderSummary() {
  const d = state.orderDraft;
  if (!d) return;
  el.orderSummaryList.innerHTML = `
    <div class="order-row"><span>Размер</span><strong>${d.qty} тюльпан${d.qty === 1 ? "" : "ов"}</strong></div>
    <div class="order-row"><span>Цвет</span><strong>${getColorMeta(d.color).name.toLowerCase()}</strong></div>
    <div class="order-row"><span>Упаковка</span><strong>${d.wrapMode === "wrap" ? "крафт" : "без"}</strong></div>
    <div class="order-row order-row-total"><span>Цена</span><strong>${formatPrice(d.price)}</strong></div>
    <hr class="order-divider" />
  `;
  el.orderDate.value = d.date || "";
  el.orderComment.value = d.comment || "";
}

function setOrderStep(step) {
  state.orderStep = step;
  const summary = step === "summary";
  el.orderSummaryStep.classList.toggle("hidden", !summary);
  el.orderSummaryActions.classList.toggle("hidden", !summary);
  el.orderConfirmStep.classList.toggle("hidden", summary);
  el.orderConfirmActions.classList.toggle("hidden", summary);
}

function openOrderSummary(product, sel, preset = {}) {
  state.orderDraft = {
    productId: product.id,
    qty: productQty(product),
    color: preset.color || sel.color,
    wrapMode: preset.wrapMode || sel.wrapMode,
    price: getCurrentPrice(product, { color: preset.color || sel.color, wrapMode: preset.wrapMode || sel.wrapMode }),
    date: preset.date || "",
    comment: preset.comment || "",
    id: preset.id || "",
    createdAt: preset.createdAt || "",
    status: preset.status || "sent",
  };
  renderOrderSummary();
  setOrderStep("summary");
  if (el.modal.open) el.modal.close();
  el.orderSummaryModal.showModal();
}

function openChannel(kind, text = state.pendingMessage) {
  const hasText = Boolean(text);
  const encoded = encodeURIComponent(text || "");
  const links = {
    whatsapp: hasText ? `https://wa.me/${CONFIG.whatsappNumber}?text=${encoded}` : `https://wa.me/${CONFIG.whatsappNumber}`,
    telegram: hasText ? `${telegramLink()}?text=${encoded}` : telegramLink(),
    call: CONFIG.callLink,
  };
  window.open(links[kind], "_blank", "noopener");
}

function productQty(product) {
  if (Number.isFinite(product.qty)) return Number(product.qty);
  const m = product.title.match(/\d+/);
  return m ? Number(m[0]) : 1;
}

function cardBadges(product) {
  return Array.isArray(product.badges) && product.badges.length ? product.badges : ["Под заказ"];
}

function renderSkeletonCards(count = 6) {
  el.catalogGrid.innerHTML = "";
  for (let i = 0; i < count; i += 1) {
    const card = document.createElement("article");
    card.className = "card skeleton-card";
    card.innerHTML = `
      <div class="skeleton-media"></div>
      <div class="card-body">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-price"></div>
        <div class="skeleton-line skeleton-meta"></div>
        <div class="skeleton-btn"></div>
      </div>
    `;
    el.catalogGrid.appendChild(card);
  }
}

function occasionMatch(product) {
  const q = productQty(product);
  switch (state.filters.occasion) {
    case "birthday": return q >= 21;
    case "date": return q <= 21;
    case "mom": return q >= 13 && q <= 31;
    case "march8": return q >= 31;
    default: return true;
  }
}

function filteredProducts() {
  return state.products.filter((p) => {
    const s = getSelection(p.id);
    const price = getCurrentPrice(p, s);
    const inSearch = p.title.toLowerCase().includes(state.filters.search.toLowerCase());
    const inCategory = state.filters.category === "all" || p.category === state.filters.category;
    const inOccasion = occasionMatch(p);
    const inPopularSize = !state.filters.popularSize || productQty(p) === state.filters.popularSize;
    return inSearch && inCategory && inOccasion && inPopularSize;
  });
}

function createCard(product) {
  const frag = el.cardTemplate.content.cloneNode(true);
  const img = frag.querySelector(".card-media");
  const hint = frag.querySelector(".image-hint");
  const title = frag.querySelector(".card-title");
  const price = frag.querySelector(".card-price");
  const colorBadge = frag.querySelector(".card-color-badge");
  const meta = frag.querySelector(".card-meta");
  const sizeBadge = frag.querySelector(".card-size-badge");
  const miniBadges = frag.querySelector(".card-mini-badges");
  const orderBtn = frag.querySelector(".card-order");

  const sel = getSelection(product.id);
  const colorMeta = getColorMeta(sel.color);
  title.textContent = product.title;
  price.textContent = formatPrice(getCurrentPrice(product, sel));
  colorBadge.textContent = `Цвет: ${colorMeta.name}`;
  colorBadge.style.setProperty("--color-accent", colorMeta.swatch);
  meta.textContent = `${product.category} · ${sel.wrapMode === "wrap" ? "Крафт" : "Без упаковки"}`;
  sizeBadge.textContent = `${productQty(product)} шт`;
  miniBadges.innerHTML = cardBadges(product).map((tag) => `<span class="mini-badge">${tag}</span>`).join("");
  const cardRoot = frag.querySelector(".card");
  cardRoot?.style.setProperty("--color-accent", colorMeta.swatch);
  updateImageWithFade(img, hint, resolveImage(product, sel));

  orderBtn.addEventListener("click", () => {
    state.currentProduct = product;
    renderProductModal();
    el.modal.showModal();
  });

  return frag;
}

function renderCatalog() {
  const list = filteredProducts();
  el.catalogGrid.innerHTML = "";
  list.forEach((p) => el.catalogGrid.appendChild(createCard(p)));
  el.catalogGrid.classList.remove("catalog-ready");
  requestAnimationFrame(() => el.catalogGrid.classList.add("catalog-ready"));
  el.resultsCount.textContent = `Найдено: ${list.length}`;
  el.emptyState.classList.toggle("hidden", list.length > 0);
}

function renderOccasionIndicator() {
  const map = { birthday: "День рождения", date: "Свидание", mom: "Маме", march8: "8 марта", just: "Просто так" };
  if (!state.filters.occasion || state.filters.occasion === "just") {
    el.occasionIndicator.classList.add("hidden");
    return;
  }
  el.occasionIndicator.classList.remove("hidden");
  el.occasionIndicator.innerHTML = `<span class="occasion-selected">Выбрано: ${map[state.filters.occasion]}</span> <button id="occasion-reset" class="btn btn-secondary btn-reset" type="button">Сбросить</button>`;
  el.occasionIndicator.querySelector("#occasion-reset").addEventListener("click", () => {
    state.filters.occasion = "";
    el.occasionButtons.forEach((b) => b.classList.remove("is-active"));
    renderOccasionIndicator();
    renderCatalog();
  });
}

function renderPopularSizeIndicator() {
  el.popularSizeButtons.forEach((button) => {
    const active = Number(button.dataset.popularSize) === state.filters.popularSize;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (!state.filters.popularSize) {
    el.popularSizeIndicator.classList.add("hidden");
    el.popularSizeIndicator.textContent = "";
    return;
  }

  el.popularSizeIndicator.classList.remove("hidden");
  el.popularSizeIndicator.innerHTML = `Показано: <strong>${state.filters.popularSize}</strong> <button id="popular-size-reset" type="button">Сбросить</button>`;
  el.popularSizeIndicator.querySelector("#popular-size-reset").addEventListener("click", () => {
    state.filters.popularSize = null;
    renderPopularSizeIndicator();
    renderCatalog();
  });
}

function renderProductModal() {
  const p = state.currentProduct;
  if (!p) return;
  const sel = getSelection(p.id);
  el.modalCategory.textContent = p.category;
  el.modalTitle.textContent = p.title;
  el.modalPrice.textContent = formatPrice(getCurrentPrice(p, sel));
  el.modalDescription.textContent = p.description;
  el.modalColorName.textContent = getColorMeta(sel.color).name;
  updateImageWithFade(el.modalImage, el.modalMissingHint, resolveImage(p, sel));
  renderSwatches(el.modalSwatches, sel.color, (color) => {
    getSelection(p.id).color = color;
    renderProductModal();
    renderCatalog();
  });
  applySegmentState(el.modalWrapToggle, sel.wrapMode);
}

function resetWizard() {
  state.wizard = { step: 0, answers: {}, finalMode: false };
  el.wizardHint.textContent = "";
}

function readWizardValue(step) {
  if (step.type === "select") return el.wizardSelect.value;
  if (step.type === "textarea") return el.wizardTextarea.value.trim();
  return el.wizardInput.value.trim();
}

function fillWizardField(step) {
  const v = state.wizard.answers[step.key] || "";
  el.wizardInput.classList.toggle("hidden", step.type !== "text");
  el.wizardTextarea.classList.toggle("hidden", step.type !== "textarea");
  el.wizardSelect.classList.toggle("hidden", step.type !== "select");
  if (step.type === "select") {
    el.wizardSelect.innerHTML = "";
    step.options.forEach((o) => {
      const opt = document.createElement("option");
      opt.value = o;
      opt.textContent = o;
      el.wizardSelect.appendChild(opt);
    });
    el.wizardSelect.value = v || step.options[0];
    return;
  }
  if (step.type === "textarea") {
    el.wizardTextarea.value = v;
    el.wizardTextarea.placeholder = step.placeholder || "Введите ответ";
    return;
  }
  el.wizardInput.value = v;
  el.wizardInput.placeholder = step.placeholder || "Введите ответ";
}

function makeWizardText() {
  const a = state.wizard.answers;
  const lines = ["Здравствуйте! Хочу индивидуальный букет."];
  if (a.forWhom) lines.push(`Для кого: ${a.forWhom}`);
  if (a.occasion) lines.push(`Повод: ${a.occasion}`);
  if (a.palette) lines.push(`Цветы/гамма: ${a.palette}`);
  if (a.budget) lines.push(`Бюджет: ${a.budget}`);
  if (a.wishes) lines.push(`Пожелания: ${a.wishes}`);
  lines.push("Перед передачей отправим фото букета.");
  lines.push("Спасибо!");
  return lines.join("\n");
}

function renderWizard() {
  const final = state.wizard.finalMode;
  el.wizardFinal.classList.toggle("hidden", !final);
  el.wizardInputWrap.classList.toggle("hidden", final);
  el.wizardQuestion.classList.toggle("hidden", final);
  el.wizardStepActions.classList.toggle("hidden", final);
  el.wizardFinalActions.classList.toggle("hidden", !final);

  if (final) {
    el.wizardProgress.textContent = "Готово";
    el.wizardProgressFill.style.width = "100%";
    el.wizardPreview.value = makeWizardText();
    return;
  }

  const step = WIZARD_STEPS[state.wizard.step];
  el.wizardProgress.textContent = `Шаг ${state.wizard.step + 1} из ${WIZARD_STEPS.length}`;
  el.wizardProgressFill.style.width = `${((state.wizard.step + 1) / WIZARD_STEPS.length) * 100}%`;
  el.wizardQuestion.textContent = step.question;
  fillWizardField(step);
}

function nextWizard(skip = false) {
  const step = WIZARD_STEPS[state.wizard.step];
  if (!skip) state.wizard.answers[step.key] = readWizardValue(step);
  if (state.wizard.step >= WIZARD_STEPS.length - 1) {
    state.wizard.finalMode = true;
    renderWizard();
    return;
  }
  state.wizard.step += 1;
  renderWizard();
}

function mixUnitPrice(qty) {
  if (qty >= 101) return 115;
  if (qty >= 51) return 120;
  return 135;
}

function currentMixPrice() {
  const nowrap = mixUnitPrice(state.mix.qty) * state.mix.qty;
  return state.mix.wrapMode === "wrap" ? nowrap + WRAP_ADDON : nowrap;
}

function currentMixStyleMeta() {
  return MIX_STYLES.find((s) => s.key === state.mix.style) || MIX_STYLES[0];
}

function renderMix() {
  el.mixQty.innerHTML = "";
  MIX_QTY.forEach((q) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = q;
    b.classList.toggle("is-active", state.mix.qty === q);
    b.addEventListener("click", () => {
      state.mix.qty = q;
      renderMix();
    });
    el.mixQty.appendChild(b);
  });

  renderSwatches(el.mixColors, state.mix.colors, (key) => {
    const i = state.mix.colors.indexOf(key);
    if (i >= 0) state.mix.colors.splice(i, 1);
    else if (state.mix.colors.length < 4) state.mix.colors.push(key);
    if (!state.mix.colors.length) state.mix.colors = ["white"];
    renderMix();
  }, 4);

  el.mixColorsText.textContent = `Выбрано: ${state.mix.colors.map((k) => getColorMeta(k).name).join(", ")}`;

  el.mixStyles.innerHTML = "";
  MIX_STYLES.forEach((s) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = s.label;
    b.classList.toggle("is-active", state.mix.style === s.key);
    b.addEventListener("click", () => {
      state.mix.style = s.key;
      renderMix();
    });
    el.mixStyles.appendChild(b);
  });

  applySegmentState(el.mixWrap, state.mix.wrapMode);
  el.mixExampleImg.src = normalizeImagePath(currentMixStyleMeta().image);
  el.mixSummary.innerHTML = `
    <strong>Итого</strong><br />
    Количество: ${state.mix.qty}<br />
    Цвета: ${state.mix.colors.map((k) => getColorMeta(k).name).join(", ")}<br />
    Стиль: ${currentMixStyleMeta().label}<br />
    Упаковка: ${state.mix.wrapMode === "wrap" ? "С крафтовой бумагой" : "Без бумаги"}<br />
    Цена: <strong>${formatPrice(currentMixPrice())}</strong>
  `;
}

function mixText() {
  return [
    "Здравствуйте! Хочу микс-букет из тюльпанов.",
    `Количество: ${state.mix.qty}`,
    `Цвета: ${state.mix.colors.map((k) => getColorMeta(k).name).join(", ")}`,
    `Стиль: ${currentMixStyleMeta().label}`,
    `Упаковка: ${state.mix.wrapMode === "wrap" ? "крафт" : "без бумаги"}`,
    `Цена: ${formatPrice(currentMixPrice())}`,
    "Перед передачей отправим фото букета.",
    "Спасибо!",
  ].join("\n");
}

function dedupeGuarantees() {
  const section = el.guaranteesSection;
  if (!section) return;
  const cards = section.querySelectorAll(".pill-card");
  const seen = new Set();
  cards.forEach((card) => {
    const title = card.querySelector("h3")?.textContent?.trim().toLowerCase();
    if (!title) return;
    if (seen.has(title)) {
      card.remove();
      return;
    }
    seen.add(title);
  });
}

function bindFaqAccordion() {
  if (!el.faqItems.length) return;

  const setOpen = (target) => {
    el.faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const active = item === target;
      item.classList.toggle("is-open", active);
      question?.setAttribute("aria-expanded", String(active));
    });
  };

  el.faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    question?.addEventListener("click", () => setOpen(item));
  });

  const initiallyOpen = [...el.faqItems].find((item) => item.classList.contains("is-open"));
  if (initiallyOpen) setOpen(initiallyOpen);
}

function bindEvents() {
  el.searchInput.addEventListener("input", (e) => {
    state.filters.search = e.target.value.trim();
    renderCatalog();
  });
  el.categorySelect.addEventListener("change", (e) => {
    state.filters.category = e.target.value;
    renderCatalog();
  });

  el.occasionButtons.forEach((b) => b.addEventListener("click", () => {
    el.occasionButtons.forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    state.filters.occasion = b.dataset.occasion;
    renderOccasionIndicator();
    renderCatalog();
  }));

  el.popularSizeButtons.forEach((button) => button.addEventListener("click", () => {
    const value = Number(button.dataset.popularSize);
    state.filters.popularSize = state.filters.popularSize === value ? null : value;
    renderPopularSizeIndicator();
    renderCatalog();
  }));

  el.budgetInput.addEventListener("input", () => {
    state.budget.value = el.budgetInput.value;
    renderBudgetRecommendations();
  });
  el.budgetPresets.forEach((button) => button.addEventListener("click", () => {
    el.budgetPresets.forEach((x) => x.classList.remove("is-active"));
    button.classList.add("is-active");
    el.budgetInput.value = button.dataset.budgetPreset;
    state.budget.value = el.budgetInput.value;
    renderBudgetRecommendations();
  }));
  el.budgetWrap.addEventListener("change", () => {
    state.budget.wrapMode = el.budgetWrap.checked ? "wrap" : "nowrap";
    renderBudgetRecommendations();
  });
  el.budgetColor.addEventListener("change", () => {
    state.budget.color = el.budgetColor.value;
    renderBudgetRecommendations();
  });

  el.modalClose.addEventListener("click", () => el.modal.close());
  el.modalWrapToggle.querySelectorAll("button[data-wrap]").forEach((b) => b.addEventListener("click", () => {
    if (!state.currentProduct) return;
    getSelection(state.currentProduct.id).wrapMode = b.dataset.wrap;
    renderProductModal();
    renderCatalog();
  }));
  el.orderButton.addEventListener("click", () => {
    if (!state.currentProduct) return;
    openOrderSummary(state.currentProduct, getSelection(state.currentProduct.id));
  });
  el.copyButton.addEventListener("click", async () => {
    if (!state.currentProduct) return;
    const ok = await copyText(makeOrderText(state.currentProduct, getSelection(state.currentProduct.id)), false);
    el.copyButton.textContent = ok ? "Текст скопирован" : "Скопируйте вручную";
    setTimeout(() => (el.copyButton.textContent = "Скопировать текст заказа"), 1200);
  });

  el.openWizard.addEventListener("click", () => {
    resetWizard();
    renderWizard();
    el.wizardModal.showModal();
  });
  el.wizardClose.addEventListener("click", () => el.wizardModal.close());
  el.wizardNext.addEventListener("click", () => nextWizard(false));
  el.wizardSkip.addEventListener("click", () => nextWizard(true));
  el.wizardCopy.addEventListener("click", () => copyText(makeWizardText()));
  el.wizardContact.addEventListener("click", async () => {
    const text = makeWizardText();
    await copyText(text);
    openMessengerChoice("Куда написать?", "Текст заявки уже скопирован", text);
  });

  const openFloristContact = () => openMessengerChoice("Связаться", "Выберите удобный канал для связи с флористом.", "");
  el.openContact.addEventListener("click", openFloristContact);

  el.openMix.addEventListener("click", () => {
    renderMix();
    el.mixModal.showModal();
  });
  el.mixClose.addEventListener("click", () => el.mixModal.close());
  el.mixWrap.querySelectorAll("button[data-wrap]").forEach((b) => b.addEventListener("click", () => {
    state.mix.wrapMode = b.dataset.wrap;
    renderMix();
  }));
  el.mixOrder.addEventListener("click", async () => {
    const text = mixText();
    await copyText(text);
    openMessengerChoice("Куда написать?", "Текст микс-заявки уже скопирован", text);
  });

  const closeByOverlay = (dialog) => dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });
  closeByOverlay(el.modal);
  closeByOverlay(el.orderSummaryModal);
  closeByOverlay(el.galleryLightbox);

  el.orderSummaryClose.addEventListener("click", () => el.orderSummaryModal.close());
  el.orderEdit.addEventListener("click", () => el.orderSummaryModal.close());
  el.orderBack.addEventListener("click", () => setOrderStep("summary"));
  el.orderDone.addEventListener("click", () => el.orderSummaryModal.close());
  el.orderIdCopy.addEventListener("click", () => {
    if (!state.orderDraft?.id) return;
    copyText(state.orderDraft.id);
  });
  el.orderCopyText.addEventListener("click", copyOrderTextWithFallback);

  const continueOrder = () => {
    if (!state.orderDraft) return;
    state.orderDraft.date = el.orderDate.value;
    state.orderDraft.comment = el.orderComment.value.trim();
    state.orderDraft.createdAt = state.orderDraft.createdAt || new Date().toISOString();
    state.orderDraft.id = state.orderDraft.id || `TLP-${Math.floor(1000 + Math.random() * 9000)}`;
    el.orderId.textContent = state.orderDraft.id;
    setOrderStep("confirm");
  };
  el.orderContinue.addEventListener("click", continueOrder);

  const sendOrder = (kind) => {
    if (!state.orderDraft) return;
    const text = buildOrderMessage(state.orderDraft);
    openChannel(kind, text);
  };
  el.orderTelegram.addEventListener("click", () => sendOrder("telegram"));
  el.orderWhatsapp.addEventListener("click", () => sendOrder("whatsapp"));
  el.orderCall.addEventListener("click", () => sendOrder("call"));

  el.galleryClose.addEventListener("click", () => el.galleryLightbox.close());
  el.galleryPrev.addEventListener("click", () => shiftGallery(-1));
  el.galleryNext.addEventListener("click", () => shiftGallery(1));
  el.galleryLightbox.addEventListener("touchstart", (e) => {
    state.galleryTouchStartX = e.changedTouches?.[0]?.clientX ?? null;
  });
  el.galleryLightbox.addEventListener("touchend", (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (state.galleryTouchStartX == null || endX == null) return;
    const diff = endX - state.galleryTouchStartX;
    if (Math.abs(diff) > 40) shiftGallery(diff < 0 ? 1 : -1);
    state.galleryTouchStartX = null;
  });
  document.addEventListener("keydown", (e) => {
    if (!el.galleryLightbox.open) return;
    if (e.key === "ArrowLeft") shiftGallery(-1);
    if (e.key === "ArrowRight") shiftGallery(1);
  });

  el.messengerTelegram.addEventListener("click", () => openChannel("telegram"));
  el.messengerWhatsapp.addEventListener("click", () => openChannel("whatsapp"));
  el.messengerCall.addEventListener("click", () => openChannel("call"));
  el.messengerClose.addEventListener("click", () => el.messengerModal.close());
}

async function init() {
  renderHeader();
  dedupeGuarantees();
  bindFaqAccordion();
  bindEvents();
  try {
    renderSkeletonCards(6);
    const res = await fetch("data/products.json", { cache: "no-store" });
    state.products = await res.json();
    state.products.forEach((p) => getSelection(p.id));
    [...new Set(state.products.map((p) => p.category))].forEach((cat) => {
      const o = document.createElement("option");
      o.value = cat;
      o.textContent = cat;
      el.categorySelect.appendChild(o);
    });
    renderCatalog();
    renderPopularSizeIndicator();
    renderBudgetColorOptions();
    renderBudgetRecommendations();
    await renderGallery();
    renderMix();
  } catch {
    el.catalogGrid.innerHTML = "<p class='empty-state'>Не удалось загрузить каталог.</p>";
  }
}

init();
