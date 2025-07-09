// reference.js

function getUnique(arr, key) {
  const set = new Set();
  arr.forEach(s => {
    if (Array.isArray(s[key])) {
      s[key].forEach(v => set.add(v));
    } else if (s[key] !== undefined) {
      set.add(s[key]);
    }
  });
  return Array.from(set);
}

let selectedClasses = [];

function renderClassChips() {
  const chipContainer = document.getElementById('filter-class-chips');
  chipContainer.innerHTML = '';
  // BUG FIX: Filter out empty, null, undefined, and non-string class names
  const allClasses = getUnique(spells, 'classes')
    .filter(cls => typeof cls === 'string' && cls.trim().length > 0)
    .sort((a, b) => a.localeCompare(b));
  allClasses.forEach(cls => {
    const chip = document.createElement('div');
    chip.className = 'chip' + (selectedClasses.includes(cls) ? ' selected' : '');
    chip.textContent = cls.charAt(0).toUpperCase() + cls.slice(1);
    chip.onclick = () => {
      if (selectedClasses.includes(cls)) {
        selectedClasses = selectedClasses.filter(c => c !== cls);
      } else {
        selectedClasses.push(cls);
      }
      renderClassChips();
      populateReferenceList();
    };
    chipContainer.appendChild(chip);
  });
}

function populateFilterOptions() {
  // Populate school filter
  const schoolSel = document.getElementById('filter-school');
  // Remove all except first option
  while (schoolSel.options.length > 1) schoolSel.remove(1);
  getUnique(spells, 'school').sort().forEach(school => {
    const opt = document.createElement('option');
    opt.value = school;
    opt.textContent = school.charAt(0).toUpperCase() + school.slice(1);
    schoolSel.appendChild(opt);
  });

  // Populate level filter
  const levelSel = document.getElementById('filter-level');
  // Remove all except first option
  while (levelSel.options.length > 1) levelSel.remove(1);
  getUnique(spells, 'level').sort((a, b) => a - b).forEach(level => {
    const opt = document.createElement('option');
    opt.value = level;
    opt.textContent = (level === 0 ? 'Cantrip' : level);
    levelSel.appendChild(opt);
  });
}

function getFilteredSpells() {
  const school = document.getElementById('filter-school').value;
  const level = document.getElementById('filter-level').value;
  const duration = document.getElementById('filter-duration').value;
  const range = document.getElementById('filter-range').value;
  // New: check if any component is selected
  const filterV = selectedComponents.V;
  const filterS = selectedComponents.S;
  const filterM = selectedComponents.M;

  return spells.filter(s => {
    let ok = true;
    if (school && s.school !== school) ok = false;
    if (level && String(s.level) !== String(level)) ok = false;
    if (selectedClasses.length && (!s.classes || !selectedClasses.some(cls => s.classes.includes(cls)))) ok = false;
    if (duration) {
      if (duration === 'instant' && s.duration_s >= 1) ok = false;
      if (duration === 'round' && !(s.duration_s > 0 && s.duration_s <= 6)) ok = false;
      if (duration === 'minute' && !(s.duration_s >= 60 && s.duration_s < 3600)) ok = false;
      if (duration === 'hour' && s.duration_s < 3600) ok = false;
      if (duration === 'special' && !(!s.duration_s || s.duration_s === 0)) ok = false;
    }
    if (range) {
      const rstr = (s.range || '').toLowerCase();
      if (range === 'self' && !rstr.includes('self')) ok = false;
      else if (range === 'touch' && !rstr.includes('touch')) ok = false;
      else if (range === 'short' && !(s.range_ft >= 1 && s.range_ft <= 30)) ok = false;
      else if (range === 'medium' && !(s.range_ft >= 31 && s.range_ft <= 120)) ok = false;
      else if (range === 'long' && !(s.range_ft > 120)) ok = false;
      else if (range === 'special' && (s.range_ft > 0 || rstr.includes('self') || rstr.includes('touch'))) ok = false;
    }
    // New: filter by components
    if (filterV && !s.components.verbal) ok = false;
    if (filterS && !s.components.somatic) ok = false;
    if (filterM && !s.components.material) ok = false;
    return ok;
  });
}

function populateReferenceList() {
  const ul = document.getElementById('all-spells');
  ul.innerHTML = '';
  getFilteredSpells().forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${s.name}</strong> <span style="color:#aaa;font-size:0.9em;">(Level ${s.level === 0 ? 'Cantrip' : s.level}, ${s.school})</span>`;
    li.style.cursor = 'pointer';
    li.onclick = () => showSpellDetail(s);
    ul.appendChild(li);
  });
}

function setupFilterEvents() {
  ['filter-school','filter-level','filter-duration','filter-range'].forEach(id => {
    document.getElementById(id).addEventListener('change', populateReferenceList);
  });
}

function showSpellDetail(spell) {
  const popup = document.getElementById('popup');
  popup.innerHTML = `
    <div class="popup-content" tabindex="0">
      <button class="popup-close" aria-label="Close" onclick="document.getElementById('popup').style.display='none'">&times;</button>
      <h2>${spell.name}</h2>
      <div><b>Level:</b> ${spell.level === 0 ? 'Cantrip' : spell.level}</div>
      <div><b>School:</b> ${spell.school}</div>
      <div><b>Range:</b> ${spell.range_ft ? spell.range_ft + ' ft' : (spell.range || '-')}</div>
      <div><b>Duration:</b> ${spell.duration_s ? formatDuration(spell.duration_s) : (spell.duration || '-')}</div>
      <div><b>Components:</b> ${Object.entries(spell.components).filter(([k,v])=>v===true).map(([k])=>k).join(', ')}</div>
      <div><b>Material:</b> ${spell.material || '-'}</div>
      <div style="margin-top:8px;"><b>Description:</b><br>${spell.description || ''}</div>
    </div>
  `;
  popup.style.display = 'flex';

  // Close on click outside content
  popup.onclick = function(e) {
    if (e.target === popup) popup.style.display = 'none';
  };
  // Close on ESC
  document.onkeydown = function(e) {
    if (e.key === "Escape") popup.style.display = 'none';
  };
}

function formatDuration(s) {
  if (!s) return '-';
  if (s < 1) return 'Instant';
  if (s % 3600 === 0) return (s/3600) + ' hr';
  if (s % 60 === 0) return (s/60) + ' min';
  return s + ' sec';
}

// Delay until spells[] exists
const initReference = () => {
  if (spells && spells.length) {
    populateFilterOptions();
    setupFilterEvents();
    populateReferenceList();
    renderClassChips();
    setupComponentFilter(); // <-- add this line
  } else {
    setTimeout(initReference, 100);
  }
};
initReference();

let selectedComponents = { V: false, S: false, M: false };

function setupComponentFilter() {
  const chips = document.querySelectorAll('#filter-components .comp-chip-toggle');
  chips.forEach(chip => {
    chip.onclick = () => {
      const comp = chip.getAttribute('data-comp');
      selectedComponents[comp] = !selectedComponents[comp];
      chip.classList.toggle('selected', selectedComponents[comp]);
      populateReferenceList();
    };
  });
}
