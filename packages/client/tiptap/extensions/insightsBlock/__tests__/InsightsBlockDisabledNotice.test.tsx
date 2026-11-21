import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {InsightsBlockDisabledNotice} from '../InsightsBlockDisabledNotice'

const renderNotice = (orgId: string | null, isOrgAdmin: boolean) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <InsightsBlockDisabledNotice orgId={orgId} isOrgAdmin={isOrgAdmin} />
    </MemoryRouter>
  )

test('says AI features are disabled by the organization', () => {
  const html = renderNotice('org1', false)
  expect(html).toContain('Your organization has disabled AI features.')
  expect(html).not.toContain('Insights are disabled')
})

test('sends an org admin to the organization settings to turn AI features back on', () => {
  const html = renderNotice('org1', true)
  expect(html).toContain('href="/me/organizations/org1/settings"')
  expect(html).toContain('Organization Settings')
  expect(html).not.toContain('/me/organizations/org1/members')
})

test('points everyone else at the org members to find an admin', () => {
  const html = renderNotice('org1', false)
  expect(html).toContain('href="/me/organizations/org1/members"')
  expect(html).toContain('org admin')
  expect(html).not.toContain('/settings')
})

test('asks a viewer outside the organization to contact an org admin without a link', () => {
  const html = renderNotice(null, false)
  expect(html).toContain('Please contact an org admin for support.')
  expect(html).not.toContain('href=')
})
