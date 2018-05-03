// @flow
import * as React from 'react';
import DayPicker from 'react-day-picker';
import 'universal/styles/daypicker.css';
import UpdateTaskDueDateMutation from 'universal/mutations/UpdateTaskDueDateMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {createFragmentContainer} from 'react-relay';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import {DueDatePicker_task as Task} from './__generated__/DueDatePicker_task.graphql';
import styled from 'react-emotion';

type Props = {|
  Atmosphere: Object,
  task: Task,
  ...MutationProps
|}

const PickerTitle = styled('div')({
  width: '100%',
  textAlign: 'center'
});
class DueDatePicker extends React.Component<Props> {
  handleDayClick = (day, {selected}) => {
    const {atmosphere, closePortal, task: {taskId}, submitMutation, onCompleted, onError} = this.props;
    submitMutation();
    const dueDate = selected ? null : day;
    UpdateTaskDueDateMutation(atmosphere, {taskId, dueDate}, onCompleted, onError);
    closePortal();
  };

  render() {
    const {task: {dueDate}} = this.props;
    const selectedDate = dueDate && new Date(dueDate);
    return (
      <React.Fragment>
        <PickerTitle>Change Due Date</PickerTitle>
        <DayPicker onDayClick={this.handleDayClick} selectedDays={selectedDate} />
      </React.Fragment>
    );
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(DueDatePicker)),
  graphql`
    fragment DueDatePicker_task on Task {
      taskId: id
      dueDate
    }
  `
);
