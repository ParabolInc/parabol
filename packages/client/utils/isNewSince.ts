const isNewSince = (createdAt: string, since: string | null | undefined) =>
  !!since && new Date(createdAt).getTime() > new Date(since).getTime()

export default isNewSince
