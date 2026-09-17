import sortByISO8601Date from '../../../utils/sortByISO8601Date'

export interface StructuredResponseSummary {
  id: string
  isShared: boolean
  sharedAt: string | null | undefined
  updatedAt: string
  answeredPromptIds: readonly string[]
}

export interface StructuredStage<R extends StructuredResponseSummary = StructuredResponseSummary> {
  id: string
  teamMember: {userId: string; user: {preferredName: string; picture: string}}
  response: R | null | undefined
}

export const sortTeamStages = <S extends StructuredStage>(
  stages: readonly S[],
  viewerId: string
) => {
  const others = stages.filter((stage) => stage.teamMember.userId !== viewerId)
  const shared = others
    .filter((stage) => stage.response?.isShared)
    .sort((a, b) => sortByISO8601Date(a.response!.sharedAt!, b.response!.sharedAt!))
  const drafting = others
    .filter((stage) => stage.response && !stage.response.isShared)
    .sort((a, b) => sortByISO8601Date(b.response!.updatedAt, a.response!.updatedAt))
  const notStarted = others.filter((stage) => !stage.response)
  return {shared, drafting, notStarted}
}
