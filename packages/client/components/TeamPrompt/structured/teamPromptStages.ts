import sortByISO8601Date from '../../../utils/sortByISO8601Date'

export interface StructuredAnswer {
  sharedAt?: string | null
  updatedAt: string
}

export interface StructuredStage<R extends StructuredAnswer = StructuredAnswer> {
  id: string
  teamMember: {userId: string; user: {preferredName: string; picture: string}}
  responses: readonly R[]
}

export const getSharedResponses = <R extends StructuredAnswer>(responses: readonly R[]) =>
  responses.filter((response) => !!response.sharedAt)

export const getMemberSharedAt = (responses: readonly StructuredAnswer[]) =>
  responses.reduce<string | null>((earliest, {sharedAt}) => {
    if (!sharedAt) return earliest
    return !earliest || sharedAt < earliest ? sharedAt : earliest
  }, null)

export const sortTeamStages = <S extends StructuredStage>(
  stages: readonly S[],
  viewerId: string
) => {
  const others = stages.filter((stage) => stage.teamMember.userId !== viewerId)
  const shared = others
    .filter((stage) => getMemberSharedAt(stage.responses))
    .sort((a, b) =>
      sortByISO8601Date(getMemberSharedAt(a.responses)!, getMemberSharedAt(b.responses)!)
    )
  const waiting = others.filter((stage) => !getMemberSharedAt(stage.responses))
  return {shared, waiting}
}
