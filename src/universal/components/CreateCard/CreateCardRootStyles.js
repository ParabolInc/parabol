import ui from 'universal/styles/ui'
import cardRootStyles from 'universal/styles/helpers/cardRootStyles'

const CreateCardRootStyles = {
  ...cardRootStyles,
  alignItems: 'center',
  border: 0,
  display: 'flex !important',
  justifyContent: 'center',
  minHeight: ui.cardMinHeight,
  padding: '.6875rem 1.25rem .5rem'
}

export default CreateCardRootStyles
