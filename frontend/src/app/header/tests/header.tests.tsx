import * as React from 'react';
import { mount, render } from 'enzyme';
import { Header } from '../header';
import type { SubjectMatterInfo } from '../../../services/subject-matter/subject-matter';

describe('Header', () => {
  it('renders header without subjectMatter info and input', () => {
    expect(
      <Header
        idInput=""
        info={undefined}
        onIdChange={jest.fn()}
        onSubmit={jest.fn()}
      />,
    ).toMatchRenderedSnapshot();
  });

  it('renders header with subjectMatter info and input', () => {
    const info: SubjectMatterInfo = {
      id: 'hanasaki',
      name: 'guming',
      type: 'crystal',
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
