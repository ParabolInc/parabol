import {PropTypes} from 'prop-types';
import React, {Children, cloneElement, Component} from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';

class RelayTransitionGroup extends Component {
  static propTypes = {
    readyState: PropTypes.any,
    error: PropTypes.element.isRequired,
    loading: PropTypes.element.isRequired,
    ready: PropTypes.element.isRequired
  };

  render() {
    const {error: errorEl, loading, ready, readyState} = this.props;
    const {error, props} = readyState;
    if (!props && this.renderProps) {
      return Children.only(loading);
    } else if (!this.renderProps && props) {
      this.renderProps = true;
    }
    let child;
    let key;
    if (error) {
      key = 0;
      child = cloneElement(errorEl, {error});
    } else if (props) {
      key = 1;
      child = cloneElement(ready, {viewer: props.viewer});
    } else {
      key = 2;
      child = loading;
    }
    return (
      <TransitionGroup appear component={null} exit={false}>
        <AnimatedFade key={key}>
          {child}
        </AnimatedFade>
      </TransitionGroup>
    );
  }
}

export default RelayTransitionGroup;
