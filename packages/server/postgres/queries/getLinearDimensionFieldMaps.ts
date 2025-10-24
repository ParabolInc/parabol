import getKysely from '../getKysely'

export interface LinearDimensionFieldMap {
  teamId: string
  dimensionName: string
  repoId: string
  labelTemplate: string | null
}

const getLinearDimensionFieldMaps = async (
  teamId: string,
  dimensionName: string,
  repoId: string
): Promise<LinearDimensionFieldMap | null> => {
  const pg = getKysely()
  const result = await pg
    .selectFrom('LinearDimensionFieldMap')
    .selectAll()
    .where('teamId', '=', teamId)
    .where('dimensionName', '=', dimensionName)
    .where('repoId', '=', repoId)
    .executeTakeFirst()

  return result as LinearDimensionFieldMap | null
}

export default getLinearDimensionFieldMaps
