import styled from '@emotion/styled'
import labels from '../../../../styles/theme/labels'

const height = '.25rem'
const width = '1.875rem'

const OutcomeCardStatusIndicator = styled('div')(({status}) => ({
  backgroundColor: labels.taskStatus[status].color,
  borderRadius: height,
  height,
  marginRight: '.3125rem',
  width
}))

export default OutcomeCardStatusIndicator
