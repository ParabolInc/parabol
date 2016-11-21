import React, {PropTypes, Component} from 'react';
import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';

export default class ProgressBarContainer extends Component {
  static propTypes = {
    gotoItem: PropTypes.func.isRequired,
    isComplete: PropTypes.bool,
    facilitatorPhaseItem: PropTypes.number,
    localPhaseItem: PropTypes.number,
    meetingPhaseItem: PropTypes.number,
    membersCount: PropTypes.number
  };

  constructor(props) {
    super(props);
    this.state = {
      hasHover: false
    };
  }

  handleHover = (hoverState) => {
    this.setState({ hasHover: !hoverState });
  };

  render() {
    const {hasHover} = this.state;
    return (
      <div
        onMouseEnter={() => this.handleHover(hasHover)}
        onMouseLeave={() => this.handleHover(hasHover)}
      >
        <ProgressBar {...this.props} hasHover={hasHover} />
      </div>
    );
  }
}
