/**
 * Manual end-to-end harness against a REAL Confluence Cloud site. Skipped unless env is set:
 *
 *   source docs/superpowers/spikes/.env.spike && \
 *   CONFLUENCE_SITE=$SPIKE_SITE CONFLUENCE_EMAIL=$SPIKE_EMAIL CONFLUENCE_TOKEN=$SPIKE_TOKEN \
 *   CONFLUENCE_SPACE_ID=<spaceId> pnpm test:server confluenceManualExport
 *
 * Uses site-host basic auth (API token). Once the dev 3LO app has Confluence scopes, the same
 * harness works with a bearer token by dropping the basicAuth/siteBaseUrl opts.
 */

import {ConfluenceServerManager} from '../ConfluenceServerManager'
import {kitchenSink} from '../confluence/__tests__/fixtures/kitchenSink'
import {convertTipTapToConfluenceStorage} from '../confluence/convertTipTapToConfluenceStorage'

const {CONFLUENCE_SITE, CONFLUENCE_EMAIL, CONFLUENCE_TOKEN, CONFLUENCE_SPACE_ID} = process.env
const maybe =
  CONFLUENCE_SITE && CONFLUENCE_EMAIL && CONFLUENCE_TOKEN && CONFLUENCE_SPACE_ID
    ? describe
    : describe.skip

const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQBagqQYAAAAAElFTkSuQmCC',
  'base64'
)
const TINY_PDF = Buffer.from(
  `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj
trailer<</Root 1 0 R/Size 4>>
%%EOF`,
  'utf8'
)

maybe('manual: real Confluence export', () => {
  const mgr = () =>
    new ConfluenceServerManager('', 'unused', undefined, {
      siteBaseUrl: `https://${CONFLUENCE_SITE!.replace(/^https?:\/\//, '')}`,
      basicAuth: {email: CONFLUENCE_EMAIL!, token: CONFLUENCE_TOKEN!}
    })

  it('exports the kitchen-sink golden with two attachments, twice — second gets " (2)"', async () => {
    const manager = mgr()
    const stamp = Date.now()
    const title = `manual-kitchen-sink-${stamp}`
    const {xhtml, assets} = convertTipTapToConfluenceStorage(kitchenSink, {
      parabolPageUrl: 'https://dev.parabol.co/pages/kitchen-sink-777',
      appOrigin: 'https://dev.parabol.co',
      resolvePageLink: () => null
    })
    expect(assets).toHaveLength(2)

    const first = await manager.createPageWithUniqueTitle({
      spaceId: CONFLUENCE_SPACE_ID!,
      title,
      storageValue: xhtml
    })
    expect(first.finalTitle).toBe(title)
    await manager.uploadAttachment(first.page.id, 'abc123.png', PNG_1PX, 'image/png')
    await manager.uploadAttachment(
      first.page.id,
      'quarterly-report.pdf',
      TINY_PDF,
      'application/pdf'
    )

    const second = await manager.createPageWithUniqueTitle({
      spaceId: CONFLUENCE_SPACE_ID!,
      title,
      storageValue: xhtml
    })
    expect(second.finalTitle).toBe(`${title} (2)`)

    console.log(
      `EYEBALL:\n  first:  https://${CONFLUENCE_SITE!.replace(/^https?:\/\//, '')}/wiki${first.page.webui}\n  second: https://${CONFLUENCE_SITE!.replace(/^https?:\/\//, '')}/wiki${second.page.webui}`
    )
  }, 120_000)
})
