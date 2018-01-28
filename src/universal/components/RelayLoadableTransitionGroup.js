import {PropTypes} from 'prop-types';
import React, {Component} from 'react';
import {TransitionGroup} from 'react-transition-group';
import AnimatedFade from 'universal/components/AnimatedFade';
import {HUMAN_ADDICTION_THRESH} from 'universal/styles/ui';

/*
 * A Component to stick in any Root component (one that uses the QueryRenderer from relay)
 *
 * */
class RelayTransitionGroup extends Component {
  static propTypes = {
    readyState: PropTypes.any,
    loading: PropTypes.func.isRequired,
    LoadableComponent: PropTypes.func.isRequired,
    extraProps: PropTypes.object
  };
  state = {pastDelay: false};

  componentDidMount() {
    this.delayTimer = setTimeout(() => {
      this.setState({
        pastDelay: true
      });
    }, HUMAN_ADDICTION_THRESH);
  }

  render() {
    const {loading: Loading, extraProps, LoadableComponent, readyState} = this.props;
    const {pastDelay} = this.state;
    const {error, props} = readyState;
    if (this.delayTimer && readyState.props) {
      clearTimeout(this.delayTimer);
    }
    return (
      <TransitionGroup appear component={null}>
        <AnimatedFade>
          {props ?
            <LoadableComponent {...extraProps} viewer={props.viewer} /> :
            <Loading error={error} pastDelay={pastDelay} />
          }
        </AnimatedFade>
      </TransitionGroup>
    );
  }
}

export default RelayTransitionGroup;
