import ReflectTemplate from '../../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../../database/types/RetrospectivePrompt'

const templateBase = {
  'Working & Stuck': [
    {
      description: 'What’s helping us make progress toward our goals?',
      question: 'What’s working?',
      title: 'Positive'
    },
    {
      description: 'What’s blocking us from achieving our goals?',
      question: 'Where did you get stuck?',
      title: 'Negative'
    }
  ],
  'Glad, Sad, Mad': [
    {description: 'What are you happy about?', question: 'Glad'},
    {description: 'What could be improved?', question: 'Sad'},
    {description: 'What are you angry or disappointed about?', question: 'Mad'}
  ],
  'Liked, Learned, Lacked, Longed for': [
    {description: 'What went well?', question: 'Liked'},
    {description: 'What did you learn?', question: 'Learned'},
    {description: 'What was missing?', question: 'Lacked'},
    {description: 'What did you want to happen?', question: 'Longed for'}
  ],
  'Start Stop Continue': [
    {description: 'What new behaviors should we adopt?', question: 'Start'},
    {description: 'What existing behaviors should we cease doing?', question: 'Stop'},
    {description: 'What current behaviors should we keep doing?', question: 'Continue'}
  ],
  Sailboat: [
    {description: 'What’s helping the team reach its goals?', question: 'Wind in the sails'},
    {description: 'What’s slowing the team down in your journey?', question: 'Anchors'},
    {description: 'What risks may the team encounter ahead?', question: 'Risks'}
  ]
} as TemplateObject

interface TemplatePrompt {
  description: string
  question: string
  title?: string
}

interface TemplateObject {
  [templateName: string]: TemplatePrompt[]
}

const makeRetroTemplates = (teamId: string, templateObj = templateBase) => {
  const phaseItems: RetrospectivePrompt[] = []
  const templates: ReflectTemplate[] = []
  const templateNames = Object.keys(templateObj)
  templateNames.forEach((templateName) => {
    const promptBase = templateObj[templateName]
    const template = new ReflectTemplate({name: templateName, teamId})

    const prompts = promptBase.map(
      (prompt, idx) =>
        new RetrospectivePrompt({
          teamId,
          templateId: template.id,
          sortOrder: idx,
          question: prompt.question,
          description: prompt.description,
          title: prompt.title
        })
    )
    templates.push(template)
    phaseItems.push(...prompts)
  })
  return {phaseItems, templates}
}

export default makeRetroTemplates
