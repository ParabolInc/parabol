// @flow
import * as React from 'react'
import {Scrollbars} from 'react-custom-scrollbars'
import {css} from 'react-emotion'

type Props = {|
  activeColor: string,
  children: React.Element<*>,
  color: string
|}

const thumbVerical = css({
  borderRadius: '3px',
  transition: 'opacity .2s ease-in'
})

class SexyScrollbar extends React.Component<Props> {
  static defaultProps = {
    color: 'rbga(0,0,0,.5)'
  }
  state = {}
  onMouseEnter = () => {
    this.setState({isHovered: true})
  }
  onMouseLeave = () => {
    this.setState({isHovered: false})
  }

  onScrollStart = () => {
    this.setState({isScrolling: true})
  }

  onScrollStop = () => {
    this.setState({isScrolling: false})
  }

  render () {
    const {isHovered, isScrolling} = this.state
    const {activeColor, children, color} = this.props
    const thumbStyles = {
      opacity: isHovered ? 1 : 0,
      backgroundColor: isScrolling && activeColor ? activeColor : color
    }
    return (
      <Scrollbars
        renderThumbVertical={(props) => (
          <div {...props} className={thumbVerical} style={{...props.style, ...thumbStyles}} />
        )}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onScrollStart={this.onScrollStart}
        onScrollStop={this.onScrollStop}
      >
        {children}
      </Scrollbars>
    )
  }
}

export default SexyScrollbar
