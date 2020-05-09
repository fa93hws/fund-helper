import * as React from 'react';
import { render, mount } from 'enzyme';
import { Header } from '../header';
import { FundInfo } from '../header-store';

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
    const info: FundInfo = { id: 'hanasaki', name: 'guming', type: 'crystal' };
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
