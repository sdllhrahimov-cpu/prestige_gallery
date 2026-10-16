// Prestige Gallery - Grand Rose Bouquet Builder
class RoseBuilder {
  constructor() {
    this.stems = 51;
    this.variety = 'explorer';
    this.packaging = 'paper';
    
    this.varieties = {
      explorer: {
        name: 'Explorer (Бархатный алый)',
        origin: 'Плантация Cotopaxi, Эквадор · 70 см',
        pricePerStem: 37500,
        image: 'assets/images/red_roses_101.jpg',
        boxImage: 'assets/images/hatbox_rouge.jpg',
        colorHex: '#8B0000'
      },
      mondial: {
        name: 'Playa Blanca / Mondial (Белоснежный)',
        origin: 'Плантация Cayambe, Эквадор · 70 см',
        pricePerStem: 39000,
        image: 'assets/images/lumier_blanche.jpg',
        boxImage: 'assets/images/hatbox_blanc.jpg',
        colorHex: '#FFFFFF'
      },
      kahala: {
        name: 'Kahala (Персиковый закат)',
        origin: 'Селекционный сорт, Эквадор · 70 см',
        pricePerStem: 42000,
        image: 'assets/images/jardin_secret.jpg',
        boxImage: 'assets/images/jardin_secret.jpg',
        colorHex: '#E29D72'
      },
      hermosa: {
        name: 'Hermosa (Пыльно-розовый)',
        origin: 'Садовые розы, Колумбия · 70 см',
        pricePerStem: 40000,
        image: 'assets/images/french_pink.jpg',
        boxImage: 'assets/images/french_pink.jpg',
        colorHex: '#D8A4AC'
      },
      sapphire: {
        name: 'Sapphire Royal (Глубокий индиго)',
        origin: 'Премиальная селекция, Нидерланды · 70 см',
        pricePerStem: 48000,
        image: 'assets/images/hydrangea_blue.jpg',
        boxImage: 'assets/images/hydrangea_blue.jpg',
        colorHex: '#2B4A78'
      }
    };

    this.packagings = {
      paper: {
        name: 'Фирменная матовая бумага с шелком',
        price: 0,
        note: 'Многослойный графитовый или пудровый матовый крафт с шелковой лентой'
      },
      box: {
        name: 'Бархатная цилиндрическая шляпная коробка',
        price: 250000,
        note: 'Замшевая коробка с флористическим оазисом и золотым тиснением'
      },
      vase: {
        name: 'Французская хрустальная ваза ручной работы',
        price: 450000,
        note: 'Премиальная стеклянная ваза с питательным раствором Chrysal'
      }
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.updatePreview();
  }

  bindEvents() {
    // Stem selectors
    document.querySelectorAll('.builder-stem-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.builder-stem-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.stems = parseInt(btn.dataset.stems, 10);
        this.updatePreview();
      });
    });

    // Variety selectors
    document.querySelectorAll('.builder-variety-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('.builder-variety-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.variety = card.dataset.variety;
        this.updatePreview();
      });
    });

    // Packaging selectors
    document.querySelectorAll('.builder-pack-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('.builder-pack-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.packaging = card.dataset.packaging;
        this.updatePreview();
      });
    });

    // Fast order & cart buttons in builder
    const builderCartBtn = document.getElementById('builder-add-cart-btn');
    if (builderCartBtn) {
      builderCartBtn.addEventListener('click', () => {
        this.addToCart();
      });
    }

    const builderFastOrderBtn = document.getElementById('builder-fast-order-btn');
    if (builderFastOrderBtn) {
      builderFastOrderBtn.addEventListener('click', () => {
        this.openFastOrder();
      });
    }
  }

  calculateTotal() {
    const varietyInfo = this.varieties[this.variety];
    const packagingInfo = this.packagings[this.packaging];
    const stemsCost = this.stems * varietyInfo.pricePerStem;
    const total = stemsCost + packagingInfo.price;
    return {
      stemsCost,
      packagingCost: packagingInfo.price,
      total
    };
  }

  formatPrice(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " UZS";
  }

  updatePreview() {
    const varietyInfo = this.varieties[this.variety];
    const packagingInfo = this.packagings[this.packaging];
    const { stemsCost, packagingCost, total } = this.calculateTotal();

    // Image choice: if box selected and boxImage exists, use it
    let currentImage = varietyInfo.image;
    if (this.packaging === 'box' && varietyInfo.boxImage) {
      currentImage = varietyInfo.boxImage;
    }

    const previewImg = document.getElementById('builder-preview-img');
    if (previewImg) {
      previewImg.src = currentImage;
      previewImg.alt = `${this.stems} роз ${varietyInfo.name}`;
    }

    const summaryTitle = document.getElementById('builder-summary-title');
    if (summaryTitle) {
      summaryTitle.innerHTML = `<span class="italic font-serif">${this.stems} королевских роз</span> · ${varietyInfo.name.split('(')[0]}`;
    }

    const summaryVariety = document.getElementById('builder-summary-variety');
    if (summaryVariety) {
      summaryVariety.textContent = `${varietyInfo.name} (${varietyInfo.origin})`;
    }

    const summaryPack = document.getElementById('builder-summary-pack');
    if (summaryPack) {
      summaryPack.textContent = packagingInfo.name;
    }

    const summaryStemsPrice = document.getElementById('builder-summary-stems-price');
    if (summaryStemsPrice) {
      summaryStemsPrice.textContent = this.formatPrice(stemsCost);
    }

    const summaryPackPrice = document.getElementById('builder-summary-pack-price');
    if (summaryPackPrice) {
      summaryPackPrice.textContent = packagingCost === 0 ? 'Включено' : this.formatPrice(packagingCost);
    }

    const summaryTotalPrice = document.getElementById('builder-summary-total-price');
    if (summaryTotalPrice) {
      summaryTotalPrice.textContent = this.formatPrice(total);
    }
  }

  getCurrentConfiguration() {
    const varietyInfo = this.varieties[this.variety];
    const packagingInfo = this.packagings[this.packaging];
    const { total } = this.calculateTotal();

    let image = varietyInfo.image;
    if (this.packaging === 'box' && varietyInfo.boxImage) {
      image = varietyInfo.boxImage;
    }

    return {
      id: `custom-rose-${this.stems}-${this.variety}-${this.packaging}`,
      title: `${this.stems} роз ${varietyInfo.name.split('(')[0].trim()}`,
      subtitle: `${this.stems} стеблей 70 см · ${packagingInfo.name}`,
      categoryName: 'Королевский кастом-букет',
      price: total,
      priceFormatted: this.formatPrice(total),
      image: image,
      quantity: 1
    };
  }

  addToCart() {
    const config = this.getCurrentConfiguration();
    if (window.Cart) {
      window.Cart.addItem(config);
      if (window.showToast) {
        window.showToast(`Гранд-букет из ${this.stems} роз добавлен в корзину`);
      }
    }
  }

  openFastOrder() {
    const config = this.getCurrentConfiguration();
    if (window.openFastOrderModal) {
      window.openFastOrderModal(config);
    }
  }
}

window.RoseBuilder = RoseBuilder;
