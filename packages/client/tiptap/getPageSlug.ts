import {toSlug} from '../shared/toSlug'

export const getPageSlug = (clientPageNum: number, title: string) => {
  const slug = toSlug(title)
  return slug ? `${slug}-${clientPageNum}` : `${clientPageNum}`
}
