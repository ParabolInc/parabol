// @flow
import * as React from 'react';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import UpdateTaskDueDateMutation from 'universal/mutations/UpdateTaskDueDateMutation';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';
import withMutationProps from 'universal/utils/relay/withMutationProps';
import {createFragmentContainer} from 'react-relay';
import type {MutationProps} from 'universal/utils/relay/withMutationProps';
import {DueDatePicker_task as Task} from './__generated__/DueDatePicker_task.graphql';

type Props = {|
  Atmosphere: Object,
  task: Task,
  ...MutationProps
|}

class DueDatePicker extends React.Component<Props> {
  handleDayClick = (day, {selected}) => {
    const {atmosphere, task: {taskId}, submitMutation, onCompleted, onError} = this.props;
    submitMutation();
    const dueDate = selected ? null : day;
    UpdateTaskDueDateMutation(atmosphere, {taskId, dueDate}, onCompleted, onError);
  };

  render() {
    const {task: {dueDate}} = this.props;
    console.log(this.props.task)
    const selectedDate = dueDate && new Date(dueDate);
    return (
      <DayPicker onDayClick={this.handleDayClick} selectedDays={selectedDate} />
    );
  }
};

export default createFragmentContainer(
  withAtmosphere(withMutationProps(DueDatePicker)),
  graphql`
    fragment DueDatePicker_task on Task {
      taskId: id
      dueDate
    }
  `
);
