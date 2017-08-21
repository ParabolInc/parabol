import getRethink from 'server/database/rethinkDriver';
import {DONE, LOBBY} from 'universal/utils/constants';
import archiveProjectsForDB from 'server/safeMutations/archiveProjectsForDB';

export default async function resetMeeting(teamId) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const r = getRethink();
      const projects = await r.table('Project').getAll(teamId, {index: 'teamId'})
        .filter({status: DONE})
        .filter((project) => project('tags').contains('archived').not())
        .pluck('id', 'content', 'tags');

      // TODO capture archived projects & push the list to pubsub when we move to evented subs for projects
      await archiveProjectsForDB(projects);
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
