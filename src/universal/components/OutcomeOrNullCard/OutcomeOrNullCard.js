import React, {Component, PropTypes} from 'react';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';
import NullCard from 'universal/components/NullCard/NullCard';

export default class OutcomeOrNullCard extends Component {
  static propTypes = {
    area: PropTypes.string,
    myUserId: PropTypes.string,
    outcome: PropTypes.object
  };

  shouldComponentUpdate(nextProps) {
    return Boolean(!nextProps.isPreview || nextProps.outcome.status !== this.props.outcome.status);
  }
  render() {
    const {area, myUserId, outcome} = this.props;
    const {content, createdBy, teamMember: {preferredName}} = outcome;
    const showOutcome = content || createdBy === myUserId;
    return showOutcome ? <OutcomeCardContainer area={area} outcome={outcome} myUserId={myUserId} /> :
    <NullCard preferredName={preferredName} />;
  }
}
