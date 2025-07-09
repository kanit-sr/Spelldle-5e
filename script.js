let spellListPopulated = false;

function populateSpellList() {
  if (spellListPopulated) return;
  spellListPopulated = true;
  const dl = document.getElementById('spell-list');
  dl.innerHTML = '';
  spells.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    dl.appendChild(opt);
  });
}


// === CONFIG ===
const MAX_TRIES = 10;
const DATA_URL = 'data/spells-srd.json';

// === STATE ===
let spells = [];
let secret;
let currentTry = 0;

// === UTILS ===
function compareField(val, target) {
  if (val === target) return 'correct';
  return val > target ? 'high' : 'low';
}
function normalizeRange(r) {
  const m = r.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}
function normalizeDuration(d) {
  let m = d.match(/(\d+)\s*hour/);
  if (m) return parseInt(m[1], 10) * 3600;
  m = d.match(/(\d+)\s*minute/);
  if (m) return parseInt(m[1], 10) * 60;
  m = d.match(/(\d+)\s*second/);
  if (m) return parseInt(m[1], 10);
  return 0;
}




// === GAME SETUP ===
fetch(DATA_URL)
  .then(r => r.json())
  .then(data => {
    spells = data.map(s => ({
      name: s.name,
      school: s.school,
      level: typeof s.level === 'string'
        ? (s.level === 'cantrip' ? 0 : parseInt(s.level, 10))
        : s.level,
      range_ft: normalizeRange(s.range),
      duration_s: normalizeDuration(s.duration),
      components: s.components,
      material: s.components.material ? s.material || '' : '',
      classes: s.classes || [],
      description: s.description || ''
    }));
    secret = spells[Math.floor(Math.random() * spells.length)];
    showSecretSpell();
    populateSpellList();
    buildBoard();
  });

function populateSpellList() {
  const dl = document.getElementById('spell-list');
  dl.innerHTML = ''; // <-- This line clears the datalist before adding new options
  spells.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    dl.appendChild(opt);
  });
}

function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let i = 0; i < MAX_TRIES; i++) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let j = 0; j < 6; j++) { // changed from 7 to 6
      const cell = document.createElement('div');
      cell.className = 'cell';
      row.appendChild(cell);
    }
    board.appendChild(row);
  }
}

document.getElementById('guess-btn').addEventListener('click', doGuess);
document.getElementById('spell-input').addEventListener('keyup', e => {
  if (e.key === 'Enter') doGuess();
});

function doGuess() {
  const input = document.getElementById('spell-input');
  const guessName = input.value.trim();
  const guess = spells.find(s => s.name.toLowerCase() === guessName.toLowerCase());
  if (!guess) { showMessage('Spell not found!'); return; }
  if (currentTry >= MAX_TRIES) return;

  const evals = evaluate(guess);
  renderGuess(evals);

  // Check if correct
  if (guess.name === secret.name) {
    showMessage('🎉 Correct! The spell was: ' + secret.name);
    showCorrectPopup(secret.name);
    highlightCorrectRow(currentTry);
    endGame();
    return;
  }

  currentTry++;
  document.getElementById('current').textContent = currentTry;
  input.value = '';
  if (currentTry === MAX_TRIES) {
    showMessage('Game Over! Spell was: ' + secret.name);
    endGame();
  } else {
    showMessage('');
  }
}

function highlightCorrectRow(rowIdx) {
  const rows = document.querySelectorAll('#board .row');
  const row = rows[rowIdx];
  row.style.outline = '3px solid #4caf50';
  row.style.boxShadow = '0 0 8px #4caf50';
}

function evaluate(g) {
  return {
    school:   g.school === secret.school ? 'correct' : 'wrong',
    level:    compareField(g.level, secret.level),
    range:    compareField(g.range_ft, secret.range_ft),
    duration: compareField(g.duration_s, secret.duration_s),
    components: {
      V: g.components.verbal === secret.components.verbal,
      S: g.components.somatic === secret.components.somatic,
      M: g.components.material === secret.components.material
    },
    material:
      secret.material && g.material.includes(secret.material)
        ? 'correct'
        : 'wrong',
    class: g.classes.some(cls => secret.classes.includes(cls))
      ? 'correct'
      : 'wrong'
  };
}

function renderGuess(evals) {
  const rows = document.querySelectorAll('#board .row');
  const row = rows[currentTry];
  const parts = ['school','level','range','duration','components','class'];
  const guess = spells.find(s => s.name.toLowerCase() === document.getElementById('spell-input').value.trim().toLowerCase());

  function formatDuration(s) {
    if (!s) return '-';
    if (s < 1) return 'Instant';
    if (s % 3600 === 0) return (s/3600) + ' hr';
    if (s % 60 === 0) return (s/60) + ' min';
    return s + ' sec';
  }

  parts.forEach((p,i) => {
    const cell = row.children[i];
    cell.classList.remove('correct','high','low','wrong');
    if (p === 'components') {
      const c = evals.components;
      cell.innerHTML = `
        <div class="comp-chip ${c.V ? 'comp-correct' : 'comp-wrong'}">V</div>
        <div class="comp-chip ${c.S ? 'comp-correct' : 'comp-wrong'}">S</div>
        <div class="comp-chip ${c.M ? 'comp-correct' : 'comp-wrong'}">M</div>
      `;
      cell.style.display = 'flex';
      cell.style.justifyContent = 'center';
      cell.style.alignItems = 'center';
      cell.style.gap = '4px';
    } else if (p === 'class') {
      cell.textContent = guess.classes && guess.classes.length ? guess.classes.join(', ') : '-';
      cell.style.display = '';
      cell.style.justifyContent = '';
      cell.style.alignItems = '';
      cell.style.gap = '';
    } else if (p === 'level') {
      cell.textContent = guess.level === 0 ? 'Cantrip' : guess.level;
      cell.style.display = '';
      cell.style.justifyContent = '';
      cell.style.alignItems = '';
      cell.style.gap = '';
    } else if (p === 'range') {
      cell.textContent = guess.range_ft ? guess.range_ft + ' ft' : '-';
      cell.style.display = '';
      cell.style.justifyContent = '';
      cell.style.alignItems = '';
      cell.style.gap = '';
    } else if (p === 'duration') {
      cell.textContent = formatDuration(guess.duration_s);
      cell.style.display = '';
      cell.style.justifyContent = '';
      cell.style.alignItems = '';
      cell.style.gap = '';
    } else if (p === 'school') {
      cell.textContent = guess.school || '-';
      cell.style.display = '';
      cell.style.justifyContent = '';
      cell.style.alignItems = '';
      cell.style.gap = '';
    } else {
      cell.textContent = guess[p] !== undefined ? guess[p] : '-';
      cell.style.display = '';
      cell.style.justifyContent = '';
      cell.style.alignItems = '';
      cell.style.gap = '';
    }
    // Add color class
    if (p === 'components') {
      // handled above
    } else if (p === 'class') {
      cell.classList.add(evals.class);
    } else {
      cell.classList.add(evals[p]);
    }
  });
}

function showMessage(msg) {
  document.getElementById('message').textContent = msg;
}
function endGame() {
  document.getElementById('guess-btn').disabled = true;
  document.getElementById('spell-input').disabled = true;
}

function showSecretSpell() {
  document.getElementById('secret-spell').textContent = secret ? secret.name : '';
}
function toggleAdminSecret() {
  const adminDiv = document.getElementById('admin-secret');
  adminDiv.style.display = adminDiv.style.display === 'none' ? 'block' : 'none';
}

// Show secret on load for admin (optional: use a keyboard shortcut)
document.addEventListener('keydown', e => {
  // Example: Ctrl+Shift+S to toggle secret
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
    toggleAdminSecret();
    showSecretSpell();
  }
});

function showCorrectPopup(spellName) {
  document.getElementById('correct-popup-msg').textContent = `Correct! The spell was: ${spellName}`;
  // Find the spell object
  const spell = spells.find(s => s.name === spellName);
  if (spell) {
    document.getElementById('correct-popup-detail').innerHTML = `
      <div><b>Level:</b> ${spell.level === 0 ? 'Cantrip' : spell.level}</div>
      <div><b>School:</b> ${spell.school}</div>
      <div><b>Range:</b> ${spell.range_ft ? spell.range_ft + ' ft' : '-'}</div>
      <div><b>Duration:</b> ${spell.duration_s ? formatDuration(spell.duration_s) : '-'}</div>
      <div><b>Components:</b> ${Object.entries(spell.components).filter(([k,v])=>v===true).map(([k])=>k).join(', ')}</div>
      <div><b>Classes:</b> ${spell.classes && spell.classes.length ? spell.classes.join(', ') : '-'}</div>
      <div style="margin-top:8px;"><b>Description:</b><br>${spell.description || ''}</div>
    `;
  } else {
    document.getElementById('correct-popup-detail').innerHTML = '';
  }
  document.getElementById('correct-popup').style.display = 'flex';
}
document.getElementById('close-correct-popup').onclick = function() {
  document.getElementById('correct-popup').style.display = 'none';
};

