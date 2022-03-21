/*
 The goal of a TaskIntegration is to store the smallest amount of information possible
 in order to fetch the issue from the integration.
 This includes:
   - service: the name of the integration
   - accessUserId: The user that first accessed the issue (we can use their accecss token)
  Class extensions will probably include one or more of the following:
   - tenant (cloudId, providerId, etc.)
   - repo (repoName, project, etc.)
   - issue (issueId, issueNumber, issueKey, etc.)
  As a rule of thumb, if the property isn't required to fetch the issue, don't include it
*/

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
