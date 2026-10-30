jest.mock('../../../utils/fetchUntrusted', () => ({fetchUntrusted: jest.fn()}))

import {fetchUntrusted} from '../../../utils/fetchUntrusted'
import {fetchZoomTranscript} from '../fetchZoomTranscript'

const mockedFetchUntrusted = fetchUntrusted as jest.MockedFunction<typeof fetchUntrusted>

describe('fetchZoomTranscript', () => {
  let warnSpy: jest.SpyInstance

  beforeAll(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterAll(() => {
    warnSpy.mockRestore()
  })

  it.each([
    'https://attacker.example/rec/download/transcript.vtt',
    'https://zoom.us.attacker.example/rec/download/transcript.vtt',
    'https://notzoom.us/rec/download/transcript.vtt',
    'http://zoom.us/rec/download/transcript.vtt',
    'file:///etc/passwd',
    'not a url'
  ])('refuses %s without a network call', async (downloadUrl) => {
    await expect(fetchZoomTranscript(downloadUrl, 'download-token')).resolves.toBeNull()
    expect(mockedFetchUntrusted).not.toHaveBeenCalled()
    expect(warnSpy).toHaveBeenCalled()
  })

  it('downloads from zoom.us with only the download token', async () => {
    mockedFetchUntrusted.mockResolvedValue({
      buffer: Buffer.from('WEBVTT'),
      contentType: 'text/vtt',
      size: 6
    })
    const downloadUrl = 'https://us06web.zoom.us/rec/webhook_download/abc/def'
    await expect(fetchZoomTranscript(downloadUrl, 'download-token')).resolves.toBe('WEBVTT')
    expect(mockedFetchUntrusted).toHaveBeenCalledWith(downloadUrl, expect.any(Number), {
      headers: {Authorization: 'Bearer download-token'},
      maxRedirects: 3
    })
  })

  it('returns null when the download fails', async () => {
    mockedFetchUntrusted.mockResolvedValue(null)
    await expect(
      fetchZoomTranscript('https://zoom.us/rec/webhook_download/abc/def', 'download-token')
    ).resolves.toBeNull()
  })
})
