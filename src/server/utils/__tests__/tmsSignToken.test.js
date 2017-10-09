import {decode} from 'jsonwebtoken';

import {AUTH0_AUD} from 'server/utils/auth0Helpers';
import tmsSignToken from '../tmsSignToken';

describe('tmsSignToken', () => {
  it('throws an error when no auth token is provided', () => {
    expect(() => tmsSignToken(undefined, []))
      .toThrow('Must provide valid auth token with `sub`');
  });

  it('throws an error when no `sub` field is provided', () => {
    expect(() => tmsSignToken({}, []))
      .toThrow('Must provide valid auth token with `sub`');
  });

  it('replaces the `tms` field with the provided value', () => {
    const token = {
      iss: 'https://some-other-site.com/',
      sub: '12345',
      name: 'daniel',
      tms: ['team1']
    };
    const newSignedToken = tmsSignToken(token, ['team1', 'team2']);
    const newToken = decode(newSignedToken);
    expect(newToken.iss).toEqual('http://localhost:3000/');
    expect(newToken.sub).toEqual('12345');
    expect(newToken.name).toEqual('daniel');
    expect(newToken.tms).toEqual(['team1', 'team2']);
    expect(newToken.aud).toEqual(AUTH0_AUD);
    expect(typeof newToken.iat).toBe('number');
    expect(typeof newToken.exp).toBe('number');
  });
});
