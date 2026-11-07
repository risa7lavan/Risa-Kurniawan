// Ensure window.fetch is writable if an external extension attempts assignment
try {
  const _orig = window.fetch;
  let _curr = typeof _orig === 'function' ? _orig.bind(window) : _orig;
  Object.defineProperty(window, 'fetch', {
    configurable: true,
    enumerable: true,
    get: () => _curr,
    set: (v) => { _curr = v; }
  });
} catch (_) {}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
