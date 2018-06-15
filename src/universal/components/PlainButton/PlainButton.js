import styled from 'react-emotion'
import ui from 'universal/styles/ui'

const disabledStyles = {
  cursor: 'not-allowed',
  opacity: '.5',
  ':hover,:focus,:active,:disabled': {
    boxShadow: 'none'
  },
  ':hover,:focus': {
    opacity: 0.5
  },
  ':active': {
    animation: 'none'
  }
}

const PlainButton = styled('button')(
  {
    appearance: 'none',
    background: 'inherit',
    border: 0,
    borderRadius: 0,
    color: 'inherit',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    margin: 0,
    padding: 0,
    ':focus': {
      boxShadow: `0 0 .0625rem .0625rem ${ui.palette.mid}`,
      outline: 0
    },
    textAlign: 'inherit'
  },
  ({disabled, waiting}) => (disabled || waiting) && disabledStyles,
  ({waiting}) => ({cursor: waiting && 'wait'})
)

export default PlainButton
