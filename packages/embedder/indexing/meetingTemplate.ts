import type {DataLoaderInstance} from 'parabol-server/dataloader/RootDataLoader'
import type MeetingTemplate from '../../server/database/types/MeetingTemplate'
import isValid from '../../server/graphql/isValid'
import {inferLanguage} from '../inferLanguage'

const MIN_TEXT_LENGTH = 10
const MAX_TEAM_HEALTH_QUESTIONS = 6

const RETROSPECTIVE_DESCRIPTION = 'Retrospective meeting: the team reflects on recent work'
const RETROSPECTIVE_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  premortem: 'Pre-mortem retrospective: the team reflects together',
  postmortem: 'Post-mortem retrospective: the team reflects together',
  feedback: 'Feedback retrospective: the team reflects together',
  strategy: 'Strategy retrospective: the team reflects together'
}
const TEAM_PROMPT_DESCRIPTION = 'Standup: team members share async updates by answering prompts'
const ACTION_DESCRIPTION =
  'Check-in meeting: the team shares updates, reviews tasks, and agrees on action items'
const POKER_DESCRIPTION = 'Sprint Poker: the team estimates and scores backlog items'
const TEAM_HEALTH_DESCRIPTION =
  'Team Health check: an anonymous survey where the team rates statements about how it works'

const joinLabel = (label: string, detail: string | null | undefined) =>
  [label.trim(), detail?.trim()].filter(Boolean).join(': ')

const createText = (template: MeetingTemplate, description: string, lines: string[]) => {
  const body = [template.name, description, ...lines].join('\n')
  const language =
    inferLanguage([template.name, ...lines].join('\n'), MIN_TEXT_LENGTH) ??
    inferLanguage(body, MIN_TEXT_LENGTH)
  return {body, language}
}

const getPromptLines = async (templateId: string, dataLoader: DataLoaderInstance) => {
  const prompts = await dataLoader.get('templatePromptsByTemplateId').load(templateId)
  return prompts.map(({question, description}) => joinLabel(question, description))
}

const createTextFromRetrospectiveMeetingTemplate = async (
  template: MeetingTemplate,
  dataLoader: DataLoaderInstance
) => {
  const description =
    RETROSPECTIVE_CATEGORY_DESCRIPTIONS[template.mainCategory] ?? RETROSPECTIVE_DESCRIPTION
  return createText(template, description, await getPromptLines(template.id, dataLoader))
}

const createTextFromTeamPromptMeetingTemplate = async (
  template: MeetingTemplate,
  dataLoader: DataLoaderInstance
) => {
  return createText(
    template,
    TEAM_PROMPT_DESCRIPTION,
    await getPromptLines(template.id, dataLoader)
  )
}

const createTextFromPokerMeetingTemplate = async (
  template: MeetingTemplate,
  dataLoader: DataLoaderInstance
) => {
  const dimensions = await dataLoader.get('templateDimensionsByTemplateId').load(template.id)
  const lines = dimensions.map(({name, description}) => joinLabel(name, description))
  return createText(template, POKER_DESCRIPTION, lines)
}

const createTextFromTeamHealthMeetingTemplate = async (
  template: MeetingTemplate,
  dataLoader: DataLoaderInstance
) => {
  const links = await dataLoader.get('teamHealthTemplateQuestionsByTemplateId').load(template.id)
  const questions = (
    await dataLoader.get('teamHealthQuestions').loadMany(links.map(({questionId}) => questionId))
  ).filter(isValid)
  const categoryIds = [
    ...new Set(questions.map(({categoryId}) => categoryId).filter((id) => id !== null))
  ]
  const categoryNames = (await dataLoader.get('teamHealthCategories').loadMany(categoryIds))
    .filter(isValid)
    .map(({name}) => name)
  const statements = questions
    .slice(0, MAX_TEAM_HEALTH_QUESTIONS)
    .map(({question}) => question.trim())
  const lines = categoryNames.length
    ? [`Covers ${categoryNames.join(', ')}`, ...statements]
    : statements
  return createText(template, TEAM_HEALTH_DESCRIPTION, lines)
}

export const createTextFromMeetingTemplate = async (
  templateId: string,
  dataLoader: DataLoaderInstance
) => {
  const template = await dataLoader.get('meetingTemplates').load(templateId)
  switch (template?.type) {
    case 'retrospective':
      return createTextFromRetrospectiveMeetingTemplate(template, dataLoader)
    case 'teamPrompt':
      return createTextFromTeamPromptMeetingTemplate(template, dataLoader)
    case 'action':
      return createText(template, ACTION_DESCRIPTION, [])
    case 'poker':
      return createTextFromPokerMeetingTemplate(template, dataLoader)
    case 'teamHealth':
      return createTextFromTeamHealthMeetingTemplate(template, dataLoader)
    default:
      return {body: '', language: undefined}
  }
}
