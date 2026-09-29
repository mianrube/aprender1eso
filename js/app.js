// Instancias únicas de la app: progreso persistente (store) y estado de interfaz en memoria (ui).
import { createStore } from './store.js';
import { createUiState } from './ui/state.js';

export const store = createStore();
export const ui = createUiState();

export const navigate = path => { location.hash = `#${path}`; };
