import {sql} from 'kysely'
export const toCreditCard = (creditCard: Record<string, any> | undefined | null) => {
  if (!creditCard) return null
  return sql<string>`(select json_populate_record(null::"CreditCard", ${JSON.stringify(creditCard)}))`
}
