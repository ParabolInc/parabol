import {PALETTE} from '../../../../client/styles/paletteV2'
import ReflectTemplate from '../../../database/types/ReflectTemplate'
import RetrospectivePrompt from '../../../database/types/RetrospectivePrompt'

const templateBase = {
  'Working & Stuck': [
    {
      description: 'What’s helping us make progress toward our goals?',
      question: 'What’s working?',
      title: 'Positive',
      groupColor: PALETTE.PROMPT_GREEN
    },
    {
      description: 'What’s blocking us from achieving our goals?',
      question: 'Where did you get stuck?',
      title: 'Negative',
      groupColor: PALETTE.PROMPT_RED
    }
  ],
  'Glad, Sad, Mad': [
    {
      description: 'What are you happy about?',
      question: 'Glad',
      groupColor: PALETTE.PROMPT_GREEN
    },
    {
      description: 'What could be improved?',
      question: 'Sad',
      groupColor: PALETTE.PROMPT_BLUE
    },
    {
      description: 'What are you angry or disappointed about?',
      question: 'Mad',
      groupColor: PALETTE.PROMPT_RED
    }
  ],
  'Liked, Learned, Lacked, Longed for': [
    {
      description: 'What went well?',
      question: 'Liked',
      groupColor: PALETTE.PROMPT_GREEN
    },
    {
      description: 'What did you learn?',
      question: 'Learned',
      groupColor: PALETTE.PROMPT_BLUE
    },
    {
      description: 'What was missing?',
      question: 'Lacked',
      groupColor: PALETTE.PROMPT_ORANGE
    },
    {
      description: 'What did you want to happen?',
      question: 'Longed for',
      groupColor: PALETTE.PROMPT_VIOLET
    }
  ],
  'Start Stop Continue': [
    {
      description: 'What new behaviors should we adopt?',
      question: 'Start',
      groupColor: PALETTE.PROMPT_GREEN
    },
    {
      description: 'What existing behaviors should we cease doing?',
      question: 'Stop',
      groupColor: PALETTE.PROMPT_RED
    },
    {
      description: 'What current behaviors should we keep doing?',
      question: 'Continue',
      groupColor: PALETTE.PROMPT_BLUE
    }
  ],
  Sailboat: [
    {
      description: 'What’s helping the team reach its goals?',
      question: 'Wind in the sails',
      groupColor: PALETTE.PROMPT_GREEN
    },
    {
      description: 'What’s slowing the team down in your journey?',
      question: 'Anchors',
      groupColor: PALETTE.PROMPT_BLUE
    },
    {
      description: 'What risks may the team encounter ahead?',
      question: 'Risks',
      groupColor: PALETTE.PROMPT_RED
    }
  ]
} as TemplateObject

interface TemplatePrompt {
  description: string
  groupColor: string
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
          groupColor: prompt.groupColor,
          title: prompt.title
        })
    )
    templates.push(template)
    phaseItems.push(...prompts)
  })
  return {phaseItems, templates}
}

export default makeRetroTemplates
