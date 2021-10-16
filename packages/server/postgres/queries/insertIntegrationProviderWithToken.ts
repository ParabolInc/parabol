import getPg from '../getPg'
import {
  IInsertIntegrationProviderWithTokenQueryParams,
  insertIntegrationProviderWithTokenQuery
} from './generated/insertIntegrationProviderWithTokenQuery'

// annoyingly, we can't define the SQL as:
// @provider -> (fields)
// @token -> (fields)
// as pgtyped wants to cast all of our types to strings, with no way to override them
// it's tempting to PR pgtyped to specify the types of the in params, but for now
// we'll do it this way:

type ITokenType = Omit<IInsertIntegrationProviderWithTokenQueryParams, 'provider'>

const insertIntegrationProviderWithToken = async (
  provider: IInsertIntegrationProviderWithTokenQueryParams['provider'],
  token: ITokenType
) => insertIntegrationProviderWithTokenQuery.run({provider, ...token}, getPg())

export default insertIntegrationProviderWithToken
