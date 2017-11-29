import getRethink from 'server/database/rethinkDriver';
import {DONE, LOBBY} from 'universal/utils/constants';
import archiveTasksForDB from 'server/safeMutations/archiveTasksForDB';

export default async function resetMeeting(teamId) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const r = getRethink();
      const tasks = await r.table('Task').getAll(teamId, {index: 'teamId'})
        .filter({status: DONE})
        .filter((task) => task('tags').contains('archived').not())
        .pluck('id', 'content', 'tags');

      // TODO capture archived tasks & push the list to pubsub when we move to evented subs for tasks
      await archiveTasksForDB(tasks);
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
