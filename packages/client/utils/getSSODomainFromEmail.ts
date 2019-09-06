const getSSODomainFromEmail = (email: string) => {
  // cypress doesn't like lookaheads like /(?<=@)[^.]+(?=\.)/
  const match = email.match(/@(\w+)/)
  return match && match[1]
}

export default getSSODomainFromEmail
