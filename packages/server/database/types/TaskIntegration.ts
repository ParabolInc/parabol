import generateUID from '../../generateUID'
import {TaskServiceEnum} from './Task'

interface Input {
  accessUserId: string
  service: TaskServiceEnum
}

export default class TaskIntegration {
  id = generateUID()
  service: TaskServiceEnum
  accessUserId: string
  constructor(input: Input) {
    const {accessUserId, service} = input
    this.accessUserId = accessUserId
    this.service = service
  }
}
