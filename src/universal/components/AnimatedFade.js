// @flow
import * as React from 'react';
import {CSSTransition} from 'react-transition-group';
import {css} from 'react-emotion';

const {Component} = React;

type Props = {
  children: React.Node,
  duration?: number,
  slide?: number
};

// eslint-disable-next-line
class AnimatedFade extends Component<Props> {
  render() {
    const {children, duration = 100, slide = 32, ...props} = this.props;

    const enter = css({
      opacity: 0,
      transform: `translate3d(0, ${slide}px, 0)`
    });
    const enterActive = css({
      opacity: '1 !important',
      transform: 'translate3d(0, 0, 0) !important',
      transition: `all ${duration}ms ease-in !important`
    });

    const exit = css({
      opacity: 1,
      transform: 'translate3d(0, 0, 0)'
    });

    const exitActive = css({
      opacity: '0 !important',
      transform: `translate3d(0, ${-slide}px, 0) !important`,
      transition: `all ${duration}ms ease-in !important`
    });

    const classNames = {
      appear: enter,
      appearActive: enterActive,
      enter,
      enterActive,
      exit,
      exitActive
    };
    return (
      <CSSTransition
        {...props}
        classNames={classNames}
        timeout={{
          enter: duration,
          exit: duration
        }}
      >
        {children}
      </CSSTransition>
    );
  }
}

export default AnimatedFade;
