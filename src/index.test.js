import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import enzyme from 'enzyme';
import { DiProvider, di, injectable } from 'react-magnetic-di';
import {
    createMockComponent,
    mountWithDi,
    runHookWithDi
} from './index';

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
        let mount;

        beforeEach(() => {
            mount = jest.spyOn(enzyme, 'mount')
                .mockImplementation(fn => fn);
        });

        afterEach(() => {
            mount.mockRestore();
        });

        it('should call mount with default props', () => {
            const wrapper = mountWithDi('MyComponent');

            expect(mount).toHaveBeenCalledTimes(1);
            expect(mount).toHaveBeenCalledWith(
                'MyComponent', {
                    wrappingComponent: DiProvider,
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
                    wrappingComponent: DiProvider,
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
                    wrappingComponent: DiProvider,
                    wrappingComponentProps: {
                        use: ['testDep']
                    }
                }
            );
            expect(wrapper).toEqual('MyComponent');
        });

        it('should render injected deps', () => {
            mount.mockRestore();
            /* eslint-disable lodash/prefer-constant */
            const Dep1 = () => null;
            const Dep2 = () => null;
            /* eslint-enable lodash/prefer-constant */
            const MyComponent = () => {
                di(Dep1, Dep2);
                return (
                    <>
                        <Dep1 />
                        <Dep2 />
                        <Dep2 />
                    </>
                );
            };
            const MockDep1 = createMockComponent('MockDep1');
            const MockDep2 = createMockComponent('MockDep2');

            const wrapper = mountWithDi(<MyComponent />, {
                deps: [
                    injectable(Dep1, MockDep1),
                    injectable(Dep2, MockDep2)
                ]
            });

            /* eslint-disable lodash/prefer-lodash-method */
            expect(wrapper.find(Dep1)).toHaveLength(0);
            expect(wrapper.find('MockDep1')).toHaveLength(1);
            expect(wrapper.find(MockDep1)).toHaveLength(1);
            expect(wrapper.find(Dep2)).toHaveLength(0);
            expect(wrapper.find('MockDep2')).toHaveLength(2);
            expect(wrapper.find(MockDep2)).toHaveLength(2);
            /* eslint-enable lodash/prefer-lodash-method */
        });
    });

    describe('runHookWithDi', () => {
        const useCounter = (initial = 0) => {
            di(useState);

            const [counter, setCounter] = useState(initial);

            return {
                counter,
                increment: () => setCounter(counter + 1)
            };
        };

        it('should run hook', () => {
            const result = runHookWithDi(useCounter);

            expect(result.hookResult).toEqual({
                counter: 0,
                increment: expect.any(Function)
            });
        });

        it('should update hook when state changes', () => {
            const result = runHookWithDi(useCounter);

            expect(result.hookResult.counter).toBe(0);

            act(() => {
                result.hookResult.increment();
            });

            expect(result.hookResult.counter).toBe(1);

            act(() => {
                result.hookResult.increment();
            });

            expect(result.hookResult.counter).toBe(2);
        });

        it('should pass arguments', () => {
            const result = runHookWithDi(() => useCounter(10));

            expect(result.hookResult.counter).toBe(10);

            act(() => {
                result.hookResult.increment();
            });

            expect(result.hookResult.counter).toBe(11);
        });

        it('should inject deps', () => {
            const mockUseState = jest.fn().mockReturnValue([30, jest.fn()]);
            const result = runHookWithDi(() => useCounter(20), {
                deps: [
                    injectable(useState, mockUseState)
                ]
            });

            expect(mockUseState).toHaveBeenCalledTimes(1);
            expect(mockUseState).toHaveBeenCalledWith(20);
            expect(result.hookResult.counter).toBe(30);
        });

        it('should rerender when update is called', () => {
            const mockUseState = jest.fn().mockReturnValue([30, jest.fn()]);
            const result = runHookWithDi(() => useCounter(20), {
                deps: [
                    injectable(useState, mockUseState)
                ]
            });

            expect(mockUseState).toHaveBeenCalledTimes(1);
            expect(mockUseState).toHaveBeenCalledWith(20);
            expect(result.hookResult.counter).toBe(30);

            act(() => {
                result.hookResult.increment();
            });

            expect(mockUseState).toHaveBeenCalledTimes(1);

            result.update();

            expect(mockUseState).toHaveBeenCalledTimes(2);
            expect(mockUseState).toHaveBeenCalledWith(20);
        });
    });
});
