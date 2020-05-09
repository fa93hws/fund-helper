import Container from '@material-ui/core/Container';
import * as React from 'react';
import { IComputedValue } from 'mobx';
import { observer } from 'mobx-react';
import { FundValues } from '../../services/fund-value-service';

const KLine = React.memo(({ values }: { values: FundValues | undefined }) => (
  <Container>{values == null ? '123' : JSON.stringify(values)}</Container>
));

export function createKLine(values: IComputedValue<FundValues | undefined>) {
  return observer(() => <KLine values={values.get()} />);
}
