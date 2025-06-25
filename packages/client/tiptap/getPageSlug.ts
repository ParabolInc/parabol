import {toSlug} from '../shared/toSlug'

export const getPageSlug = (pageCode: number, title: string) => {
  const slug = toSlug(title)
  return slug ? `${slug}-${pageCode}` : `${pageCode}`
}
