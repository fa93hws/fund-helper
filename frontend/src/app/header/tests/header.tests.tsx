import * as React from 'react';
import { mount, render } from 'enzyme';
import { Header } from '../header';
import type { FundBasicInfoCN } from '../../../services/fund-cn/fund-cn.proto';
import { FundTypeCN } from '../../../services/fund-cn/fund-cn.proto';

describe('Header', () => {
  it('renders header without fund info and input', () => {
    expect(
      <Header
        idInput=""
        info={undefined}
        onIdChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    ).toMatchRenderedSnapshot();
  });

  it('renders header with fund info and input', () => {
    const info: FundBasicInfoCN = {
      id: 'hanasaki',
      name: 'guming',
      type: FundTypeCN.混合,
    };
    expect(
      render(
        <Header
          idInput="cwx"
          info={info}
          onIdChange={jest.fn()}
          onSubmit={jest.fn()}
        />,
      ),
    ).toMatchSnapshot();
  });

  it('triggers onchange when text change', () => {
    const onChange = jest.fn();
    const component = mount(
      <Header
        idInput=""
        info={undefined}
        onIdChange={onChange}
        onSubmit={jest.fn()}
      />,
    );
    component.find('input').simulate('change');
    expect(onChange).toHaveBeenCalled();
  });
});
