import {convertFromRaw, convertToRaw} from 'draft-js';
import getRethink from 'server/database/rethinkDriver';
import addTagToProject from 'universal/utils/draftjs/addTagToProject';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';

const archiveProjectsForDB = async (projects) => {
  const r = getRethink();
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
    };
  });
  await r.expr(archivedProjects).forEach((project) => {
    return r.table('Project')
      .get(project('id'))
      .update({
        content: project('content'),
        tags: project('tags')
      });
  });

  // return the ids of the archived projects
  return projects.map(({id}) => id);
};

export default archiveProjectsForDB;
