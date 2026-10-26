/**
 * SiteViza — site configuration
 *
 * This is the ONLY file the owner needs to touch to personalize the site:
 * name, photo, YouTube link, social links and the footer disclaimer.
 * Everything here is a PLACEHOLDER and must be replaced with real data
 * before launch — see README.md for a step-by-step guide.
 *
 * Do NOT put API keys or secret tokens in this file — it is public
 * (loaded directly in the browser).
 */
window.SITE_CONFIG = {
  // ---- Identity -----------------------------------------------------
  name: "Данила Корн",
  // Short one-line descriptor shown under the name in the hero.
  descriptor: "ТРЕЙДЕР · YOUTUBE · ДНЕВНИК РЫНКА",

  // Portrait image for the "personal brand" section.
  // Replace with a real photo: assets/images/portrait.jpg (recommended
  // size: at least 800x1000px, portrait orientation, JPG or WEBP).
  // Leave null to keep the generated placeholder badge.
  portraitUrl: null,

  // ---- YouTube --------------------------------------------------------
  // Link to your channel (or a specific video once you have one worth
  // featuring). Until then this just points visitors to YouTube itself —
  // no fake video, no video ID needed.
  youtubeChannelUrl: "https://youtube.com/",

  // ---- Email subscription (Google Apps Script + Google Sheets) --------
  // Deploy the Apps Script Web App described in README.md, then paste
  // its /exec URL here. Until then, submissions show a friendly
  // "not connected yet" message instead of failing silently.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbwdtUaJv_RFlPSUyDRONCPGBYt56zDoPqBMmX4GMJXgChuyn6Zog-ojC3YerWLIACKL/exec",

  // ---- Social links ----------------------------------------------------
  // Placeholder: point at each platform's home page for now. Replace with
  // your real profile URLs when ready. Leave a value empty ("") to hide
  // that link entirely.
  socials: {
    youtube: "https://youtube.com/",
    tiktok: "https://www.tiktok.com/",
    x: "https://x.com/",
    linkedin: "https://www.linkedin.com/",
  },

  // ---- Legal ------------------------------------------------------------
  disclaimer:
    "Материалы сайта носят информационный характер и не являются индивидуальной инвестиционной рекомендацией.",
};
