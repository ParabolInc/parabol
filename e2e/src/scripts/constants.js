import path from 'path';

// Note that 20 seconds is a reasonably long timeout.  I'm betting that
// tests will generally fail due to errors rather than timeouts.
export const MOCHA_TIMEOUT = 20000;
export const SERVER_TIMEOUT = 20000;

export const DRIVERS_DIR = path.join(process.cwd(), 'webdrivers');
