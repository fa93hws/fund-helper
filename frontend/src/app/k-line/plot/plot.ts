import { ECharts, init, EChartOption } from 'echarts';
import { FundValues } from '../../../services/fund-value-service';

type LineData = {
  data: [string, number][];
  title: string;
};

export type Markup = {
  text: string;
  backgroundColor: string;
  coord: [number, number];
};

export class Plotter {
  private readonly chart: ECharts;

  constructor(container: HTMLDivElement) {
    this.chart = init(container);
  }

  // timestamp is in seconds
  private formatTimestamp(timestamp: number) {
    return new Date(timestamp * 1000).toISOString();
  }

  private convertData(values: FundValues): LineData {
    const data = values.values.reduce<[string, number][]>((acc, cur) => {
      acc.push([this.formatTimestamp(cur.date), cur.real_value]);
      return acc;
    }, []);
    return {
      data,
      title: `${values.name}@${values.id} (${values.typ})`,
    };
  }

  private convertMarkup(
    markups: Markup[],
  ): EChartOption.SeriesLine['markPoint'] {
    const data = markups.map((m) => ({
      name: 'buy-or-sell',
      coord: [this.formatTimestamp(m.coord[0]), m.coord[1]],
      label: { formatter: m.text },
      itemStyle: { color: m.backgroundColor },
    })) as any;
    return { data };
  }

  drawLine(values: FundValues, plotMarkups: Markup[]) {
    const lineData = this.convertData(values);
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
