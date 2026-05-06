/*
WebWorkers must come from the same origin. These files are ~1.5MB, so we want to avoid
sending them from our server. So, we build them separately and reference the filenames
*/
import manifest from '../../../../../../build/workerManifest.js'

const urlCache = new Map<string, Promise<string>>()

async function getWorkerUrl(filename: string): Promise<string> {
  const cached = urlCache.get(filename)
  if (cached) return cached
  const publicPath = __PRODUCTION__ ? __webpack_public_path__ : '/static/'
  const promise = fetch(publicPath + filename)
    .then((res) => res.blob())
    .then((blob) => URL.createObjectURL(blob))
  urlCache.set(filename, promise)
  return promise
}

window.MonacoEnvironment = {
  async getWorker(_workerId: string, label: string) {
    const filename =
      label === 'json'
        ? manifest.monacoJSONWorker[0]!
        : label === 'graphql'
          ? manifest.monacoGraphQLWorker[0]!
          : manifest.monacoWorker[0]!
    const url = await getWorkerUrl(filename)
    return new Worker(url)
  }
}
