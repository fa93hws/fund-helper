import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { ResultKind, ResultType } from '../../../services/fund-value-service';
import { Header, createHeader } from '../header';
import { FundInfo } from '../header-store';

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
          kind: ResultKind.OK,
          data: [],
        } as ResultType;
      },
    };
    const HeaderImpl = createHeader(fakeFundValueService);
    return <HeaderImpl />;
  });
