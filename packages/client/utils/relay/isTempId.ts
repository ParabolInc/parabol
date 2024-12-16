const isTempId = (id: string | null | undefined) => id?.endsWith('-tmp') ?? false

export default isTempId
