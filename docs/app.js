const WRAP_DISCOUNT = 200;

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
  { key: "pink_center", name: "Розовый с белым центром", swatch: "radial-gradient(circle at 45% 45%, #FFFFFF 0 35%, #FF5AA5 36% 100%)" },
  { key: "pink", name: "Розовый", swatch: "#FF5AA5" },
  { key: "yellow", name: "Жёлтый", swatch: "#F7C948" },
  { key: "purple", name: "Фиолетовый", swatch: "#6D28D9" },
];

const PLACEHOLDER_IMAGE = "assets/placeholder-1.svg";

const state = {
  products: [],
  currentProduct: null,
  selectionById: {},
  filters: { search: "", price: "all", category: "all" },
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
  priceButtons: document.querySelectorAll("[data-price]"),
  cardTemplate: document.getElementById("card-template"),
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
  messengerModal: document.getElementById("messenger-modal"),
  messengerClose: document.getElementById("messenger-close"),
  messengerTelegram: document.getElementById("messenger-telegram"),
  messengerWhatsapp: document.getElementById("messenger-whatsapp"),
  messengerCall: document.getElementById("messenger-call"),
};

function formatPrice(value) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ${CONFIG.currency}`;
}

function normalizeImagePath(path) {
  if (!path) return PLACEHOLDER_IMAGE;
  return encodeURI(String(path).trim().replace(/\\/g, "/"));
}

function getTelegramLink() {
  if (CONFIG.telegramUsernameOrLink.startsWith("http")) return CONFIG.telegramUsernameOrLink;
  return `https://t.me/${CONFIG.telegramUsernameOrLink.replace("@", "")}`;
}

function getSelection(productId) {
  if (!state.selectionById[productId]) {
    state.selectionById[productId] = { color: "white", wrapMode: "wrap" };
  }
  return state.selectionById[productId];
}

function getColorMeta(colorKey) {
  return COLOR_OPTIONS.find((c) => c.key === colorKey) || COLOR_OPTIONS[0];
}

function getCurrentPrice(product, selection) {
  return selection.wrapMode === "nowrap" ? Math.max(product.price - WRAP_DISCOUNT, 0) : product.price;
}

function resolveImage(product, selection) {
  return product.images?.[selection.color]?.[selection.wrapMode] || PLACEHOLDER_IMAGE;
}

function updateImageWithFade(img, hintNode, srcPath) {
  const finalSrc = normalizeImagePath(srcPath);
  const fallbackSrc = normalizeImagePath(PLACEHOLDER_IMAGE);
  img.style.opacity = "0";

  const temp = new Image();
  temp.onload = () => {
    img.src = finalSrc;
    img.style.opacity = "1";
    hintNode?.classList.toggle("hidden", true);
  };
  temp.onerror = () => {
    img.src = fallbackSrc;
    img.style.opacity = "1";
    hintNode?.classList.toggle("hidden", false);
  };
  temp.src = finalSrc;
}

function makeOrderText(product, selection) {
  const colorName = getColorMeta(selection.color).name;
  const wrapLabel = selection.wrapMode === "wrap" ? "крафт" : "без бумаги";
  const price = formatPrice(getCurrentPrice(product, selection));
  return `Здравствуйте! Хочу заказать: ${product.title}. Цвет: ${colorName}. Упаковка: ${wrapLabel}. Цена: ${price}. Дата/время: __. Адрес: __.`;
}

function renderHeader() {
  el.shopTitle.textContent = `${CONFIG.shopName} • ${CONFIG.city}`;
  el.shopMeta.textContent = CONFIG.phone;
  el.contactLinks.innerHTML = `
    <a href="${CONFIG.callLink}">Позвонить</a>
    <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a href="${getTelegramLink()}" target="_blank" rel="noreferrer">Telegram</a>
  `;
}

function applySegmentState(container, wrapMode) {
  container.querySelectorAll("button[data-wrap]").forEach((button) => {
    const active = button.dataset.wrap === wrapMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderSwatches(container, selection, onSelect) {
  container.innerHTML = "";
  COLOR_OPTIONS.forEach((color) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "swatch";
    if (selection.color === color.key) button.classList.add("is-selected");
    button.setAttribute("aria-label", `Цвет: ${color.name}`);
    button.style.background = color.swatch;
    if (color.border) button.style.borderColor = "#D0D0D0";
    button.addEventListener("click", () => onSelect(color.key));
    container.appendChild(button);
  });
}

function createCard(product) {
  const fragment = el.cardTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".card");
  const img = fragment.querySelector(".card-media");
  const hint = fragment.querySelector(".image-hint");
  const title = fragment.querySelector(".card-title");
  const short = fragment.querySelector(".card-short");
  const price = fragment.querySelector(".card-price");
  const swatches = fragment.querySelector(".swatches");
  const colorName = fragment.querySelector(".selected-color");
  const segment = fragment.querySelector(".segment");
  const openBtn = fragment.querySelector(".btn-small");

  title.textContent = product.title;
  short.textContent = product.short;

  const updateCard = () => {
    const selection = getSelection(product.id);
    colorName.textContent = getColorMeta(selection.color).name;
    price.textContent = formatPrice(getCurrentPrice(product, selection));
    updateImageWithFade(img, hint, resolveImage(product, selection));
    renderSwatches(swatches, selection, (color) => {
      getSelection(product.id).color = color;
      updateCard();
      if (state.currentProduct?.id === product.id) renderModal();
    });
    applySegmentState(segment, selection.wrapMode);
  };

  segment.querySelectorAll("button[data-wrap]").forEach((button) => {
    button.addEventListener("click", () => {
      getSelection(product.id).wrapMode = button.dataset.wrap;
      updateCard();
      if (state.currentProduct?.id === product.id) renderModal();
    });
  });

  openBtn.addEventListener("click", () => {
    state.currentProduct = product;
    renderModal();
    el.modal.showModal();
  });

  card.style.cursor = "pointer";
  updateCard();
  return fragment;
}

function filteredProducts() {
  return state.products.filter((product) => {
    const search = product.title.toLowerCase().includes(state.filters.search.toLowerCase());
    const category = state.filters.category === "all" || product.category === state.filters.category;
    const activePrice = getCurrentPrice(product, getSelection(product.id));
    let priceOk = true;
    if (state.filters.price === "2000") priceOk = activePrice <= 2000;
    if (state.filters.price === "4000") priceOk = activePrice <= 4000;
    if (state.filters.price === "4000+") priceOk = activePrice >= 4000;
    return search && category && priceOk;
  });
}

function renderCatalog() {
  const products = filteredProducts();
  el.catalogGrid.innerHTML = "";
  products.forEach((p) => el.catalogGrid.appendChild(createCard(p)));
  el.resultsCount.textContent = `Найдено: ${products.length}`;
  el.emptyState.classList.toggle("hidden", products.length > 0);
}

function populateCategories() {
  const categories = [...new Set(state.products.map((p) => p.category))];
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    el.categorySelect.appendChild(option);
  });
}

function renderModal() {
  const product = state.currentProduct;
  if (!product) return;
  const selection = getSelection(product.id);

  el.modalCategory.textContent = product.category;
  el.modalTitle.textContent = product.title;
  el.modalPrice.textContent = formatPrice(getCurrentPrice(product, selection));
  el.modalDescription.textContent = product.description;
  el.modalColorName.textContent = getColorMeta(selection.color).name;
  el.modalImage.alt = product.title;
  updateImageWithFade(el.modalImage, el.modalMissingHint, resolveImage(product, selection));

  renderSwatches(el.modalSwatches, selection, (color) => {
    getSelection(product.id).color = color;
    renderModal();
    renderCatalog();
  });

  applySegmentState(el.modalWrapToggle, selection.wrapMode);
}

function openMessenger(kind) {
  const product = state.currentProduct;
  if (!product) return;
  const text = encodeURIComponent(makeOrderText(product, getSelection(product.id)));

  const links = {
    whatsapp: `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`,
    telegram: `${getTelegramLink()}?text=${text}`,
    call: CONFIG.callLink,
  };

  window.open(links[kind], "_blank", "noopener");
  el.messengerModal.close();
}

async function copyOrderText() {
  if (!state.currentProduct) return;
  const text = makeOrderText(state.currentProduct, getSelection(state.currentProduct.id));
  try {
    await navigator.clipboard.writeText(text);
    el.copyButton.textContent = "Текст скопирован";
    setTimeout(() => { el.copyButton.textContent = "Скопировать текст заказа"; }, 1200);
  } catch {
    el.copyButton.textContent = "Скопируйте вручную";
  }
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

  el.priceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      el.priceButtons.forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
      state.filters.price = button.dataset.price;
      renderCatalog();
    });
  });

  el.modalClose.addEventListener("click", () => el.modal.close());
  el.modalWrapToggle.querySelectorAll("button[data-wrap]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.currentProduct) return;
      getSelection(state.currentProduct.id).wrapMode = button.dataset.wrap;
      renderModal();
      renderCatalog();
    });
  });

  el.orderButton.addEventListener("click", () => el.messengerModal.showModal());
  el.copyButton.addEventListener("click", copyOrderText);

  el.messengerTelegram.addEventListener("click", () => openMessenger("telegram"));
  el.messengerWhatsapp.addEventListener("click", () => openMessenger("whatsapp"));
  el.messengerCall.addEventListener("click", () => openMessenger("call"));
  el.messengerClose.addEventListener("click", () => el.messengerModal.close());
}

async function init() {
  renderHeader();
  bindEvents();

  try {
    const response = await fetch("data/products.json", { cache: "no-store" });
    state.products = await response.json();
    state.products.forEach((product) => getSelection(product.id));
    populateCategories();
    renderCatalog();
  } catch {
    el.catalogGrid.innerHTML = "<p class='empty-state'>Не удалось загрузить каталог.</p>";
  }
}

init();
