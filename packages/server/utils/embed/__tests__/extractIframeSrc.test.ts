import {extractIframeSrc} from '../extractIframeSrc'

describe('extractIframeSrc', () => {
  it('pulls the src out of a youtube style embed', () => {
    const html =
      '<iframe width="480" height="270" src="https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed" frameborder="0" allowfullscreen></iframe>'
    expect(extractIframeSrc(html)).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?feature=oembed')
  })

  it('handles single quoted attributes', () => {
    const html = "<iframe src='https://player.vimeo.com/video/123'></iframe>"
    expect(extractIframeSrc(html)).toBe('https://player.vimeo.com/video/123')
  })

  it('handles attributes before src', () => {
    const html =
      '<iframe class="x" data-a="b" src="https://www.loom.com/embed/abc" allowfullscreen></iframe>'
    expect(extractIframeSrc(html)).toBe('https://www.loom.com/embed/abc')
  })

  it('decodes html entities in the src', () => {
    const html = '<iframe src="https://open.spotify.com/embed/track/1?a=1&amp;b=2"></iframe>'
    expect(extractIframeSrc(html)).toBe('https://open.spotify.com/embed/track/1?a=1&b=2')
  })

  it('returns null when there is no iframe', () => {
    const html =
      '<blockquote class="twitter-tweet"><p>hi</p></blockquote><script src="https://platform.twitter.com/widgets.js"></script>'
    expect(extractIframeSrc(html)).toBe(null)
  })

  it('returns null for an http src', () => {
    expect(extractIframeSrc('<iframe src="http://www.loom.com/embed/abc"></iframe>')).toBe(null)
  })

  it('returns null for a src on a host that is not allowlisted', () => {
    expect(extractIframeSrc('<iframe src="https://evil.example.com/x"></iframe>')).toBe(null)
  })

  it('returns null for a javascript src', () => {
    expect(extractIframeSrc('<iframe src="javascript:alert(1)"></iframe>')).toBe(null)
  })

  it('returns null for a protocol-relative src', () => {
    expect(extractIframeSrc('<iframe src="//www.loom.com/embed/abc"></iframe>')).toBe(null)
  })

  it('returns null for a data uri src', () => {
    expect(extractIframeSrc('<iframe src="data:text/html;base64,PHNjcmlwdD4="></iframe>')).toBe(
      null
    )
  })

  it('returns null on empty input', () => {
    expect(extractIframeSrc('')).toBe(null)
    expect(extractIframeSrc('   ')).toBe(null)
  })

  it('ignores a script tag that precedes the iframe', () => {
    const html = '<script>window.x=1</script><iframe src="https://www.loom.com/embed/abc"></iframe>'
    expect(extractIframeSrc(html)).toBe('https://www.loom.com/embed/abc')
  })
})
