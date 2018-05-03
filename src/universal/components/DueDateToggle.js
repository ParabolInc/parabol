// @flow
import * as React from 'react';
import styled from 'react-emotion';
import LoadableMenu from 'universal/components/LoadableMenu';
import LoadableDueDatePicker from 'universal/components/LoadableDueDatePicker';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import {shortMonths} from 'universal/utils/makeDateString';
import ui from 'universal/styles/ui';
import StyledFontAwesome from 'universal/components/StyledFontAwesome';

const Toggle = styled('div')(
  {
    alignItems: 'center',
    borderRadius: '.125rem',
    cursor: 'pointer',
    display: 'flex',
    padding: '.0625rem .1875rem'
  },
  ({dueDate}) => ({
    color: dueDate && ui.dueDateColor,
    backgroundColor: dueDate && ui.dueDateBg
  }),
  ({isDueSoon}) => ({
    color: isDueSoon && ui.dueDateSoonColor,
    backgroundColor: isDueSoon && ui.dueDateSoonBg
  }),
  ({isPastDue}) => ({
    color: isPastDue && ui.dueDatePastColor,
    backgroundColor: isPastDue && ui.dueDatePastBg
  })
);

const DueDateIcon = styled(StyledFontAwesome)({
  fontSize: ui.iconSize
});

const DateString = styled('span')({
  marginLeft: '0.25rem'
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

const getDateDiff = (dueDate) => {
  const today = new Date();
  const date = new Date(dueDate);
  const timeDiff = date.getTime() - today.getTime();
  const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return diffDays;
};

const DueDateToggle = (props: Props) => {
  const {task} = props;
  const {dueDate} = task;
  const dateDiff = dueDate && getDateDiff(dueDate);
  const isDueSoon =  dueDate && dateDiff > -1 && dateDiff < 2;
  const isPastDue =  dueDate && dateDiff < 0;
  const toggle = (
    <Toggle dueDate={dueDate} isDueSoon={isDueSoon} isPastDue={isPastDue}>
      <DueDateIcon name="clock-o" />
      {dueDate && <DateString>{formatDueDate(dueDate)}</DateString>}
    </Toggle>
  );
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
  );
}

export default createFragmentContainer(
  DueDateToggle,
  graphql`
    fragment DueDateToggle_task on Task {
      dueDate
      ...DueDatePicker_task
    }
  `
);
