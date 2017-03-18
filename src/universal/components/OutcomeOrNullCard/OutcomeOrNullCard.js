import React, {Component, PropTypes} from 'react';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';
import NullCard from 'universal/components/NullCard/NullCard';

export default class OutcomeOrNullCard extends Component {
  static propTypes = {
    myUserId: PropTypes.string,
    outcome: PropTypes.object
  };

  shouldComponentUpdate(nextProps) {
    return Boolean(!nextProps.isPreview || nextProps.outcome.status !== this.props.outcome.status);
  }
  render() {
    const {myUserId, outcome} = this.props;
    const {content, createdBy, teamMember: {preferredName}, type} = outcome;
    const showOutcome = content || createdBy === myUserId;
    return showOutcome ? <OutcomeCardContainer {...this.props} /> :
    <NullCard preferredName={preferredName} type={type || 'Project'} />;
  }
}
