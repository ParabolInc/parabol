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
      getNextStep: () => 'embed' as const
    },
    embed: {
      run: embedMetadata,
      getNextStep: () => 'getSimilarRetroTopics' as const
    },
    getSimilarRetroTopics: {
      run: getSimilarRetroTopics,
      getNextStep: () => 'rerank' as const
    },
    rerank: {
      run: rerankRetroTopics
    }
  }
}
