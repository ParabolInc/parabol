import {TaskServiceEnum} from './Task'

interface Input {
  accessUserId: string
  service: TaskServiceEnum
}

export default abstract class BaseTaskIntegration {
  service: TaskServiceEnum
  accessUserId: string
  constructor(input: Input) {
    const {accessUserId, service} = input
    this.accessUserId = accessUserId
    this.service = service
  }
}
