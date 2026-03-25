export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET || 'tu-clave-secreta-super-larga-cambiar-en-produccion',
  AULAS_URL: process.env.AULAS_URL || 'https://aulas.cpi.fi.uba.ar',
  IS_DEV: process.env.NODE_ENV === 'development',
} as const;

export type Env = typeof ENV;
