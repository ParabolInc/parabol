import {convertFromRaw, convertToRaw} from 'draft-js';
import getRethink from 'server/database/rethinkDriver';
import {DONE, LOBBY} from 'universal/utils/constants';
import addTagToProject from 'src/universal/utils/draftjs/addTagToProject';
import getTagsFromEntityMap from 'src/universal/utils/draftjs/getTagsFromEntityMap';

export default async function resetMeeting(teamId) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const r = getRethink();
      const projects = await r.table('Project').getAll(teamId, {index: 'teamId'})
        .filter({status: DONE})
        .filter((project) => project('tags').contains('archived').not())
        .pluck('id', 'content', 'tags')
      const archivedProjects = projects.map((project) => {
        const contentState = convertFromRaw(JSON.parse(project.content));
        const nextContentState = addTagToProject(contentState, '#archived');
        const raw = convertToRaw(nextContentState);
        const nextTags = getTagsFromEntityMap(raw.entityMap);
        const nextContentStr = JSON.stringify(raw);
        return {
          content: nextContentStr,
          tags: nextTags,
          id: project.id
        }
      });
      //const archivedProjectIds = projects.map((proj) => proj.id);

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
          return r.args(archivedProjects).forEach((project) => {
            return r.table('Project').update(project('id'), {
              content: project('content'),
              tags: project('tags')
            })
          })
        })
        .do(() => {
          // flag agenda items as inactive (more or less deleted)
          return r.table('AgendaItem').getAll(teamId, {index: 'teamId'})
            .update({
              isActive: false
            });
        })
        .do(() => {
          return r.table('')
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
