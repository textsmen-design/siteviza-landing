/**
 * SiteViza — site behaviour
 * Vanilla JS, no dependencies. Reads window.SITE_CONFIG (data/config.js)
 * and data/results.json, then wires up the interactive bits:
 * header reveal, scroll animations, results table, social links and the
 * subscribe forms (posted to a Google Apps Script Web App).
 */
(function () {
  "use strict";

  const config = window.SITE_CONFIG || {};

  /* ---------------------------------------------------------------
   * Social icons (inline SVG, kept tiny and dependency-free)
   * ------------------------------------------------------------- */
  const SOCIAL_ICONS = {
    youtube:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12s0-3.2-.4-4.7c-.2-.9-.9-1.6-1.8-1.8C18.1 5 12 5 12 5s-6.1 0-7.8.5c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.7c.2.9.9 1.6 1.8 1.8C5.9 19 12 19 12 19s6.1 0 7.8-.5c.9-.2 1.6-.9 1.8-1.8.4-1.5.4-4.7.4-4.7ZM10 15V9l5 3-5 3Z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.4 2.2 1.8 3.7 4 3.9v2.6c-1.4.1-2.7-.3-4-1.1v6.4c0 3.1-2.5 5.2-5.4 5.2-2.9 0-5.4-2.2-5.4-5.3 0-3 2.6-5.3 5.7-5.2v2.7c-1.5-.1-2.9.9-2.9 2.5 0 1.5 1.3 2.6 2.7 2.6 1.6 0 2.9-1.2 2.9-2.9V3h2.4Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 3h4.6l4 5.6L17.2 3H21l-6.6 8.1L21.5 21h-4.6l-4.4-6.1L7 21H3.2l7-8.6L4 3Z"/></svg>',
    linkedin:
      '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z"/></svg>',
  };

  const SOCIAL_LABELS = {
    youtube: "YouTube",
    tiktok: "TikTok",
    x: "X",
    linkedin: "LinkedIn",
  };

  /* ---------------------------------------------------------------
   * Apply config: identity, socials, disclaimer, footer year
   * ------------------------------------------------------------- */
  function applyConfig() {
    document.querySelectorAll("[data-brand-name]").forEach((el) => {
      if (el.tagName === "A" && el.classList.contains("brand")) return; // keep logo mark "SV"
      el.textContent = config.name || el.textContent;
    });

    const initials = (config.name || "")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    void initials; // reserved for a future initials-based fallback

    if (config.portraitUrl) {
      const wrap = document.querySelector("[data-portrait-wrap]");
      if (wrap) {
        wrap.innerHTML = `<img src="${config.portraitUrl}" alt="Портрет ${config.name || ""}" class="portrait-photo" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" />`;
      }
    }

    const disclaimerEl = document.querySelector("[data-disclaimer]");
    if (disclaimerEl) disclaimerEl.textContent = config.disclaimer || "";

    const yearEl = document.querySelector("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    if (config.youtubeChannelUrl) {
      document.querySelectorAll("[data-youtube-channel-link]").forEach((el) => {
        el.href = config.youtubeChannelUrl;
      });
    }

    renderSocialLinks();
  }

  function renderSocialLinks() {
    const socials = config.socials || {};
    const entries = Object.keys(socials).filter((key) => socials[key]);

    const markup = entries
      .map((key) => {
        const icon = SOCIAL_ICONS[key] || "";
        const label = SOCIAL_LABELS[key] || key;
        return `<li><a href="${socials[key]}" target="_blank" rel="noopener noreferrer">${icon}<span>${label}</span></a></li>`;
      })
      .join("");

    const row = document.querySelector("[data-social-row]");
    const footerRow = document.querySelector("[data-social-row-footer]");
    if (row) row.innerHTML = markup;
    if (footerRow) footerRow.innerHTML = markup;
  }

  /* ---------------------------------------------------------------
   * Results: current week stats + archive table, from results.json
   * ------------------------------------------------------------- */
  function signClass(value) {
    if (typeof value !== "string") return "";
    if (value.trim().startsWith("-")) return "down";
    if (value.trim().startsWith("+")) return "up";
    return "";
  }

  function renderResults(data) {
    const weeks = Array.isArray(data.weeks) ? data.weeks : [];
    if (!weeks.length) return;

    const [current, ...archive] = weeks;

    renderProofHighlight(weeks);

    if (data.isDemo) {
      const badge = document.querySelector("[data-demo-badge]");
      if (badge) badge.hidden = false;
    }

    const currentWrap = document.querySelector("[data-current-week]");
    if (currentWrap) {
      const resultSign = signClass(current.result);
      currentWrap.innerHTML = `
        <div class="stat"><span class="stat__label">Дата</span><span class="stat__value">${current.date}</span></div>
        <div class="stat"><span class="stat__label">Сделок</span><span class="stat__value">${current.trades}</span></div>
        <div class="stat"><span class="stat__label">Прибыльных</span><span class="stat__value stat__value--up">${current.profitable}</span></div>
        <div class="stat"><span class="stat__label">Убыточных</span><span class="stat__value stat__value--down">${current.losses}</span></div>
        <div class="stat"><span class="stat__label">Итог недели</span><span class="stat__value ${resultSign ? "stat__value--" + resultSign : ""}">${current.result}</span></div>
        <div class="stat"><span class="stat__label">Баланс</span><span class="stat__value">${current.balance}</span></div>
      `;
      observeStatCountUp(currentWrap);
    }

    const archiveBody = document.querySelector("[data-archive-body]");
    if (archiveBody) {
      archiveBody.innerHTML = archive
        .map((week) => {
          const sign = signClass(week.result);
          return `
            <tr class="${sign ? "is-" + sign : ""}">
              <td>${week.date}</td>
              <td>${week.trades}</td>
              <td>${week.profitable}</td>
              <td>${week.losses}</td>
              <td class="${sign ? "result-cell--" + sign : ""}">${week.result}</td>
              <td>${week.balance}</td>
            </tr>
          `;
        })
        .join("");
    }
  }

  /* ---------------------------------------------------------------
   * Count-up micro-interaction: pure integer stat values (trades,
   * profitable, losses) animate from 0 once scrolled into view.
   * Non-numeric values (dates, "+3.2%", balances) are left untouched.
   * ------------------------------------------------------------- */
  function animateCount(el) {
    const raw = el.textContent.trim();
    if (!/^\d+$/.test(raw)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = parseInt(raw, 10);
    const duration = 700;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = String(target);
      }
    }

    requestAnimationFrame(tick);
  }

  function observeCountUp(elements) {
    if (!("IntersectionObserver" in window) || !elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  function observeStatCountUp(container) {
    observeCountUp(Array.from(container.querySelectorAll(".stat__value")));
  }

  /* ---------------------------------------------------------------
   * Proof highlight: an honest, computed number (how many weeks are
   * tracked in results.json so far) plus a tiny sparkline of recent
   * outcomes — visual "proof" instead of a spreadsheet feel.
   * ------------------------------------------------------------- */
  function renderProofHighlight(weeks) {
    const valueEl = document.querySelector("[data-weeks-count]");
    if (valueEl) {
      valueEl.textContent = String(weeks.length);
      observeCountUp([valueEl]);
    }

    const sparkEl = document.querySelector("[data-proof-spark]");
    if (sparkEl) {
      const recent = weeks.slice(0, 10).reverse();
      sparkEl.innerHTML = recent
        .map((week, index) => {
          const sign = signClass(week.result);
          const height = 30 + ((index * 37) % 60); // varied, deterministic bar heights
          return `<span class="proof-spark__bar${sign ? " proof-spark__bar--" + sign : ""}" style="height:${height}%"></span>`;
        })
        .join("");
    }
  }

  // Used only if data/results.json can't be fetched (e.g. the page is
  // opened as a local file, where browsers block fetch() by CORS) so the
  // Results section never shows a bare error — it always shows a clearly
  // labeled demo table instead. Same shape and same "isDemo" honesty as
  // the real file; never presented as real performance.
  var FALLBACK_RESULTS = {
    isDemo: true,
    weeks: [
      { date: "2026-08-24", trades: 12, profitable: 8, losses: 4, result: "+1.8%", balance: "10 811 у.е." },
      { date: "2026-08-17", trades: 9, profitable: 5, losses: 4, result: "+1.2%", balance: "10 619 у.е." },
      { date: "2026-08-10", trades: 14, profitable: 9, losses: 5, result: "+3.4%", balance: "10 493 у.е." },
      { date: "2026-08-03", trades: 7, profitable: 3, losses: 4, result: "-1.1%", balance: "10 148 у.е." },
      { date: "2026-07-27", trades: 11, profitable: 7, losses: 4, result: "+2.6%", balance: "10 260 у.е." },
    ],
  };

  function loadResults() {
    fetch("data/results.json")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(renderResults)
      .catch(() => renderResults(FALLBACK_RESULTS));
  }

  /* ---------------------------------------------------------------
   * Subscribe forms: POST the email to a Google Apps Script Web App,
   * which appends it to a Google Sheet and emails the owner. See
   * README.md for the ready-to-deploy Apps Script code. Until a real
   * appsScriptUrl is set in config.js, the form validates normally but
   * shows a clear "not connected yet" message instead of pretending to
   * have submitted anywhere.
   * ------------------------------------------------------------- */
  function setupSubscribeForms() {
    const appsScriptUrl = config.appsScriptUrl;
    const forms = document.querySelectorAll("[data-subscribe-form]");

    forms.forEach((form) => {
      const input = form.querySelector('input[type="email"]');
      const status = form.querySelector(".subscribe-form__status");
      let isSubmitting = false;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        const email = input.value.trim();
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!isValid) {
          status.textContent = "Проверьте формат email.";
          status.dataset.state = "error";
          input.focus();
          return;
        }

        if (!appsScriptUrl || appsScriptUrl.indexOf("PASTE_YOUR") === 0) {
          status.textContent =
            "Форма пока не подключена: нужно указать appsScriptUrl в data/config.js (см. README.md).";
          status.dataset.state = "error";
          return;
        }

        isSubmitting = true;
        form.classList.add("is-loading");
        status.textContent = "";
        status.dataset.state = "";

        fetch(appsScriptUrl, {
          method: "POST",
          // text/plain avoids a CORS preflight (OPTIONS), which Apps
          // Script Web Apps don't handle by default.
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ type: "subscription", email: email, source: "SiteViza", page: location.href }),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Bad response: " + response.status);
            return response.json();
          })
          .then((data) => {
            if (data && data.result === "success") {
              status.textContent = "Готово! Вы подписаны — ждите новых разборов на почте.";
              status.dataset.state = "success";
              form.reset();
            } else {
              throw new Error((data && data.error) || "Unknown error");
            }
          })
          .catch((err) => {
            console.error("Subscribe form error:", err);
            status.textContent =
              "Не получилось подписаться. Попробуйте ещё раз чуть позже.";
            status.dataset.state = "error";
          })
          .finally(() => {
            isSubmitting = false;
            form.classList.remove("is-loading");
          });
      });
    });
  }

  /* ---------------------------------------------------------------
   * Inquiry form (final CTA): a separate "contact / business inquiry"
   * form, distinct from the subscribe form above. Posts to the same
   * Apps Script Web App with type:"inquiry" so the script can route
   * it to its own sheet + recipient instead of the subscriber list.
   * Same honest "not connected yet" fallback if appsScriptUrl is unset.
   * ------------------------------------------------------------- */
  function setupInquiryForm() {
    const appsScriptUrl = config.appsScriptUrl;
    const form = document.querySelector("[data-inquiry-form]");
    if (!form) return;

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');
    const status = form.querySelector(".inquiry-form__status");
    let isSubmitting = false;

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (isSubmitting) return;

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isEmailValid || !message) {
        status.textContent = !isEmailValid ? "Проверьте формат email." : "Расскажите пару слов в сообщении.";
        status.dataset.state = "error";
        (!isEmailValid ? emailInput : messageInput).focus();
        return;
      }

      if (!appsScriptUrl || appsScriptUrl.indexOf("PASTE_YOUR") === 0) {
        status.textContent =
          "Форма пока не подключена: нужно указать appsScriptUrl в data/config.js (см. README.md).";
        status.dataset.state = "error";
        return;
      }

      isSubmitting = true;
      form.classList.add("is-loading");
      status.textContent = "Отправляем…";
      status.dataset.state = "";

      fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          type: "inquiry",
          name: name,
          email: email,
          message: message,
          source: "SiteViza",
          page: location.href,
        }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Bad response: " + response.status);
          return response.json();
        })
        .then((data) => {
          if (data && data.result === "success") {
            status.textContent = "Спасибо. Сообщение отправлено.";
            status.dataset.state = "success";
            form.reset();
          } else {
            throw new Error((data && data.error) || "Unknown error");
          }
        })
        .catch((err) => {
          console.error("Inquiry form error:", err);
          status.textContent = "Не удалось отправить сообщение. Попробуйте ещё раз.";
          status.dataset.state = "error";
        })
        .finally(() => {
          isSubmitting = false;
          form.classList.remove("is-loading");
        });
    });
  }

  /* ---------------------------------------------------------------
   * Header visibility + scroll reveal
   * ------------------------------------------------------------- */
  function setupHeaderReveal() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 80) {
        header.classList.add("is-visible");
      } else {
        header.classList.remove("is-visible");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function setupScrollReveal() {
    const items = document.querySelectorAll(".reveal");
    // Elements are visible by default (see styles.css). Only switch on the
    // fade-in animation once we know IntersectionObserver is available —
    // otherwise leave everything as plain, fully visible content.
    if (!("IntersectionObserver" in window) || !items.length) {
      return;
    }

    document.documentElement.classList.add("js-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------
   * Hero terminal card: subtle pointer-tilt micro-interaction.
   * Skipped on touch devices and when reduced motion is requested.
   * ------------------------------------------------------------- */
  function setupHeroTilt() {
    const wrap = document.querySelector("[data-hero-card]");
    const card = wrap ? wrap.querySelector(".figure__frame") : null;
    if (!wrap || !card) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    function onMove(event) {
      const rect = wrap.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--ry", (px * 8).toFixed(2) + "deg");
      card.style.setProperty("--rx", (py * -8).toFixed(2) + "deg");
    }

    function onLeave() {
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    }

    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);
  }

  /* ---------------------------------------------------------------
   * Small "live session" clock in the hero meta line — a cheap but
   * effective way to make the terminal feel alive and current.
   * ------------------------------------------------------------- */
  function setupLiveClock() {
    const el = document.querySelector("[data-live-clock]");
    if (!el) return;

    function tick() {
      el.textContent = new Date().toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------------
   * Init
   * ------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    loadResults();
    setupSubscribeForms();
    setupInquiryForm();
    setupHeaderReveal();
    setupScrollReveal();
    setupLiveClock();
    setupHeroTilt();
  });
})();
