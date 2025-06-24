// I write this so often when debugging that I want to just quickly import it instead
export const logQuery = (qb: any) => {
  console.log(qb.compile())
  return qb
}
