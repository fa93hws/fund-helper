import * as http from 'http';
import { SubjectMatter } from './interfaces/subject-matter.interface';

function httpGet<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    http
      .get(url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });

        resp.on('end', () => {
          resolve(JSON.parse(data));
        });
      })
      .on('error', (err) => {
        reject(new Error(err.message));
      });
  });
}

export async function fetchSubjectMatter(id: string): Promise<SubjectMatter> {
  const url = `http://localhost:3000/api/v1/cn-funds/${id}`;
  return httpGet(url);
}
