/**
 * Northwind Gourmet Market - Client Application
 * Powered by Jev IA (TypeSafe AI System One Models)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    products: [],
    categories: [],
    cart: JSON.parse(localStorage.getItem("northwind_jev_cart") || "[]"),
    activeCategory: "all",
    searchQuery: "",
    sortBy: "featured",
    apiKey: localStorage.getItem("typesafe_api_key") || "",
    currentRecommendation: null,
    isRecommending: false,
    recommendationDebounceTimer: null
  };

  // DOM Elements
  const productsGrid = document.getElementById("productsGrid");
  const categoriesBar = document.getElementById("categoriesBar");
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const sortSelect = document.getElementById("sortSelect");
  const productCountInfo = document.getElementById("productCountInfo");

  // Cart DOM Elements
  const cartTriggerBtn = document.getElementById("cartTriggerBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const cartCountBadge = document.getElementById("cartCountBadge");
  const cartNavTotal = document.getElementById("cartNavTotal");
  const drawerCartCount = document.getElementById("drawerCartCount");
  const drawerSubtotal = document.getElementById("drawerSubtotal");
  const drawerShipping = document.getElementById("drawerShipping");
  const drawerTotal = document.getElementById("drawerTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const shippingProgressBar = document.getElementById("shippingProgressBar");
  const shippingValue = document.getElementById("shippingValue");
  const cartAiBox = document.getElementById("cartAiBox");
  const cartAiContent = document.getElementById("cartAiContent");
  const cartAiProb = document.getElementById("cartAiProb");

  // Hero AI Strip DOM Elements
  const heroAiStrip = document.getElementById("heroAiStrip");
  const stripProductCard = document.getElementById("stripProductCard");
  const stripConfidence = document.getElementById("stripConfidence");
  const stripFit = document.getElementById("stripFit");
  const inspectFromStripBtn = document.getElementById("inspectFromStripBtn");

  // Inspector & Settings Modal
  const inspectorModal = document.getElementById("inspectorModal");
  const inspectorOverlay = document.getElementById("inspectorOverlay");
  const closeInspectorBtn = document.getElementById("closeInspectorBtn");
  const engineSettingsBtn = document.getElementById("engineSettingsBtn");
  const openInspectorBannerBtn = document.getElementById("openInspectorBannerBtn");
  const engineStatusDot = document.getElementById("engineStatusDot");
  const engineLabel = document.getElementById("engineLabel");
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const keyFeedback = document.getElementById("keyFeedback");

  // Modal Tabs & Content
  const modalTabBtns = document.querySelectorAll(".modal-tabs .tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  const inspectModelName = document.getElementById("inspectModelName");
  const inspectConfidence = document.getElementById("inspectConfidence");
  const inspectScore = document.getElementById("inspectScore");
  const inspectNoul = document.getElementById("inspectNoul");
  const probabilitiesList = document.getElementById("probabilitiesList");
  const inspectExplanation = document.getElementById("inspectExplanation");
  const rawRequestCode = document.getElementById("rawRequestCode");
  const rawResponseCode = document.getElementById("rawResponseCode");

  // Checkout Celebration Modal
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutOverlay = document.getElementById("checkoutOverlay");
  const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
  const checkoutSummaryBox = document.getElementById("checkoutSummaryBox");
  const toastContainer = document.getElementById("toastContainer");

  // Initialize
  initApp();

  async function initApp() {
    setupEventListeners();
    updateApiKeyUI();
    updateCartUI();
    await fetchCatalog();
    requestJevRecommendations();
  }

  function setupEventListeners() {
    // Search
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      clearSearchBtn.style.display = state.searchQuery ? "block" : "none";
      renderProducts();
    });

    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      state.searchQuery = "";
      clearSearchBtn.style.display = "none";
      renderProducts();
    });

    // Sorting
    sortSelect.addEventListener("change", (e) => {
      state.sortBy = e.target.value;
      renderProducts();
    });

    // Cart Drawer Toggle
    cartTriggerBtn.addEventListener("click", openCart);
    closeCartBtn.addEventListener("click", closeCart);
    cartOverlay.addEventListener("click", closeCart);

    // Inspector Modal Toggle
    engineSettingsBtn.addEventListener("click", openInspector);
    openInspectorBannerBtn.addEventListener("click", openInspector);
    inspectFromStripBtn.addEventListener("click", openInspector);
    closeInspectorBtn.addEventListener("click", closeInspector);
    inspectorOverlay.addEventListener("click", closeInspector);

    // Modal Tabs
    modalTabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        modalTabBtns.forEach(b => b.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active"));
        btn.classList.add("active");
        const targetTab = document.getElementById(btn.dataset.tab);
        if (targetTab) targetTab.classList.add("active");
      });
    });

    // Copy JSON Buttons
    document.querySelectorAll(".copy-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.copyTarget;
        const codeElem = document.getElementById(targetId);
        if (codeElem) {
          navigator.clipboard.writeText(codeElem.innerText);
          const originalText = btn.innerText;
          btn.innerText = "Copiado!";
          setTimeout(() => btn.innerText = originalText, 1800);
        }
      });
    });

    // Save & Test API Key
    saveKeyBtn.addEventListener("click", handleSaveApiKey);

    // Checkout
    checkoutBtn.addEventListener("click", handleCheckout);
    closeCheckoutBtn.addEventListener("click", () => {
      checkoutModal.classList.remove("active");
      checkoutOverlay.classList.remove("active");
    });
  }

  // Fetch Catalog from Backend API
  async function fetchCatalog() {
    try {
      const response = await fetch("/api/catalog");
      if (!response.ok) throw new Error("Erro ao carregar catálogo.");
      const data = await response.json();
      state.products = data.products || [];
      state.categories = data.categories || [];

      renderCategories();
      renderProducts();
    } catch (err) {
      console.error(err);
      productsGrid.innerHTML = `
        <div class="empty-cart-state" style="grid-column: 1 / -1;">
          <span class="empty-cart-icon">⚠️</span>
          <h4>Erro ao conectar ao catálogo Northwind</h4>
          <p>Verifique se o servidor local está em execução na porta 8080.</p>
        </div>
      `;
    }
  }

  // Render Category Filter Pills
  function renderCategories() {
    const allCount = state.products.length;
    let html = `
      <button class="cat-pill ${state.activeCategory === 'all' ? 'active' : ''}" data-category="all">
        <span class="cat-icon">🍽️</span>
        <span class="cat-name">Todos (${allCount})</span>
      </button>
    `;

    state.categories.forEach(cat => {
      const count = state.products.filter(p => p.categoryId === cat.id).length;
      const isActive = state.activeCategory === String(cat.id);
      html += `
        <button class="cat-pill ${isActive ? 'active' : ''}" data-category="${cat.id}">
          <span class="cat-icon">${cat.icon || '📦'}</span>
          <span class="cat-name">${cat.name} (${count})</span>
        </button>
      `;
    });

    categoriesBar.innerHTML = html;

    categoriesBar.querySelectorAll(".cat-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        categoriesBar.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        state.activeCategory = pill.dataset.category;
        renderProducts();
      });
    });
  }

  // Filter & Sort Products
  function getFilteredProducts() {
    let list = [...state.products];

    // Filter by Category
    if (state.activeCategory !== "all") {
      list = list.filter(p => String(p.categoryId) === state.activeCategory);
    }

    // Filter by Search
    if (state.searchQuery) {
      list = list.filter(p => {
        const matchName = p.name.toLowerCase().includes(state.searchQuery);
        const matchCat = p.categoryName.toLowerCase().includes(state.searchQuery);
        const matchTags = (p.tags || []).some(t => t.toLowerCase().includes(state.searchQuery));
        return matchName || matchCat || matchTags;
      });
    }

    // Sort
    switch (state.sortBy) {
      case "price-asc":
        list.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.unitPrice - a.unitPrice);
        break;
      case "rating-desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured: prioritize badges and stock
        list.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
        break;
    }

    return list;
  }

  // Render Product Grid
  function renderProducts() {
    const items = getFilteredProducts();
    productCountInfo.innerText = `Exibindo ${items.length} produto${items.length === 1 ? '' : 's'}`;

    if (items.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-cart-state" style="grid-column: 1 / -1;">
          <span class="empty-cart-icon">🔍</span>
          <h4>Nenhum produto gourmet encontrado</h4>
          <p>Tente buscar por outro termo ou selecione a categoria 'Todos'.</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = items.map(p => {
      const badgeHtml = p.badge ? `<span class="card-badge badge-gold">${p.badge}</span>` : '';
      const tagsHtml = (p.tags || []).map(t => `<span class="tag-pill">${t}</span>`).join('');
      const inCart = state.cart.find(c => c.id === p.id);
      const btnText = inCart ? `Adicionado (${inCart.quantity})` : 'Adicionar à Cesta';
      const btnClass = inCart ? 'btn-add-cart in-cart' : 'btn-add-cart';

      return `
        <div class="product-card" data-product-id="${p.id}">
          <div>
            <div class="card-top">
              <div class="card-emoji-box" style="background: ${getCategoryGradient(p.categoryId)}">
                <span>${p.emoji || '🍽️'}</span>
              </div>
              ${badgeHtml}
            </div>

            <div class="card-category">${p.categoryName}</div>
            <h3 class="card-title">${p.name}</h3>
            <div class="card-specs">${p.quantityPerUnit} &bull; Estoque: ${p.unitsInStock}</div>

            <div class="card-tags">
              ${tagsHtml}
            </div>
          </div>

          <div>
            <div class="card-rating-row">
              <span class="stars">★ ${p.rating}</span>
              <span>(${p.reviewCount} avaliações)</span>
            </div>

            <div class="card-footer">
              <div class="card-price-box">
                <span class="card-price-label">Preço unitário</span>
                <span class="card-price">$${p.unitPrice.toFixed(2)}</span>
              </div>

              <button class="${btnClass}" onclick="window.addToCart(${p.id})">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                <span>${btnText}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  function getCategoryGradient(catId) {
    const gradients = {
      1: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(168, 85, 247, 0.2))',
      2: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))',
      3: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(217, 70, 239, 0.2))',
      4: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(202, 138, 4, 0.2))',
      5: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(180, 83, 9, 0.2))',
      6: 'linear-gradient(135deg, rgba(225, 29, 72, 0.2), rgba(159, 18, 57, 0.2))',
      7: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
      8: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))'
    };
    return gradients[catId] || 'rgba(255, 255, 255, 0.08)';
  }

  // Cart Functions
  window.addToCart = function(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existing = state.cart.find(item => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        categoryName: product.categoryName,
        unitPrice: product.unitPrice,
        quantity: 1,
        emoji: product.emoji,
        tags: product.tags
      });
    }

    saveCart();
    updateCartUI();
    renderProducts();
    triggerCartBounce();
    showToast(`Adicionado: <strong>${product.name}</strong> à cesta`);

    // Real-Time Jev AI Recommendation Request
    requestJevRecommendations();
  };

  window.changeQty = function(productId, delta) {
    const item = state.cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => i.id !== productId);
    }

    saveCart();
    updateCartUI();
    renderProducts();
    requestJevRecommendations();
  };

  window.removeFromCart = function(productId) {
    const item = state.cart.find(i => i.id === productId);
    state.cart = state.cart.filter(i => i.id !== productId);
    saveCart();
    updateCartUI();
    renderProducts();
    if (item) showToast(`Removido: ${item.name}`);
    requestJevRecommendations();
  };

  function saveCart() {
    localStorage.setItem("northwind_jev_cart", JSON.stringify(state.cart));
  }

  function updateCartUI() {
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const freeShippingThreshold = 75.00;
    const shipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0.00 : 12.00;
    const grandTotal = subtotal + shipping;

    // Badges & Headers
    cartCountBadge.innerText = totalCount;
    cartNavTotal.innerText = `$${subtotal.toFixed(2)}`;
    drawerCartCount.innerText = `${totalCount} ite${totalCount === 1 ? 'm' : 'ns'}`;
    drawerSubtotal.innerText = `$${subtotal.toFixed(2)}`;
    drawerShipping.innerText = shipping === 0.00 ? (subtotal > 0 ? "GRÁTIS" : "$0.00") : `$${shipping.toFixed(2)}`;
    drawerTotal.innerText = `$${grandTotal.toFixed(2)}`;

    checkoutBtn.disabled = state.cart.length === 0;

    // Free Shipping Progress
    if (subtotal >= freeShippingThreshold) {
      shippingProgressBar.style.width = "100%";
      shippingValue.innerText = "Parabéns! Frete Grátis Liberado";
      shippingValue.style.color = "var(--accent-green)";
    } else {
      const remaining = freeShippingThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
      shippingProgressBar.style.width = `${pct}%`;
      shippingValue.innerText = `Faltam $${remaining.toFixed(2)}`;
      shippingValue.style.color = "var(--accent-gold)";
    }

    // Render Cart Items
    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart-state">
          <span class="empty-cart-icon">🧺</span>
          <h4>Sua cesta está vazia</h4>
          <p>Adicione iguarias do catálogo para ver o Jev IA sugerir combinações gastronômicas exclusivas!</p>
        </div>
      `;
      cartAiBox.style.display = "none";
      return;
    }

    cartItemsContainer.innerHTML = state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-emoji">${item.emoji || '🍽️'}</div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-unit-price">$${item.unitPrice.toFixed(2)} / un</span>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="window.changeQty(${item.id}, -1)">&minus;</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="qty-btn" onclick="window.changeQty(${item.id}, 1)">&plus;</button>
          </div>
        </div>
        <div class="cart-item-total-col">
          <span class="cart-item-subtotal">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
          <button class="btn-remove-item" onclick="window.removeFromCart(${item.id})" title="Remover">&times;</button>
        </div>
      </div>
    `).join("");
  }

  function triggerCartBounce() {
    cartCountBadge.style.transform = "scale(1.4)";
    setTimeout(() => cartCountBadge.style.transform = "scale(1)", 200);
  }

  function openCart() {
    cartDrawer.classList.add("active");
    cartOverlay.classList.add("active");
  }

  function closeCart() {
    cartDrawer.classList.remove("active");
    cartOverlay.classList.remove("active");
  }

  // Jev IA Real-Time Recommendation Engine Integration
  function requestJevRecommendations() {
    clearTimeout(state.recommendationDebounceTimer);
    state.recommendationDebounceTimer = setTimeout(async () => {
      await fetchJevRecommendations();
    }, 280); // Debounce to allow quick multiple clicks
  }

  async function fetchJevRecommendations() {
    state.isRecommending = true;

    // Show subtle pulsing loading state in strip
    stripConfidence.innerHTML = `Confiança IA: <strong>Calculando...</strong>`;

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: state.cart,
          apiKey: state.apiKey || undefined
        })
      });

      if (!response.ok) throw new Error("Falha na recomendação do Jev IA");
      const result = await response.json();
      state.currentRecommendation = result;

      renderHeroRecommendation(result);
      renderInCartRecommendation(result);
      updateInspectorContent(result);
    } catch (err) {
      console.error("[Jev Error]:", err);
    } finally {
      state.isRecommending = false;
    }
  }

  // Render Top Recommendation in Hero AI Strip
  function renderHeroRecommendation(result) {
    const top = result.topChoice;
    if (!top) {
      stripProductCard.innerHTML = `<p class="strip-loading">Nenhuma recomendação disponível no momento.</p>`;
      return;
    }

    const confPct = Math.round(result.confidence * 100);
    const scoreVal = result.bundleScore || 3.0;
    const scoreLabels = { 0: "Fraco", 1: "Razoável", 2: "Bom", 3: "Excelente" };

    stripConfidence.innerHTML = `Confiança Jev: <strong>${confPct}%</strong>`;
    stripFit.innerHTML = `Harmonia Gastronômica: <strong>${scoreLabels[Math.round(scoreVal)] || "Excelente"}</strong>`;

    stripProductCard.innerHTML = `
      <div class="strip-recommendation-content">
        <div class="strip-rec-emoji">${top.emoji || '🍽️'}</div>
        <div class="strip-rec-info">
          <div class="strip-rec-header-row">
            <span class="strip-rec-name">${top.name}</span>
            <span class="strip-rec-category">${top.categoryName}</span>
            <span class="strip-rec-prob-badge">🎯 ${top.jevProbability}% probabilidade</span>
          </div>
          <p class="strip-rec-reason">${top.pairingReason}</p>
        </div>
        <div class="strip-rec-actions">
          <span class="strip-rec-price">$${top.unitPrice.toFixed(2)}</span>
          <button class="btn-add-strip" onclick="window.addToCart(${top.id})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            <span>Adicionar com 1 Clique</span>
          </button>
        </div>
      </div>
    `;
  }

  // Render Mini Recommendation in Cart Drawer
  function renderInCartRecommendation(result) {
    const top = result.topChoice;
    if (!top || state.cart.length === 0) {
      cartAiBox.style.display = "none";
      return;
    }

    cartAiBox.style.display = "block";
    cartAiProb.innerText = `${top.jevProbability}% de afinidade`;
    cartAiContent.innerHTML = `
      <div class="cart-ai-mini-card">
        <div>
          <div class="cart-ai-mini-name">${top.emoji || ''} ${top.name} ($${top.unitPrice.toFixed(2)})</div>
          <div class="cart-ai-mini-reason">${top.pairingReason}</div>
        </div>
        <button class="btn-mini-add" onclick="window.addToCart(${top.id})">+ Adicionar</button>
      </div>
    `;
  }

  // Update Inspector Modal with Live Payload and Probabilities
  function updateInspectorContent(result) {
    if (!result) return;

    inspectModelName.innerText = result.model || "jev-1.13.0";
    inspectConfidence.innerText = (result.confidence || 0.85).toFixed(2);
    inspectScore.innerText = `${(result.bundleScore || 3.0).toFixed(1)} / 4`;
    inspectNoul.innerText = `${Math.round((result.upsellProbability || 0.82) * 100)}%`;

    if (result.topChoice) {
      inspectExplanation.innerText = result.topChoice.pairingReason;
    }

    // Probabilities Bar Chart
    const recs = result.recommendations || [];
    probabilitiesList.innerHTML = recs.map((item, idx) => {
      const isTop = idx === 0;
      return `
        <div class="prob-row">
          <span class="prob-name" title="${item.name}">${item.emoji || ''} ${item.name}</span>
          <div class="prob-track">
            <div class="prob-fill ${isTop ? 'is-top' : ''}" style="width: ${Math.max(4, item.jevProbability)}%"></div>
          </div>
          <span class="prob-value ${isTop ? 'is-top' : ''}">${item.jevProbability}%</span>
        </div>
      `;
    }).join("");

    // Raw JSON
    rawRequestCode.innerText = JSON.stringify(result.systemOneRequest || {}, null, 2);
    rawResponseCode.innerText = JSON.stringify(result.systemOneResponse || {}, null, 2);
  }

  // Inspector Modal Management
  function openInspector() {
    inspectorModal.classList.add("active");
    inspectorOverlay.classList.add("active");
    if (state.currentRecommendation) {
      updateInspectorContent(state.currentRecommendation);
    }
  }

  function closeInspector() {
    inspectorModal.classList.remove("active");
    inspectorOverlay.classList.remove("active");
  }

  // API Key Handling
  function updateApiKeyUI() {
    if (state.apiKey) {
      apiKeyInput.value = state.apiKey;
      engineLabel.innerText = "Jev IA: TypeSafe Cloud";
      engineStatusDot.style.backgroundColor = "var(--accent-jev)";
      engineStatusDot.style.boxShadow = "0 0 10px var(--accent-jev)";
    } else {
      engineLabel.innerText = "Jev IA: Local (609k Cestas)";
      engineStatusDot.style.backgroundColor = "var(--accent-green)";
      engineStatusDot.style.boxShadow = "0 0 8px var(--accent-green)";
    }
  }

  async function handleSaveApiKey() {
    const key = apiKeyInput.value.trim();
    if (!key) {
      localStorage.removeItem("typesafe_api_key");
      state.apiKey = "";
      updateApiKeyUI();
      keyFeedback.className = "key-feedback";
      keyFeedback.innerText = "Chave removida. Usando motor calibrado local.";
      requestJevRecommendations();
      return;
    }

    keyFeedback.className = "key-feedback";
    keyFeedback.innerText = "Testando conexão com api.typesafe.ai...";

    try {
      const res = await fetch("/api/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json();
      if (data.valid) {
        localStorage.setItem("typesafe_api_key", key);
        state.apiKey = key;
        updateApiKeyUI();
        keyFeedback.className = "key-feedback success";
        keyFeedback.innerText = "✅ Conectado com sucesso à TypeSafe AI!";
        showToast("Chave TypeSafe AI validada com sucesso!");
        requestJevRecommendations();
      } else {
        keyFeedback.className = "key-feedback error";
        keyFeedback.innerText = `❌ ${data.message || 'Chave inválida'}`;
      }
    } catch (err) {
      keyFeedback.className = "key-feedback error";
      keyFeedback.innerText = "Erro ao testar a chave. Verifique a internet.";
    }
  }

  // Checkout Simulation
  function handleCheckout() {
    if (state.cart.length === 0) return;

    closeCart();
    const subtotal = state.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const shipping = subtotal >= 75.00 ? 0.00 : 12.00;
    const total = subtotal + shipping;

    checkoutSummaryBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
        <span>Itens adquiridos:</span>
        <strong>${state.cart.length} variedades (${state.cart.reduce((s, i) => s + i.quantity, 0)} unidades)</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
        <span>Valor dos produtos:</span>
        <strong>$${subtotal.toFixed(2)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
        <span>Frete:</span>
        <strong style="color: ${shipping === 0 ? 'var(--accent-green)' : 'inherit'}">${shipping === 0 ? 'GRÁTIS' : '$' + shipping.toFixed(2)}</strong>
      </div>
      <div style="display:flex; justify-content:space-between; font-size: 1.1rem; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
        <span>Total Pago:</span>
        <strong style="color: var(--accent-gold); font-family: var(--font-mono);">$${total.toFixed(2)}</strong>
      </div>
      <p style="margin-top: 12px; font-size: 0.8rem; color: var(--text-secondary);">
        💡 Recomendação Jev aceita na cesta gerou satisfação gastronômica estimada em 94%.
      </p>
    `;

    checkoutModal.classList.add("active");
    checkoutOverlay.classList.add("active");

    // Clear cart
    state.cart = [];
    saveCart();
    updateCartUI();
    renderProducts();
    requestJevRecommendations();
  }

  // Toast Notification Helper
  function showToast(htmlMessage) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <span>🛍️</span>
      <div>${htmlMessage}</div>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = "slideInToast 0.3s ease reverse";
      setTimeout(() => toast.remove(), 280);
    }, 2800);
  }
});
