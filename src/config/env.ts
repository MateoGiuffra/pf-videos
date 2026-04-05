export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET || 'tu-clave-secreta-super-larga-cambiar-en-produccion',
  AULAS_URL: process.env.AULAS_URL || 'https://aulas.gobstones.org',
  IS_DEV: process.env.NODE_ENV === 'development',
  ADMIN_MOODLE_NAME: process.env.ADMIN_MOODLE_NAME || '',
  GOOGLE: {
    SERVICE_ACCOUNT_BASE64: process.env.GOOGLE_SERVICE_ACCOUNT_BASE64,
    DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
    OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    OAUTH_REFRESH_TOKEN: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  },
} as const;

export type Env = typeof ENV;
