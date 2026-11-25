import {filetypeinfo} from 'magic-bytes.js'
import {z} from 'zod'
import defineTool from '../defineTool'
import runGraphQL from '../runGraphQL'
import {writeAnnotations} from '../toolAnnotations'
import toolError from '../toolError'
import toolResult from '../toolResult'

const MAX_IMAGE_BYTES = 3_000_000

const UPLOAD_USER_ASSET = `
  mutation UploadUserAsset($file: File!, $scope: AssetScopeEnum!, $scopeKey: ID!) {
    uploadUserAsset(file: $file, scope: $scope, scopeKey: $scopeKey) {
      url
      name
      type
      size
    }
  }
`

export default defineTool({
  name: 'upload_image',
  title: 'Upload an image',
  description: `Upload a PNG, JPEG, GIF or WebP image, at most ${MAX_IMAGE_BYTES.toLocaleString('en-US')} bytes, and get back its URL to put in a page or task. scope says who can see it: User (only you; scopeKey is your user id), Team (the team; scopeKey is its teamId) or Page (anyone who can read the page; scopeKey is its pageId). Needs users:write, teams:write or pages:write to match the scope.`,
  inputSchema: z.object({
    filename: z.string().min(1).describe('The file name, such as diagram.png'),
    mimeType: z
      .enum(['image/png', 'image/jpeg', 'image/gif', 'image/webp'])
      .describe('The image type, which must match the bytes'),
    base64: z.string().describe('The image bytes, base64 encoded'),
    scope: z.enum(['User', 'Team', 'Page']).describe('Who can see the image'),
    scopeKey: z.string().describe('The user id, teamId or pageId the scope names')
  }),
  annotations: writeAnnotations,
  run: async (context, {filename, mimeType, base64, scope, scopeKey}) => {
    const bytes = Buffer.from(base64, 'base64')
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) {
      return toolError(
        `The image must be between 1 and ${MAX_IMAGE_BYTES} bytes once decoded.`,
        'BAD_USER_INPUT'
      )
    }
    if (!filetypeinfo(bytes).some(({mime}) => mime === mimeType)) {
      return toolError(`The bytes are not a ${mimeType} image.`, 'BAD_USER_INPUT')
    }
    const file = new File([bytes], filename, {type: mimeType})
    return toolResult(
      await runGraphQL(context, UPLOAD_USER_ASSET, {scope, scopeKey}, undefined, {file})
    )
  }
})
