const getEventIdFromTempId = (tempId: string) => parseInt(tempId.split('-')[1])

export default getEventIdFromTempId
