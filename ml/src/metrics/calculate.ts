import type { ParamsConfig } from '../interfaces/params-config.interface';
import type { SubjectMatter } from '../interfaces/subject-matter.interface';
import { calculateOptimalPoints } from './optimal-points';

export function calculate(subjectMatter: SubjectMatter, config: ParamsConfig) {
  return calculateOptimalPoints(subjectMatter, config.optimalPoints);
}
