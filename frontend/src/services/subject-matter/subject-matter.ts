import type { Result } from '@fund-helper/utils/result-type';

export type SubjectMatterInfo = {
  id: string;
  name: string;
  type: string;
};

export type SubjectMatterValue = {
  time: Date;
  value: number;
};

export type SubjectMatter = {
  info: SubjectMatterInfo;
  values: SubjectMatterValue[];
};

export interface CanFetchSubjectMatter {
  fetchSubjectMatter(id: string): Promise<Result.T<SubjectMatter>>;
}
