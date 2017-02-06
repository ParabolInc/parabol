import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import fromNow from '../../utils/fromNow';
import Ellipsis from '../../components/Ellipsis/Ellipsis';
import EditingStatus from 'universal/components/EditingStatus/EditingStatus';

const editingStatusContainer = `
query {
  editors @cached(id: $outcomeId, type: "[Presence]") {
    id
    userId
    editing
    teamMember @cached(type: "TeamMember") {
      preferredName
    }
  }
}
`;

const makeEditingStatus = (editors, active, updatedAt) => {
  if (editors !== makeEditingStatus.editors || active !== makeEditingStatus.active) {
    makeEditingStatus.editors = editors;
    makeEditingStatus.active = active;
    const endStr = <small>{'(<TAB> saves)'}</small>;
    // no one else is editing
    if (editors.length === 0) {
      makeEditingStatus.cache = active ? <span>editing {endStr}<Ellipsis/></span> :
        fromNow(updatedAt);
    } else {
      const editorNames = editors.map(e => e.teamMember.preferredName);
      // one other is editing
      if (editors.length === 1) {
        const editor = editorNames[0];
        makeEditingStatus.cache = <span>{editor} editing{active ? 'too' : ''}<Ellipsis/></span>;
      } else if (editors.length === 2) {
        makeEditingStatus.cache = active ?
          <span>several are editing {endStr}<Ellipsis/></span> :
          <span>{`${editorNames[0]} and ${editorNames[1]} editing`}<Ellipsis/></span>;
      } else {
        makeEditingStatus.cache = <span>several are editing {endStr}<Ellipsis/></span>;
      }
    }
  }
  return makeEditingStatus.cache;
};

const mapStateToProps = (state, props) => {
  const {form, updatedAt, outcomeId} = props;
  const {editors} = cashay.query(editingStatusContainer, {
    op: 'editingStatusContainer',
    variables: {outcomeId},
    key: outcomeId,
    resolveCached: {
      editors: (source, args) => (doc) => doc.editing === `Task::${args.id}`,
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
  const editingStatus = makeEditingStatus(editors, active, updatedAt);
  return {
    editingStatus
  };
};

const EditingStatusContainer = (props) => {
  const {editingStatus} = props;
  return <EditingStatus status={editingStatus}/>;
};

EditingStatusContainer.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.object,
  editingStatus: PropTypes.any,
  outcomeId: PropTypes.string,
  updatedAt: PropTypes.instanceOf(Date)
};

export default connect(mapStateToProps)(EditingStatusContainer);
