import type {PlanBenefit} from './orgPlanDetails'

const getPlanBenefitLabel = ({title, detail}: PlanBenefit) =>
  detail ? `${title} ${detail}` : title

export default getPlanBenefitLabel
