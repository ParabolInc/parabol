import mintToken, {mintTokenSigned} from './mintToken';

import invitationMutation from '../../graphql/models/Invitation/invitationMutation';
import userMutation from '../../graphql/models/User/userMutation';
import teamMemberMutation from '../../graphql/models/TeamMember/teamMemberMutation';
import teamMutation from '../../graphql/models/Team/teamMutation';

export default function signupTeam(team, teamLeader, teamMembers, refreshAuthToken) {
  describe('signup team', () => {
    let authToken;

    beforeEach(async() => { authToken = await refreshAuthToken(); });

    test('update user profile', async() => {
      const expectedName = 'Cpt. America';
      const {resolve} = userMutation.updateUserProfile;
      const updatedUser = {
        id: teamLeader.id,
        preferredName: expectedName
      };
      const result = await resolve({}, {updatedUser}, {authToken});
      expect(result.id).toBe(teamLeader.id);
      expect(result.preferredName).toBe(expectedName);
    });

    /*
     * We must wait for the work performed in setTimeout()
     * to complete, therefore this test must be a callback,
     * not a promise.
     */
    test('createFirstTeam', (done) => {
      const unitTestCb = () => {
        done();
      };
      const {resolve} = teamMutation.createFirstTeam;
      const newTeam = { ...team };
      resolve({}, {newTeam}, {authToken, unitTestCb})
      .then((result) => expect(typeof result).toBe('string'));
    });

    test('invite team members and accept invitations', (done) => {
      // Done as one test, because we need inviteeTokens to test
      // the acceptInvitation endpoint
      const unitTestCb = async(inviteesWithTokens) => {
        const {resolve: acceptInvitation} = teamMemberMutation.acceptInvitation;
        const exchange = { publish: jest.fn() };

        const acceptPromises = inviteesWithTokens.map(async(inviteeWithToken) => {
          const {email, inviteToken} = inviteeWithToken;
          const {id: userId} = teamMembers.find((member) =>
            member.auth0UserInfo.email === email);
          const auth0Token = mintTokenSigned(userId);
          const {resolve: updateUserWithAuthToken} = userMutation.updateUserWithAuthToken;
          await updateUserWithAuthToken({}, {auth0Token, isUnitTest: true});
          const userAuthToken = mintToken(userId);
          return acceptInvitation({}, {inviteToken}, {authToken: userAuthToken, exchange});
        });
        await Promise.all(acceptPromises);
        expect(exchange.publish.mock.calls.length).toBe(teamMembers.length);
        done();
      };
      const teamId = authToken.tms[0];
      const {resolve} = invitationMutation.inviteTeamMembers;
      const invitees = teamMembers.map(member => {
        const {auth0UserInfo: {email, name: fullName}} = member;
        return { email, fullName, task: '' };
      });
      resolve({}, {invitees, teamId}, {authToken, unitTestCb})
      .catch((e) => { throw new Error(`${e}`); });
    });
  });
}
