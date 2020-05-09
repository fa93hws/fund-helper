import { HeaderStore } from '../header-store';

describe('HeaderStore', () => {
  const mockFetchValues = jest.fn();

  beforeEach(() => mockFetchValues.mockRestore());

  it('has these default values', () => {
    const store = new HeaderStore(mockFetchValues);
    expect(store.idInput).toEqual('');
  });

  it('sets input', () => {
    const store = new HeaderStore(mockFetchValues);
    store.setIdInput('guming');
    expect(store.idInput).toEqual('guming');
  });

  it('call fetch values on submit', () => {
    const store = new HeaderStore(mockFetchValues);
    store.idInput = 'guming';
    store.onSubmit();
    expect(mockFetchValues).toHaveBeenCalledWith('guming');
  });
});
