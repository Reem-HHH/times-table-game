// start.js
// Renders the Start screen where the student enters their name,
// then navigates to the "Select Table" screen.

import { State, AppAPI } from '../core/app.js';

export function renderStart() {
  // Grab the main container (all screens are injected here)
  const main = document.getElementById('main');

  // Build the Start screen UI
  // - Hero heading + short instruction
  // - Card with a name input and a big Start button
  main.innerHTML = `
    <section class="screen hero">
      <h1>Let’s practice multiplication!</h1>
      <p>Type your name to begin.</p>

      <div class="card start-card centered-card">
        <div class="card-body">
          <div class="grid" >
            <input
              class="input"
              id="nameInput"
              placeholder="👤 Your name"
              aria-label="Your name"
              autocomplete="off"
              maxlength="40"
            />
            <div class="start-actions">
              <button class="btn primary" id="startBtn" aria-label="Start the game">🚀 Start</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  // Focus the name field immediately so students can type right away
  const input = document.getElementById('nameInput');
  input && input.focus();

  /**
   * Proceed to the next screen:
   * - Save the player's name to global State (default to "Player")
   * - Switch to the Select Table screen
   */
  function go() {
    const name = (input?.value || '').trim();
    State.player = name || 'Player';
    AppAPI.setScreen('select');
  }

  // Start button click → go
  document.getElementById('startBtn').onclick = go;

  // Pressing Enter in the name field → go
  input.onkeydown = (e) => {
    if (e.key === 'Enter') go();
  };
}
