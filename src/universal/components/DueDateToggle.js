// @flow
import * as React from 'react';
import styled from 'react-emotion';
import LoadableMenu from 'universal/components/LoadableMenu';
import LoadableDueDatePicker from 'universal/components/LoadableDueDatePicker';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {shortMonths} from 'universal/utils/makeDateString';

const Toggle = styled('div')(
  {
    alignItems: 'center',
  },
  ({dueDate}) => ({
    color: dueDate && 'red',
    backgroundColor: dueDate && 'rgba(255,0,0, 0.2)',
  })
);

const DateString = styled('span')({
  marginLeft: '0.25rem',
});

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
};

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
};

type Props = {|
  task: Object
|}

const formatDueDate = (dueDate) => {
  const date = new Date(dueDate);
  const month = date.getMonth();
  const day = date.getDate();
  const monthStr = shortMonths[month];
  return `${monthStr} ${day}`;
};

class DueDateToggle extends React.Component<Props> {
  render() {
    const {task} = this.props;
    const {dueDate} = task;
    const toggle = (
      <Toggle dueDate={dueDate}>
        <FontAwesome name="clock-o" />
        {dueDate && <DateString>{formatDueDate(dueDate)}</DateString>}
      </Toggle>
    )
    return (
      <LoadableMenu
        LoadableComponent={LoadableDueDatePicker}
        maxWidth={350}
        maxHeight={300}
        originAnchor={originAnchor}
        queryVars={{
          task
        }}
        targetAnchor={targetAnchor}
        toggle={toggle}
      />
    )
  }
};

export default createFragmentContainer(
  DueDateToggle,
  graphql`
    fragment DueDateToggle_task on Task {
      dueDate
      ...DueDatePicker_task
    }
  `
);
