import { ECharts, init, EChartOption } from 'echarts';
import type { FundValueWithInfoCN } from '../../../services/fund-cn/fund-cn.proto';

type LineData = {
  data: [string, number][];
  title: string;
};

export type Markup = {
  text: string;
  backgroundColor: string;
  coord: [Date, number];
};

export class Plotter {
  private readonly chart: ECharts;

  constructor(container: HTMLDivElement) {
    this.chart = init(container);
  }

  private convertData({ values, info }: FundValueWithInfoCN): LineData {
    const data = values.reduce<[string, number][]>((acc, cur) => {
      acc.push([cur.time.toISOString(), cur.value]);
      return acc;
    }, []);
    return {
      data,
      title: `${info.name}@${info.id} (${info.type})`,
    };
  }

  private convertMarkup(
    markups: Markup[],
  ): EChartOption.SeriesLine['markPoint'] {
    const data = markups.map((m) => ({
      name: 'buy-or-sell',
      coord: [m.coord[0].toISOString(), m.coord[1]],
      label: { formatter: m.text },
      itemStyle: { color: m.backgroundColor },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any;
    return { data };
  }

  drawLine(valueWithInfo: FundValueWithInfoCN, plotMarkups: Markup[]) {
    const lineData = this.convertData(valueWithInfo);
    const markPoint = this.convertMarkup(plotMarkups);
    this.chart.setOption({
      title: { text: lineData.title, left: 'center' },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          animation: false,
        },
      },
      xAxis: {
        type: 'time',
      },
      yAxis: {
        type: 'value',
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 10,
        },
        {
          start: 0,
          end: 10,
        },
      ],
      series: [
        {
          data: lineData.data,
          showSymbol: false,
          type: 'line',
          markPoint,
        },
      ],
    });
  }
}
