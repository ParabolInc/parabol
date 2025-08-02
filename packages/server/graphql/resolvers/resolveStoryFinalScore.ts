import type {DataLoaderInstance} from '../../dataloader/RootDataLoader'

export const resolveStoryFinalScore = async (
  taskId: string,
  meetingId: string,
  dimensionRefIdx: number,
  dataLoader: DataLoaderInstance
) => {
  const [meeting, estimates] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('meetingTaskEstimates').load({taskId, meetingId})
  ])
  if (meeting.meetingType !== 'poker') return null
  const {templateRefId} = meeting
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(templateRefId)
  const {dimensions} = templateRef
  const dimensionRef = dimensions[dimensionRefIdx]!
  const {name: dimensionName} = dimensionRef
  const dimensionEstimate = estimates.find((estimate) => estimate.name === dimensionName)
  return dimensionEstimate?.label ?? null
}
