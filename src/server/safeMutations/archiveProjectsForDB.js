import {convertFromRaw, convertToRaw} from 'draft-js';
import getRethink from 'server/database/rethinkDriver';
import addTagToProject from 'universal/utils/draftjs/addTagToProject';
import getTagsFromEntityMap from 'universal/utils/draftjs/getTagsFromEntityMap';
import {primeStandardLoader} from 'server/utils/RethinkDataLoader';

const archiveProjectsForDB = async (projects, dataLoader) => {
  if (!projects || projects.length === 0) return [];
  const r = getRethink();
  const projectsToArchive = projects.map((project) => {
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
  const updatedProjects = await r(projectsToArchive).forEach((project) => {
    return r.table('Project')
      .get(project('id'))
      .update({
        content: project('content'),
        tags: project('tags')
      }, {returnChanges: true});
  })('changes')('new_val');

  if (dataLoader) {
    primeStandardLoader(dataLoader.get('projects'), updatedProjects);
  }
  return updatedProjects;
};

export default archiveProjectsForDB;
