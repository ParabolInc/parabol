// @flow
import type {Task} from 'universal/types/task';

import {css} from 'aphrodite-local-styles/no-important';
import React, {Component} from 'react';
import withHotkey from 'react-hotkey-hoc';
import {withRouter} from 'react-router';
import CreateCard from 'universal/components/CreateCard/CreateCard';
import NullableTask from 'universal/components/NullableTask/NullableTask';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import sortOrderBetween from 'universal/dnd/sortOrderBetween';
import CreateTaskMutation from 'universal/mutations/CreateTaskMutation';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {ACTIVE, MEETING} from 'universal/utils/constants';

const makeCards = (tasks, myUserId, itemStyle, handleAddTask) => {
  return tasks.map((task) => {
    const {id} = task;
    const key = `$outcomeCard${id}`;
    return (
      <div className={css(itemStyle)} key={key}>
        <NullableTask
          area={MEETING}
          handleAddTask={handleAddTask}
          isAgenda
          myUserId={myUserId}
          task={task}
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
  tasks: Task[],
  styles: Object,
  teamId: string
};

class MeetingAgendaCards extends Component<Props> {
  componentWillMount() {
    const {bindHotkey} = this.props;
    bindHotkey('t', this.handleAddTask());
  }

  handleAddTask = (content) => () => {
    const {agendaId, atmosphere, tasks, teamId} = this.props;
    const {userId} = atmosphere;
    const maybeLastTask = tasks[tasks.length - 1];
    const sortOrder = sortOrderBetween(
      maybeLastTask, null, null, false
    );
    const newTask = {
      content,
      status: ACTIVE,
      sortOrder,
      agendaId,
      userId,
      teamId
    };
    CreateTaskMutation(atmosphere, newTask, MEETING);
  }

  render() {
    const {atmosphere: {userId}, tasks, styles} = this.props;
    return (
      <div className={css(styles.root)}>
        {makeCards(tasks, userId, styles.item, this.handleAddTask)}
        {/* Input Card */}
        <div className={css(styles.item)}>
          <CreateCard
            handleAddTask={this.handleAddTask()}
            hasControls
          />
        </div>
        {/* Placeholder Cards */}
        {makePlaceholders(tasks.length, styles.item)}
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
