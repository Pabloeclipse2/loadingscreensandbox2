// --- Bilder ---
let photos = [
  "images/img1.jpg", "images/img2.jpg", "images/img3.jpg", 
  "images/img4.jpg", "images/img5.jpg", "images/img6.jpg", 
  "images/img7.jpg", "images/img8.jpg", "images/img9.jpg", 
  "images/img10.jpg", "images/img11.jpg"
];

let usesPhotos = [];
let background1 = document.getElementById("1");
let background2 = document.getElementById("2");
let load = document.getElementById("load");
background2.style.opacity = 0;

let mode = 0;
let animOptions = { duration: 1000, fill: 'forwards' };

// --- Bild-Animation ---
function slide() {
  if (usesPhotos.length == 0) {
    for (let i = 0; i < photos.length; i++) usesPhotos[i] = photos[i];
  }
  
  if (mode == 0) {
    mode = 1;
    background2.style.backgroundImage = load.style.backgroundImage;
    background1.animate([{ opacity: 1 }, { opacity: 0 }], animOptions);
    background2.animate([{ opacity: 0 }, { opacity: 1 }], animOptions);
  } else {
    mode = 0;
    background1.style.backgroundImage = load.style.backgroundImage;
    background1.animate([{ opacity: 0 }, { opacity: 1 }], animOptions);
    background2.animate([{ opacity: 1 }, { opacity: 0 }], animOptions);
  }
  
  let rand = Math.floor(Math.random() * usesPhotos.length);
  load.style.backgroundImage = 'url("' + usesPhotos[rand] + '")';
  usesPhotos.splice(rand, 1);
}

slide();
slide();
setInterval(slide, 5000);

// --- Variablen für den Download ---
let totalFiles = 1;
let neededFiles = 1;
let currentFile = "";
let lastRemainingLogged = null;

let textstatus = document.getElementById("textstatus");
let anchor = document.getElementById("history");
let historyList = [];

function sanitizeFileName(text) {
  if (!text) return "";
  let s = String(text);
  let quoted = s.match(/['"]([^'"]+)['"]/);
  if (quoted && quoted[1]) return quoted[1];
  
  s = s.replace(/^.*?-\s*/i, "");
  s = s.replace(/^(loading|downloading)\s+/i, "");
  s = s.replace(/\.\.\.\s*\d+%?$/i, "");
  return s;
}

// Berechnet die Prozente
function getProgressPercent() {
  if (totalFiles <= 0) return 0;
  let p = (totalFiles - neededFiles) / totalFiles;
  if (p < 0) p = 0;
  if (p > 1) p = 1;
  return Math.round(p * 100);
}

// Fügt den Eintrag mit Prozenten hinzu und animiert den Fade
function addHistoryLine(file, remaining) {
  if (!file) return;

  let textEl = document.createElement("p");
  textEl.classList.add("log");
  textEl.innerHTML = file + " " + remaining + "%"; // <-- Dein Format: "ADDON 3%"

  anchor.insertBefore(textEl, anchor.childNodes[0]);
  historyList.unshift(textEl);
  
  let maxEintraege = 10; // Wie viele Zeilen sollen sichtbar sein?

  // Aktualisiert die Durchsichtigkeit (Fade Out)
  for (let i = 0; i < historyList.length; i++) {
    let item = historyList[i];
    
    // 0 = oben (100% sichtbar), 9 = unten (0% sichtbar)
    let opacity = 1 - (i / (maxEintraege - 1));
    item.style.opacity = Math.max(0, opacity);
    
    // Löscht Elemente, die zu weit unten sind
    if (i >= maxEintraege) {
      anchor.removeChild(item);
      historyList.splice(i, 1);
      i--; 
    }
  }
}

// Logik, die zählt, wenn GMod die restlichen Dateien durchgibt
function updateRemainingLog() {
  let progress = getProgressPercent();
  let remaining = 100 - progress;

  if (lastRemainingLogged === null) {
    lastRemainingLogged = remaining;
    addHistoryLine(currentFile, remaining);
    return;
  }

  if (remaining < lastRemainingLogged) {
    for (let r = lastRemainingLogged - 1; r >= remaining; r--) {
      addHistoryLine(currentFile, r);
    }
  } else if (remaining > lastRemainingLogged) {
    addHistoryLine(currentFile, remaining);
  }
  lastRemainingLogged = remaining;
}

// --- GMod Hooks ---
window.GameDetails = function(servername, serverurl, mapname, maxplayers, steamid, gamemode, volume, language) {
  document.getElementById("mapname").innerHTML = mapname;
}

window.DownloadingFile = function(fileName) {
  currentFile = sanitizeFileName(fileName);
  textstatus.innerHTML = currentFile;
}

window.SetStatusChanged = function(text) {
  if (!currentFile) {
    currentFile = sanitizeFileName(text);
    textstatus.innerHTML = currentFile;
  }
}

window.SetFilesTotal = function(total) {
  totalFiles = Math.max(1, parseInt(total, 10) || 1);
  updateRemainingLog();
}

window.SetFilesNeeded = function(needed) {
  neededFiles = Math.max(0, parseInt(needed, 10) || 0);
  updateRemainingLog();
}
