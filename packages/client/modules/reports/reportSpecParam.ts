import {parseReportSpec} from '../../shared/reports/parseReportSpec'
import type {ReportSpec} from '../../shared/reports/reportCatalog'

const toBase64Url = (text: string) => {
  const binary = Array.from(new TextEncoder().encode(text), (byte) => String.fromCharCode(byte))
  return btoa(binary.join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromBase64Url = (encoded: string) => {
  const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
}

export const encodeReportSpec = (spec: ReportSpec) => toBase64Url(JSON.stringify(spec))

// null when the address doesn't hold a spec Parabol can run, like a link cut short
export const decodeReportSpec = (param: string | null) => {
  if (!param) return null
  try {
    return parseReportSpec(JSON.parse(fromBase64Url(param))).spec
  } catch {
    return null
  }
}

export const parseReportSpecJSON = (json: string) => {
  try {
    return parseReportSpec(JSON.parse(json)).spec
  } catch {
    return null
  }
}
