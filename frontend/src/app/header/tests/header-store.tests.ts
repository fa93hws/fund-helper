import { HeaderStore } from '../header-store';
import { Result } from '../../../utils/result-type';
import { CanFetchFundValue } from '../../../services/fund-value-service';

describe('HeaderStore', () => {
  jest.useFakeTimers();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockFetchFundValues = jest.fn<Promise<Result<any>>, [string]>();
  const mockSetFundInfo = jest.fn();
  const fakeService: CanFetchFundValue = {
    fetchFundValues: mockFetchFundValues,
  };

  beforeEach(() => {
    mockFetchFundValues.mockRestore();
  });

  it('has these default values', () => {
    const store = new HeaderStore({
      fundValueService: fakeService,
      setFundInfo: mockSetFundInfo,
    });
    expect(store.idInput).toEqual('');
    expect(store.info).toBeUndefined();
    expect(store.errorMessage).toBeUndefined();
  });

  it('set the input id to given value', () => {
    const store = new HeaderStore({
      fundValueService: fakeService,
      setFundInfo: mockSetFundInfo,
    });
    store.setIdInput('guming');
    expect(store.idInput).toEqual('guming');
  });

  it('set the info to given value', () => {
    const store = new HeaderStore({
      fundValueService: fakeService,
      setFundInfo: mockSetFundInfo,
    });
    store.setInfo({ id: 'hanasaki', name: 'guming', type: 'crystal' });
    expect(store.info).toEqual({
      id: 'hanasaki',
      name: 'guming',
      type: 'crystal',
    });
  });

  it('send the requests through fund value service', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'ok', data: 'hanasaki' }),
    );
    const store = new HeaderStore({
      fundValueService: fakeService,
      setFundInfo: mockSetFundInfo,
    });
    store.setIdInput('guming');
    await store.fetchValue();
    expect(mockFetchFundValues).toHaveBeenCalledWith('guming');
  });

  it('set fund info once response is received', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'ok', data: 'hanasaki' }),
    );
    const store = new HeaderStore({
      fundValueService: fakeService,
      setFundInfo: mockSetFundInfo,
    });
    store.setIdInput('guming');
    await store.fetchValue();
    expect(mockSetFundInfo).toHaveBeenCalledWith('hanasaki');
  });

  it('display message if error encountered', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'error', error: new Error('error!') }),
    );
    const store = new HeaderStore({
      fundValueService: fakeService,
      setFundInfo: mockSetFundInfo,
    });
    store.setIdInput('guming');
    await store.fetchValue();
    expect(store.errorMessage).toEqual('error!');
  });

  it('dismiss message after timeout', async () => {
    mockFetchFundValues.mockReturnValueOnce(
      Promise.resolve({ kind: 'error', error: new Error('error!') }),
    );
    const store = new HeaderStore({
      fundValueService: fakeService,
      alertTimeout: 1000,
      setFundInfo: mockSetFundInfo,
    });
    store.setIdInput('guming');
    await store.fetchValue();
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
    const store = new HeaderStore({
      fundValueService: fakeService,
      setFundInfo: mockSetFundInfo,
    });
    store.setIdInput('guming');
    store.errorMessage = 'error!';
    const p = store.fetchValue();
    expect(stubClearTimeout).toHaveBeenCalled();
    expect(store.errorMessage).toBeUndefined();
    await p;
  });
});
