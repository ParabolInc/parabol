import React, {Component} from 'react'
import styled from 'react-emotion'
import {DECELERATE} from 'universal/styles/animation'
import plural from 'universal/utils/plural'

interface Props {
  editorsCount: number,
}

const BarMask = styled('div')((props: Props) => ({
  borderRadius: '8px',
  overflow: 'hidden',
  transition: `all 300ms ${DECELERATE}`,
  width: 50 * props.editorsCount + 10
}))

const HealthBarStyle = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: 16,
  marginTop: 8,
})

const Bar = styled('div')({
  background: `linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,255,0,1) 40%, rgba(0,255,0,1) 75%)`,
  height: 4,
  width: 200
})

const HealthBarLabel = styled('div')({
  paddingTop: 8
})

class PhaseItemHealthBar extends Component<Props> {
  render() {
    const {editorsCount} = this.props
    return (
      <HealthBarStyle>
        <BarMask editorsCount={editorsCount}>
          <Bar />
        </BarMask>
        <HealthBarLabel>{`${editorsCount} ${plural(editorsCount, 'person', 'people')} typing...`}</HealthBarLabel>
      </HealthBarStyle>
    )
  }
}

export default PhaseItemHealthBar
