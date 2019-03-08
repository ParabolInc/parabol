const isTempId = (id: any) => (id ? id.endsWith('-tmp') : false)

export default isTempId
