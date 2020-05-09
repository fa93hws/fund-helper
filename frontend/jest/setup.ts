import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import { toMatchRenderedSnapshot } from './rendered-snapshot';

configure({ adapter: new Adapter() });

expect.extend({
  toMatchRenderedSnapshot,
});
