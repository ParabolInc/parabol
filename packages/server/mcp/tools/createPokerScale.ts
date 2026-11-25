import palettePickerOptions from 'parabol-client/styles/palettePickerOptions'
import {Threshold} from 'parabol-client/types/constEnums'
import isSpecialPokerLabel from 'parabol-client/utils/isSpecialPokerLabel'
import {z} from 'zod'
import {validateScaleLabel} from '../../graphql/mutations/helpers/validateScaleValue'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import runTemplateStep, {TemplateStepFailedError} from '../runTemplateStep'
import {writeAnnotations} from '../toolAnnotations'
import toolResult from '../toolResult'

const SPECIAL_CARD_COUNT = 2

const ADD_POKER_TEMPLATE_SCALE = `
  mutation AddPokerTemplateScale($teamId: ID!) {
    addPokerTemplateScale(teamId: $teamId) {
      scale {
        id
      }
    }
  }
`

const RENAME_POKER_TEMPLATE_SCALE = `
  mutation RenamePokerTemplateScale($scaleId: ID!, $name: String!) {
    renamePokerTemplateScale(scaleId: $scaleId, name: $name) {
      __typename
    }
  }
`

const ADD_SCALE_VALUE = `
  mutation AddPokerTemplateScaleValue($scaleId: ID!, $scaleValue: AddTemplateScaleInput!) {
    addPokerTemplateScaleValue(scaleId: $scaleId, scaleValue: $scaleValue) {
      __typename
    }
  }
`

const ADD_LAST_SCALE_VALUE = `
  mutation AddLastPokerTemplateScaleValue($scaleId: ID!, $scaleValue: AddTemplateScaleInput!) {
    addPokerTemplateScaleValue(scaleId: $scaleId, scaleValue: $scaleValue) {
      scale {
        id
        name
        values {
          label
          color
        }
      }
    }
  }
`

const REMOVE_POKER_TEMPLATE_SCALE = `
  mutation RemovePokerTemplateScale($scaleId: ID!) {
    removePokerTemplateScale(scaleId: $scaleId) {
      __typename
    }
  }
`

type SavedScale = {id: string; name: string; values: {label: string; color: string}[]}

export default defineTool({
  name: 'create_poker_scale',
  title: 'Create a poker scale',
  description: `Create a poker scale on a team: the cards people vote with on a dimension, such as 1, 2, 3, 5 or S, M, L. Give up to ${Threshold.MAX_POKER_SCALE_VALUES - SPECIAL_CARD_COUNT} labels in order, each 1 to ${Threshold.POKER_SCALE_VALUE_MAX_LENGTH} characters, and Parabol picks each card's color. Every scale also ends with ? and Pass cards, so leave those out. To vote with it, set it as a dimension's scale on one of the team's poker templates with updatePokerTemplateDimensionScale through graphql_mutate, then select that template with select_template before start_sprint_poker. It refuses a name another scale on the team has and a team that already has ${Threshold.MAX_POKER_TEMPLATE_SCALES} scales. If a step fails it removes the scale it made, and an error with unfinishedScaleId names one it couldn't remove: remove it with removePokerTemplateScale through graphql_mutate. Needs templates:write.`,
  inputSchema: z.object({
    teamId: z.string().describe('The team that owns the scale, from get_me'),
    name: z
      .string()
      .trim()
      .min(1)
      .max(50)
      .describe("The scale's name, which no other scale on the team may have"),
    values: z
      .array(
        z.object({
          label: z
            .string()
            .trim()
            .refine(
              validateScaleLabel,
              `A label is 1 to ${Threshold.POKER_SCALE_VALUE_MAX_LENGTH} characters`
            )
            .refine((label) => !isSpecialPokerLabel(label), 'Every scale has ? and Pass already')
            .describe('What the card says, such as 5 or XL')
        })
      )
      .min(1)
      .max(Threshold.MAX_POKER_SCALE_VALUES - SPECIAL_CARD_COUNT)
      .refine(
        (values) => new Set(values.map(({label}) => label)).size === values.length,
        'Each card needs its own label'
      )
      .describe('The cards, lowest first')
  }),
  annotations: writeAnnotations,
  run: async (context, {teamId, name, values}) => {
    const created = await runGraphQL<{addPokerTemplateScale: {scale: {id: string}}}>(
      context,
      ADD_POKER_TEMPLATE_SCALE,
      {teamId}
    )
    const scaleId = created.data?.addPokerTemplateScale.scale.id
    if (created.errors?.length || !scaleId) return toolResult(created)
    const scaleValues = values.map(({label}, idx) => ({
      label,
      color: palettePickerOptions[idx % palettePickerOptions.length]!.hex
    }))
    try {
      await runTemplateStep(context, RENAME_POKER_TEMPLATE_SCALE, {scaleId, name})
      for (const scaleValue of scaleValues.slice(0, -1)) {
        await runTemplateStep(context, ADD_SCALE_VALUE, {scaleId, scaleValue})
      }
      const added = await runTemplateStep<{addPokerTemplateScaleValue: {scale: SavedScale}}>(
        context,
        ADD_LAST_SCALE_VALUE,
        {scaleId, scaleValue: scaleValues.at(-1)}
      )
      return toolResult({data: {scale: added.addPokerTemplateScaleValue.scale}})
    } catch (error) {
      const removed = await runGraphQL(context, REMOVE_POKER_TEMPLATE_SCALE, {scaleId})
      if (!(error instanceof TemplateStepFailedError)) throw error
      return toolResult(
        error.result,
        removed.errors?.length ? {unfinishedScaleId: scaleId} : undefined
      )
    }
  }
})
