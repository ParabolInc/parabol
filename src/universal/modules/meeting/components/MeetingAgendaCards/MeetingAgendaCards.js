import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';
import {cashay} from 'cashay';
import shortid from 'shortid';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import {ACTIVE, MEETING} from 'universal/utils/constants';
import withHotkey from 'react-hotkey-hoc';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';

const handleAddProjectFactory = (teamMemberId, agendaId) => (content) => () => {
  const [, teamId] = teamMemberId.split('::');
  const newProject = {
    id: `${teamId}::${shortid.generate()}`,
    content,
    status: ACTIVE,
    teamMemberId,
    sortOrder: 0,
    agendaId
  };
  cashay.mutate('createProject', {variables: {newProject}});
};

const makeCards = (array, dispatch, myTeamMemberId, itemStyle, handleAddProject) => {
  return array.map((outcome) => {
    const {id} = outcome;
    const key = `$outcomeCard${id}`;
    const [myUserId] = myTeamMemberId.split('::');
    return (
      <div className={css(itemStyle)} key={key}>
        <OutcomeOrNullCard
          area={MEETING}
          handleAddProject={handleAddProject}
          isAgenda
          myUserId={myUserId}
          outcome={outcome}
        />
      </div>
    );
  });
};

const makePlaceholders = (length, itemStyle) => {
  const rowLength = 4;
  const emptyCardCount = rowLength - (length % rowLength + 1);
  /* eslint-disable react/no-array-index-key */
  return new Array(emptyCardCount).fill(undefined).map((item, idx) =>
    (<div
      className={css(itemStyle)}
      key={`CreateCardPlaceholder${idx}`}
    >
      <CreateCard />
    </div>));
  /* eslint-enable */
};

const MeetingAgendaCards = (props) => {
  const {agendaId, bindHotkey, dispatch, myTeamMemberId, outcomes, styles} = props;
  const handleAddProject = handleAddProjectFactory(myTeamMemberId, agendaId);
  const addBlankProject = handleAddProject();
  bindHotkey('p', handleAddProject);
  return (
    <div className={css(styles.root)}>
      {/* Get Cards */}
      {outcomes.length !== 0 &&
      makeCards(outcomes, dispatch, myTeamMemberId, styles.item, handleAddProject)
      }
      {/* Input Card */}
      <div className={css(styles.item)}>
        <CreateCard
          handleAddProject={addBlankProject}
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
    marginBottom: '1rem',
    marginTop: '1rem',
    padding: '0 .5rem',
    width: '25%',

    [ui.breakpoint.wide]: {
      padding: '0 .75rem'
    },

    [ui.breakpoint.wider]: {
      padding: '0 1rem'
    }
  }
});

export default withHotkey(withStyles(styleThunk)(MeetingAgendaCards));
