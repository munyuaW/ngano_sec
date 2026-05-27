// Portal Configuration

const portals = {
  students: {
    id: "students",
    label: "Students",
    title: "Student Portal",
    description: "Access grades, timetables and school announcements.",
    usernameLabel: "Student Admin No.",
    usernamePlaceholder: "e.g. 3467",
    helpText: "Use your student Admission Number issued at enrollment.",
  },
  staff: {
    id: "staff",
    label: "Staff",
    title: "Staff Portal",
    description:
      "Manage classes, attendance, lesson plans, and internal communications.",
    usernameLabel: "Staff email",
    usernamePlaceholder: "e.g. mrjohndoe@gmail.com",
    helpText: "Contact IT support if you need a password reset.",
  },
  alumni: {
    id: "alumni",
    label: "Alumni",
    title: "Alumni Portal",
    description:
      "Stay connected with events, giving opportunities, and class updates.",
    usernameLabel: "Alumni email",
    usernamePlaceholder: "e.g. mdmjanedoe@yahoo.com",
    helpText:
      "First time here? Use the activation link from your invite email.",
  },
};

const form = document.getElementById("portalLoginForm");

const badgeEl = document.getElementById("portalBadge");
const titleEl = document.getElementById("portalTitle");
const descEl = document.getElementById("portalDescription");
const portalField = document.getElementById("portalField");
const usernameLabel = document.getElementById("usernameLabel");
const usernameInput = document.getElementById("username");
const usernameHint = document.getElementById("usernameHint");

const passwordInput = document.getElementById("password");
const showHidePwdBtn = document.getElementById("togglePassword");

const submitBtn = document.getElementById("submitBtn");
const portalNavLinks = document.querySelectorAll("#portalNav a");

const defaultPortalId = "students";

showHidePwdBtn.addEventListener("click", () => {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  showHidePwdBtn.textContent = isVisible ? "Show" : "Hide";
  showHidePwdBtn.setAttribute(
    "aria-label",
    isVisible ? "Show password" : "Hide password",
  );
  showHidePwdBtn.setAttribute("aria-pressed", isVisible ? "false" : "true");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
});

function updatePortal() {
  const portalId = getPortalIdFromUrl();
  const portal = getPortal(portalId);

  document.title = `${portal.title} | Ngano Secondary`;
  badgeEl.textContent = portal.title;
  titleEl.textContent = portal.title;
  descEl.textContent = portal.description;
  portalField.value = portal.id;
  usernameLabel.textContent = portal.usernameLabel;
  usernameInput.placeholder = portal.usernamePlaceholder;
  usernameHint.textContent = portal.helpText;
  submitBtn.textContent = `Sign in to ${portal.label.toLowerCase()} dashboard`;

  updatePortalNav(portalId);
}

function updatePortalNav(currentPortalId) {
  portalNavLinks.forEach((link) => link.classList.remove("is-current"));
  portalNavLinks.forEach((link) => {
    if (currentPortalId === link.id) {
      link.classList.add("is-current");
    }
  });
}

function getPortalIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("portal") || defaultPortalId;
}

function getPortal(id) {
  return id && portals[id] ? portals[id] : portals[defaultPortalId];
}

function buildLoginUrl(portalId) {
  return "login.html?portal=" + encodeURIComponent(portalId);
}

updatePortal();
