import { ECharts, init } from 'echarts';
import { FundValues } from '../../../services/fund-value-service';

type LineData = {
  data: [string, number][];
  title: string;
};

export class Plotter {
  private readonly chart: ECharts;

  constructor(container: HTMLDivElement) {
    this.chart = init(container);
  }

  private convertData(values: FundValues): LineData {
    const data = values.values.reduce<[string, number][]>((acc, cur) => {
      acc.push([new Date(cur.date * 1000).toISOString(), cur.real_value]);
      return acc;
    }, []);
    return {
      data,
      title: `${values.name}@${values.id} (${values.typ})`,
    };
  }

  drawLine(values: FundValues) {
    const lineData = this.convertData(values);
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
        },
      ],
    });
  }
}
