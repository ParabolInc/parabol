import {isAllowedEmbedHost, resolveCuratedEmbed} from '../curatedEmbedProviders'

describe('resolveCuratedEmbed', () => {
  it('returns null for an unknown provider', () => {
    expect(resolveCuratedEmbed('https://example.com/blog/post')).toBe(null)
  })

  it('returns null for a non-http url', () => {
    expect(resolveCuratedEmbed('javascript:alert(1)')).toBe(null)
  })

  describe('youtube', () => {
    it('handles a watch url', () => {
      expect(resolveCuratedEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toMatchObject({
        embedSrc: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        providerName: 'YouTube',
        aspectRatio: '16:9'
      })
    })

    it('handles a youtu.be short url', () => {
      expect(resolveCuratedEmbed('https://youtu.be/dQw4w9WgXcQ')?.embedSrc).toBe(
        'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
      )
    })

    it('handles a shorts url', () => {
      expect(resolveCuratedEmbed('https://www.youtube.com/shorts/abc123XYZ_-')?.embedSrc).toBe(
        'https://www.youtube-nocookie.com/embed/abc123XYZ_-'
      )
    })

    it('handles a live url', () => {
      expect(resolveCuratedEmbed('https://www.youtube.com/live/abc123XYZ_-')?.embedSrc).toBe(
        'https://www.youtube-nocookie.com/embed/abc123XYZ_-'
      )
    })

    it('carries a start time through as a query param', () => {
      expect(
        resolveCuratedEmbed('https://www.youtube.com/watch?v=abc123XYZ_-&t=90')?.embedSrc
      ).toBe('https://www.youtube-nocookie.com/embed/abc123XYZ_-?start=90')
    })

    it('rejects a watch url with no video id', () => {
      expect(resolveCuratedEmbed('https://www.youtube.com/watch')).toBe(null)
    })

    it('rejects a video id with unexpected characters', () => {
      expect(resolveCuratedEmbed('https://www.youtube.com/watch?v=../../evil')).toBe(null)
    })
  })

  describe('loom', () => {
    it('handles a share url', () => {
      expect(resolveCuratedEmbed('https://www.loom.com/share/abc123def456')).toMatchObject({
        embedSrc: 'https://www.loom.com/embed/abc123def456',
        providerName: 'Loom'
      })
    })

    it('handles a share url with query noise', () => {
      expect(resolveCuratedEmbed('https://loom.com/share/abc123def456?sid=xyz')?.embedSrc).toBe(
        'https://www.loom.com/embed/abc123def456'
      )
    })
  })

  describe('vimeo', () => {
    it('handles a numeric video url', () => {
      expect(resolveCuratedEmbed('https://vimeo.com/123456789')?.embedSrc).toBe(
        'https://player.vimeo.com/video/123456789'
      )
    })

    it('ignores a non-numeric path', () => {
      expect(resolveCuratedEmbed('https://vimeo.com/channels/staffpicks')).toBe(null)
    })
  })

  describe('google', () => {
    it('maps a doc edit url to preview', () => {
      expect(
        resolveCuratedEmbed('https://docs.google.com/document/d/ABC_123/edit?usp=sharing')
      ).toMatchObject({
        embedSrc: 'https://docs.google.com/document/d/ABC_123/preview',
        providerName: 'Google Docs',
        aspectRatio: '4:3'
      })
    })

    it('maps a sheet to preview', () => {
      expect(
        resolveCuratedEmbed('https://docs.google.com/spreadsheets/d/ABC_123/edit#gid=0')?.embedSrc
      ).toBe('https://docs.google.com/spreadsheets/d/ABC_123/preview')
    })

    it('maps slides to embed', () => {
      expect(
        resolveCuratedEmbed('https://docs.google.com/presentation/d/ABC_123/edit')?.embedSrc
      ).toBe('https://docs.google.com/presentation/d/ABC_123/embed')
    })

    it('maps a form to an embedded viewform', () => {
      expect(
        resolveCuratedEmbed('https://docs.google.com/forms/d/e/ABC_123/viewform')?.embedSrc
      ).toBe('https://docs.google.com/forms/d/e/ABC_123/viewform?embedded=true')
    })

    it('ignores a google url that is not a document', () => {
      expect(resolveCuratedEmbed('https://docs.google.com/')).toBe(null)
    })
  })

  describe('figma', () => {
    it('wraps a design url in the embed endpoint', () => {
      const result = resolveCuratedEmbed('https://www.figma.com/design/AbC123/My-File')
      expect(result?.embedSrc).toBe(
        'https://www.figma.com/embed?embed_host=parabol&url=https%3A%2F%2Fwww.figma.com%2Fdesign%2FAbC123%2FMy-File'
      )
      expect(result?.providerName).toBe('Figma')
    })
  })

  describe('miro', () => {
    it('maps a board to the live embed', () => {
      expect(resolveCuratedEmbed('https://miro.com/app/board/uXjVK123=/')?.embedSrc).toBe(
        'https://miro.com/app/live-embed/uXjVK123='
      )
    })
  })

  describe('codepen', () => {
    it('maps a pen to the embed path', () => {
      expect(resolveCuratedEmbed('https://codepen.io/someuser/pen/abcXYZ')?.embedSrc).toBe(
        'https://codepen.io/someuser/embed/abcXYZ'
      )
    })
  })

  describe('spotify', () => {
    it('maps a track', () => {
      expect(resolveCuratedEmbed('https://open.spotify.com/track/abc123')?.embedSrc).toBe(
        'https://open.spotify.com/embed/track/abc123'
      )
    })

    it('maps a playlist', () => {
      expect(resolveCuratedEmbed('https://open.spotify.com/playlist/abc123')?.embedSrc).toBe(
        'https://open.spotify.com/embed/playlist/abc123'
      )
    })

    it('ignores an unsupported spotify path', () => {
      expect(resolveCuratedEmbed('https://open.spotify.com/user/someone')).toBe(null)
    })
  })
})

describe('isAllowedEmbedHost', () => {
  it('accepts an exact allowlisted host', () => {
    expect(isAllowedEmbedHost('https://www.loom.com/embed/abc')).toBe(true)
  })

  it('accepts a subdomain of an allowlisted host', () => {
    expect(isAllowedEmbedHost('https://player.vimeo.com/video/1')).toBe(true)
  })

  it('rejects an arbitrary host', () => {
    expect(isAllowedEmbedHost('https://evil.example.com/x')).toBe(false)
  })

  it('rejects a lookalike suffix attack', () => {
    expect(isAllowedEmbedHost('https://notloom.com/embed/abc')).toBe(false)
    expect(isAllowedEmbedHost('https://www.loom.com.evil.co/embed/abc')).toBe(false)
  })

  it('rejects http even on an allowlisted host', () => {
    expect(isAllowedEmbedHost('http://www.loom.com/embed/abc')).toBe(false)
  })

  it('rejects javascript urls', () => {
    expect(isAllowedEmbedHost('javascript:alert(1)')).toBe(false)
  })

  it('rejects unparseable input', () => {
    expect(isAllowedEmbedHost('')).toBe(false)
    expect(isAllowedEmbedHost('not a url')).toBe(false)
  })

  it('accepts every embedSrc the curated table can produce', () => {
    const samples = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.loom.com/share/abc123def456',
      'https://vimeo.com/123456789',
      'https://docs.google.com/document/d/ABC_123/edit',
      'https://www.figma.com/design/AbC123/My-File',
      'https://miro.com/app/board/uXjVK123=/',
      'https://codepen.io/someuser/pen/abcXYZ',
      'https://open.spotify.com/track/abc123'
    ]
    for (const sample of samples) {
      const result = resolveCuratedEmbed(sample)
      expect(result).not.toBe(null)
      expect(isAllowedEmbedHost(result!.embedSrc)).toBe(true)
    }
  })
})
