type CrossOrigin = 'anonymous' | 'use-credentials' | ''

export interface CorsOptions {
  crossOrigin?: CrossOrigin
}

/**
 * In order to cache images in the service worker, CORS has to be enabled.
 * If CORS is disabled, service worker treats response as opaque and it's not possible to read response headers,
 * which makes it impossible to cache images.
 * More information here: https://stackoverflow.com/questions/39109789/what-limitations-apply-to-opaque-responses
 */
export const APP_CORS_OPTIONS: CorsOptions = {
  crossOrigin: 'anonymous'
}

/**
 * Using CORS in emails can cause issues with some email clients eg. images not showing in Apple Mail, let's disable it.
 */
export const EMAIL_CORS_OPTIONS: CorsOptions = {}
