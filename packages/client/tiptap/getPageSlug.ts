import {toSlug} from '../shared/toSlug'

export const getPageSlug = (pageCode: number, title: string | null | undefined) => {
  if (!title) return `${pageCode}`
  const slug = toSlug(title)
  return slug ? `${slug}-${pageCode}` : `${pageCode}`
}
