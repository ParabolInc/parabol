jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

import type {IntegrationMeta} from '../../../shared/integrations/IntegrationMeta'
import type {ClientIntegrationDefinition} from '../ClientIntegrationDefinition'
import {
  clientIntegrations,
  isTaskClientIntegration,
  type RegisteredClientIntegration
} from '../registry'

type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

const entries = Object.entries<ClientIntegrationDefinition>(clientIntegrations)

it('the client registry covers exactly the IntegrationMeta services', () => {
  const inSync: MutuallyAssignable<RegisteredClientIntegration, IntegrationMeta['service']> = true
  expect(inSync).toBe(true)
})

it('every registered integration ships its own settings-row logo asset', () => {
  const sources = entries.map(([, definition]) => definition.logo.src)
  sources.forEach((src) => expect(src).toBeTruthy())
  expect(new Set(sources).size).toBe(sources.length)
})

describe.each(entries)('%s conformance', (key, definition) => {
  it('matches its registry key and its shared IntegrationMeta', async () => {
    const metaModule = await import(`../../${key}/shared/${key}IntegrationMeta`)
    const meta: IntegrationMeta = metaModule[`${key}IntegrationMeta`]
    expect(definition.service).toBe(key)
    expect({
      service: definition.service,
      title: definition.title,
      description: definition.description
    }).toEqual(meta)
  })

  it('ships a scoping results component exactly when it is a task service', () => {
    expect(definition.capabilities.scoping?.Results instanceof Function).toBe(
      isTaskClientIntegration(definition.service)
    )
  })

  it('ships a retro work drawer tab', () => {
    expect(definition.capabilities.workDrawer?.Panel).toBeTruthy()
  })
})
