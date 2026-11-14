import {Threshold} from 'parabol-client/types/constEnums'
import type {MeetingTypeEnum} from '../../../../postgres/types/Meeting'

const promptTemplateRules = {
  retrospective: {
    defaultTemplateId: 'workingStuckTemplate',
    mainCategory: 'retrospective',
    illustrationUrl: '/assets/Organization/aGhostOrg/template/gladSadMadTemplate.png',
    maxPrompts: Threshold.MAX_REFLECTION_PROMPTS,
    freeTemplatesColumn: 'freeCustomRetroTemplatesRemaining'
  },
  teamPrompt: {
    defaultTemplateId: 'enterpriseDailyStandupTemplate',
    mainCategory: 'standup',
    illustrationUrl: '/assets/Organization/aGhostOrg/template/teamPrompt.png',
    maxPrompts: Threshold.MAX_STANDUP_PROMPTS,
    freeTemplatesColumn: 'freeCustomStandupTemplatesRemaining'
  }
} as const

export type PromptTemplateType = keyof typeof promptTemplateRules

export const isPromptTemplateType = (type: MeetingTypeEnum): type is PromptTemplateType =>
  type in promptTemplateRules

export default promptTemplateRules
