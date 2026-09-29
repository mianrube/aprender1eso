export const KEY = 'rumbo-ue-v1';

export function defaults() {
  return { points: 0, streak: 0, lastDay: null, m: {}, badges: [], types: [] };
}

// Almacenamiento en memoria con la misma interfaz que localStorage.
export function memoryStorage() {
  const map = new Map();
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: k => void map.delete(k),
  };
}

// localStorage puede no existir o lanzar (modo privado, bloqueado): entonces, memoria.
export function browserStorage() {
  try {
    const s = globalThis.localStorage;
    s.setItem('__rumbo_probe__', '1');
    s.removeItem('__rumbo_probe__');
    return s;
  } catch {
    return memoryStorage();
  }
}

function parse(raw) {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

export function createStore(storage = browserStorage()) {
  const listeners = new Set();
  const memory = memoryStorage();
  let backend = storage;

  // Si el backend lanza, se pasa a memoria durante el resto de la sesión.
  const run = fn => {
    try {
      return fn(backend);
    } catch {
      backend = memory;
      return fn(backend);
    }
  };

  const raw = run(s => s.getItem(KEY));
  let state = { ...defaults(), ...(raw ? parse(raw) : {}) };

  const emit = () => listeners.forEach(fn => fn(state));

  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      run(s => s.setItem(KEY, JSON.stringify(state)));
      emit();
    },
    reset() {
      run(s => s.removeItem(KEY));
      state = defaults();
      emit();
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
