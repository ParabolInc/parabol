import { emailHash, getAddOrUpdateMemberPath } from '../../utils/mailchimpHelpers';

describe('mailchimp', () => {
  it('generates an md5 hash from an email', () => {
    expect(emailHash('burin@example.com')).toBe('37c9841fb76c8c7089219053056f502a');
  });

  it('generates the same md5 hash from an email, ignoring case', () => {
    expect(emailHash('burin@EXAMPLE.com')).toBe('37c9841fb76c8c7089219053056f502a');
  });

  it('generates the proper url, given a list ID and email', () => {
    const expectedPath = '/lists/123/members/37c9841fb76c8c7089219053056f502a';
    expect(getAddOrUpdateMemberPath(123, 'burin@EXAMPLE.com')).toBe(expectedPath);
  });
});
