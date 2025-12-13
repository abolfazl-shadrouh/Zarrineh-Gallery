const qs = (sel, scope = document) => scope.querySelector(sel);
const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

/* ----------------- Router ----------------- */
class Router {
  constructor() {
    this.pages = qsa(".page");
    this.navLinks = qsa(".nav-link");
    this.pageContainer = qs(".page-container");
    this.footerLinks = qsa(".footer-link");
    this.cartButton = qs(".header-cart-indicator");

    this.bindEvents();
  }

  showPage(id) {
    this.pages.forEach((p) => p.classList.remove("page-active"));
    const page = qs(`#${id}`);
    if (page) page.classList.add("page-active");

    this.navLinks.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.page === id);
    });

    const mainNav = qs(".main-nav");
    const navToggle = qs(".nav-toggle");
    if (mainNav && navToggle) {
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  }

  bindEvents() {
    this.navLinks.forEach((btn) => {
      btn.addEventListener("click", () => this.showPage(btn.dataset.page));
    });

    this.footerLinks.forEach((btn) => {
      btn.addEventListener("click", () => this.showPage(btn.dataset.page));
    });

    if (this.cartButton) {
      this.cartButton.addEventListener("click", () => this.showPage("cart"));
    }

    // دسته‌بندی‌ها در صفحه اصلی
    qs(".categories")?.addEventListener("click", (e) => {
      const card = e.target.closest(".category-card");
      if (!card) return;
      const targetPage = card.dataset.page || "products";
      const targetCategory = card.dataset.categoryTarget;
      this.showPage(targetPage);
      if (targetCategory) {
        ProductFilter.selectCategory(targetCategory);
      }
    });

    // دکمه "مشاهده همه محصولات"
    this.pageContainer.addEventListener("click", (e) => {
      const btn = e.target.closest('[data-page="products"]');
      if (!btn) return;
      this.showPage("products");
    });
  }
}

/* ----------------- Navigation / Header ----------------- */
class HeaderNav {
  constructor() {
    this.navToggle = qs(".nav-toggle");
    this.mainNav = qs(".main-nav");
    this.init();
  }

  init() {
    if (!this.navToggle || !this.mainNav) return;

    this.navToggle.addEventListener("click", () => {
      const isOpen = this.mainNav.classList.toggle("open");
      this.navToggle.classList.toggle("open", isOpen);
      this.navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }
}

/* ----------------- Slider ----------------- */
class HeroSlider {
  constructor(selector) {
    this.root = qs(selector);
    if (!this.root) return;
    this.slides = qsa(".slide", this.root);
    this.prevBtn = qs(".slider-prev", this.root);
    this.nextBtn = qs(".slider-next", this.root);
    this.dotsContainer = qs(".slider-dots", this.root);
    this.current = 0;
    this.interval = null;

    if (!this.slides.length) return;

    this.lazyLoadBackgrounds();
    this.createDots();
    this.setSlide(0);
    this.bindEvents();
    this.start();
  }

  lazyLoadBackgrounds() {
    this.slides.forEach((slide) => {
      const bg = slide.dataset.bg;
      if (bg) {
        const img = new Image();
        img.src = bg;
        img.onload = () => {
          slide.style.backgroundImage = `url("${bg}")`;
        };
      }
    });
  }

  createDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = "";
    this.slides.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `اسلاید ${idx + 1}`);
      dot.addEventListener("click", () => {
        this.setSlide(idx);
        this.reset();
      });
      this.dotsContainer.appendChild(dot);
    });
  }

  updateDots() {
    if (!this.dotsContainer) return;
    qsa(".slider-dot", this.dotsContainer).forEach((dot, idx) => {
      dot.classList.toggle("active", idx === this.current);
    });
  }

  setSlide(index) {
    this.slides.forEach((s) => s.classList.remove("active"));
    this.current = (index + this.slides.length) % this.slides.length;
    this.slides[this.current].classList.add("active");
    this.updateDots();
  }

  start() {
    if (!this.slides.length) return;
    this.interval = setInterval(() => this.setSlide(this.current + 1), 5000);
  }

  reset() {
    if (this.interval) clearInterval(this.interval);
    this.start();
  }

  bindEvents() {
    this.prevBtn?.addEventListener("click", () => {
      this.setSlide(this.current - 1);
      this.reset();
    });

    this.nextBtn?.addEventListener("click", () => {
      this.setSlide(this.current + 1);
      this.reset();
    });
  }
}

/* ----------------- Lazy Background Images ----------------- */
class LazyBackground {
  constructor() {
    this.items = qsa("[data-bg]");
    if (!this.items.length) return;
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
      rootMargin: "200px 0px",
      threshold: 0.01,
    });
    this.items.forEach((el) => this.observer.observe(el));
  }

  onIntersect(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const bg = el.dataset.bg;
      if (!bg) return;
      el.style.backgroundImage = `url("${bg}")`;
      this.observer.unobserve(el);
      el.removeAttribute("data-bg");
    });
  }
}

/* ----------------- Scroll Animations ----------------- */
class ScrollAnimator {
  constructor() {
    this.elements = qsa("[data-animate]");
    if (!this.elements.length) return;
    this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
      threshold: 0.1,
    });
    this.elements.forEach((el) => this.observer.observe(el));
  }

  onIntersect(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        this.observer.unobserve(entry.target);
      }
    });
  }
}

/* ----------------- Parallax ----------------- */
class Parallax {
  constructor() {
    this.items = qsa(".parallax");
    if (!this.items.length) return;
    this.handleScroll = this.handleScroll.bind(this);
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    this.handleScroll();
  }

  handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    this.items.forEach((el) => {
      const strength = parseFloat(el.dataset.parallaxStrength || "15");
      const offset = scrollY * (strength / 1000);
      el.style.transform = `translateY(${offset}px)`;
    });
  }
}

/* ----------------- Product Data & Cart ----------------- */
const productsData = {};
const cartState = {
  items: [],
};

class ProductData {
  static init() {
    const cards = qsa("[data-product-id]");
    cards.forEach((card) => {
      const id = card.dataset.productId;
      if (productsData[id]) return;
      const title = card.querySelector("h3")?.textContent?.trim() || "محصول";
      const priceText = card.querySelector(".product-price")?.textContent || "";
      const match = priceText.match(/([\d٬,]+)\s*تومان/);
      const price = match ? parseInt(match[1].replace(/[^\d]/g, ""), 10) : 0;
      productsData[id] = { id, title, price };
    });
  }
}

class Cart {
  constructor() {
    this.container = qs("#cart-items");
    this.totalEl = qs("#cart-total");
    this.cartCountEl = qs("#cart-count");
    this.pageContainer = qs(".page-container");
    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.pageContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".add-to-cart");
      if (!btn) return;
      const card = btn.closest("[data-product-id]");
      if (!card) return;
      const id = card.dataset.productId;
      this.add(id);
    });
  }

  add(id) {
    const data = productsData[id];
    if (!data) return;
    const existing = cartState.items.find((it) => it.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cartState.items.push({
        id: data.id,
        title: data.title,
        price: data.price,
        qty: 1,
      });
    }
    this.render();
    Toast.show(`«${data.title}» به سبد خرید اضافه شد.`);
  }

  updateQty(id, qty) {
    const item = cartState.items.find((it) => it.id === id);
    if (!item) return;
    if (qty <= 0) {
      this.remove(id);
    } else {
      item.qty = qty;
      this.render();
    }
  }

  remove(id) {
    cartState.items = cartState.items.filter((it) => it.id !== id);
    this.render();
  }

  render() {
    if (!this.container || !this.totalEl || !this.cartCountEl) return;

    this.container.innerHTML = "";

    if (!cartState.items.length) {
      const p = document.createElement("p");
      p.className = "cart-empty";
      p.textContent = "سبد خرید شما خالی است.";
      this.container.appendChild(p);
      this.totalEl.textContent = "۰ تومان";
      this.cartCountEl.textContent = "0";
      return;
    }

    let total = 0;
    cartState.items.forEach((item) => {
      total += item.price * item.qty;

      const row = document.createElement("div");
      row.className = "cart-item";

      const info = document.createElement("div");
      info.className = "cart-item-info";

      const title = document.createElement("div");
      title.className = "cart-item-title";
      title.textContent = item.title;

      const price = document.createElement("div");
      price.className = "cart-item-price";
      price.textContent = Cart.formatPrice(item.price * item.qty);

      info.appendChild(title);
      info.appendChild(price);

      const actions = document.createElement("div");
      actions.className = "cart-item-actions";

      const minus = document.createElement("button");
      minus.className = "cart-qty-btn";
      minus.textContent = "−";
      minus.addEventListener("click", () =>
        this.updateQty(item.id, item.qty - 1)
      );

      const qty = document.createElement("span");
      qty.className = "cart-qty";
      qty.textContent = item.qty;

      const plus = document.createElement("button");
      plus.className = "cart-qty-btn";
      plus.textContent = "+";
      plus.addEventListener("click", () =>
        this.updateQty(item.id, item.qty + 1)
      );

      const remove = document.createElement("button");
      remove.className = "cart-remove";
      remove.textContent = "حذف";
      remove.addEventListener("click", () => this.remove(item.id));

      actions.append(minus, qty, plus, remove);

      row.append(info, actions);
      this.container.appendChild(row);
    });

    this.totalEl.textContent = Cart.formatPrice(total);
    this.cartCountEl.textContent = cartState.items.reduce(
      (s, it) => s + it.qty,
      0
    );
  }

  static formatPrice(num) {
    if (!num) return "۰ تومان";
    const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
    return `${formatted} تومان`;
  }
}

/* ----------------- Product Filter ----------------- */
class ProductFilter {
  static init() {
    this.filterContainer = qs("#product-filter");
    this.productsGrid = qs("#products-grid");
    if (!this.filterContainer || !this.productsGrid) return;

    this.filterContainer.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      const category = e.target.dataset.category;
      ProductFilter.apply(category);

      this.filterContainer
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  }

  static apply(category) {
    if (!this.productsGrid) return;
    qsa(".product-card", this.productsGrid).forEach((card) => {
      const cardCat = card.dataset.category || "all";
      card.style.display =
        category === "all" || cardCat === category ? "" : "none";
    });
  }

  static selectCategory(category) {
    if (!this.filterContainer) return;
    const btn = this.filterContainer.querySelector(
      `button[data-category="${category}"]`
    );
    if (!btn) return;
    btn.click();
  }
}

/* ----------------- Gallery & Lightbox ----------------- */
class GalleryLightbox {
  constructor() {
    this.lightbox = qs("#lightbox");
    this.lightboxImage = qs("#lightbox-image");
    this.closeBtn = qs("#lightbox-close");
    this.loader = qs(".gallery-loader");
    this.grid = qs(".gallery-grid");
    this.init();
  }

  init() {
    if (!this.lightbox || !this.lightboxImage || !this.grid) return;

    qsa(".gallery-item", this.grid).forEach((item) => {
      item.addEventListener("click", () => {
        const className = item.dataset.full;
        this.lightboxImage.className = `lightbox-image ${className}`;
        this.lightbox.classList.add("active");
      });
    });

    this.closeBtn?.addEventListener("click", () =>
      this.lightbox.classList.remove("active")
    );

    this.lightbox.addEventListener("click", (e) => {
      if (e.target === this.lightbox) {
        this.lightbox.classList.remove("active");
      }
    });

    // شبیه‌سازی لود گالری
    if (this.loader) {
      setTimeout(() => {
        this.loader.style.display = "none";
      }, 800);
    }
  }
}

/* ----------------- Toast ----------------- */
class Toast {
  static init() {
    this.container = qs(".toast-container");
  }

  static show(message, duration = 2800) {
    if (!this.container) return;
    const toast = document.createElement("div");
    toast.className = "toast";

    const icon = document.createElement("span");
    icon.className = "toast-icon";
    icon.textContent = "✓";

    const text = document.createElement("span");
    text.textContent = message;

    const close = document.createElement("button");
    close.type = "button";
    close.className = "toast-close";
    close.textContent = "×";
    close.addEventListener("click", () => {
      toast.remove();
    });

    toast.append(icon, text, close);
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, duration);
  }
}

/* ----------------- Contact Form ----------------- */
class ContactForm {
  constructor() {
    this.form = qs(".contact-form");
    this.init();
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      this.form.reset();
      Toast.show("پیام شما با موفقیت ثبت شد.");
    });
  }
}

/* ----------------- Init ----------------- */
document.addEventListener("DOMContentLoaded", () => {
  new HeaderNav();
  const router = new Router();
  new HeroSlider(".hero-slider");
  new LazyBackground();
  new ScrollAnimator();
  new Parallax();
  ProductData.init();
  Toast.init();
  const cart = new Cart();
  ProductFilter.init();
  new GalleryLightbox();
  new ContactForm();

  // شروع از صفحه اصلی
  router.showPage("home");
});

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis({
    lerp: 0.07,
    smoothWheel: true,
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
});
