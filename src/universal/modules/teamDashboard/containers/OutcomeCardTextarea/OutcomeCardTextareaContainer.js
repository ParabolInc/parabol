import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import fromNow from 'universal/utils/fromNow';
import Ellipsis from 'universal/components/Ellipsis/Ellipsis';
import OutcomeCardTextarea from 'universal/components/OutcomeCard/OutcomeCardTextarea';

const outcomeCardTextareaQuery = `
query {
  editors @cached(id: $projectId, type: "[Presence]") {
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
    // no one else is editing
    if (editors.length === 0) {
      makeEditingStatus.cache = active ? <span>editing<Ellipsis/></span> : fromNow(updatedAt);
    } else {
      const editorNames = editors.map(e => e.teamMember.preferredName);
      // one other is editing
      if (editors.length === 1) {
        const editor = editorNames[0];
        makeEditingStatus.cache = <span>{editor} editing{active ? 'too' : ''}<Ellipsis/></span>;
      } else if (editors.length === 2) {
        makeEditingStatus.cache = active ?
          <span>several are editing<Ellipsis/></span> :
          <span>{`${editorNames[0]} and ${editorNames[1]} editing`}<Ellipsis/></span>;
      } else {
        makeEditingStatus.cache = <span>several are editing<Ellipsis/></span>;
      }
    }
  }
  return makeEditingStatus.cache;
};

const mapStateToProps = (state, props) => {
  const {active} = props.meta;
  const {updatedAt, id: outcomeId} = props.outcome;
  const {editors} = cashay.query(outcomeCardTextareaQuery, {
    op: 'outcomeCardTextareaContainer',
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
  const editingStatus = makeEditingStatus(editors, active, updatedAt);
  return {
    editingStatus
  };
};

const OutcomeCardTextareaContainer = (props) => {
  return (
    <OutcomeCardTextarea
      {...props}
    />
  );
};

OutcomeCardTextareaContainer.propTypes = {
  editingStatus: PropTypes.any
};

export default connect(mapStateToProps)(OutcomeCardTextareaContainer);
