import Container from '@material-ui/core/Container';
import * as React from 'react';
import { IComputedValue, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { FundValueWithInfoCN } from '../../services/fund-cn/fund-cn.proto';
import { Plotter, Markup } from './plot/plot';
import styles from './k-line.css';

type KLineProperty = {
  onMounted: (element: HTMLDivElement) => void;
};

const KLine = React.memo(({ onMounted }: KLineProperty) => {
  return (
    <Container className={styles.container}>
      <div ref={onMounted} className={styles.plot} />
    </Container>
  );
});

export function createKLine(
  values: IComputedValue<FundValueWithInfoCN | undefined>,
  makrups: IComputedValue<Markup[]>,
) {
  let plotter: Plotter;
  const onMounted = (element: HTMLDivElement) => {
    plotter = new Plotter(element);
  };
  reaction(
    () => ({ fundValues: values.get(), plotMarkups: makrups.get() }),
    ({ fundValues, plotMarkups }) => {
      fundValues && plotter.drawLine(fundValues, plotMarkups);
    },
    { fireImmediately: true },
  );
  return observer(() => <KLine onMounted={onMounted} />);
}
