import * as React from 'react';
import { observer } from 'mobx-react';
import { IComputedValue } from 'mobx';
import Container from '@material-ui/core/Container';
import { FundValues } from '../../services/fund-value-service';

const KLine = React.memo(
  ({ fundInfo }: { fundInfo: FundValues | undefined }) => (
    <Container>{fundInfo == null ? '123' : JSON.stringify(fundInfo)}</Container>
  ),
);

export function createKLine(fundInfo: IComputedValue<FundValues | undefined>) {
  return observer(() => <KLine fundInfo={fundInfo.get()} />);
}
