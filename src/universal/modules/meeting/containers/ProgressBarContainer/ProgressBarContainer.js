import React, {PropTypes, Component} from 'react';
import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';
import {phaseArray} from 'universal/utils/constants';

export default class ProgressBarContainer extends Component {
  static propTypes = {
    gotoItem: PropTypes.func.isRequired,
    isComplete: PropTypes.bool,
    facilitatorPhase: PropTypes.oneOf(phaseArray),
    facilitatorPhaseItem: PropTypes.number,
    localPhase: PropTypes.oneOf(phaseArray),
    localPhaseItem: PropTypes.number,
    meetingPhaseItem: PropTypes.number,
    membersCount: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      hoverState: {
        onMouseEnter: false,
        onMouseLeave: true,
      }
    };
  }

  handleHover = (type) => {
    const hoverState = {
      onMouseEnter: type === 'enter',
      onMouseLeave: type === 'leave',
    };
    this.setState({...this.state, hoverState});
  };

  render() {
    const {hoverState} = this.state;
    return (
      <div
        onMouseEnter={() => this.handleHover('enter')}
        onMouseLeave={() => this.handleHover('leave')}
        onMouseMove={() => this.handleHover('enter')}
      >
        <ProgressBar {...this.props} hoverState={hoverState} />
      </div>
    );
  }
}
