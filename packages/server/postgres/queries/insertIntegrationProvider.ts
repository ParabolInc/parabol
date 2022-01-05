import getPg from '../getPg'
import {insertIntegrationProviderQuery} from './generated/insertIntegrationProviderQuery'
import {TIntegrationProvider} from './getIntegrationProvidersByIds'

type Provider = Omit<
  TIntegrationProvider,
  'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'scopeGlobal'
>
const insertIntegrationProvider = async (provider: Provider) => {
  const result = await insertIntegrationProviderQuery.run(provider as any, getPg())
  return result[0].id
}

export default insertIntegrationProvider
