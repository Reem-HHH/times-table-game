// select.js
// Renders the "Select Table" screen where the student picks a times table (0–10).

import { State, AppAPI } from '../core/app.js';

export function renderSelect() {
  // Grab the main container
  const main = document.getElementById('main');

  // Build the grid of number tiles (×0 through ×10)
  let tiles = '';
  for (let i = 0; i <= 10; i++) {
    tiles += `
      <button class="tile" data-n="${i}">
        ×${i}
      </button>`;
  }

  // Render screen markup
  main.innerHTML = `
    <section class="screen">
      <div class="hero">
        <h1>Pick a times table</h1>
        <p>
          ${State.player ? `Ready, ${State.player}?` : 'Choose any number 0–10.'}
        </p>
      </div>
      <div class="tiles">${tiles}</div>
    </section>
  `;

  /**
   * Add click listeners to each tile
   * - Reads the chosen number
   * - Sets up a new session in global State
   * - Navigates to the Game screen
   */
  document.querySelectorAll('.tile').forEach((btn) => {
    btn.onclick = () => {
      const n = Number(btn.getAttribute('data-n'));
      State.session = {
        table: n,       // chosen table number
        total: 10,      // total questions
        asked: 0,       // questions asked so far
        correct: 0,     // correct answers
        start: 0,       // timer start (set later)
        time: 0,        // elapsed time
        showSkip: false // skip-count hint initially hidden
      };
      AppAPI.setScreen('game');
    };
  });
}
