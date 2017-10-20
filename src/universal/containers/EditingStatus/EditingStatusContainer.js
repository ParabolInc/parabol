import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import getRefreshPeriod from 'universal/utils/getRefreshPeriod';
import EditingStatus from 'universal/components/EditingStatus/EditingStatus';
import getRelaySafeProjectId from 'universal/utils/getRelaySafeProjectId';

const editingStatusContainer = `
query {
  presence(teamId: $teamId) @live {
    id
    userId
    editing
    teamMember @cached(type: "TeamMember") {
      id
      preferredName
    }
  }
}
`;


const mapStateToProps = (state, props) => {
  const {outcomeId} = props;
  const relaySafeProjectId = getRelaySafeProjectId(outcomeId);

  const {presence: editors} = cashay.query(editingStatusContainer, {
    op: 'editingStatusContainer',
    variables: {
      teamId: relaySafeProjectId.split('::')[0]
    },
    key: relaySafeProjectId,
    filter: {
      presence: (presence) => presence.editing === `Task::${relaySafeProjectId}`
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
    createdAt: PropTypes.instanceOf(Date),
    updatedAt: PropTypes.instanceOf(Date)
  };

  constructor(props) {
    super(props);
    this.state = {
      timestampType: 'createdAt'
    };
  }

  componentWillUnmount() {
    this.resetTimeout();
  }

  toggleTimestamp = () => {
    const timestampType = this.state.timestampType === 'createdAt' ? 'updatedAt' : 'createdAt';
    this.setState({timestampType});
  };

  resetTimeout() {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = undefined;
  }

  queueNextRender() {
    this.resetTimeout();
    const {createdAt, updatedAt} = this.props;
    const timestamp = this.state.timestampType === 'createdAt' ? createdAt : updatedAt;
    const timeTilRefresh = getRefreshPeriod(timestamp);
    this.refreshTimer = setTimeout(() => {
      this.forceUpdate();
    }, timeTilRefresh);
  }

  render() {
    const {isEditing, editors, createdAt, updatedAt} = this.props;
    this.queueNextRender();
    const timestamp = this.state.timestampType === 'createdAt' ? createdAt : updatedAt;
    return (
      <EditingStatus
        handleClick={this.toggleTimestamp}
        isEditing={isEditing}
        editors={editors}
        timestamp={timestamp}
        timestampType={this.state.timestampType}
      />
    );
  }
}
