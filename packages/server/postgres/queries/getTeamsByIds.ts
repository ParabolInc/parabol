import {getTeamsByIdsQuery, IGetTeamsByIdsQueryResult} from './generated/getTeamsByIdsQuery'
import getPg from '../getPg'
import {isNotNull} from '../../utils/predicates'
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
          cloudId: jiraDimensionField.dimensionName,
          issueKey: jiraDimensionField.issueKey,
          projectKey: jiraDimensionField.dimensionName,
          fieldName: jiraDimensionField.fieldName,
          fieldType: jiraDimensionField.dimensionName,
          fieldId: jiraDimensionField.dimensionName
        }))
    } as Team
  })
}

const getTeamsByIds = async (teamIds: string[] | readonly string[]) => {
  const teams = await getTeamsByIdsQuery.run({ids: teamIds} as any, getPg())
  return mapToTeam(teams)
}

export default getTeamsByIds
