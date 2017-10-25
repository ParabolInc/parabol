import {tierSupportsUpdateCheckInQuestion} from '../tierSupportsUpdateCheckInQuestion';

import {PERSONAL, PRO, ENTERPRISE} from 'universal/utils/constants';

describe('tierSupportsUpdateCheckInQuestion', () => {
  it('returns `true` for pro teams', () => {
    expect(tierSupportsUpdateCheckInQuestion(PRO)).toBe(true);
  });

  it('returns `true` for enterprise teams', () => {
    expect(tierSupportsUpdateCheckInQuestion(ENTERPRISE)).toBe(true);
  });

  it('returns `false` for personal teams', () => {
    expect(tierSupportsUpdateCheckInQuestion(PERSONAL)).toBe(false);
  });
});
