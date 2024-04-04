import {Workflow} from '../custom'
import {embedMetadata} from './embedMetadata'

export class EmbedWorkflow implements Workflow {
  name = 'embed' as const
  steps = {
    start: {
      run: embedMetadata
    }
  }
}
