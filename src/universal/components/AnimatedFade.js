import {css} from 'aphrodite-local-styles/no-important';
import React, {Component} from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import withStyles from 'universal/styles/withStyles';
import PropTypes from 'prop-types';

class AnimatedFade extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    styles: PropTypes.object
  }
  state = {ready: false};

  componentWillMount() {
    // This is required because aphrodite loads async. updating it to push styles in sync will fix this
    // calling css below injects them into the stylesheet & then waiting till the next tick gives it time to flush
    setTimeout(() => this.setState({ready: true}));
  }

  render() {
    const {children, styles, ...props} = this.props;
    const classNames = {
      appear: css(styles.enter),
      appearActive: css(styles.enterActive),
      enter: css(styles.enter),
      enterActive: css(styles.enterActive),
      exit: css(styles.exit),
      exitActive: css(styles.exitActive)
    };
    if (!this.state.ready) return null;

    return (
      <CSSTransition
        {...props}
        classNames={classNames}
        timeout={300}
      >
        {children}
      </CSSTransition>
    );
  }
}

const styleThunk = () => ({
  enter: {
    opacity: 0,
    transform: 'translate3d(0, 10px, 0)'
  },

  enterActive: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
    transition: 'all 100ms ease-in'
  },

  exit: {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)'
  },

  exitActive: {
    opacity: 0,
    transform: 'translate3d(0, -10px, 0)',
    transition: 'all 100ms ease-in'
  }
});

export default withStyles(styleThunk)(AnimatedFade);
