// @flow
import React from 'react'
import styled from 'react-emotion'
import ui from 'universal/styles/ui'
import {PRO_LABEL} from 'universal/utils/constants'
import Confetti from 'react-dom-confetti'
import appTheme from 'universal/styles/theme/appTheme'
import RaisedButton from 'universal/components/RaisedButton'

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

const confettiConfig = {
  angle: 90,
  spread: 150,
  startVelocity: 90,
  elementCount: 250,
  decay: 0.88,
  colors: [
    ...Object.values(appTheme.brand.secondary),
    appTheme.brand.primary.purple,
    appTheme.brand.primary.Lightened,
    appTheme.brand.primary.purpleDarkened,
    appTheme.brand.primary.orange,
    appTheme.brand.primary.teal
  ]
}

type Props = {|
  handleClose: () => void
|}

type State = {|
  active: boolean
|}

class UpgradeSuccess extends React.Component<Props, State> {
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

  _mounted: boolean
  state = {
    active: false
  }

  componentDidMount () {
    this._mounted = true
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
        <ModalButton size='large' depth={1} onClick={handleClose}>
          {'Let’s Get Back to Business'}
        </ModalButton>
        <Confetti active={active} config={confettiConfig} />
      </CenteredModalBoundary>
    )
  }
}

export default UpgradeSuccess
