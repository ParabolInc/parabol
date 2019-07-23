import React from 'react'
import styled from '@emotion/styled'
import ui from 'universal/styles/ui'
import {PRO_LABEL} from 'universal/utils/constants'
import RaisedButton from 'universal/components/RaisedButton'
import Confetti from './Confetti'

const flexBase = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
}

const modalCopyBase = {
  fontSize: '.9375rem',
  lineHeight: '2rem',
  margin: 0
}

const ModalBoundary = styled('div')({
  ...flexBase,
  background: ui.palette.white,
  borderRadius: ui.modalBorderRadius,
  height: 374,
  width: 700
})

const CenteredModalBoundary = styled(ModalBoundary)({
  flexDirection: 'column'
})

const ModalHeading = styled('h2')({
  fontSize: '1.5rem',
  fontWeight: 600,
  lineHeight: '1.5',
  margin: '0 0 .5rem'
})

const Emoji = styled('div')({
  fontSize: '4rem',
  lineHeight: 1
})

const ModalCopy = styled('p')({...modalCopyBase})

const ModalButton = styled(RaisedButton)({
  margin: '2rem 0 0',
  width: '22.5rem'
})

interface Props {
  handleClose: () => void
}

interface State {
  active: boolean
}

class UpgradeSuccess extends React.Component<Props, State> {
  _mounted = true

  constructor (props: Props) {
    super(props)
    setTimeout(() => {
      this.setState({active: true})
      setTimeout(() => {
        if (this._mounted) {
          this.setState({active: false})
        }
      }, 100)
    })
  }
  state = {
    active: false
  }

  componentWillUnmount () {
    this._mounted = false
  }

  render () {
    const {handleClose} = this.props
    const {active} = this.state
    return (
      <CenteredModalBoundary>
        <Emoji>{'🤗'}</Emoji>
        <ModalHeading>{'We’re glad you’re here!'}</ModalHeading>
        <ModalCopy>
          {'Your organization is now on the '}
          <b>{PRO_LABEL}</b>
          {' tier.'}
        </ModalCopy>
        <ModalButton size='large' onClick={handleClose}>
          {'Let’s Get Back to Business'}
        </ModalButton>
        <Confetti active={active} />
      </CenteredModalBoundary>
    )
  }
}

export default UpgradeSuccess
