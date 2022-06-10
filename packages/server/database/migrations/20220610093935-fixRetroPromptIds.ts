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

  const renames = Object.fromEntries(
    promptIdMapping.flatMap(({oldId, newId}) => {
      return [
        [
          `${oldId}-RetroReflection`,
          r.table('RetroReflection').filter({promptId: oldId}).update({promptId: newId})
        ],
        [
          `${oldId}-RetroReflectionGroup`,
          r.table('RetroReflectionGroup').filter({promptId: oldId}).update({promptId: newId})
        ]
      ]
    })
  )
  await r(renames).run()
}

export const down = async function (r) {
  const renames = Object.fromEntries(
    promptIdMapping.flatMap(({oldId, newId}) => {
      return [
        [
          `${oldId}-RetroReflection`,
          r.table('RetroReflection').filter({promptId: newId}).update({promptId: oldId})
        ],
        [
          `${oldId}-RetroReflectionGroup`,
          r.table('RetroReflectionGroup').filter({promptId: newId}).update({promptId: oldId})
        ]
      ]
    })
  )
  await r(renames).run()
}
