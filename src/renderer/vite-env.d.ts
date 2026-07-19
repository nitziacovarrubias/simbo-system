/// <reference types="vite/client" />

import type { SimboApi } from '../shared/types';

declare global {
  interface Window {
    simboApi: SimboApi;
  }
}

export {};
