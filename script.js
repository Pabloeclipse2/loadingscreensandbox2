// Hier sind DEINE Bilder aus dem images/ Ordner
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
let animOptions = {
  duration: 1000,
  fill: 'forwards'
};

// --- Bild-Animation (Homigrad Style) ---
function slide() {
  if (usesPhotos.length == 0) {
    for (let i = 0; i < photos.length; i++) {
      usesPhotos[i] = photos[i];
    }
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

// Start der Bilder
slide();
slide();
setInterval(slide, 5000); // Alle 5 Sekunden ein neues Bild

// --- Text-Filter (damit es sauber aussieht) ---
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

// --- GMod Hooks & History Log ---
let textstatus = document.getElementById("textstatus");
let anchor = document.getElementById("history");
let historyList = [];

function addHistory(msg) {
  if (!msg || msg === "Verbinde...") return;
  
  let textEl = document.createElement("p");
  textEl.classList.add("log");
  textEl.innerHTML = msg;
  
  anchor.insertBefore(textEl, anchor.childNodes[0]);
  historyList.unshift(textEl); // Fügt oben hinzu
  
  let max = 12; // Maximale Anzahl an Einträgen im Log
  
  for (let i = 0; i < historyList.length; i++) {
    let item = historyList[i];
    // Opacity berechnen: Der oberste (i=0) ist 1, nach unten wird es durchsichtig
    let opacity = 1 - (i / max); 
    item.style.opacity = opacity;
    
    if (i >= max) {
      anchor.removeChild(item);
      historyList.pop();
    }
  }
}

window.GameDetails = function(servername, serverurl, mapname, maxplayers, steamid, gamemode, volume, language) {
  // Aktualisiert den Mapnamen unter deinem Titel
  document.getElementById("mapname").innerHTML = mapname;
}

window.DownloadingFile = function(filePath) {
  let cleanName = sanitizeFileName(filePath);
  if (textstatus.innerHTML !== "Verbinde...") {
    addHistory(textstatus.innerHTML); // Altes in History schieben
  }
  textstatus.innerHTML = cleanName; // Neues anzeigen
}

window.SetStatusChanged = function(status) {
  let cleanStatus = sanitizeFileName(status);
  if (textstatus.innerHTML !== "Verbinde...") {
    addHistory(textstatus.innerHTML);
  }
  textstatus.innerHTML = cleanStatus;
}
