const CONFIG = {
  shopName: "Цветы",
  city: "Казань",
  phone: "+7 (900) 000-00-00",
  whatsappNumber: "79000000000",
  telegramUsernameOrLink: "https://t.me/flower_shop_demo",
  preferredMessenger: "whatsapp",
  currency: "₽",
  workingHours: "Ежедневно, 08:00–21:00",
  deliveryInfo: "Доставка по городу 60–90 минут",
  minimumOrder: 1500,
};

const state = {
  products: [],
  currentProduct: null,
  filters: {
    search: "",
    price: "all",
    category: "all",
  },
};

const elements = {
  shopTitle: document.getElementById("shop-title"),
  shopMeta: document.getElementById("shop-meta"),
  shopInfo: document.getElementById("shop-info"),
  contactLinks: document.getElementById("contact-links"),
  popularGrid: document.getElementById("popular-grid"),
  catalogGrid: document.getElementById("catalog-grid"),
  resultsCount: document.getElementById("results-count"),
  emptyState: document.getElementById("empty-state"),
  searchInput: document.getElementById("search"),
  categorySelect: document.getElementById("category"),
  priceButtons: document.querySelectorAll("[data-price]"),
  cardTemplate: document.getElementById("card-template"),
  modal: document.getElementById("product-modal"),
  modalClose: document.getElementById("modal-close"),
  modalGallery: document.getElementById("modal-gallery"),
  modalCategory: document.getElementById("modal-category"),
  modalTitle: document.getElementById("modal-title"),
  modalPrice: document.getElementById("modal-price"),
  modalDescription: document.getElementById("modal-description"),
  modalTags: document.getElementById("modal-tags"),
  modalAvailability: document.getElementById("modal-availability"),
  modalSize: document.getElementById("modal-size"),
  modalComposition: document.getElementById("modal-composition"),
  orderButton: document.getElementById("order-button"),
  copyButton: document.getElementById("copy-button"),
};

function formatPrice(value) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ${CONFIG.currency}`;
}

function resolveTelegramLink(input) {
  if (!input) return "";
  if (input.startsWith("http")) return input;
  return `https://t.me/${input.replace("@", "")}`;
}

function renderShopInfo() {
  document.title = `${CONFIG.shopName} • ${CONFIG.city}`;
  elements.shopTitle.textContent = `${CONFIG.shopName} • ${CONFIG.city}`;
  elements.shopMeta.textContent = `${CONFIG.phone} · ${CONFIG.workingHours}`;
  elements.shopInfo.innerHTML = `
    <p><strong>Часы работы:</strong> ${CONFIG.workingHours}</p>
    <p><strong>Доставка:</strong> ${CONFIG.deliveryInfo}</p>
    ${CONFIG.minimumOrder ? `<p><strong>Минимальный заказ:</strong> ${formatPrice(CONFIG.minimumOrder)}</p>` : ""}
  `;
  const telegramLink = resolveTelegramLink(CONFIG.telegramUsernameOrLink);
  elements.contactLinks.innerHTML = `
    <a href="tel:${CONFIG.phone.replace(/[^\d+]/g, "")}">Позвонить</a>
    <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank" rel="noreferrer">WhatsApp</a>
    <a href="${telegramLink}" target="_blank" rel="noreferrer">Telegram</a>
  `;
}

function availabilityLabel(value) {
  return value === "in_stock" ? "В наличии" : "Под заказ";
}

function createCard(product) {
  const fragment = elements.cardTemplate.content.cloneNode(true);
  const image = fragment.querySelector(".card-media");
  const tags = fragment.querySelector(".tag-list");

  image.src = product.images?.[0] || "assets/placeholder-1.svg";
  image.alt = product.title;
  fragment.querySelector(".card-title").textContent = product.title;
  fragment.querySelector(".card-short").textContent = product.short;
  fragment.querySelector(".card-price").textContent = formatPrice(product.price);

  (product.tags || []).forEach((tag) => {
    const li = document.createElement("li");
    li.textContent = tag;
    tags.appendChild(li);
  });

  const button = fragment.querySelector("button");
  button.addEventListener("click", () => openModal(product.id));

  return fragment;
}

function filteredProducts() {
  return state.products.filter((product) => {
    const inSearch = product.title.toLowerCase().includes(state.filters.search.toLowerCase());
    const inCategory = state.filters.category === "all" || product.category === state.filters.category;

    let inPrice = true;
    if (state.filters.price === "2000") inPrice = product.price <= 2000;
    if (state.filters.price === "4000") inPrice = product.price <= 4000;
    if (state.filters.price === "4000+") inPrice = product.price >= 4000;

    return inSearch && inCategory && inPrice;
  });
}

function renderPopular() {
  elements.popularGrid.innerHTML = "";
  state.products.slice(0, 6).forEach((product) => {
    elements.popularGrid.appendChild(createCard(product));
  });
}

function renderCatalog() {
  const list = filteredProducts();
  elements.catalogGrid.innerHTML = "";

  list.forEach((product) => {
    elements.catalogGrid.appendChild(createCard(product));
  });

  elements.resultsCount.textContent = `Найдено: ${list.length}`;
  elements.emptyState.classList.toggle("hidden", list.length > 0);
}

function populateCategories() {
  const categories = [...new Set(state.products.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category[0].toUpperCase() + category.slice(1);
    elements.categorySelect.appendChild(option);
  });
}

function orderText(product) {
  return `Хочу заказать: ${product.title} за ${formatPrice(product.price)}. Дата/время: __. Адрес: __. Комментарий: __.`;
}

function openMessenger(product) {
  const text = encodeURIComponent(orderText(product));
  const telegramLink = resolveTelegramLink(CONFIG.telegramUsernameOrLink);

  const urls = {
    whatsapp: `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`,
    telegram: `${telegramLink}${telegramLink.includes("?") ? "&" : "?"}text=${text}`,
  };

  window.open(urls[CONFIG.preferredMessenger] || urls.whatsapp, "_blank", "noopener");
}

async function copyOrderText(product) {
  const text = orderText(product);
  await navigator.clipboard.writeText(text);
  elements.copyButton.textContent = "Текст скопирован";
  setTimeout(() => {
    elements.copyButton.textContent = "Скопировать текст заказа";
  }, 1400);
}

function openModal(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  state.currentProduct = product;

  elements.modalCategory.textContent = product.category;
  elements.modalTitle.textContent = product.title;
  elements.modalPrice.textContent = formatPrice(product.price);
  elements.modalDescription.textContent = product.description;
  elements.modalAvailability.textContent = availabilityLabel(product.availability);
  elements.modalSize.textContent = product.size || "Стандарт";
  elements.modalComposition.textContent = product.composition || "Уточните состав при заказе";

  elements.modalTags.innerHTML = "";
  (product.tags || []).forEach((tag) => {
    const li = document.createElement("li");
    li.textContent = tag;
    elements.modalTags.appendChild(li);
  });

  elements.modalGallery.innerHTML = "";
  (product.images || ["assets/placeholder-1.svg"]).forEach((image) => {
    const img = document.createElement("img");
    img.src = image;
    img.alt = product.title;
    img.loading = "lazy";
    elements.modalGallery.appendChild(img);
  });

  elements.modal.showModal();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.trim();
    renderCatalog();
  });

  elements.categorySelect.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    renderCatalog();
  });

  elements.priceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      elements.priceButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      state.filters.price = button.dataset.price;
      renderCatalog();
    });
  });

  elements.modalClose.addEventListener("click", () => elements.modal.close());
  elements.modal.addEventListener("click", (event) => {
    const article = elements.modal.querySelector("article");
    if (!article.contains(event.target)) elements.modal.close();
  });

  elements.orderButton.addEventListener("click", () => {
    if (state.currentProduct) openMessenger(state.currentProduct);
  });

  elements.copyButton.addEventListener("click", async () => {
    if (!state.currentProduct) return;
    try {
      await copyOrderText(state.currentProduct);
    } catch {
      elements.copyButton.textContent = "Скопируйте вручную";
    }
  });
}

async function init() {
  renderShopInfo();
  bindEvents();

  try {
    const response = await fetch("data/products.json", { cache: "no-store" });
    state.products = await response.json();
    populateCategories();
    renderPopular();
    renderCatalog();
  } catch {
    elements.catalogGrid.innerHTML = "<p class='empty-state'>Не удалось загрузить каталог. Проверьте файл data/products.json.</p>";
  }
}

init();
