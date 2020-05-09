import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { Header, createHeader } from '../header';
import { HeaderStore, FundInfo } from '../header-store';
import { FundValues } from '../../../services/fund-value-service';
import { Result } from '../../../utils/result-type';

storiesOf('app.header', module)
  .add('header (stateless)', () => {
    const info: FundInfo = {
      id: text('显示基金ID', '320007'),
      name: text('显示基金名称', '诺安成长混合'),
      type: text('显示基金类型', '混合型'),
    };
    const errorMessage = text('错误信息', '');
    return (
      <Header
        idInput={text('id input', '')}
        info={info}
        onIdChange={action('id input changes')}
        onSubmit={action('submit')}
        errorMessage={errorMessage === '' ? undefined : errorMessage}
      />
    );
  })
  .add('header (stateful)', () => {
    const fakeFundValueService = {
      fetchFundValues: async (id: string) => {
        action('fetch')(id);
        return {
          kind: 'ok',
          data: {},
        } as Result<FundValues>;
      },
    };
    const store = new HeaderStore({
      fundValueService: fakeFundValueService,
      setFundInfo: action('set fund info'),
    });
    const HeaderImpl = createHeader(store);
    return <HeaderImpl />;
  });
