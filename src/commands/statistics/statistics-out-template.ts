import { readFileSync } from 'fs';
import * as ejs from 'ejs';

type TemplateParameter = {
  fundId: string;
  fundName: string;
  fundType: string;
  average: number;
  max: number;
  min: number;
  numDays: number;
};
export function formatOutput(templateParameter: TemplateParameter) {
  const compiled = ejs.compile(
    readFileSync(`${__dirname}/statistics-out.ejs`, 'utf8'),
  );
  return compiled(templateParameter);
}
