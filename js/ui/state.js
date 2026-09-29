// Estado de interfaz solo en memoria: nivel seleccionado y sesión de reto en curso.
// No se guarda en localStorage; al recargar se pierde (el progreso vive en el store).
export function createUiState(initial = {}) {
  let state = { level: 1, session: null, ...initial };
  const listeners = new Set();
  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      listeners.forEach(fn => fn(state));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
