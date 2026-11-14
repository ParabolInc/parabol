const MAX_PAGE_CODE = 2 ** 32 - 1

export const isValidPageCode = (pageCode: unknown): pageCode is number =>
  typeof pageCode === 'number' &&
  Number.isInteger(pageCode) &&
  pageCode > 0 &&
  pageCode <= MAX_PAGE_CODE
