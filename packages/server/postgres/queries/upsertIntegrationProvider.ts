import getPg from '../getPg'
import {upsertIntegrationProviderQuery} from './generated/upsertIntegrationProviderQuery'
import {TIntegrationProvider} from './getIntegrationProvidersByIds'

type Provider = Omit<
  TIntegrationProvider,
  'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'scopeGlobal'
>
const upsertIntegrationProvider = async (provider: Provider) => {
  const result = await upsertIntegrationProviderQuery.run(provider as any, getPg())
  return result[0].id
}

export default upsertIntegrationProvider
