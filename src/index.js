import React from 'react';
import { mount } from 'enzyme';
import { DiProvider } from 'react-magnetic-di';
import isFunction from 'lodash/isFunction';

export const createMockComponent = (
    displayName,
    {
        shouldRenderChildren = true,
        shouldMockChildren = false,
        renderChildrenArgs = [],
        mockRef = undefined
    } = {
        shouldRenderChildren: true,
        shouldMockChildren: false,
        renderChildrenArgs: [],
        mockRef: undefined
    }
) => {
    // eslint-disable-next-line lodash/prefer-constant
    const MockChildComponent = () => null;
    MockChildComponent.displayName = 'MockChildComponent';

    const renderComponent = ({ children }) => {
        if (shouldMockChildren) {
            return <MockChildComponent />;
        }

        if (!shouldRenderChildren || !children) {
            return null;
        }

        if (children && isFunction(children)) {
            return children(...renderChildrenArgs);
        }

        return children;
    };

    const MockComponent = mockRef ?
        React.forwardRef(({ children }, ref) => {
            isFunction(ref) ?
                ref(mockRef) :
                (ref.current = mockRef);

            return renderComponent({ children });
        }) :
        ({ children }) => renderComponent({ children });
    MockComponent.displayName = displayName;
    return MockComponent;
};

export const mountWithDi = (node, { deps = [] } = { deps: [] }) => mount(node, {
    wrappingComponent: DiProvider,
    wrappingComponentProps: {
        use: deps
    }
});

export const runHookWithDi = (useHook, { deps = [] } = { deps: [] }) => {
    const hookRunner = {};
    const HookRenderer = () => {
        hookRunner.hookResult = useHook();
        return null;
    };

    const wrapper = mountWithDi(<HookRenderer />, { deps });
    hookRunner.update = () => {
        wrapper.setProps({});
    };
    hookRunner.unmount = () => {
        wrapper.unmount();
    };

    return hookRunner;
};
