import RootDataLoader from 'parabol-server/dataloader/RootDataLoader'
import {Job} from './EmbeddingsJobQueueStream'
import {processJobEmbed} from './processJobEmbed'

export const processJob = async (job: Job, dataLoader: RootDataLoader) => {
  const {jobType} = job
  switch (jobType) {
    case 'embed':
      return processJobEmbed(job, dataLoader)
    default:
      throw new Error(`Invalid job type: ${jobType}`)
  }
}
