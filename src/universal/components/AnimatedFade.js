import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {CSSTransition} from 'react-transition-group';
import withStyles from 'universal/styles/withStyles';

class AnimatedFade extends Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    styles: PropTypes.object
  }
  state = {ready: false};

  componentWillMount() {
    this._mounted = true;
    // This is required because aphrodite loads async. updating it to push styles in sync will fix this
    // calling css below injects them into the stylesheet & then waiting till the next tick gives it time to flush
    setTimeout(() => {
      if (this._mounted) {
        this.setState({ready: true});
      }
    });
  }

  componentWillUnmount() {
    this._mounted = false;
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
    if (!this.state.ready) {
      // CSSTransition doesn't play well with null
      return <div />;
    }

    return (
      <CSSTransition
        {...props}
        classNames={classNames}
        timeout={{
          enter: 100,
          exit: 100
        }}
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
    transform: 'translate3d(0, -32px, 0)',
    transition: 'all 100ms ease-out'
  }
});

export default withStyles(styleThunk)(AnimatedFade);
