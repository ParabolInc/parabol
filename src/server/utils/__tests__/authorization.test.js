import * as Authz from '../authorization';

import {PERSONAL, PRO, ENTERPRISE} from 'universal/utils/constants';

import MockDB from 'server/__tests__/setup/MockDB';

console.error = jest.fn();

describe('authorization', () => {
  describe('requireTeamCanUpdateCheckInQuestion', () => {
    it('throws an error when the team does not support updating the check-in question', async () => {
      expect.assertions(1);

      // SETUP
      const db = new MockDB();
      const {team: [newTeam]} = await db.newTeam({tier: PERSONAL});

      // TEST
      try {
        await Authz.requireTeamCanUpdateCheckInQuestion(newTeam.id);
      } catch (error) {
        expect(error.message).toMatch('Unauthorized');
      }
    });

    it('returns `true` when the team does support updating the check-in question', async () => {
      expect.assertions(2);

      // SETUP
      const db = new MockDB();
      const {team: [proTeam]} = await db.newTeam({tier: PRO});
      const {team: [enterpriseTeam]} = await db.newTeam({tier: ENTERPRISE});

      // TEST
      await Promise.all(
        [proTeam, enterpriseTeam].map(async (team) => {
          const canUpdateCheckInQuestion = await Authz.requireTeamCanUpdateCheckInQuestion(team.id);
          return expect(canUpdateCheckInQuestion).toBe(true);
        })
      );
    });
  });
});
