import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  const now = new Date()
  const missingLessOfPrompt = {
    createdAt: now,
    description: 'What are we over-doing or doing too much of?',
    groupColor: '#D9D916',
    id: 'starfishTemplate:lessOfPrompt',
    isActive: true,
    question: 'Less Of ➖',
    sortOrder: 1,
    teamId: 'aGhostTeam',
    templateId: 'starfishTemplate',
    title: 'Less Of ➖',
    updatedAt: now
  }
  const missingMoreOfPrompt = {
    createdAt: now,
    description: 'What are we not taking enough advantage of?',
    groupColor: '#45E5E5',
    id: 'starfishTemplate:moreOfPrompt',
    isActive: true,
    question: 'More Of ➕',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'starfishTemplate',
    title: 'More Of ➕',
    updatedAt: now
  }
  await r.table('ReflectPrompt').insert([missingLessOfPrompt, missingMoreOfPrompt]).run()
}

export const down = async function (r: R) {
  await r
    .table('ReflectPrompt')
    .getAll(r.args(['starfishTemplate:lessOfPrompt', 'starfishTemplate:moreOfPrompt']))
    .delete()
    .run()
}
