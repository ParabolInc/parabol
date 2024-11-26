import {generateJSON} from '@tiptap/html'
import {TaskTag} from 'parabol-server/postgres/types'
import {serverTipTapExtensions} from '~/shared/tiptap/serverTipTapExtensions'

export const convertTipTapTaskContent = (text: string, tags?: TaskTag[]) => {
  let body = `<p>${text}</p>`
  if (tags) {
    tags.forEach((tag) => {
      body = body + `<span data-id=${tag} data-type="taskTag">#${tag}</span>`
    })
  }
  return JSON.stringify(generateJSON(body, serverTipTapExtensions))
}
