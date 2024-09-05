import getKysely from '../../../postgres/getKysely'
import {UpdateFeatureFlagSuccessResolvers} from '../resolverTypes'

export type UpdateFeatureFlagSuccessSource = {
  featureFlagId: string
}

const UpdateFeatureFlagSuccess: UpdateFeatureFlagSuccessResolvers = {
  featureFlag: async (source, _args, {dataLoader}) => {
    const pg = getKysely()
    const flag = await pg
      .selectFrom('FeatureFlag')
      .where('id', '=', source.featureFlagId)
      .selectAll()
      .executeTakeFirst()
    return flag
  }
}

export default UpdateFeatureFlagSuccess
