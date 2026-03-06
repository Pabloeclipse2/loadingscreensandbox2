
var bgA = document.getElementById("bgA");
var bgB = document.getElementById("bgB");
var currentFileEl = document.getElementById("currentFile");
var logEl = document.getElementById("log");

var activeA = true;
var lastImageIndex = -1;

var totalFiles = 1;
var neededFiles = 1;

var currentFile = "";
var lastRemainingLogged = null;

// ---------- Images / crossfade ----------
function pickRandomImage() {
  if (!IMAGES || !IMAGES.length) return "";
  var idx;
  do {
    idx = Math.floor(Math.random() * IMAGES.length);
  } while (IMAGES.length > 1 && idx === lastImageIndex);
  lastImageIndex = idx;
  return "images/" + IMAGES[idx];
}

function showFirstImage() {
  var src = pickRandomImage();
  if (!src) return;
  bgA.src = src;
  bgA.style.opacity = "1";
  bgB.style.opacity = "0";
}

function crossfadeNextImage() {
  var src = pickRandomImage();
  if (!src) return;

  var visible = activeA ? bgA : bgB;
  var hidden = activeA ? bgB : bgA;

  hidden.onload = function () {
    hidden.style.opacity = "1";
    visible.style.opacity = "0";
    hidden.onload = null;
    activeA = !activeA;
  };

  hidden.src = src;
}

// ---------- Download display ----------
function sanitizeFileName(text) {
  if (!text) return "";

  var s = String(text);

  // If GMod status string comes in, try extracting the quoted file name.
  var quoted = s.match(/['"]([^'"]+)['"]/);
  if (quoted && quoted[1]) {
    return quoted[1];
  }

  // Strip common prefixes like "Loading " or "Downloading "
  s = s.replace(/^.*?-\s*/i, "");
  s = s.replace(/^(loading|downloading)\s+/i, "");
  s = s.replace(/\.\.\.\s*\d+%?$/i, "");

  return s;
}

function setCurrentFile(text) {
  var clean = sanitizeFileName(text);
  currentFile = clean || "";
  currentFileEl.textContent = currentFile;
}

function getProgressPercent() {
  if (totalFiles <= 0) return 0;
  var p = (totalFiles - neededFiles) / totalFiles;
  if (p < 0) p = 0;
  if (p > 1) p = 1;
  return Math.round(p * 100);
}

// Remaining percent list:
// top = higher remaining percent
// bottom = lower remaining percent
function appendRemainingLine(file, remaining) {
  if (!file) return;

  var line = document.createElement("div");
  line.className = "line";
  line.textContent = file + " " + remaining + "%";
  logEl.appendChild(line);

  while (logEl.children.length > 12) {
    logEl.removeChild(logEl.firstChild);
  }

  updateLogFade();
}

function updateLogFade() {
  var lines = logEl.children;
  var count = lines.length;
  if (!count) return;

  for (var i = 0; i < count; i++) {
    var depth = count <= 1 ? 0 : i / (count - 1); // 0 = top, 1 = bottom
    var opacity = 1 - (depth * 0.86);
    var moveDown = depth * 28;

    lines[i].style.opacity = String(opacity);
    lines[i].style.transform = "translateY(" + moveDown + "px)";
  }
}

function updateRemainingLog() {
  var progress = getProgressPercent();
  var remaining = 100 - progress;

  if (lastRemainingLogged === null) {
    lastRemainingLogged = remaining;
    appendRemainingLine(currentFile, remaining);
    return;
  }

  // During normal loading remaining decreases: 100, 99, 98...
  if (remaining < lastRemainingLogged) {
    for (var r = lastRemainingLogged - 1; r >= remaining; r--) {
      appendRemainingLine(currentFile, r);
    }
  } else if (remaining > lastRemainingLogged) {
    // Fallback for weird hook jumps
    appendRemainingLine(currentFile, remaining);
  }

  lastRemainingLogged = remaining;
}

// ---------- GMod hooks ----------
function DownloadingFile(fileName) {
  setCurrentFile(fileName);
}

function SetStatusChanged(text) {
  // Only use SetStatusChanged if DownloadingFile has not supplied a filename yet.
  if (!currentFile) {
    setCurrentFile(text);
  }
}

function SetFilesTotal(total) {
  totalFiles = Math.max(1, parseInt(total, 10) || 1);
  updateRemainingLog();
}

function SetFilesNeeded(needed) {
  neededFiles = Math.max(0, parseInt(needed, 10) || 0);
  updateRemainingLog();
}

// ---------- Start ----------
showFirstImage();
setInterval(crossfadeNextImage, 7000);

// No fake preview text, no "Downloading content... 100%", no completion message.
// Blank under-title area until GMod sends the real file name.
currentFileEl.textContent = "";
