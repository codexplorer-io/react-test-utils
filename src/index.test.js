import { mount } from 'enzyme';
import {
    createMockComponent,
    mountWithDi
} from './index';

jest.mock('enzyme', () => ({
    mount: jest.fn(fn => fn)
}));

jest.mock('react-magnetic-di', () => ({
    DiProvider: 'MockDiProvider'
}));

describe('Test utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createMockComponent', () => {
        it('should create empty mock component with display name', () => {
            const MockComponent = createMockComponent('MyComponent');

            expect(MockComponent.displayName).toEqual('MyComponent');
            expect(MockComponent()).toBe(null);
        });

        it('should create empty mock component with display name when hasChildren is false', () => {
            const MockComponent = createMockComponent('MyComponent', { hasChildren: false });

            expect(MockComponent.displayName).toEqual('MyComponent');
            expect(MockComponent()).toBe(null);
        });

        it('should create mock component with display name and children', () => {
            const MockComponent = createMockComponent('MyComponent', { hasChildren: true });

            expect(MockComponent.displayName).toEqual('MyComponent');
            expect(MockComponent({ children: 'MockChildren' })).toBe('MockChildren');
        });

        it('should create mock component with mock child component', () => {
            const MockComponent = createMockComponent('MyComponent', { shouldMockChildComponent: true });

            expect(MockComponent.displayName).toEqual('MyComponent');
            expect(MockComponent().type.displayName).toEqual('MockComponent');
        });

        it('should create mock renders children component', () => {
            // eslint-disable-next-line lodash/prefer-constant
            const children = jest.fn().mockReturnValue('MockResult');

            const MockComponent = createMockComponent('MyComponent', { shouldRenderChildren: true });

            expect(MockComponent.displayName).toEqual('MyComponent');
            expect(MockComponent({ children })).toEqual('MockResult');
            expect(children).toHaveBeenCalledTimes(1);
        });

        it('should create mock renders children component with arguments', () => {
            // eslint-disable-next-line lodash/prefer-constant
            const children = jest.fn().mockReturnValue('MockResult');

            const MockComponent = createMockComponent('MyComponent', {
                shouldRenderChildren: true,
                renderChildrenArgs: ['arg1', 'arg2']
            });

            expect(MockComponent.displayName).toEqual('MyComponent');
            expect(MockComponent({ children })).toEqual('MockResult');
            expect(children).toHaveBeenCalledTimes(1);
            expect(children).toHaveBeenCalledWith('arg1', 'arg2');
        });
    });

    describe('mountWithDi', () => {
        it('should call mount with default props', () => {
            const wrapper = mountWithDi('MyComponent');

            expect(mount).toHaveBeenCalledTimes(1);
            expect(mount).toHaveBeenCalledWith(
                'MyComponent', {
                    wrappingComponent: 'MockDiProvider',
                    wrappingComponentProps: {
                        use: []
                    }
                }
            );
            expect(wrapper).toEqual('MyComponent');
        });

        it('should call mount with empty deps', () => {
            const wrapper = mountWithDi('MyComponent', { deps: [] });

            expect(mount).toHaveBeenCalledTimes(1);
            expect(mount).toHaveBeenCalledWith(
                'MyComponent', {
                    wrappingComponent: 'MockDiProvider',
                    wrappingComponentProps: {
                        use: []
                    }
                }
            );
            expect(wrapper).toEqual('MyComponent');
        });

        it('should call mount with passed deps', () => {
            const wrapper = mountWithDi('MyComponent', { deps: ['testDep'] });

            expect(mount).toHaveBeenCalledTimes(1);
            expect(mount).toHaveBeenCalledWith(
                'MyComponent', {
                    wrappingComponent: 'MockDiProvider',
                    wrappingComponentProps: {
                        use: ['testDep']
                    }
                }
            );
            expect(wrapper).toEqual('MyComponent');
        });
    });
});
