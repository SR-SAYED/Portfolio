const selectAll = (selector) => document.querySelectorAll(selector);

function renderTimeline(items, type) {
  return items.map((item) => {
    const title = type === "experience" ? item.role : item.institution;
    const subtitle = type === "experience" ? item.company : item.program;
    const highlights = item.highlights
      ? `<ul>${item.highlights.map((highlight) => `<li>${highlight}</li>`).join("")}</ul>`
      : "";
    const cgpa = type === "education" && item.cgpa
      ? `<span class="education-cgpa">CGPA: ${item.cgpa}</span>`
      : "";

    return `<article class="timeline-item"><h4>${title}</h4><p>${subtitle}</p>${cgpa}<time>${item.period}</time>${highlights}</article>`;  }).join("");
}

function renderCertificate(certificate) {
  return `<article class="certificate-card"><img src="${certificate.image}" alt="${certificate.title} certificate" loading="lazy"><div><h4>${certificate.title}</h4><p>${certificate.issuer}</p><a href="${certificate.file}" target="_blank">View PDF ↗</a></div></article>`;
}

function renderPortfolio(data) {
  const { profile, stats, skills, experience, education, achievements, softSkills, languages, technicalCertificates, professionalCertificates = [] } = data;
  document.title = `${profile.name} | ${profile.role}`;
  document.querySelector("link[rel='icon']").href = `${profile.favicon}?v=1`;
  document.querySelector("[data-intro]").textContent = profile.intro;
  document.querySelector("[data-summary]").textContent = profile.summary;
  document.querySelector("[data-photo]").src = profile.photo;
  document.querySelector("[data-year]").textContent = new Date().getFullYear();

  selectAll("[data-name]").forEach((element) => { element.textContent = profile.name; });
  selectAll("[data-location]").forEach((element) => { element.textContent = profile.location; });
  selectAll("[data-email]").forEach((element) => {
    element.href = `mailto:${profile.email}`;
    element.textContent = profile.email;
  });
  selectAll("[data-phone]").forEach((element) => {
    element.href = `tel:${profile.phone.replace(/[^+\d]/g, "")}`;
    element.textContent = profile.phone;
  });
  ["github", "linkedin", "facebook", "instagram"].forEach((network) => {
    selectAll(`[data-${network}]`).forEach((element) => { element.href = profile[network]; });
  });

  document.querySelector("[data-stats]").innerHTML = stats.map((stat) => `<article class="stat"><strong>${stat.value}</strong><span>${stat.label}</span></article>`).join("");
  document.querySelector("[data-experience]").innerHTML = renderTimeline(experience, "experience");
  document.querySelector("[data-education]").innerHTML = renderTimeline(education, "education");
  document.querySelector("[data-skills]").innerHTML = skills.map((skill) => `<article class="skill"><div class="skill-top"><h3>${skill.name}</h3><span>${skill.level}%</span></div><p>${skill.details}</p><div class="meter"><i style="width:${skill.level}%"></i></div></article>`).join("");
  document.querySelector("[data-soft-skills]").innerHTML = softSkills.map((skill) => `<span>${skill}</span>`).join("");
  document.querySelector("[data-languages]").innerHTML = languages.map((language) => `<p>${language}</p>`).join("");
  document.querySelector("[data-achievements]").innerHTML = achievements.map((achievement) => `<article>${achievement}</article>`).join("");
  document.querySelector("[data-technical-certificates]").innerHTML = technicalCertificates.map(renderCertificate).join("");
  const professionalSection = document.querySelector(".professional-certificates");
  if (professionalCertificates.length) {
    document.querySelector("[data-professional-certificates]").innerHTML = professionalCertificates.map(renderCertificate).join("");
    professionalSection.hidden = false;
  }
  document.querySelector("[data-cv-links]").innerHTML = `<div class="resume-download">${profile.resumes.map((resume) => `<a href="${resume.file}" target="_blank">${resume.label}<span>↗</span></a>`).join("")}</div>`;
}

async function init() {
  try {
    const response = await fetch("data/portfolio.json");
    if (!response.ok) throw new Error("Portfolio data could not be loaded.");
    renderPortfolio(await response.json());
  } catch (error) {
    console.error(error);
    document.querySelector("[data-intro]").textContent = "Portfolio content is currently unavailable. Please refresh the page.";
  }

  const menu = document.querySelector(".site-nav");
  const menuButton = document.querySelector(".menu-toggle");
  menuButton.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", isOpen);
  });
  selectAll(".site-nav a").forEach((link) => link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));
  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && !menuButton.contains(event.target)) {
      menu.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.1 });
  selectAll(".reveal").forEach((element) => observer.observe(element));
}

const scrollButton = document.querySelector(".scroll-direction");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY) {
    scrollButton.textContent = "↓";
    scrollButton.setAttribute("aria-label", "Scroll down");
  } else if (currentScrollY < lastScrollY) {
    scrollButton.textContent = "↑";
    scrollButton.setAttribute("aria-label", "Scroll up");
  }
  lastScrollY = currentScrollY;
}, { passive: true });

scrollButton.addEventListener("click", () => {
  if (scrollButton.textContent === "↑") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }
});

init();
