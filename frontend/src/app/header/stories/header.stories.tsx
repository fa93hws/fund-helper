import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { computed } from 'mobx';
import { Header, createHeader } from '../header';
import { FundBasicInfoCN } from '../../../services/fund-cn/fund-cn.proto';

storiesOf('app.header', module)
  .add('header (stateless)', () => {
    const info: FundBasicInfoCN = {
      id: text('显示基金ID', '320007'),
      name: text('显示基金名称', '诺安成长混合'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: text('显示基金类型', '混合型') as any,
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
    const info: FundBasicInfoCN = {
      id: text('显示基金ID', '320007'),
      name: text('显示基金名称', '诺安成长混合'),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: text('显示基金类型', '混合型') as any,
    };
    const HeaderImpl = createHeader(
      fetchFundValues,
      computed(() => info),
    );
    return <HeaderImpl />;
  });
