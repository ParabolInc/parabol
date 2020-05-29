const getDomainFromEmail = (email: string) => {
  return email.slice(email.indexOf('@') + 1)
}

export default getDomainFromEmail
