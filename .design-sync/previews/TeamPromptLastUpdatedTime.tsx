import {TeamPromptLastUpdatedTime} from 'parabol-client'

const twoHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString()

export const Posted = () => (
  <TeamPromptLastUpdatedTime createdAt={twoHoursAgo} updatedAt={twoHoursAgo} />
)

export const Edited = () => (
  <TeamPromptLastUpdatedTime createdAt={twoHoursAgo} updatedAt={oneHourAgo} />
)
