import React, {Component} from 'react'
import styled from 'react-emotion'

interface Props {
  strength: number,
}

const Bar = styled('div')((props: Props) => ({
  backgroundColor: 'red',
  borderRadius: '15%',
  height: 4,
  width: 50 * props.strength
}))

class PhaseItemHealthBar extends Component<Props> {
  render() {
    const {strength} = this.props
    return (
      <div>
        <Bar strength={strength} />
        <span>2 people typing...</span>
      </div>
    )
  }
}

export default PhaseItemHealthBar
