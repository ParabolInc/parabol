import {verify} from 'jsonwebtoken';

import {
  auth0AuthenticationClient,
  auth0ManagementClient,
  clientSecret as auth0ClientSecret
} from '../../utils/auth0Helpers';

export function mockAuth0AuthenticationClientTokensGetInfo(teamMembers) {
  auth0AuthenticationClient.tokens.getInfo = jest.fn((auth0Token) => {
    const authToken = verify(auth0Token, Buffer.from(auth0ClientSecret, 'base64'));
    const match = teamMembers.find((teamMember) =>
      teamMember.id === authToken.sub);
    if (match) {
      return match.auth0UserInfo;
    }
    throw new Error(
      `auth0Client.tokens.getInfo (mock): unknown id ${authToken.sub}`
    );
  });
}

export function mockAuth0ManagementClientUsersUpdateAppMetadata() {
  auth0ManagementClient.users.updateAppMetadata = jest.fn(() => true);
}
