import PropTypes from 'prop-types';
import React, {Component} from 'react';
import NullCard from 'universal/components/NullCard/NullCard';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';

export default class OutcomeOrNullCard extends Component {
  static propTypes = {
    area: PropTypes.string,
    isAgenda: PropTypes.bool,
    isDragging: PropTypes.bool,
    myUserId: PropTypes.string,
    outcome: PropTypes.object
  };

  shouldComponentUpdate(nextProps) {
    return Boolean(!nextProps.isPreview ||
      nextProps.outcome.status !== this.props.outcome.status ||
      nextProps.outcome.content !== this.props.outcome.content
    );
  }

  render() {
    const {area, isAgenda, myUserId, outcome, isDragging} = this.props;
    const {content, createdBy, teamMember: {preferredName}} = outcome;
    const showOutcome = content || createdBy === myUserId;
    return showOutcome ?
      <OutcomeCardContainer
        area={area}
        isDragging={isDragging}
        isAgenda={isAgenda}
        outcome={outcome}
        myUserId={myUserId}
      /> :
      <NullCard preferredName={preferredName} />;
  }
}
