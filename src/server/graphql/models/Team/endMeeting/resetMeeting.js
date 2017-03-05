import getRethink from 'server/database/rethinkDriver';
import {DONE, LOBBY} from 'universal/utils/constants';

export default async function resetMeeting(teamId) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const r = getRethink();
      await r.table('Team').get(teamId)
        .update({
          facilitatorPhase: LOBBY,
          meetingPhase: LOBBY,
          meetingId: null,
          facilitatorPhaseItem: null,
          meetingPhaseItem: null,
          activeFacilitator: null
        })
        .do(() => {
          // flag agenda items as inactive (more or less deleted)
          return r.table('AgendaItem').getAll(teamId, {index: 'teamId'})
            .update({
              isActive: false
            });
        })
        .do(() => {
          // archive projects that are DONE
          return r.table('Project').getAll(teamId, {index: 'teamId'})
            .filter({status: DONE})
            .update({
              isArchived: true
            });
        })
        .do(() => {
          // shuffle the teamMember check in order, uncheck them in
          return r.table('TeamMember')
            .getAll(teamId, {index: 'teamId'})
            .sample(100000)
            .coerceTo('array')
            .do((arr) => arr.forEach((doc) => {
              return r.table('TeamMember').get(doc('id'))
                  .update({
                    checkInOrder: arr.offsetsOf(doc).nth(0),
                    isCheckedIn: null
                  });
            })
            );
        });
      resolve();
    }, 5000);
  });
}
