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

  await Promise.all(
    promptIdMapping.map(async ({oldId, newId}) => {
      await r({
        retroReflection: r
          .table('RetroReflection')
          .filter({promptId: oldId})
          .update({promptId: newId}),
        retroReflectionGroup: r
          .table('RetroReflectionGroup')
          .filter({promptId: oldId})
          .update({promptId: newId})
      }).run()
    })
  )
}

export const down = async function (r) {
  await Promise.all(
    promptIdMapping.map(async ({oldId, newId}) => {
      await r({
        retroReflection: r
          .table('RetroReflection')
          .filter({promptId: newId})
          .update({promptId: oldId}),
        retroReflectionGroup: r
          .table('RetroReflectionGroup')
          .filter({promptId: newId})
          .update({promptId: oldId})
      }).run()
    })
  )
}
