import {ENTERPRISE, PRO} from 'universal/utils/constants';

export const qualifyingTiers = [ENTERPRISE, PRO];

export const tierSupportsUpdateCheckInQuestion = (tier) => qualifyingTiers.includes(tier);
