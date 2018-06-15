import PropTypes from 'prop-types'
import React, {Component} from 'react'
import styled from 'react-emotion'
import PlainButton from 'universal/components/PlainButton/PlainButton'

const ButtonRoot = styled(PlainButton)(
  {
    // Override PlainButton styles
  },
  ({disabled}) =>
    disabled &&
    {
      // Override PlainButton disabled styles
    },
  ({buttonStyles}) =>
    buttonStyles && {
      // Button variants that use BaseButton can override styles
      ...buttonStyles
    },
  ({pressedDownStyles}) =>
    pressedDownStyles && {
      // Button variants that use BaseButton can add pressedDown styles
      ...pressedDownStyles
    }
)

class BaseButton extends Component {
  static propTypes = {
    'aria-label': PropTypes.string,
    buttonStyles: PropTypes.object,
    children: PropTypes.any,
    disabled: PropTypes.bool,
    disabledStyles: PropTypes.object,
    innerRef: PropTypes.func,
    onClick: PropTypes.func,
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    pressedStyles: PropTypes.object,
    title: PropTypes.string,
    type: PropTypes.oneOf(['button', 'menu', 'reset', 'submit']),
    // https://github.com/facebook/react/issues/4251
    visuallyDisabled: PropTypes.bool,
    waiting: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      pressedDown: null
    }
  }

  onMouseDown = (e) => {
    if (e.button === 0) {
      this.setState({pressedDown: true})
    }
  }

  onMouseUp = (e) => {
    if (this.state.pressedDown) {
      this.setState({pressedDown: false})
    }
    // We don’t want 'focus' styles to linger after the click (TA)
    // wait till next tick because other components might need to use the button as the relativeTarget when they get blurred
    // pull the target out of the event so react can recycle the event
    const {currentTarget} = e
    setTimeout(() => currentTarget.blur())
  }

  onMouseLeave = (e) => {
    if (this.state.pressedDown) {
      this.setState({pressedDown: false})
    }
    const {onMouseLeave} = this.props
    if (onMouseLeave) {
      onMouseLeave(e)
    }
  }

  render () {
    const {
      'aria-label': ariaLabel,
      buttonStyles,
      children,
      disabled,
      innerRef,
      onClick,
      onMouseEnter,
      pressedDownStyles,
      title,
      type,
      visuallyDisabled,
      waiting
    } = this.props

    const {pressedDown} = this.state
    const hasDisabledStyles = Boolean(disabled || visuallyDisabled || waiting)

    return (
      <ButtonRoot
        aria-label={ariaLabel}
        buttonStyles={buttonStyles}
        disabled={hasDisabledStyles}
        onClick={onClick}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
        onMouseEnter={onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        pressedDownStyles={!hasDisabledStyles && pressedDown && pressedDownStyles}
        ref={innerRef}
        title={title || ariaLabel}
        type={type || 'button'}
        waiting={waiting}
      >
        {children}
      </ButtonRoot>
    )
  }
}

export default BaseButton
