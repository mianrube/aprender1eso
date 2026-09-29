import { store, ui, navigate } from '../app.js';
import { createSession } from '../engine/session.js';

// Empieza una sesión de reto (ids = repaso de fallos) y va a la pantalla de juego.
export function startSession({ type, level, ids = null }) {
  const session = createSession({ type, level, ids }, store.get());
  ui.set({ session, level });
  navigate('/europa/reto');
}

// Abandona la sesión sin marcarla como terminada; lo ya ganado se conserva.
export function leaveSession() {
  ui.set({ session: null });
  navigate('/europa');
}
