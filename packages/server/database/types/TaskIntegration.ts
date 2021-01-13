import {TaskServiceEnum} from 'parabol-client/types/graphql'
import shortid from 'shortid'

interface Input {
  service: TaskServiceEnum
}

export default class TaskIntegration {
  id = shortid.generate()
  service: TaskServiceEnum
  constructor(input: Input) {
    const {service} = input
    this.service = service
  }
}
