// Always load at the top of the page (don't restore previous scroll on refresh).
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.addEventListener("load", () => window.scrollTo(0, 0));

// Nav hairline on scroll.
(function () {
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () =>
      nav.classList.toggle("is-scrolled", window.scrollY > 6);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();

// About slide-over panel.
(function () {
  const sheet = document.getElementById("aboutSheet");
  const backdrop = document.getElementById("sheetBackdrop");
  const openBtn = document.getElementById("aboutOpen");
  const closeBtn = document.getElementById("sheetClose");
  if (!sheet || !backdrop) return;

  const open = (e) => {
    if (e) e.preventDefault();
    sheet.classList.add("open");
    backdrop.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    sheet.classList.remove("open");
    backdrop.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  if (openBtn) openBtn.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();

// Products: tab switcher
(function () {
  const tabs = document.querySelectorAll('.prod-tab');
  const panels = document.querySelectorAll('.prod-panel');
  if (!tabs.length || !panels.length) return;

  function activate(idx) {
    tabs.forEach(t => t.classList.toggle('is-active', +t.dataset.idx === idx));
    panels.forEach(p => p.classList.toggle('is-active', +p.dataset.idx === idx));
  }

  tabs.forEach(tab => tab.addEventListener('click', () => activate(+tab.dataset.idx)));
})();

// Subtle fade-up reveal.
(function () {
  const selector =
    ".hero__banner, .hero__main, .hero__title, .hero__aside, .about__big, .about__text, .sec-title, .track, .tile, .cap__title, .chips-row, .logos, .life__head, .life__sub, .gcard, .contact__title, .contact__mail, .contact__links";
  const els = Array.from(document.querySelectorAll(selector));
  els.forEach((el) => el.classList.add("reveal"));

  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const delay = Math.min(i * 45, 200);
          setTimeout(() => entry.target.classList.add("in"), delay);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
  );

  els.forEach((el) => io.observe(el));
})();

// Live IST clock (hero + contact).
(function () {
  const targets = [
    document.getElementById("clockTime"),
    document.getElementById("clockTimeFoot"),
  ].filter(Boolean);
  if (!targets.length) return;

  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const tick = () => {
    const t = fmt.format(new Date());
    targets.forEach((el) => (el.textContent = t));
  };
  tick();
  setInterval(tick, 1000 * 30);
})();

// TEMPORARY theme previewer.
(function () {
  const themer = document.getElementById("themer");
  const btn = document.getElementById("themerBtn");
  if (!themer || !btn) return;

  const root = document.documentElement;
  const swatches = Array.from(themer.querySelectorAll("[data-theme-pick]"));

  const markActive = (name) => {
    swatches.forEach((s) =>
      s.classList.toggle("is-active", s.dataset.themePick === name),
    );
  };
  const apply = (name) => {
    if (name && name !== "light") root.setAttribute("data-theme", name);
    else root.removeAttribute("data-theme");
    markActive(name || "light");
    try {
      localStorage.setItem("pr-theme", name || "light");
    } catch (e) {}
  };

  // restore saved choice
  let saved = "light";
  try {
    saved = localStorage.getItem("pr-theme") || "light";
  } catch (e) {}
  apply(saved);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = themer.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
  swatches.forEach((s) =>
    s.addEventListener("click", () => apply(s.dataset.themePick)),
  );

  document.addEventListener("click", (e) => {
    if (!themer.contains(e.target)) themer.classList.remove("open");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") themer.classList.remove("open");
  });
})();

// Gallery lightbox — click a photo to open it with its description.
(function () {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const img = document.getElementById("lbImg");
  const tag = document.getElementById("lbTag");
  const title = document.getElementById("lbTitle");
  const desc = document.getElementById("lbDesc");
  const closeBtn = document.getElementById("lightboxClose");
  const backdrop = document.getElementById("lightboxBackdrop");
  const thumbs = document.getElementById("lbThumbs");
  const sections = document.getElementById("lbSections");
  const cards = Array.from(
    document.querySelectorAll(".gcard:not(.gcard--ph), .js-proj"),
  );

  const open = (card) => {
    const im = card.querySelector("img");
    const alt = (im && im.alt) || card.dataset.title || "";
    const list = card.dataset.imgs
      ? card.dataset.imgs.split("|")
      : [im ? im.currentSrc || im.src : ""].filter(Boolean);

    const show = (src) => {
      img.src = src;
      img.alt = alt;
    };
    show(list[0]);
    tag.textContent = card.dataset.tag || "";
    tag.style.display = card.dataset.tag ? "" : "none";
    title.textContent = card.dataset.title || alt;

    // structured (problem / what I built / impact) or a simple description
    const blocks = [
      ["The problem", card.dataset.problem],
      ["What I built", card.dataset.build],
      ["The impact", card.dataset.impact],
    ].filter((b) => b[1]);
    if (blocks.length) {
      sections.innerHTML = "";
      blocks.forEach(([label, txt]) => {
        const d = document.createElement("div");
        d.className = "lb-block";
        const l = document.createElement("span");
        l.className = "lb-block__label";
        l.textContent = label;
        const p = document.createElement("p");
        p.textContent = txt;
        d.append(l, p);
        sections.appendChild(d);
      });
      sections.style.display = "";
      desc.style.display = "none";
    } else {
      sections.style.display = "none";
      sections.innerHTML = "";
      desc.textContent = card.dataset.desc || "";
      desc.style.display = card.dataset.desc ? "" : "none";
    }

    thumbs.innerHTML = "";
    if (list.length > 1) {
      list.forEach((src, i) => {
        const b = document.createElement("button");
        b.className = "lightbox__thumb" + (i === 0 ? " is-active" : "");
        b.type = "button";
        b.innerHTML = '<img src="' + src + '" alt="" />';
        b.addEventListener("click", () => {
          show(src);
          thumbs
            .querySelectorAll(".lightbox__thumb")
            .forEach((t) => t.classList.remove("is-active"));
          b.classList.add("is-active");
        });
        thumbs.appendChild(b);
      });
      thumbs.style.display = "";
    } else {
      thumbs.style.display = "none";
    }

    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };
  const close = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  cards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.addEventListener("click", () => open(card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(card);
      }
    });
  });
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("open")) close();
  });
})();
