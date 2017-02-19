import {mintTokenSigned} from './mintToken';
import userMutation from '../../graphql/models/User/userMutation';

export default function (leader) {
  describe('signup team leader', () => {
    test('with mocked auth0 token', async() => {
      const auth0Token = mintTokenSigned(leader.id);
      const {resolve} = userMutation.updateUserWithAuthToken;
      const result = await resolve({}, {auth0Token, isUnitTest: true});
      expect(result.id).toBe(leader.id);
      expect(result.email).toBe(leader.auth0UserInfo.email);
    });
  });
}
