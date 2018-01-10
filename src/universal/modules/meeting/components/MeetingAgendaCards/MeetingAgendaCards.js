// @flow
import type {Project} from 'universal/types/project';

import {css} from 'aphrodite-local-styles/no-important';
import React, {Component} from 'react';
import withHotkey from 'react-hotkey-hoc';
import {withRouter} from 'react-router';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import NullableProject from 'universal/components/NullableProject/NullableProject';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import CreateProjectMutation from 'universal/mutations/CreateProjectMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {ACTIVE, MEETING} from 'universal/utils/constants';

const makeCards = (projects, myUserId, itemStyle, handleAddProject) => {
  return projects.map((project) => {
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

type Props = {
  agendaId: string,
  atmosphere: Object, // TODO: atmosphere type
  bindHotkey: (key: string, cb: () => void) => void,
  history: Object,
  projects: Project[],
  styles: Object,
  teamId: string
};

class MeetingAgendaCards extends Component<Props> {
  componentWillMount() {
    const {bindHotkey} = this.props;
    bindHotkey('p', this.handleAddProject());
  }

  handleAddProject = (content) => () => {
    const {agendaId, atmosphere, projects, teamId} = this.props;
    const {userId} = atmosphere;
    const maybeLastProject = projects[projects.length - 1];
    const sortOrder = sortOrderBetween(
      maybeLastProject, null, null, false
    );
    const gqlArgs = {
      newProject: {
        content,
        status: ACTIVE,
        sortOrder,
        agendaId,
        userId,
        teamId
      },
      area: MEETING
    };
    CreateProjectMutation(atmosphere, gqlArgs);
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
