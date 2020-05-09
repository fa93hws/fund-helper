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
        errorMessage={undefined}
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
          errorMessage={undefined}
        />,
      ),
    ).toMatchSnapshot();
  });

  it('renders header with error message', () => {
    expect(
      render(
        <Header
          idInput=""
          info={undefined}
          onIdChange={jest.fn()}
          onSubmit={jest.fn()}
          errorMessage="errorMessage"
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
        errorMessage={undefined}
      />,
    );
    component.find('input').simulate('change');
    expect(onChange).toHaveBeenCalled();
  });
});
