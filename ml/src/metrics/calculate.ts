import type { ParamsConfig } from '../interfaces/params-config.interface';
import type { SubjectMatter } from '../interfaces/subject-matter.interface';

export function calculateMetrics(
  subjectMatter: SubjectMatter,
  config: ParamsConfig,
) {
  const { info, values } = subjectMatter;
  const out: Record<string, unknown> = { info, values };
  return { config, out };
}
