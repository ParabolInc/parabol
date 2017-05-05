import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import fromNow from 'universal/utils/fromNow';
import getRefreshPeriod from 'universal/utils/getRefreshPeriod';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';
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

const makeEditingStatus = (editors, active, timestamp, timestampType) => {
  let editingStatus = null;
  // no one else is editing
  if (editors.length === 0) {
    editingStatus = active ? <span>editing<Ellipsis /></span> :
      ((timestampType === 'updatedAt' ? 'Updated ' : 'Created ') + fromNow(timestamp));
  } else {
    const editorNames = editors.map((e) => e.teamMember.preferredName);
    // one other is editing
    if (editors.length === 1) {
      const editor = editorNames[0];
      editingStatus = <span>{editor} editing{active ? 'too' : ''}<Ellipsis /></span>;
    } else if (editors.length === 2) {
      editingStatus = active ?
        <span>several are editing<Ellipsis /></span> :
        <span>{`${editorNames[0]} and ${editorNames[1]} editing`}<Ellipsis /></span>;
    } else {
      editingStatus = <span>several are editing<Ellipsis /></span>;
    }
  }
  return editingStatus;
};

const mapStateToProps = (state, props) => {
  const {form, outcomeId} = props;
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
  const formState = state.form[form];
  const active = formState && formState.active === outcomeId;
  return {
    active,
    editors
  };
};

@connect(mapStateToProps)
export default class EditingStatusContainer extends Component {
  static propTypes = {
    active: PropTypes.bool,
    className: PropTypes.object,
    editors: PropTypes.any,
    outcomeId: PropTypes.string,
    updatedAt: PropTypes.instanceOf(Date),
    createdAt: PropTypes.instanceOf(Date)
  };

  constructor(props) {
    super(props);
    const {active, editors, updatedAt, createdAt} = this.props;
    const timestampType = 'updatedAt'; // Should pull this default from storage instead
    const timestamp = timestampType === 'updatedAt' ? updatedAt : createdAt;
    this.state = {
      timestampType,
      editingStatus: makeEditingStatus(editors, active, timestamp, timestampType)
    };
    this.toggleTimestamp = this.toggleTimestamp.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {active, editors, updatedAt, createdAt} = nextProps;
    const {timestampType} = this.state;
    const timestamp = timestampType === 'updatedAt' ? updatedAt : createdAt;
    if (this.props.active !== active
        || this.props.editors !== editors
        || this.props.updatedAt !== updatedAt
        || this.props.createdAt !== createdAt
      ) {
      this.setState({
        editingStatus: makeEditingStatus(editors, active, timestamp, timestampType)
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this.refreshTimer);
  }

  toggleTimestamp() {
    const {timestampType} = this.state;
    const {editors, active, updatedAt, createdAt} = this.props;
    const newTimestampType = timestampType === 'updatedAt' ? 'createdAt' : 'updatedAt';
    const timestamp = newTimestampType === 'updatedAt' ? updatedAt : createdAt;
    this.setState({
      timestampType: newTimestampType,
      editingStatus: makeEditingStatus(editors, active, timestamp, newTimestampType)
    });
  }

  render() {
    const {active, editors, updatedAt, createdAt} = this.props;
    const {editingStatus, timestampType} = this.state;
    const timestamp = timestampType === 'updatedAt' ? updatedAt : createdAt;
    clearTimeout(this.refreshTimer);
    const refreshPeriod = getRefreshPeriod(timestamp);
    this.refreshTimer = setTimeout(() => {
      this.setState({
        editingStatus: makeEditingStatus(editors, active, timestamp, timestampType)
      });
    }, refreshPeriod);
    return <EditingStatus status={editingStatus} handleClick={this.toggleTimestamp} />;
  }
}
