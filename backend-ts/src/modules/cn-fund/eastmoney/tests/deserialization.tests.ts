import {
  fakeValueResponseRaw,
  fakeValueResponseParsed,
  fakeListResponseParsed,
  fakeListResponseRaw,
} from './fake-data';
import { deserializeValue, deserializeList } from '../deserialize-response';

describe('deserializeValue', () => {
  it('deserialize the value from real response', () => {
    const deserializationResult = deserializeValue(fakeValueResponseRaw);
    expect(deserializationResult).toEqual({
      kind: 'ok',
      data: fakeValueResponseParsed,
    });
  });

  it('returns error if apidata is not present', (done) => {
    const deserializationResult = deserializeValue('var a = "response"');
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: Failed to get apidata.content as string]`,
      );
      done();
    } else {
      done.fail('It should give error');
    }
  });

  it('returns error if content is not present', (done) => {
    const deserializationResult = deserializeValue(
      'var apidata = { pages: 1, curpage: 2 }',
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: Failed to get apidata.content as string]`,
      );
      done();
    } else {
      done.fail('It should give error');
    }
  });

  it('returns error if pages is not present', (done) => {
    const deserializationResult = deserializeValue(
      'var apidata = { pages: 1, content: "" }',
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: Failed to get apidata.curpage as number]`,
      );
      done();
    } else {
      done.fail('It should give error');
    }
  });

  it('returns error if curpage is not present', (done) => {
    const deserializationResult = deserializeValue(
      'var apidata = { content: "", curpage: 2 }',
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: Failed to get apidata.pages as number]`,
      );
      done();
    } else {
      done.fail('It should give error');
    }
  });

  it('returns error if date is not in format', (done) => {
    const deserializationResult = deserializeValue(
      `var apidata={ content:"<table><tbody><tr><td>20200-04-24</td><td>123</td></tr></tbody></table>",records:1,pages:1,curpage:1};`,
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: type of date is not in yyyy-mm-dd, html: <table><tbody><tr><td>20200-04-24</td><td>123</td></tr></tbody></table>]`,
      );
      done();
    } else {
      done.fail('It should give error');
    }
  });

  it('returns error if value is not in float', (done) => {
    const deserializationResult = deserializeValue(
      `var apidata={ content:"<table><tbody><tr><td>2020-04-24</td><td>value</td></tr></tbody></table>",records:1,pages:1,curpage:1};`,
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: type of value can not be parsed to float, html: <table><tbody><tr><td>2020-04-24</td><td>value</td></tr></tbody></table>]`,
      );
      done();
    } else {
      done.fail('It should give error');
    }
  });
});

describe('deserializeList', () => {
  it('deserialize the list correctly', () => {
    const deserializationResult = deserializeList(fakeListResponseRaw);
    expect(deserializationResult).toEqual({
      kind: 'ok',
      data: fakeListResponseParsed,
    });
  });

  it('returns error if r is not array', (done) => {
    const deserializationResult = deserializeList('var r = ""');
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: Failed to get r in context as array]`,
      );
      done();
    } else {
      done.fail('it should give error');
    }
  });

  it('returns error if element of r is not array', (done) => {
    const deserializationResult = deserializeList('var r = ["aa"]');
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: rawInfo must be an array, got aa]`,
      );
      done();
    } else {
      done.fail('it should give error');
    }
  });

  it('returns error if element of r does not have 5 elements', (done) => {
    const deserializationResult = deserializeList('var r = [["1", "2", "3"]]');
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: rawInfo should have 5 element, got 3 from [1,2,3]]`,
      );
      done();
    } else {
      done.fail('it should give error');
    }
  });

  it('returns error if id is not string', (done) => {
    const deserializationResult = deserializeList(
      'var r = [[1, "a", "b", "c", "d"]]',
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: id should be string, got 1 from [1,a,b,c,d]]`,
      );
      done();
    } else {
      done.fail('it should give error');
    }
  });

  it('returns error if name is not string', (done) => {
    const deserializationResult = deserializeList(
      'var r = [["o", "a", 1, "c", "d"]]',
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: name should be string, got 1 from [o,a,1,c,d]]`,
      );
      done();
    } else {
      done.fail('it should give error');
    }
  });

  it('returns error if type is not string', (done) => {
    const deserializationResult = deserializeList(
      'var r = [["o", "a", "b", 1, "d"]]',
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: typeStr should be string, got 1 from [o,a,b,1,d]]`,
      );
      done();
    } else {
      done.fail('it should give error');
    }
  });

  it('returns error if type is not recognized', (done) => {
    const deserializationResult = deserializeList(
      'var r = [["o", "a", "b", "1", "d"]]',
    );
    if (deserializationResult.kind === 'error') {
      expect(deserializationResult.error).toMatchInlineSnapshot(
        `[Error: unknown fund type 1]`,
      );
      done();
    } else {
      done.fail('it should give error');
    }
  });
});
