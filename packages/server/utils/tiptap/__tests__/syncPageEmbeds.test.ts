import * as Y from 'yjs'
import {MAX_REVALIDATIONS_PER_LOAD, syncPageEmbeds} from '../syncPageEmbeds'

const mockResolveEmbed = jest.fn()
jest.mock('../../embed/resolveEmbed', () => ({
  EMBED_CACHE_TTL_MS: 7 * 24 * 60 * 60 * 1000,
  resolveEmbed: (url: string) => mockResolveEmbed(url)
}))

const DAY = 24 * 60 * 60 * 1000

const makeDoc = (
  embeds: {url: string; fetchedAt?: string; title?: string; embedSrc?: string}[]
) => {
  const doc = new Y.Doc()
  const frag = doc.getXmlFragment('default')
  const nodes = embeds.map((attrs) => {
    const el = new Y.XmlElement('embedBlock')
    el.setAttribute('url', attrs.url)
    el.setAttribute('displayMode', 'embed')
    el.setAttribute('align', 'center')
    el.setAttribute('aspectRatio', '16:9')
    if (attrs.fetchedAt) el.setAttribute('fetchedAt', attrs.fetchedAt)
    if (attrs.title) el.setAttribute('title', attrs.title)
    if (attrs.embedSrc) el.setAttribute('embedSrc', attrs.embedSrc)
    return el
  })
  frag.insert(0, nodes)
  return {doc, frag, nodes}
}

const fresh = () => new Date(Date.now() - DAY).toISOString()
const ancient = () => new Date(Date.now() - 90 * DAY).toISOString()

beforeEach(() => {
  mockResolveEmbed.mockReset()
})

describe('syncPageEmbeds', () => {
  it('does nothing on a document with no embeds', async () => {
    const doc = new Y.Doc()
    doc.getXmlFragment('default').insert(0, [new Y.XmlElement('paragraph')])
    await syncPageEmbeds(doc)
    expect(mockResolveEmbed).not.toHaveBeenCalled()
  })

  it('emits zero Yjs updates when every embed is fresh', async () => {
    const {doc} = makeDoc([
      {url: 'https://a.example.com/1', fetchedAt: fresh(), title: 'A'},
      {url: 'https://b.example.com/2', fetchedAt: fresh(), title: 'B'}
    ])
    const before = Y.encodeStateAsUpdate(doc)
    const updates: Uint8Array[] = []
    doc.on('update', (update: Uint8Array) => updates.push(update))

    await syncPageEmbeds(doc)

    expect(mockResolveEmbed).not.toHaveBeenCalled()
    expect(updates).toHaveLength(0)
    expect(Buffer.from(Y.encodeStateAsUpdate(doc))).toEqual(Buffer.from(before))
  })

  it('stamps fetchedAt with now, not the cached resolve time', async () => {
    // A cache hit returns the original fetchedAt. Writing that back would leave the
    // node stale forever and re-resolve on every load.
    const {doc, nodes} = makeDoc([{url: 'https://a.example.com/1', fetchedAt: ancient()}])
    mockResolveEmbed.mockResolvedValue({
      metadata: {url: 'https://a.example.com/1', title: 'Cached', fetchedAt: ancient()},
      isFallback: false
    })

    await syncPageEmbeds(doc)

    const written = Date.parse(nodes[0]!.getAttribute('fetchedAt') as string)
    expect(Date.now() - written).toBeLessThan(5000)
  })

  it('does not re-resolve on a second pass after a cache-hit refresh', async () => {
    const {doc} = makeDoc([{url: 'https://a.example.com/1', fetchedAt: ancient()}])
    mockResolveEmbed.mockResolvedValue({
      metadata: {url: 'https://a.example.com/1', title: 'Cached', fetchedAt: ancient()},
      isFallback: false
    })

    await syncPageEmbeds(doc)
    await syncPageEmbeds(doc)

    expect(mockResolveEmbed).toHaveBeenCalledTimes(1)
  })

  it('leaves content attributes untouched when a refresh returns identical metadata', async () => {
    // Only the fetchedAt clock moves. Bumping it is what stops the node from being
    // considered stale on every subsequent load.
    const {doc, nodes} = makeDoc([
      {url: 'https://a.example.com/1', fetchedAt: ancient(), title: 'Same', embedSrc: 'https://x/1'}
    ])
    mockResolveEmbed.mockResolvedValue({
      metadata: {
        url: 'https://a.example.com/1',
        title: 'Same',
        embedSrc: 'https://x/1',
        fetchedAt: ancient()
      },
      isFallback: false
    })

    await syncPageEmbeds(doc)

    expect(mockResolveEmbed).toHaveBeenCalledTimes(1)
    expect(nodes[0]!.getAttribute('title')).toBe('Same')
    expect(nodes[0]!.getAttribute('embedSrc')).toBe('https://x/1')
    expect(nodes[0]!.getAttribute('fetchedAt')).not.toBe(ancient())
  })

  it('updates a stale embed', async () => {
    const {doc, nodes} = makeDoc([
      {url: 'https://a.example.com/1', fetchedAt: ancient(), title: 'Old title'}
    ])
    mockResolveEmbed.mockResolvedValue({
      metadata: {
        url: 'https://a.example.com/1',
        title: 'New title',
        embedSrc: 'https://www.loom.com/embed/abc',
        fetchedAt: new Date().toISOString()
      },
      isFallback: false
    })

    await syncPageEmbeds(doc)

    expect(nodes[0]!.getAttribute('title')).toBe('New title')
    expect(nodes[0]!.getAttribute('embedSrc')).toBe('https://www.loom.com/embed/abc')
  })

  it('never overwrites user intent attributes', async () => {
    const {doc, nodes} = makeDoc([{url: 'https://a.example.com/1', fetchedAt: ancient()}])
    nodes[0]!.setAttribute('displayMode', 'card')
    nodes[0]!.setAttribute('align', 'left')
    nodes[0]!.setAttribute('aspectRatio', 'tall')
    nodes[0]!.setAttribute('width', '400')
    mockResolveEmbed.mockResolvedValue({
      metadata: {
        url: 'https://a.example.com/1',
        title: 'New',
        aspectRatio: '16:9',
        fetchedAt: new Date().toISOString()
      },
      isFallback: false
    })

    await syncPageEmbeds(doc)

    expect(nodes[0]!.getAttribute('displayMode')).toBe('card')
    expect(nodes[0]!.getAttribute('align')).toBe('left')
    expect(nodes[0]!.getAttribute('aspectRatio')).toBe('tall')
    expect(nodes[0]!.getAttribute('width')).toBe('400')
    expect(nodes[0]!.getAttribute('title')).toBe('New')
  })

  it('caps the number of revalidations per load', async () => {
    const many = Array.from({length: MAX_REVALIDATIONS_PER_LOAD + 7}, (_, i) => ({
      url: `https://a.example.com/${i}`,
      fetchedAt: ancient()
    }))
    const {doc} = makeDoc(many)
    mockResolveEmbed.mockImplementation(async (url: string) => ({
      metadata: {url, title: 'x', fetchedAt: new Date().toISOString()},
      isFallback: false
    }))

    await syncPageEmbeds(doc)

    expect(mockResolveEmbed).toHaveBeenCalledTimes(MAX_REVALIDATIONS_PER_LOAD)
  })

  it('preserves the snapshot when a resolve fails', async () => {
    const {doc, nodes} = makeDoc([
      {
        url: 'https://a.example.com/1',
        fetchedAt: ancient(),
        title: 'Last known good',
        embedSrc: 'https://www.loom.com/embed/abc'
      }
    ])
    mockResolveEmbed.mockResolvedValue(null)

    await syncPageEmbeds(doc)

    expect(nodes[0]!.getAttribute('title')).toBe('Last known good')
    expect(nodes[0]!.getAttribute('embedSrc')).toBe('https://www.loom.com/embed/abc')
  })

  it('preserves the snapshot when a resolve throws', async () => {
    const {doc, nodes} = makeDoc([
      {url: 'https://a.example.com/1', fetchedAt: ancient(), title: 'Last known good'}
    ])
    mockResolveEmbed.mockRejectedValue(new Error('network down'))

    await syncPageEmbeds(doc)

    expect(nodes[0]!.getAttribute('title')).toBe('Last known good')
  })

  it('clears a provider-derived attribute when a successful resolve reports it gone', async () => {
    const {doc, nodes} = makeDoc([
      {
        url: 'https://a.example.com/1',
        fetchedAt: ancient(),
        title: 'Still here',
        embedSrc: 'https://www.loom.com/embed/abc'
      }
    ])
    mockResolveEmbed.mockResolvedValue({
      metadata: {
        url: 'https://a.example.com/1',
        title: 'Still here',
        embedSrc: null,
        fetchedAt: new Date().toISOString()
      },
      isFallback: false
    })

    await syncPageEmbeds(doc)

    expect(nodes[0]!.getAttribute('embedSrc')).toBeUndefined()
    expect(nodes[0]!.getAttribute('title')).toBe('Still here')
  })

  it('preserves unreported provider-derived attributes when a resolve omits them', async () => {
    const {doc, nodes} = makeDoc([
      {url: 'https://a.example.com/1', fetchedAt: ancient(), title: 'Same title'}
    ])
    nodes[0]!.setAttribute('description', 'Original description')
    nodes[0]!.setAttribute('thumbnailUrl', 'https://x/original-thumb.png')
    mockResolveEmbed.mockResolvedValue({
      metadata: {
        url: 'https://a.example.com/1',
        title: 'Same title',
        fetchedAt: new Date().toISOString()
      },
      isFallback: false
    })

    await syncPageEmbeds(doc)

    expect(nodes[0]!.getAttribute('description')).toBe('Original description')
    expect(nodes[0]!.getAttribute('thumbnailUrl')).toBe('https://x/original-thumb.png')
  })

  it('preserves the snapshot when a resolve falls back to a synthesized hostname title', async () => {
    const {doc, nodes} = makeDoc([
      {
        url: 'https://a.example.com/1',
        fetchedAt: ancient(),
        title: 'Last known good',
        embedSrc: 'https://www.loom.com/embed/abc'
      }
    ])
    mockResolveEmbed.mockResolvedValue({
      metadata: {
        url: 'https://a.example.com/1',
        embedSrc: null,
        title: 'a.example.com',
        providerName: 'a.example.com',
        fetchedAt: new Date().toISOString()
      },
      isFallback: true
    })

    await syncPageEmbeds(doc)

    expect(nodes[0]!.getAttribute('title')).toBe('Last known good')
    expect(nodes[0]!.getAttribute('embedSrc')).toBe('https://www.loom.com/embed/abc')
  })

  it('treats an embed with no fetchedAt as stale', async () => {
    const {doc} = makeDoc([{url: 'https://a.example.com/1'}])
    mockResolveEmbed.mockResolvedValue({
      metadata: {url: 'https://a.example.com/1', title: 'x', fetchedAt: new Date().toISOString()},
      isFallback: false
    })
    await syncPageEmbeds(doc)
    expect(mockResolveEmbed).toHaveBeenCalledTimes(1)
  })

  describe('loom migration', () => {
    it('rewrites a loom node into an embedBlock', async () => {
      const doc = new Y.Doc()
      const frag = doc.getXmlFragment('default')
      const loom = new Y.XmlElement('loom')
      loom.setAttribute('src', 'https://www.loom.com/share/abc123def456')
      frag.insert(0, [loom])

      await syncPageEmbeds(doc)

      const children = frag.toArray() as Y.XmlElement[]
      expect(children).toHaveLength(1)
      expect(children[0]!.nodeName).toBe('embedBlock')
      expect(children[0]!.getAttribute('url')).toBe('https://www.loom.com/share/abc123def456')
      expect(children[0]!.getAttribute('embedSrc')).toBe('https://www.loom.com/embed/abc123def456')
      expect(children[0]!.getAttribute('providerName')).toBe('Loom')
    })

    it('preserves surrounding siblings and order', async () => {
      const doc = new Y.Doc()
      const frag = doc.getXmlFragment('default')
      const before = new Y.XmlElement('paragraph')
      const loom = new Y.XmlElement('loom')
      loom.setAttribute('src', 'https://www.loom.com/share/abc123def456')
      const after = new Y.XmlElement('heading')
      frag.insert(0, [before, loom, after])

      await syncPageEmbeds(doc)

      const names = (frag.toArray() as Y.XmlElement[]).map((el) => el.nodeName)
      expect(names).toEqual(['paragraph', 'embedBlock', 'heading'])
    })

    it('leaves a loom node with no src alone', async () => {
      const doc = new Y.Doc()
      const frag = doc.getXmlFragment('default')
      frag.insert(0, [new Y.XmlElement('loom')])

      await syncPageEmbeds(doc)

      expect((frag.toArray()[0] as Y.XmlElement).nodeName).toBe('loom')
    })
  })
})
