import { google } from 'googleapis';
import { ENV } from '@/config/env';

/**
 * Service Account client — used for reading files (proxy/view).
 * Service accounts cannot upload to "My Drive" due to quota limitations.
 */
export function getDriveClient() {
  if (!ENV.GOOGLE.SERVICE_ACCOUNT_BASE64) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_BASE64 is not set in the environment.');
  }

  const credentials = JSON.parse(
    Buffer.from(ENV.GOOGLE.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * OAuth2 client using the user's refresh token — used for UPLOADING files.
 * Files will be owned by the user (uses user's Drive quota).
 * Requires GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN in .env
 */
export function getDriveClientOAuth() {
  const { OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN } = ENV.GOOGLE;

  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET || !OAUTH_REFRESH_TOKEN) {
    throw new Error(
      'Missing OAuth credentials. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN in .env'
    );
  }

  const oauth2Client = new google.auth.OAuth2(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET);
  oauth2Client.setCredentials({ refresh_token: OAUTH_REFRESH_TOKEN });

  return google.drive({ version: 'v3', auth: oauth2Client });
}
