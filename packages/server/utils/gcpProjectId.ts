const METADATA_PROJECT_ID_URL =
  'http://metadata.google.internal/computeMetadata/v1/project/project-id'

let gcpProjectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || undefined

export const getGcpProjectId = () => gcpProjectId

export const loadGcpProjectId = async () => {
  if (gcpProjectId || !process.env.KUBERNETES_SERVICE_HOST) return
  const response = await fetch(METADATA_PROJECT_ID_URL, {
    headers: {'Metadata-Flavor': 'Google'},
    signal: AbortSignal.timeout(2000)
  }).catch(() => null)
  if (!response?.ok) return
  const projectId = await response.text().catch(() => '')
  gcpProjectId = projectId.trim() || undefined
}
