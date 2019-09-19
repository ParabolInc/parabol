import Task, {TaskInput} from 'parabol-server/database/types/Task'

interface Input extends TaskInput {
  assignee: any
}

export default class DemoTask extends Task {
  __typename = 'Task'
  assignee: any
  constructor(input: Input) {
    super(input)
    const {assignee} = input
    this.assignee = assignee
  }
}
