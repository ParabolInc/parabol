import {Workflow} from '../custom'
import {embedMetadata} from './embedMetadata'
import {getSimilarRetroTopics} from './getSimilarRetroTopics'
import {relatedDiscussionsStart} from './relatedDiscussionsStart'
import {rerankRetroTopics} from './rerankRetroTopics'

export class RelatedDiscussionsWorkflow implements Workflow {
  name = 'relatedDiscussions' as const
  steps = {
    start: {
      run: relatedDiscussionsStart,
      getNextStep: () => 'embed'
    },
    embed: {
      run: embedMetadata,
      getNextStep: () => 'getSimilarRetroTopics'
    },
    getSimilarRetroTopics: {
      run: getSimilarRetroTopics,
      getNextStep: () => 'rerank'
    },
    rerank: {
      run: rerankRetroTopics
    }
  }
}
