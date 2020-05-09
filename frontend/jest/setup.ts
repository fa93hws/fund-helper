import { configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';
import { toMatchRenderedSnapshot } from './rendered-snapshot';

(React as any).useLayoutEffect = React.useEffect;
configure({ adapter: new Adapter() });

expect.extend({
  toMatchRenderedSnapshot,
});
