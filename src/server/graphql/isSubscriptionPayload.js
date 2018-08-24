const isSubscriptionPayload = (payload) => payload.query.startsWith('subscription')

export default isSubscriptionPayload
