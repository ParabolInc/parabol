import {shouldRefreshMetadata} from '../shouldRefreshMetadata'

const getMetadata = (attributes: string = '') => {
  return `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:attr="urn:oasis:names:tc:SAML:metadata:attribute" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" entityID="url_to_idp_metadata" ${attributes}>
</md:EntityDescriptor>
`
}

test('Should not refresh without validUntil or cacheDuration', async () => {
  const metadata = getMetadata()
  const doc = {
    metadata,
    updatedAt: new Date()
  }
  expect(shouldRefreshMetadata(doc)).toBe(false)
})

test('Should refresh with validUntill less than a month', async () => {
  const now = new Date()
  const metadata = getMetadata(`validUntil="${now.toISOString()}"`)
  const doc = {
    metadata,
    updatedAt: new Date()
  }
  expect(shouldRefreshMetadata(doc)).toBe(true)
})

test('Should not refresh with validUntill more than a month', async () => {
  const future = new Date()
  future.setMonth(future.getMonth() + 2)
  const metadata = getMetadata(`validUntil="${future.toISOString()}"`)
  const doc = {
    metadata,
    updatedAt: new Date()
  }
  expect(shouldRefreshMetadata(doc)).toBe(false)
})

test('Should not refresh with cacheDuration not expired', async () => {
  const metadata = getMetadata('cacheDuration="PT86400S"')
  const doc = {
    metadata,
    updatedAt: new Date()
  }
  expect(shouldRefreshMetadata(doc)).toBe(false)
})

test('Should refresh with cacheDuration expired', async () => {
  const past = new Date()
  past.setDate(past.getDate() - 2)
  const metadata = getMetadata('cacheDuration="PT86400S"')
  const doc = {
    metadata,
    updatedAt: past
  }
  expect(shouldRefreshMetadata(doc)).toBe(true)
})
