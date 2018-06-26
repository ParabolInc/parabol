import styled from 'react-emotion'
import labels from 'universal/styles/theme/labels'

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
