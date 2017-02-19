import mintToken, {mintTokenSigned} from './mintToken';

import invitationMutation from '../../graphql/models/Invitation/invitationMutation';
import teamMemberMutation from '../../graphql/models/TeamMember/teamMemberMutation';
import teamMutation from '../../graphql/models/Team/teamMutation';
import userMutation from '../../graphql/models/User/userMutation';

export default function signupTeam(team, teamLeader, teamMembers, refreshAuthToken) {
  describe('signup team', () => {
    let authToken;
    beforeEach(async() => { authToken = await refreshAuthToken(); });

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
      .then((result) => expect(typeof result).toBe('string'))
      .catch((e) => console.log(`exception during test: ${e}`));
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
