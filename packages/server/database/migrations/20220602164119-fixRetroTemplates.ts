import {
  down as faultyDown,
  reflectPrompts,
  templates,
  up as faultyUp
} from './20220124600507-addMoreRetroTemplates'

const fixedReflectPrompts = reflectPrompts.map((prompt) => ({
  ...prompt,
  id: `${prompt.templateId}:${prompt.id}`
}))

export const up = async function (r) {
  try {
    await faultyDown(r)
    await Promise.all([
      r.table('MeetingTemplate').insert(templates).run(),
      r.table('ReflectPrompt').insert(fixedReflectPrompts).run()
    ])
  } catch (e) {
    console.log(e)
  }
}

export const down = async function (r) {
  const templateIds = templates.map(({id}) => id)
  const promptIds = fixedReflectPrompts.map(({id}) => id)
  try {
    await Promise.all([
      r.table('MeetingTemplate').getAll(r.args(templateIds)).delete().run(),
      r.table('ReflectPrompt').getAll(r.args(promptIds)).delete().run()
    ])
    await faultyUp(r)
  } catch (e) {
    console.log(e)
  }
}
