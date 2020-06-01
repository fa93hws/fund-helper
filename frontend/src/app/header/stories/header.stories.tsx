import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { computed } from 'mobx';
import { Header, createHeader } from '../header';
import type { SubjectMatterInfo } from '../../../services/subject-matter/subject-matter';

storiesOf('app.header', module)
  .add('header (stateless)', () => {
    const info: SubjectMatterInfo = {
      id: text('显示基金ID', '320007'),
      name: text('显示基金名称', '诺安成长混合'),
      type: text('显示基金类型', '混合型'),
    };
    return (
      <Header
        idInput={text('id input', '')}
        info={info}
        onIdChange={action('id input changes')}
        onSubmit={action('submit')}
      />
    );
  })
  .add('header (stateful)', () => {
    const fetchFundValues = async (id: string) => action('fetch')(id);
    const info: SubjectMatterInfo = {
      id: text('显示基金ID', '320007'),
      name: text('显示基金名称', '诺安成长混合'),
      type: text('显示基金类型', '混合型'),
    };
    const HeaderImpl = createHeader(
      fetchFundValues,
      computed(() => ({ info, values: [] })),
    );
    return <HeaderImpl />;
  });
