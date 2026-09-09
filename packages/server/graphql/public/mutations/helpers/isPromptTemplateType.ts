import type {MeetingTypeEnum} from '../../../../postgres/types/Meeting'

const PROMPT_TEMPLATE_TYPES = ['retrospective', 'teamPrompt'] as const

export type PromptTemplateType = (typeof PROMPT_TEMPLATE_TYPES)[number]

export const isPromptTemplateType = (type: MeetingTypeEnum): type is PromptTemplateType =>
  (PROMPT_TEMPLATE_TYPES as readonly MeetingTypeEnum[]).includes(type)
