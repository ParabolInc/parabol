import {reflectPrompts} from './20220124600507-addMoreRetroTemplates'

// fix promptId fields of existing reflections
const promptIdMapping = reflectPrompts
  // filter out prompts which were missing since the old id belongs to different template
  .filter(({id}) => !['keepPrompt', 'moreOfPrompt', 'lessOfPrompt'].includes(id))
  .map(({id, templateId}) => ({
    oldId: id,
    newId: `${templateId}:${id}`
  }))

// There is some prompt filtering happening based on template creation date
const newIds = reflectPrompts.map(({id, templateId}) => `${templateId}:${id}`)
const createdAt = new Date('2022-01-28')

export const up = async function (r) {
  await r.table('ReflectPrompt').getAll(r.args(newIds)).update({createdAt}).run()

  await r.table('RetroReflection').indexCreate('promptId').run()
  await r.table('RetroReflectionGroup').indexCreate('promptId').run()
  await r.table('RetroReflection').indexWait().run()
  await r.table('RetroReflectionGroup').indexWait().run()

  for (const {oldId, newId} of promptIdMapping) {
    await r({
      retroReflection: r
        .table('RetroReflection')
        .getAll(oldId, {index: 'promptId'})
        .update({promptId: newId}),
      retroReflectionGroup: r
        .table('RetroReflectionGroup')
        .getAll(oldId, {index: 'promptId'})
        .update({promptId: newId})
    }).run()
  }
}

export const down = async function (r) {
  for (const {oldId, newId} of promptIdMapping) {
    await r({
      retroReflection: r
        .table('RetroReflection')
        .getAll(newId, {index: 'promptId'})
        .update({promptId: oldId}),
      retroReflectionGroup: r
        .table('RetroReflectionGroup')
        .getAll(newId, {index: 'promptId'})
        .update({promptId: oldId})
    }).run()
  }
  await r.table('RetroReflection').indexDrop('promptId').run()
  await r.table('RetroReflectionGroup').indexDrop('promptId').run()
}
