import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {withRouter} from 'react-router';
import {cashay} from 'cashay';
import shortid from 'shortid';
import CreateCard from 'universal/components/CreateCard/CreateCard';
// import OutcomeCard from 'universal/modules/teamDashboard/components/TeamProjectCard/TeamProjectCard';
import {ACTIVE, SORT_STEP} from 'universal/utils/constants';
import MeetingAgendaOutcomeCard from '../MeetingAgendaOutcomeCard/MeetingAgendaOutcomeCard';

const handleAddActionFactory = (teamMemberId, agendaId) => () => {
  const [, teamId] = teamMemberId.split('::');
  const newAction = {
    id: `${teamId}::${shortid.generate()}`,
    teamMemberId,
    sortOrder: SORT_STEP, // TODO: consider some other value for sort values?
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
    teamSort: SORT_STEP, // TODO: consider some other value for sort values?
    userSort: SORT_STEP,
    agendaId
  };
  cashay.mutate('createProject', {variables: {newProject}});
};

let s = {};

const makeCards = (array) => {
  const cards = array.map((card) => {
    const key = `${card.type}OutcomeCard${card.id}`;
    return (
      <div className={s.item} key={key}>
        <MeetingAgendaOutcomeCard
          content={card.content}
          id={card.id}
          status={card.status}
          type={card.type}
        />
      </div>
    );
  });
  return cards;
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
  const {agendaId, myTeamMemberId, outcomes} = props;
  const handleAddAction = handleAddActionFactory(myTeamMemberId, agendaId);
  const handleAddProject = handleAddProjectFactory(myTeamMemberId, agendaId);
  return (
    <div className={s.root}>
      {/* Get Cards */}
      {outcomes.length !== 0 &&
        makeCards(outcomes)
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
  myTeamMemberId: PropTypes.string,
  outcomes: PropTypes.array.isRequired
};

export default withRouter(look(MeetingAgendaCards));
