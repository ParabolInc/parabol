import styled from '@emotion/styled'
import {PALETTE} from '../../../../styles/paletteV2'
import {TaskStatus} from '../../../../types/constEnums'

const taskStatusColors = {
  [TaskStatus.DONE]: PALETTE.STATUS_DONE,
  [TaskStatus.ACTIVE]: PALETTE.STATUS_ACTIVE,
  [TaskStatus.STUCK]: PALETTE.STATUS_STUCK,
  [TaskStatus.FUTURE]: PALETTE.STATUS_FUTURE,
  [TaskStatus.ARCHIVED]: PALETTE.STATUS_ARCHIVED,
  [TaskStatus.PRIVATE]: PALETTE.STATUS_PRIVATE
}

const OutcomeCardStatusIndicator = styled('div')<{status: string}>(({status}) => ({
  backgroundColor: taskStatusColors[status],
  borderRadius: 4,
  height: 4,
  marginRight: 4,
  width: 32
}))

export default OutcomeCardStatusIndicator
