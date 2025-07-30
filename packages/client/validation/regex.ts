export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const urlRegex = /https?:\/\/[^<>\s]*\b/g
export const idRegex = /^[a-zA-Z0-9\-_|:]{5,70}$/
export const compositeIdRegex = /^[a-zA-Z0-9\-_|]{5,35}::[a-zA-Z0-9\-_|]{5,35}$/
export const domainRegex =
  /^((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,})$/

export const domainWithWildcardRegex = /^(\*\.)?([\w-]+\.)+[\w-]+$/
