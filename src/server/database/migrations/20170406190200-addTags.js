exports.up = async(r) => {
  const mutations = [
    r.table('Action'),
    r.table('Project').replace((project) => {
      return r.branch(
        project('isArchived'),
        project.merge({
          tags: ['archived']
        }).without('isArchived'),
        project.merge({
          tags: []
        }).without('isArchived')
      )
    })
  ];
  const [actions] = await Promise.all(mutations);
  const newProjects = actions.map((action, idx) => ({
    id: action.id,
    agendaId: action.agendaId,
    content: action.content,
    createdAt: action.createdAt,
    isArchived: false,
    sortOrder: idx, // meh, so they have to resort, oh well
    status: 'active',
    tags: ['private'],
    teamId: action.teamMemberId.split('::')[1],
    teamMemberId: action.teamMemberId,
    updatedAt: action.updatedAt,
  }));

  await r.table('Project').insert(newProjects);

  try {
    await r.tableDrop('Action');
  } catch (e) {
    //
  }

  const indices = [
    r.table('Project').indexCreate('tags', {multi: true}),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }

  const waitIndices = [
    r.table('Project').indexWait('tags'),
  ];
  await Promise.all(waitIndices);
};

exports.down = async(r) => {
  const tables = [
    r.tableCreate('Action')
  ];
  try {
    await Promise.all(tables);
  } catch (e) {
    //
  }
  const projectsToConvert = await r.table('Project').getAll('private', {index: 'tags'});
  const actions = projectsToConvert.map((project, idx) => ({
    id: project.id,
    content: project.content,
    userId: project.userId,
    teamMemberId: project.teamMemberId,
    isComplete: false,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    sortOrder: idx,
    agendaId: project.agendaId
  }));

  await r.table('Action').insert(actions);

  const mutations = [
    r.table('Project').getAll('archived', {index: 'tags'}).update({
      isArchived: true
    }),
  ];

  await Promise.all(mutations);

  const indices = [
    r.table('Project').indexDrop('tags'),
  ];
  try {
    await Promise.all(indices);
  } catch (e) {
    // ignore
  }
  await r.table('Project').replace(r.row.without('tags'));
};
