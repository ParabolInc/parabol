import {RETRO_PHASE_ITEM} from 'universal/utils/constants'
import shortid from 'shortid'

exports.up = async (r) => {
  try {
    await Promise.all([r.tableCreate('ReflectTemplate')])
  } catch (e) {}
  try {
    await Promise.all([
      r.table('ReflectTemplate').indexCreate('teamId'),
      r.table('CustomPhaseItem').indexCreate('teamId')
    ])
  } catch (e) {}

  const now = new Date()
  const makeTemplate = (name, teamId) => ({
    id: shortid.generate(),
    createdAt: now,
    isActive: true,
    name,
    teamId,
    updatedAt: now
  })

  const templateNames = [
    'Working & Stuck',
    'Glad, Sad, Mad',
    'Liked, Learned, Lacked, Longed for',
    'Start Stop Continue',
    'Sailboat'
  ]

  const gladSadMadPrompts = ['Glad', 'Sad', 'Mad']
  const fourLsPrompts = ['Liked', 'Learned', 'Lacked', 'Longed for']
  const startStopContPrompts = ['Start', 'Stop', 'Continue']
  const sailboatPrompts = ['Wind in the sails', 'Anchors', 'Risks']

  const makePrompt = (teamId, templateId, question) => ({
    id: shortid.generate(),
    createdAt: now,
    phaseItemType: RETRO_PHASE_ITEM,
    isActive: true,
    teamId,
    updatedAt: now,
    templateId,
    question,
    title: question
  })

  try {
    // insert all templates
    const teamIds = await r.table('Team')('id')

    // make templates
    const templatesByTeamId = {}
    const templateInserts = []
    teamIds.forEach((teamId) => {
      templateInserts.push(...templatesByTeamId[teamId])
      templatesByTeamId[teamId] = templateNames.map((name) => makeTemplate(name, teamId))
    })
    await r.table('ReflectTemplate').insert(templateInserts)

    // put existing prompts into a template
    const retrosCreatedAtDate = new Date('02/12/2018')
    const updatedPhaseItemPromises = teamIds.map((teamId) => {
      return r
        .table('CustomPhaseItem')
        .getAll(teamId)
        .update({
          templateId: templatesByTeamId[teamId][0].id,
          createdAt: retrosCreatedAtDate,
          updatedAt: retrosCreatedAtDate
        })
    })
    await Promise.all(updatedPhaseItemPromises)

    // create new prompts
    const phaseItemInserts = []
    teamIds.forEach((teamId) => {
      // skip the existing working/stuck template
      const [, gladSadMad, fourL, startStopCont, sail] = templatesByTeamId[teamId]
      const glads = gladSadMadPrompts.map((question) => makePrompt(teamId, gladSadMad.id, question))
      const fourLs = fourLsPrompts.map((question) => makePrompt(teamId, fourL.id, question))
      const starts = startStopContPrompts.map((question) =>
        makePrompt(teamId, startStopCont.id, question)
      )
      const sailboats = sailboatPrompts.map((question) => makePrompt(teamId, sail.id, question))
      phaseItemInserts.push(...glads, ...fourLs, ...starts, ...sailboats)
    })
    await r.table('CustomPhaseItem').insert(phaseItemInserts)
  } catch (e) {}
}

exports.down = async (r) => {
  try {
    await Promise.all([r.tableDrop('ReflectTemplate')])
  } catch (e) {}
  try {
    const retrosCreatedAtDate = new Date('02/12/2018')
    await r
      .table('CustomPhaseItem')
      .filter((row) => row('createdAt').ne(retrosCreatedAtDate))
      .delete()
    await r
      .table('CustomPhaseItem')
      .replace((r) => r.row.without('createdAt', 'updatedAt', 'templateId'))
  } catch (e) {}
}
