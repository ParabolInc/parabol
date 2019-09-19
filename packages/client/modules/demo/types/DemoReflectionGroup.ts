import ReflectionGroup, {ReflectionGroupInput} from 'parabol-server/database/types/ReflectionGroup'
import {demoViewerId} from '../initDB'
import Reflection from 'parabol-server/database/types/Reflection'
import Task from 'parabol-server/database/types/Task'

interface Input extends ReflectionGroupInput {
  phaseItem: any
  meeting: any
  reflections: Reflection[]
  tasks: Task[]
}

export default class DemoReflectionGroup extends ReflectionGroup {
  __typename = 'RetroReflectionGroup'
  phaseItem: any
  reflectionGroupId: string
  voteCount: number
  viewerVoteCount: number
  meeting: any
  reflections: Reflection[]
  tasks: Task[]
  createdAt: any
  updatedAt: any
  titleIsUserDefined: boolean
  constructor(input: Input) {
    super(input)
    const {id, phaseItem, meeting, reflections, tasks, smartTitle, title} = input
    this.phaseItem = phaseItem
    this.reflectionGroupId = id!
    this.voteCount = this.voterIds.length
    this.viewerVoteCount = this.voterIds.filter((id) => id === demoViewerId).length
    this.meeting = meeting
    this.reflections = reflections
    this.tasks = tasks
    this.titleIsUserDefined = smartTitle !== title
  }
}
