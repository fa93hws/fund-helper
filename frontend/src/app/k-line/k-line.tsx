import Container from '@material-ui/core/Container';
import * as React from 'react';
import { IComputedValue, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { FundValues } from '../../services/fund-value-service';
import { Plotter } from './plot/plot';
import styles from './k-line.css';

type KLineProperty = {
  onMounted: (element: HTMLDivElement) => void;
};

const KLine = React.memo(({ onMounted }: KLineProperty) => {
  return (
    <Container>
      <div ref={onMounted} className={styles.plot} />
    </Container>
  );
});

export function createKLine(values: IComputedValue<FundValues | undefined>) {
  let plotter: Plotter;
  const onMounted = (element: HTMLDivElement) => {
    plotter = new Plotter(element);
  };
  reaction(
    () => values.get(),
    (fundValues) => {
      fundValues && plotter.drawLine(fundValues);
    },
    { fireImmediately: true },
  );
  return observer(() => <KLine onMounted={onMounted} />);
}
