import ms from 'ms'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {PALETTE} from '../styles/paletteV2'
import relativeDate from '../utils/relativeDate'
import TEXT = PALETTE.TEXT

const StyledSpan = styled('span')({
  color: TEXT.LIGHT,
  fontSize: 11,
  lineHeight: '1rem',
  paddingTop: 4
})

interface State {
  fromNow: string
}

interface Props {
  createdAt: string | Date
}

class TimelineEventDate extends Component<Props, State> {
  state = {
    fromNow: relativeDate(this.props.createdAt)
  }
  intervalId?: number

  componentDidMount () {
    this.intervalId = window.setInterval(() => {
      const fromNow = relativeDate(this.props.createdAt)
      if (fromNow !== this.state.fromNow) {
        this.setState({
          fromNow
        })
      }
    }, ms('1m'))
  }

  componentWillUnmount (): void {
    clearInterval(this.intervalId)
  }

  render () {
    const {fromNow} = this.state
    return <StyledSpan>{fromNow}</StyledSpan>
  }
}

export default TimelineEventDate
