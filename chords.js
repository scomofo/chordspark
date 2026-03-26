// ═══════════════════════════════════════════════════════════════════
// ChordSpark Chord Diagram — SVG Renderer
// ═══════════════════════════════════════════════════════════════════

function renderChordDiagram(chordKey, opts = {}) {
  const chord = CHORDS[chordKey];
  if (!chord) return "";

  const size = opts.size || 140;
  const showLabel = opts.showLabel !== false;
  const glow = opts.glow || false;
  const dimmed = opts.dimmed || false;

  const w = size;
  const h = size * 1.3;
  const padL = 24;
  const padR = 10;
  const padT = showLabel ? 30 : 14;
  const padB = 10;
  const fretH = (h - padT - padB) / 4;
  const strSpacing = (w - padL - padR) / 5;
  const numFrets = 4;
  const startFret = chord.barFret > 1 ? chord.barFret : 0;

  const opacity = dimmed ? 0.3 : 1;
  const filterAttr = glow ? `filter="url(#glow-${chordKey})"` : "";

  let svg = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="opacity:${opacity}">`;

  // Glow filter
  if (glow) {
    svg += `<defs><filter id="glow-${chordKey}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feFlood flood-color="${chord.color}" flood-opacity="0.3"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter></defs>`;
  }

  // Label
  if (showLabel) {
    svg += `<text x="${w/2}" y="18" text-anchor="middle" fill="${chord.color}" font-weight="800" font-size="14" font-family="'JetBrains Mono',monospace">${chord.name}</text>`;
  }

  // Nut (thick bar at top if open position)
  if (startFret <= 1) {
    svg += `<rect x="${padL - 1}" y="${padT}" width="${strSpacing * 5 + 2}" height="3.5" rx="1" fill="#c8c8d0"/>`;
  }

  // Fret position indicator
  if (startFret > 1) {
    svg += `<text x="${padL - 8}" y="${padT + fretH * 0.55}" text-anchor="end" fill="#6b7280" font-size="10" font-family="monospace">${startFret}fr</text>`;
  }

  // Fret lines
  for (let i = 0; i <= numFrets; i++) {
    const y = padT + i * fretH;
    const sw = i === 0 && startFret <= 1 ? 0 : 0.8;
    svg += `<line x1="${padL}" y1="${y}" x2="${padL + strSpacing * 5}" y2="${y}" stroke="#3a3a4a" stroke-width="${sw}"/>`;
  }

  // String lines
  for (let i = 0; i < 6; i++) {
    const x = padL + i * strSpacing;
    const sw = i === 0 ? 1.4 : (i < 3 ? 1 : 0.7);
    svg += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + numFrets * fretH}" stroke="#555" stroke-width="${sw}"/>`;
  }

  // Barre bar
  if (chord.barFret > 0) {
    const barY = padT + (chord.barFret - startFret - 0.5) * fretH;
    // Find barre range
    let barStart = 5, barEnd = 0;
    chord.fingerMap.forEach((fm, i) => {
      if (fm === "b") { barStart = Math.min(barStart, i); barEnd = Math.max(barEnd, i); }
    });
    const x1 = padL + barStart * strSpacing;
    const x2 = padL + barEnd * strSpacing;
    const r = strSpacing * 0.28;
    svg += `<rect x="${x1 - r}" y="${barY - r}" width="${x2 - x1 + r * 2}" height="${r * 2}" rx="${r}" fill="${chord.color}" opacity="0.8"/>`;
  }

  // Finger dots + mute/open markers
  chord.frets.forEach((f, i) => {
    const x = padL + i * strSpacing;

    if (f === -1) {
      // Muted string
      svg += `<text x="${x}" y="${padT - 5}" text-anchor="middle" fill="#ef4444" font-size="11" font-weight="700">✕</text>`;
      return;
    }
    if (f === 0) {
      // Open string
      svg += `<circle cx="${x}" cy="${padT - 6}" r="3.5" fill="none" stroke="#9ca3af" stroke-width="1.5"/>`;
      return;
    }

    const fm = chord.fingerMap[i];
    if (fm === "b") return; // Rendered by barre bar

    const displayFret = f - startFret;
    const y = padT + (displayFret - 0.5) * fretH;
    const r = strSpacing * 0.3;

    svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${chord.color}" ${filterAttr}/>`;

    // Finger number
    if (typeof fm === "number" && fm > 0 && size >= 120) {
      svg += `<text x="${x}" y="${y + 3.5}" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" font-family="sans-serif">${fm}</text>`;
    }
  });

  svg += `</svg>`;
  return svg;
}

// Render a small inline chord badge (for lists)
function renderChordBadge(chordKey, learned) {
  const chord = CHORDS[chordKey];
  if (!chord) return "";
  const bg = learned ? chord.color + "22" : "#1a1a24";
  const border = learned ? chord.color + "66" : "#2a2a3a";
  const color = learned ? chord.color : "#4b5563";
  return `<span class="chord-badge" style="background:${bg};border-color:${border};color:${color}">${chord.name}</span>`;
}

// Render chord dot (tiny indicator)
function renderChordDot(chordKey, learned) {
  const chord = CHORDS[chordKey];
  const bg = learned ? chord.color : "#2a2a3a";
  return `<span class="chord-dot" style="background:${bg}" title="${chord.name}"></span>`;
}
