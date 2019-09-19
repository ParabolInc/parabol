import Reflection, {ReflectionInput} from 'parabol-server/database/types/Reflection'
import {demoViewerId} from '../initDB'
import DemoReflectionGroup from './DemoReflectionGroup'

interface Input extends ReflectionInput {
  phaseItem: any
  retroReflectionGroup?: DemoReflectionGroup
}

export default class DemoReflection extends Reflection {
  __typename = 'RetroReflection'
  isHumanTouched = false
  phaseItem: any
  reflectionId: string
  editorIds: string[] = []
  isViewerCreator: boolean
  retroReflectionGroup!: DemoReflectionGroup
  createdAt: any
  updatedAt: any
  constructor(input: Input) {
    super(input)
    const {id,creatorId, phaseItem} = input
    this.phaseItem = phaseItem
    this.reflectionId = id!
    this.isViewerCreator = creatorId === demoViewerId
    this.entities = []
  }
}
