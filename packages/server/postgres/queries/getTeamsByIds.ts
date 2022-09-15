import {isNotNull} from 'parabol-client/utils/predicates'
import getPg from '../getPg'
import {getTeamsByIdsQuery, IGetTeamsByIdsQueryResult} from './generated/getTeamsByIdsQuery'
import {IGetTeamsByOrgIdsQueryResult} from './generated/getTeamsByOrgIdsQuery'

export interface JiraDimensionField {
  dimensionName: string
  cloudId: string
  issueKey: string
  projectKey: string
  fieldName: string
  fieldType: 'string' | 'number'
  fieldId: string
}

export interface Team extends Omit<IGetTeamsByIdsQueryResult, 'jiraDimensionFields'> {
  jiraDimensionFields: JiraDimensionField[]
}

export const mapToTeam = (result: IGetTeamsByIdsQueryResult[] | IGetTeamsByOrgIdsQueryResult[]) => {
  return result.map((team) => {
    return {
      ...team,
      jiraDimensionFields: team.jiraDimensionFields
        .filter(isNotNull)
        .map((jiraDimensionField: any) => ({
          dimensionName: jiraDimensionField.dimensionName,
          cloudId: jiraDimensionField.cloudId,
          projectKey: jiraDimensionField.projectKey,
          issueKey: jiraDimensionField.issueKey,
          fieldName: jiraDimensionField.fieldName,
          fieldType: jiraDimensionField.fieldType,
          fieldId: jiraDimensionField.fieldId
        }))
    } as Team
  })
}

const getTeamsByIds = async (teamIds: string[] | readonly string[]) => {
  const teams = await getTeamsByIdsQuery.run({ids: teamIds} as any, getPg())
  return mapToTeam(teams)
}

export default getTeamsByIds
