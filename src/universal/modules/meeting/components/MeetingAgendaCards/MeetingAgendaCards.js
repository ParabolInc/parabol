import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withHotkey from 'react-hotkey-hoc';
import {withRouter} from 'react-router';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import NullableProject from 'universal/components/NullableProject/NullableProject';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import CreateProjectMutation from 'universal/mutations/CreateProjectMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {ACTIVE, MEETING} from 'universal/utils/constants';

const makeCards = (array, myUserId, itemStyle, handleAddProject) => {
  return array.map((project) => {
    const {id} = project;
    const key = `$outcomeCard${id}`;
    return (
      <div className={css(itemStyle)} key={key}>
        <NullableProject
          area={MEETING}
          handleAddProject={handleAddProject}
          isAgenda
          myUserId={myUserId}
          project={project}
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
    bindHotkey('p', this.handleAddProject());
  }

  handleAddProject = (content) => () => {
    const {atmosphere, teamId, agendaId} = this.props;
    const {userId} = atmosphere;
    const newProject = {
      content,
      status: ACTIVE,
      teamMemberId: `${userId}::${teamId}`,
      sortOrder: 0,
      agendaId
    };
    CreateProjectMutation(atmosphere, newProject, MEETING);
  }

  render() {
    const {atmosphere: {userId}, projects, styles} = this.props;
    return (
      <div className={css(styles.root)}>
        {makeCards(projects, userId, styles.item, this.handleAddProject)}
        {/* Input Card */}
        <div className={css(styles.item)}>
          <CreateCard
            handleAddProject={this.handleAddProject()}
            hasControls
          />
        </div>
        {/* Placeholder Cards */}
        {makePlaceholders(projects.length, styles.item)}
      </div>
    );
  }
}

MeetingAgendaCards.propTypes = {
  agendaId: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  bindHotkey: PropTypes.func,
  history: PropTypes.object.isRequired,
  projects: PropTypes.array.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string.isRequired
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
