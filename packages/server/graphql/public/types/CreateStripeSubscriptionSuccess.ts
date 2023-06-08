import {CreateStripeSubscriptionSuccessResolvers} from '../resolverTypes'

export type CreateStripeSubscriptionSuccessSource = {
  stripeSubscriptionClientSecret: string
}

const CreateStripeSubscriptionSuccess: CreateStripeSubscriptionSuccessResolvers = {
  stripeSubscriptionClientSecret: ({stripeSubscriptionClientSecret}) =>
    stripeSubscriptionClientSecret
}

export default CreateStripeSubscriptionSuccess
