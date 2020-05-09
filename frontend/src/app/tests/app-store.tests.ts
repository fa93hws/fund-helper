import { AppStore } from '../app-store';
import { CanFetchFundValue } from '../../services/fund-value-service';
import { Result } from '../../utils/result-type';

describe('AppStore', () => {
  jest.useFakeTimers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockFetchFundValues = jest.fn<Promise<Result<any>>, [string]>();
  const fakeService: CanFetchFundValue = {
    fetchFundValues: mockFetchFundValues,
  };

  beforeEach(() => {
    mockFetchFundValues.mockRestore();
  });

  it('has the following default value', () => {
    const store = new AppStore({ fundValueService: fakeService });
    expect(store.values).toBeUndefined();
  });

  it('send the requests through fund value service', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'ok', data: 'hanasaki' }),
    );
    const store = new AppStore({
      fundValueService: fakeService,
    });
    await store.fetchValue('guming');
    expect(mockFetchFundValues).toHaveBeenCalledWith('guming');
  });

  it('set fund info once response is received', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'ok', data: 'hanasaki' }),
    );
    const store = new AppStore({
      fundValueService: fakeService,
    });
    await store.fetchValue('guming');
    expect(store.values).toEqual('hanasaki');
  });

  it('display message if error encountered', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'error', error: new Error('error!') }),
    );
    const store = new AppStore({
      fundValueService: fakeService,
    });
    await store.fetchValue('guming');
    expect(store.errorMessage).toEqual('error!');
  });

  it('dismiss message after timeout', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'error', error: new Error('error!') }),
    );
    const store = new AppStore({
      fundValueService: fakeService,
      alertTimeout: 1000,
    });
    await store.fetchValue('guming');
    jest.advanceTimersByTime(999);
    expect(store.errorMessage).toEqual('error!');
    jest.advanceTimersByTime(2);
    expect(store.errorMessage).toBeUndefined();
  });

  it('clear error message before the request', async () => {
    const stubClearTimeout = jest.spyOn(window, 'clearTimeout');
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'ok', data: 'hanasaki' }),
    );
    const store = new AppStore({
      fundValueService: fakeService,
    });
    store.errorMessage = 'error!';
    const p = store.fetchValue('guming');
    expect(stubClearTimeout).toHaveBeenCalled();
    expect(store.errorMessage).toBeUndefined();
    await p;
  });
});
