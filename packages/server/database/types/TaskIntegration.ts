import {TaskServiceEnum} from 'parabol-client/types/graphql'
import generateUID from '../../generateUID'
interface Input {
  service: TaskServiceEnum
}

export default class TaskIntegration {
  id = generateUID()
  service: TaskServiceEnum
  constructor(input: Input) {
    const {service} = input
    this.service = service
  }
}
