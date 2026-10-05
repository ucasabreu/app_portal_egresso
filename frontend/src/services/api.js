// Vite e Nginx encaminham /api para o backend no ambiente correspondente.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
