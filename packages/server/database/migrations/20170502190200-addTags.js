exports.up = async (r) => {
  const mutations = [
    r.table('Action').run(),
    r
      .table('Project')
      .replace((project) => {
        return r.branch(
          project('isArchived')
            .eq(true)
            .default(false),
          project
            .merge({
              tags: ['#archived']
            })
            .without('isArchived'),
          project
            .merge({
              tags: []
            })
            .without('isArchived')
        )
      })
      .run()
  ]
  const [actions] = await Promise.all(mutations)
  const newProjects = actions.map((action, idx) => {
    const tags = ['#private']
    const isArchived = action.isComplete || false
    if (isArchived) {
      tags.push('#archived')
    }
    return {
      id: action.id,
      agendaId: action.agendaId,
      content: action.content,
      createdAt: action.createdAt,
      isArchived,
      sortOrder: idx, // meh, so they have to resort, oh well
      status: 'active',
      tags,
      teamId: action.teamMemberId.split('::')[1],
      teamMemberId: action.teamMemberId,
      updatedAt: action.updatedAt
    }
  })

  await r
    .table('Project')
    .insert(newProjects)
    .run()

  try {
    await r.tableDrop('Action').run()
  } catch (e) {
    //
  }

  const indices = [
    r
      .table('Project')
      .indexCreate('tags', {multi: true})
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    // ignore
  }

  const waitIndices = [
    r
      .table('Project')
      .indexWait('tags')
      .run()
  ]
  await Promise.all(waitIndices)
}

exports.down = async (r) => {
  const tables = [r.tableCreate('Action').run()]
  try {
    await Promise.all(tables)
  } catch (e) {
    //
  }
  const projectsToConvert = await r
    .table('Project')
    .getAll('#private', {index: 'tags'})
    .run()
  const actions = projectsToConvert.map((project, idx) => ({
    id: project.id,
    content: project.content,
    userId: project.userId,
    teamMemberId: project.teamMemberId,
    isComplete: project.tags.includes('#archived'),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    sortOrder: idx,
    agendaId: project.agendaId
  }))

  await r
    .table('Action')
    .insert(actions)
    .run()

  const mutations = [
    r
      .table('Project')
      .update((project) => ({
        isArchived: r.branch(project('tags').contains('#archived'), true, false)
      }))
      .run()
  ]

  await Promise.all(mutations)

  const indices = [
    r
      .table('Project')
      .indexDrop('tags')
      .run(),
    r
      .table('Action')
      .indexCreate('userId')
      .run(),
    r
      .table('Action')
      .indexCreate('teamMemberId')
      .run(),
    r
      .table('Action')
      .indexCreate('agendaId')
      .run()
  ]
  try {
    await Promise.all(indices)
  } catch (e) {
    // ignore
  }
  await r
    .table('Project')
    .replace(r.row.without('tags'))
    .run()
}
