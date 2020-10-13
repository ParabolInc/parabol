const getSSODomainFromEmail = (email: string) => {
  // cypress doesn't like lookaheads like /(?<=@)[^.]+(?=\.)/
  const match = email.match(/@(\w+)/)
  return match?.[1].toLowerCase() ?? null
}

export default getSSODomainFromEmail
