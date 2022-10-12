import {R} from 'rethinkdb-ts'

export const up = async function (r: R) {
  const now = new Date()
  const missingKeepPrompt = {
    createdAt: now,
    description: 'What should we continue doing?',
    groupColor: '#D9D916',
    id: 'keepPrompt',
    isActive: true,
    question: 'Keep',
    sortOrder: 2,
    teamId: 'aGhostTeam',
    templateId: 'dropAddKeepImproveDAKITemplate',
    title: 'Keep',
    updatedAt: now
  }
  await r.db('actionDevelopment').table('ReflectPrompt').insert(missingKeepPrompt).run()
}

export const down = async function (r: R) {
  await r.db('actionDevelopment').table('ReflectPrompt').get('keepPrompt').delete().run()
}
