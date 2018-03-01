import toSnakeCase, {toSnakeCaseObject} from '../toSnakeCase';

describe('toSnakeCase', () => {
  it('can snake_case_string a SnakeCaseString', () => {
    expect(toSnakeCase('SnakeCaseString')).toEqual('snake_case_string');
  });
});

describe('toSnakeCaseObject', () => {
  it('can snake case the keys of an object', () => {
    const inObj = {
      tierPersonalCount: 1,
      tierProCount: 2,
      tierProBillingLeaderCount: 3
    };
    const outObj = {
      tier_personal_count: 1,
      tier_pro_count: 2,
      tier_pro_billing_leader_count: 3
    };
    expect(toSnakeCaseObject(inObj)).toEqual(outObj);
  });
});
