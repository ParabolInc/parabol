import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite/no-important';
import {cashay} from 'cashay';
import shortid from 'shortid';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import {ACTIVE} from 'universal/utils/constants';
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer';
import withHotkey from 'react-hotkey-hoc';
import NullCard from 'universal/components/NullCard/NullCard';
import makeUsername from 'universal/utils/makeUsername';

const handleAddActionFactory = (teamMemberId, agendaId) => () => {
  const [, teamId] = teamMemberId.split('::');
  const newAction = {
    id: `${teamId}::${shortid.generate()}`,
    teamMemberId,
    sortOrder: 0,
    agendaId
  };
  cashay.mutate('createAction', {variables: {newAction}});
};

const handleAddProjectFactory = (teamMemberId, agendaId) => () => {
  const [, teamId] = teamMemberId.split('::');
  const newProject = {
    id: `${teamId}::${shortid.generate()}`,
    status: ACTIVE,
    teamMemberId,
    teamSort: 0,
    userSort: 0,
    agendaId
  };
  cashay.mutate('createProject', {variables: {newProject}});
};

const makeCards = (array, dispatch, myTeamMemberId, itemStyle) => {
  return array.map((outcome) => {
    const {type, id, teamMember: {preferredName}, content, teamMemberId} = outcome;
    const key = `${type}OutcomeCard${id}`;
    const username = makeUsername(preferredName);
    return (
      <div className={css(itemStyle)} key={key}>
        {(!content && myTeamMemberId !== teamMemberId) ?
          <NullCard username={username}/> :
          <OutcomeCardContainer form={key} outcome={outcome}/>
        }
      </div>
    );
  });
};

const makePlaceholders = (length, itemStyle) => {
  const rowLength = 4;
  const emptyCardCount = rowLength - (length % rowLength + 1);
  return new Array(emptyCardCount).fill(undefined).map((item, idx) =>
    <div
      className={css(itemStyle)}
      key={`CreateCardPlaceholder${idx}`}
    >
      <CreateCard />
    </div>);
};

const MeetingAgendaCards = (props) => {
  const {agendaId, bindHotkey, dispatch, myTeamMemberId, outcomes, styles} = props;
  const handleAddAction = handleAddActionFactory(myTeamMemberId, agendaId);
  const handleAddProject = handleAddProjectFactory(myTeamMemberId, agendaId);
  bindHotkey('a', handleAddAction);
  bindHotkey('p', handleAddProject);
  return (
    <div className={css(styles.root)}>
      {/* Get Cards */}
      {outcomes.length !== 0 &&
      makeCards(outcomes, dispatch, myTeamMemberId, styles.item)
      }
      {/* Input Card */}
      <div className={css(styles.item)}>
        <CreateCard
          handleAddAction={handleAddAction}
          handleAddProject={handleAddProject}
          hasControls
        />
      </div>
      {/* Placeholder Cards */}
      {makePlaceholders(outcomes.length, styles.item)}
    </div>
  );
};

MeetingAgendaCards.propTypes = {
  agendaId: PropTypes.string.isRequired,
  bindHotkey: PropTypes.func,
  dispatch: PropTypes.func,
  myTeamMemberId: PropTypes.string,
  outcomes: PropTypes.array.isRequired,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    display: 'flex !important',
    flexWrap: 'wrap'
  },

  item: {
    marginTop: '2rem',
    padding: '0 1rem',
    width: '25%'
  }
});

export default withHotkey(withStyles(styleThunk)(MeetingAgendaCards));
