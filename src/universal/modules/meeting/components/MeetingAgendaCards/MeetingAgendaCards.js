import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withHotkey from 'react-hotkey-hoc';
import {withRouter} from 'react-router';
import shortid from 'shortid';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import OutcomeOrNullCard from 'universal/components/OutcomeOrNullCard/OutcomeOrNullCard';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CreateProjectMutation from 'universal/mutations/CreateProjectMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {ACTIVE, MEETING} from 'universal/utils/constants';

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

class MeetingAgendaCards extends Component {
  componentWillMount() {
    const {bindHotkey} = this.props;
    bindHotkey('p', this.addBlankProject);
  }

  handleAddProject = (content) => () => {
    const {atmosphere, teamMemberId, teamId, agendaId} = this.props;
    const newProject = {
      id: `${teamId}::${shortid.generate()}`,
      content,
      status: ACTIVE,
      teamMemberId,
      sortOrder: 0,
      agendaId
    };
    CreateProjectMutation(atmosphere, newProject);
  }

  render() {
    const {dispatch, myTeamMemberId, outcomes, styles} = this.props;
    return (
      <div className={css(styles.root)}>
        {/* Get Cards */}
        {outcomes.length !== 0 &&
        makeCards(outcomes, dispatch, myTeamMemberId, styles.item, this.handleAddProject)
        }
        {/* Input Card */}
        <div className={css(styles.item)}>
          <CreateCard
            handleAddProject={this.handleAddProject()}
            hasControls
          />
        </div>
        {/* Placeholder Cards */}
        {makePlaceholders(outcomes.length, styles.item)}
      </div>
    );
  }
}

MeetingAgendaCards.propTypes = {
  agendaId: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  bindHotkey: PropTypes.func,
  dispatch: PropTypes.func,
  history: PropTypes.object.isRequired,
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

export default withRouter(withAtmosphere(withHotkey(withStyles(styleThunk)(MeetingAgendaCards))));
