import { HeaderStore } from '../header-store';

describe('HeaderStore', () => {
  const fakeService = {
    fetchFundValues: jest.fn(),
  };
  it('set input id to empty string by default', () => {
    const store = new HeaderStore(fakeService);
    expect(store.idInput).toEqual('');
  });

  it('set info to unknowns by default', () => {
    const store = new HeaderStore(fakeService);
    expect(store.info).toBeUndefined();
  });

  it('set the input id to given value', () => {
    const store = new HeaderStore(fakeService);
    store.setIdInput('guming');
    expect(store.idInput).toEqual('guming');
  });

  it('set the info to given value', () => {
    const store = new HeaderStore(fakeService);
    store.setInfo({ id: 'hanasaki', name: 'guming', type: 'crystal' });
    expect(store.info).toEqual({
      id: 'hanasaki',
      name: 'guming',
      type: 'crystal',
    });
  });
});
