import {FlagConversionModalPayloadResolvers} from '../resolverTypes'

export type FlagConversionModalPayloadSource =
  | {
      orgId: string
    }
  | {error: {message: string}}

const FlagConversionModalPayload: FlagConversionModalPayloadResolvers = {
  org: (source, _args, {dataLoader}) => {
    return 'orgId' in source ? dataLoader.get('organizations').load(source.orgId) : null
  }
}

export default FlagConversionModalPayload
