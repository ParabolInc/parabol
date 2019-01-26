import styled from 'react-emotion'
import withInnerRef from 'universal/decorators/withInnerRef'

const disabledStyles = {
  cursor: 'not-allowed',
  opacity: 0.5,
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

interface Props {
  disabled?: boolean
  waiting?: boolean
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
    textAlign: 'inherit'
  },
  ({disabled, waiting}: Props) => (disabled || waiting ? disabledStyles : undefined),
  ({waiting}: Props) => ({cursor: waiting ? 'wait' : undefined})
)

export default withInnerRef(PlainButton as any)
