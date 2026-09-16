import type {DataLoaderWorker} from '../../../graphql'

const validateDimensionFieldMutation = async (
  dataLoader: DataLoaderWorker,
  meetingId: string,
  dimensionName: string
) => {
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  if (!meeting) return new Error('Invalid meetingId')
  if (meeting.meetingType !== 'poker') return new Error('Not a poker meeting')
  const templateRef = await dataLoader.get('templateRefs').loadNonNull(meeting.templateRefId)
  if (!templateRef.dimensions.some((dimension) => dimension.name === dimensionName)) {
    return new Error('Invalid dimension name')
  }
  return meeting
}

export default validateDimensionFieldMutation
