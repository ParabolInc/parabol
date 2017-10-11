/**
 * Tests that users can sign in and sign out.
 */
import { newUser } from '../lib';

const behaviors = {
  goToHomepage: (driver) => () => driver.get('http://localhost:3000')
};

describe('Authentication', () => {
  it('can visit the homepage', async () => {
    const user = await newUser({ browser: 'chrome', behaviors });
    await user.goToHomepage();
    await user.quit();
  });

  it('shows an error when the email is not found');

  it('shows an error when the password is wrong');

  it('can log in with the correct credentials');

  it('can log out');
});
