const getSSODomainFromEmail = (email: string) => {
  const match = email.match(/(?<=@)[^.]+(?=\.)/)
  return match && match[0]
}

export default getSSODomainFromEmail
