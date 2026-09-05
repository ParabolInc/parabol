import sortByISO8601Date from '../../../utils/sortByISO8601Date'

export interface StructuredResponseSummary {
  id: string
  isShared: boolean
  sharedAt: string | null | undefined
  createdAt: string
  updatedAt: string
}

export interface StructuredStage<R extends StructuredAnswer = StructuredAnswer> {
  id: string
  teamMember: {userId: string; user: {preferredName: string; picture: string}}
  responses: readonly R[]
}

const sharedOrder = (response: StructuredResponseSummary) => response.sharedAt ?? response.createdAt

export const sortTeamStages = <S extends StructuredStage>(
  stages: readonly S[],
  viewerId: string
) => {
  const others = stages.filter((stage) => stage.teamMember.userId !== viewerId)
  const shared = others
    .filter((stage) => stage.response?.isShared)
    .sort((a, b) => sortByISO8601Date(sharedOrder(a.response!), sharedOrder(b.response!)))
  const drafting = others
    .filter((stage) => stage.response && !stage.response.isShared)
    .sort((a, b) => sortByISO8601Date(b.response!.updatedAt, a.response!.updatedAt))
  const notStarted = others.filter((stage) => !stage.response)
  return {shared, drafting, notStarted}
}
