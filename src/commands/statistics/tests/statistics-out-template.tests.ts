import { formatOutput } from '../statistics-out-template';

describe('formatOutput', () => {
  it('renders message correctly', () => {
    const parameters = {
      fundId: '123456',
      fundName: '某某基金',
      average: 2.435,
      max: 2.543,
      min: 2.345,
      numDays: 123,
    };
    expect(formatOutput(parameters)).toMatchInlineSnapshot(`
      "基金ID: 123456
      基金名称: 某某基金
      123日均值: 2.435
      123日最高: 2.543
      123日最低: 2.345"
    `);
  });
});
