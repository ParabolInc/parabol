import getKysely from '../../../postgres/getKysely'
import {AddFeatureFlagSuccessResolvers} from '../resolverTypes'

export type AddFeatureFlagSuccessSource = {
  featureFlagId: string
}

const AddFeatureFlagSuccess: AddFeatureFlagSuccessResolvers = {
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

export default AddFeatureFlagSuccess
