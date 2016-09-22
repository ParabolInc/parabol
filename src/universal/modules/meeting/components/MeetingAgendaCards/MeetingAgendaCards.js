import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import shortid from 'shortid';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import {ACTIVE} from 'universal/utils/constants';
import AgendaCard from 'universal/modules/meeting/components/AgendaCard/AgendaCard';

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

let s = {};

const makeCards = (array, dispatch) => {
  return array.map((outcome) => {
    const key = `${outcome.type}OutcomeCard${outcome.id}`;
    return (
      <div className={s.item} key={key}>
        <AgendaCard dispatch={dispatch} outcome={outcome}/>
      </div>
    );
  });
};

const makePlaceholders = (length) => {
  const rowLength = 4;
  const fullRows = Math.floor(length / rowLength);
  const itemsTotal = (fullRows * 4) + rowLength;
  const placeholdersTotal = itemsTotal - (length + 1);
  const placeholders = [];
  for (let i = 0; i < placeholdersTotal; i++) {
    placeholders.push(
      <div
        className={s.item}
        key={`CreateCardPlaceholder${i}`}
      >
        <CreateCard />
      </div>);
  }
  return placeholders;
};

const MeetingAgendaCards = (props) => {
  const {agendaId, dispatch, myTeamMemberId, outcomes} = props;
  const handleAddAction = handleAddActionFactory(myTeamMemberId, agendaId);
  const handleAddProject = handleAddProjectFactory(myTeamMemberId, agendaId);
  return (
    <div className={s.root}>
      {/* Get Cards */}
      {outcomes.length !== 0 &&
      makeCards(outcomes, dispatch)
      }
      {/* Input Card */}
      <div className={s.item}>
        <CreateCard
          handleAddAction={handleAddAction}
          handleAddProject={handleAddProject}
          hasControls
        />
      </div>
      {/* Placeholder Cards */}
      {makePlaceholders(outcomes.length)}
    </div>
  );
};

s = StyleSheet.create({
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

MeetingAgendaCards.propTypes = {
  agendaId: PropTypes.string.isRequired,
  dispatch: PropTypes.func,
  myTeamMemberId: PropTypes.string,
  outcomes: PropTypes.array.isRequired
};

export default look(MeetingAgendaCards);
