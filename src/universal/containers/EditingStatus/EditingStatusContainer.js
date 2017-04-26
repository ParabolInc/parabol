import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import getRefreshPeriod from 'universal/utils/getRefreshPeriod';
import EditingStatus from 'universal/components/EditingStatus/EditingStatus';

const editingStatusContainer = `
query {
  presence(teamId: $teamId) @live {
    id
    userId
    editing
    teamMember @cached(type: "TeamMember") {
      preferredName
    }
  }
}
`;


const mapStateToProps = (state, props) => {
  const {outcomeId} = props;
  const {presence: editors} = cashay.query(editingStatusContainer, {
    op: 'editingStatusContainer',
    variables: {
      teamId: outcomeId.split('::')[0]
    },
    key: outcomeId,
    filter: {
      presence: (presence) => presence.editing === `Task::${outcomeId}`
    },
    resolveCached: {
      teamMember: (source) => {
        if (!source.editing) {
          return undefined;
        }
        const [, teamId] = source.editing.split('::');
        const {userId} = source;
        return `${userId}::${teamId}`;
      }
    }
  }).data;
  return {
    editors
  };
};

@connect(mapStateToProps)
export default class EditingStatusContainer extends Component {
  static propTypes = {
    isEditing: PropTypes.bool,
    editors: PropTypes.any,
    outcomeId: PropTypes.string,
    updatedAt: PropTypes.instanceOf(Date)
  };

  componentWillUnmount() {
    this.resetTimeout();
  }

  resetTimeout() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = undefined;
  }

  queueNextRender() {
    this.resetTimeout();
    const {updatedAt} = this.props;
    const timeTilRefresh = getRefreshPeriod(updatedAt);
    this.refreshTimer = setTimeout(() => {
      this.forceUpdate();
    }, timeTilRefresh);
  }

  render() {
    const {isEditing, editors, updatedAt} = this.props;
    this.queueNextRender();
    return <EditingStatus isEditing={isEditing} editors={editors} updatedAt={updatedAt} />;
  }
}
