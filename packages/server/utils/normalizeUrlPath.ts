import {isLetterOnlyId} from './getErrorFingerprint'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isIdSegment = (segment: string) =>
  UUID.test(segment) || (/\d/.test(segment) && segment.length >= 4) || isLetterOnlyId(segment)

const decodeSegment = (segment: string) => {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

const normalizeUrlPath = (path: string) =>
  path
    .split('/')
    .map((segment) => (isIdSegment(decodeSegment(segment)) ? ':id' : segment))
    .join('/')

export default normalizeUrlPath
