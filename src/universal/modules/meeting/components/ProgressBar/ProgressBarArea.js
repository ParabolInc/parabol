import React, {PropTypes, Component} from 'react';
import ProgressBar from 'universal/modules/meeting/components/ProgressBar/ProgressBar';

export default class ProgressBarArea extends Component {
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

  onHover = () => { this.setState({ hasHover: true }); };
  onLeave = () => { this.setState({ hasHover: false }); };

  render() {
    const {hasHover} = this.state;
    return (
      <div
        onMouseEnter={() => this.onHover()}
        onMouseLeave={() => this.onLeave()}
      >
        <ProgressBar {...this.props} hasHover={hasHover} />
      </div>
    );
  }
}
