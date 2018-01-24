// @flow
/* eslint-env mocha */

import { shallow } from 'enzyme';
import React from 'react';

import Flag from '../Flag';

describe('Flag', () => {
  const Foo = () => <div>Foo!</div>;
  const Bar = () => <div>Bar!</div>;
  const Baz = () => <div>Baz!</div>;

  it('can conditionally render a single component', () => {
    // when
    let wrapper = shallow(<Flag when render={<Foo />} />);

    // then
    expect(wrapper.find(Foo)).toHaveLength(1);

    // when
    wrapper = shallow(<Flag when={false} render={<Foo />} />);

    // then
    expect(wrapper.find(Foo)).toHaveLength(0);
  });

  it('can conditionally render two components', () => {
    // when
    let wrapper = shallow(<Flag when render={<Foo />} otherwise={<Bar />} />);

    // then
    expect(wrapper.find(Foo)).toHaveLength(1);
    expect(wrapper.find(Bar)).toHaveLength(0);

    // when
    wrapper = shallow(<Flag when={false} render={<Foo />} otherwise={<Bar />} />);

    // then
    expect(wrapper.find(Foo)).toHaveLength(0);
    expect(wrapper.find(Bar)).toHaveLength(1);
  });

  it('can conditionally render an arbitrary number of components', () => {
    // given
    const switchOnVal = (val) => {
      switch (val) {
        case 'foo':
          return <Foo />;
        case 'bar':
          return <Bar />;
        case 'baz':
          return <Baz />;
        default:
          return null;
      }
    };

    // when/then
    let wrapper = shallow(<Flag when="foo" switchOnVal={switchOnVal} />);
    expect(wrapper.find(Foo)).toHaveLength(1);
    expect(wrapper.find(Bar)).toHaveLength(0);
    expect(wrapper.find(Baz)).toHaveLength(0);

    wrapper = shallow(<Flag when="bar" switchOnVal={switchOnVal} />);
    expect(wrapper.find(Foo)).toHaveLength(0);
    expect(wrapper.find(Bar)).toHaveLength(1);
    expect(wrapper.find(Baz)).toHaveLength(0);

    wrapper = shallow(<Flag when="baz" switchOnVal={switchOnVal} />);
    expect(wrapper.find(Foo)).toHaveLength(0);
    expect(wrapper.find(Bar)).toHaveLength(0);
    expect(wrapper.find(Baz)).toHaveLength(1);

    wrapper = shallow(<Flag when="hmmm" switchOnVal={switchOnVal} />);
    expect(wrapper.find(Foo)).toHaveLength(0);
    expect(wrapper.find(Bar)).toHaveLength(0);
    expect(wrapper.find(Baz)).toHaveLength(0);
  });

  it('lets you know if you called it with ambiguous arguments', () => {
    expect(
      () => shallow(<Flag when render={<Foo />} otherwise={<Bar />} switchOnVal={() => <Baz />} />)
    ).toThrow(/Must provide one of/);
  });
});
