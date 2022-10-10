import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV3'

const taskStatusColors = {
  done: PALETTE.GRAPE_600,
  active: PALETTE.JADE_400,
  stuck: PALETTE.TOMATO_500,
  future: PALETTE.AQUA_400,
  archived: PALETTE.SLATE_500,
  private: PALETTE.GOLD_300
} as const

const OutcomeCardStatusIndicator = styled('div')<{status: keyof typeof taskStatusColors}>(
  ({status}) => ({
    backgroundColor: taskStatusColors[status],
    borderRadius: 4,
    height: 4,
    marginRight: 4,
    width: 32
  })
)

export default OutcomeCardStatusIndicator
