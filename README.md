# Spelldle-5e
Guessing 5e Spells Web-game.

# Spelldle 5e

A Wordle-inspired guessing game for D&D 5e spells.  
Guess the secret spell in up to 10 tries using clues about school, level, range, duration, components, and class.

---

## Features

- **Wordle-style gameplay**: Guess the secret spell by name.
- **Feedback for each guess**: See if your guess matches the secret spell's properties (school, level, range, duration, components, class).
- **Component filter**: Filter the spell reference list by V/S/M components using toggle chips.
- **Spell reference**: Browse and filter all spells by school, level, range, class, and components.
- **Spell detail popup**: Click any spell in the reference to see its full details in a modal.
- **Modern dark UI**: Clean, responsive, and accessible design.

---

## How to Play

1. Type a spell name in the input and click **Guess** (or press Enter).
2. The board will show how your guess compares to the secret spell:
   - 🟩 = exact match
   - 🟦 = too high
   - 🟧 = too low
   - 🟥 = wrong
   - Components show green (correct) or gray (incorrect) for V/S/M.
3. You have 10 tries to guess the spell.
4. Use the **All Spells** reference below to browse/filter spells and see their details.

---

## Filters

- **School, Level, Range**: Use dropdowns to filter the spell list.
- **Components**: Click V, S, or M to filter spells that require those components.
- **Class**: Click class chips to filter by class.

---

## Development

### Project Structure

```
d:\Spells wordle game\
├── index.html
├── style.css
├── script.js
├── reference.js
└── data\
    └── spells-srd.json
```

### Main Files

- `index.html` — Main HTML structure.
- `style.css` — All styles, including board, popups, and filters.
- `script.js` — Game logic and board rendering.
- `reference.js` — Spell reference, filters, and popup logic.
- `data/spells-srd.json` — Spell data (SRD).

---

## Customization

- **Add more spells**: Edit `data/spells-srd.json`.
- **Change max tries**: Edit `MAX_TRIES` in `script.js`.
- **Change UI colors**: Edit `style.css`.

---

## Credits

- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html)
- Spell data: D&D 5e SRD

---

## License

MIT License (see LICENSE file if present)
