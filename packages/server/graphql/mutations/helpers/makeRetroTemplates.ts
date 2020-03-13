import ReflectTemplate from '../../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../../database/types/RetrospectivePrompt'
import {TEMPLATE_PROMPT_COLORS} from '../../../../client/styles/prompt'

const templateBase = {
  'Working & Stuck': [
    {
      description: 'What’s helping us make progress toward our goals?',
      question: 'What’s working?',
      title: 'Positive',
      color: TEMPLATE_PROMPT_COLORS.RED
    },
    {
      description: 'What’s blocking us from achieving our goals?',
      question: 'Where did you get stuck?',
      title: 'Negative',
      color: TEMPLATE_PROMPT_COLORS.ORANGE
    }
  ],
  'Glad, Sad, Mad': [
    {description: 'What are you happy about?', question: 'Glad', color: TEMPLATE_PROMPT_COLORS.RED},
    {description: 'What could be improved?', question: 'Sad', color: TEMPLATE_PROMPT_COLORS.ORANGE},
    {
      description: 'What are you angry or disappointed about?',
      question: 'Mad',
      color: TEMPLATE_PROMPT_COLORS.YELLOW
    }
  ],
  'Liked, Learned, Lacked, Longed for': [
    {description: 'HEY What went well?', question: 'Liked', color: TEMPLATE_PROMPT_COLORS.RED},
    {description: 'What did you learn?', question: 'Learned', color: TEMPLATE_PROMPT_COLORS.ORANGE},
    {description: 'What was missing?', question: 'Lacked', color: TEMPLATE_PROMPT_COLORS.YELLOW},
    {
      description: 'What did you want to happen?',
      question: 'Longed for',
      color: TEMPLATE_PROMPT_COLORS.GREEN_LIGHT
    }
  ],
  'Start Stop Continue': [
    {
      description: 'What new behaviors should we adopt?',
      question: 'Start',
      color: TEMPLATE_PROMPT_COLORS.RED
    },
    {
      description: 'What existing behaviors should we cease doing?',
      question: 'Stop',
      color: TEMPLATE_PROMPT_COLORS.ORANGE
    },
    {
      description: 'What current behaviors should we keep doing?',
      question: 'Continue',
      color: TEMPLATE_PROMPT_COLORS.YELLOW
    }
  ],
  Sailboat: [
    {
      description: 'What’s helping the team reach its goals?',
      question: 'Wind in the sails',
      color: TEMPLATE_PROMPT_COLORS.RED
    },
    {
      description: 'What’s slowing the team down in your journey?',
      question: 'Anchors',
      color: TEMPLATE_PROMPT_COLORS.ORANGE
    },
    {
      description: 'What risks may the team encounter ahead?',
      question: 'Risks',
      color: TEMPLATE_PROMPT_COLORS.YELLOW
    }
  ]
} as TemplateObject

interface TemplatePrompt {
  description: string
  question: string
  title?: string
  color: string
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
          title: prompt.title,
          color: prompt.color
        })
    )
    templates.push(template)
    phaseItems.push(...prompts)
  })
  return {phaseItems, templates}
}

export default makeRetroTemplates
