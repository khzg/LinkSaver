function saveLink() {
  const link = document.getElementById("linkInput").value;
  const name = document.getElementById("nameInput").value;

  if (link && name) {
    const savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
    savedLinks.unshift({name, link});
    localStorage.setItem("savedLinks", JSON.stringify(savedLinks));

    displayLinks();
  }
}

function displayLinks() {
  const savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
  const linksList = document.getElementById("linksList");

  // Sort the saved links by date
  savedLinks.sort((a, b) => new Date(b.date) - new Date(a.date));

  linksList.innerHTML = savedLinks
    .map(
      ({name, link}, index) =>
        `<li><a href="${link}" target="_blank">${name}</a><button id="delete" onclick="deleteLink(${index})">❌</button></li>`
    )
    .join("");

  const savedLinksSection = document.getElementById("savedLinksSection");
  savedLinksSection.style.display = "block";
}

function deleteLink(index) {
  const savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
  savedLinks.splice(index, 1);
  localStorage.setItem("savedLinks", JSON.stringify(savedLinks));
  displayLinks();
}

function exportJson() {
  const savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
  const jsonData = JSON.stringify(savedLinks, null, 2);
  const blob = new Blob([jsonData], {type: "application/json"});

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "links.json";
  a.click();
}

function importJson(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;
    const importedLinks = JSON.parse(content);

    if (Array.isArray(importedLinks)) {
      localStorage.setItem("savedLinks", JSON.stringify(importedLinks));
      displayLinks();
    } else {
      console.error("Invalid JSON file");
    }
  };

  reader.readAsText(file);
}

window.onload = function () {
  displayLinks();
};

function refreshPage() {
  location.reload();
}

let settings = {};

function loadSettings() {
  fetch("settings.json")
    .then((response) => response.json())
    .then((data) => {
      settings = data;
      applySettings();
    })
    .catch((error) => {
      console.error("Error loading settings:", error);
    });
}

function applySettings() {
  const language = settings.language || "en";
  const style = settings.style || "ltr";

  // Load the language translation file
  const translations = settings.translations || {};
  const languageTranslations = translations[language] || {};

  // Apply the translations to the HTML elements
  document.getElementById("linksHeading").textContent =
    languageTranslations.savedLinksHeading;
  document.getElementById("saveButton").textContent =
    languageTranslations.saveButton;
  document.getElementById("exportButton").textContent =
    languageTranslations.exportButton;
  document.getElementById("importLabel").textContent =
    languageTranslations.importLabel;
  document.getElementById("linkLabel").textContent = languageTranslations.link;
  document.getElementById("nameLabel").textContent = languageTranslations.name;
  document.getElementById("searchInput").placeholder = languageTranslations.searchPlaceholder;

  // Apply the style (LTR or RTL)
  document.body.dir = style === "rtl" ? "rtl" : "ltr";

  // Apply custom styles
  const customStyles = settings.styles || {};
  Object.keys(customStyles).forEach((property) => {
    document.body.style.setProperty(`--${property}`, customStyles[property]);
  });

  // Apply multi-line CSS styles
  if (style === "ltr") {
    const ltrStyles = `
        body {
        direction: ltr;
        }
        
        #linksList li button {
        right: 0;
        margin-right: 10px;
        left: unset;
        }

  `;
    const styleElement = document.createElement("style");
    styleElement.innerHTML = ltrStyles;
    document.head.appendChild(styleElement);
  } else {
    const rtlStyles = `
        body {
        direction: rtl;
        }

        #linksList li button {
        left: 0;
        margin-left: 10px;
        right: unset;
        }

        #searchContainer {
          justify-items: left;
        }
  `;
    const styleElement = document.createElement("style");
    styleElement.innerHTML = rtlStyles;
    document.head.appendChild(styleElement);
  }

  displayLinks();
}

function searchLinks() {
  const searchInput = document.getElementById("searchInput").value.toLowerCase();
  const savedLinks = JSON.parse(localStorage.getItem("savedLinks")) || [];
  const filteredLinks = savedLinks.filter((link) => {
    const name = link.name.toLowerCase();
    const url = link.link.toLowerCase();
    return name.includes(searchInput) || url.includes(searchInput);
  });

  const linksList = document.getElementById("linksList");
  linksList.innerHTML = filteredLinks
    .map(
      ({ name, link }, index) =>
        `<li><a href="${link}" target="_blank">${name}</a><button id="delete" onclick="deleteLink(${index})">❌</button></li>`
    )
    .join("");
}


loadSettings();
