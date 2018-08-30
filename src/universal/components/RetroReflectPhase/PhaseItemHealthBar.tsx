import React, {Component} from 'react'
import styled, {keyframes} from 'react-emotion'
import {DECELERATE} from 'universal/styles/animation'
import plural from 'universal/utils/plural'
import appTheme from 'universal/styles/theme/appTheme'
interface Props {
  editorCount: number
}

const {
  brand: {
    primary: {purpleLightened, orange, teal}
  }
} = appTheme

const BarMask = styled('div')((props: Props) => ({
  borderRadius: '8px',
  height: 4,
  overflow: 'hidden',
  transition: `all 300ms ${DECELERATE}`,
  width: Math.max(10, 50 * props.editorCount)
}))

const HealthBarStyle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 16,
  marginTop: 8
})

const shiftColor = keyframes`
  0% {
    background-position: 0px;
  }
	100% {
	  background-position: 200px;
	}
`

const Bar = styled('div')({
  animation: `${shiftColor} 2000ms linear infinite`,
  background: `linear-gradient(90deg, ${purpleLightened} 0%, ${orange} 40%, ${teal} 75%, ${purpleLightened} 100%)`,
  borderRadius: '8px',
  height: '100%',
  width: 200
})

const HealthBarLabel = styled('div')({
  paddingTop: 8,
  userSelect: 'none'
})

class PhaseItemHealthBar extends Component<Props> {
  render() {
    const {editorCount} = this.props
    return (
      <HealthBarStyle>
        <BarMask editorCount={editorCount}>
          <Bar />
        </BarMask>
        <HealthBarLabel>{`${editorCount} ${plural(
          editorCount,
          'person',
          'people'
        )} typing...`}</HealthBarLabel>
      </HealthBarStyle>
    )
  }
}

export default PhaseItemHealthBar
