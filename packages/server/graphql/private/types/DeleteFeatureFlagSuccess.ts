import getKysely from '../../../postgres/getKysely'
import {DeleteFeatureFlagSuccessResolvers} from '../resolverTypes'

export type DeleteFeatureFlagSuccessSource = {
  featureFlagId: string
}

const DeleteFeatureFlagSuccess: DeleteFeatureFlagSuccessResolvers = {
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

export default DeleteFeatureFlagSuccess
