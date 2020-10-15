import React from 'react';
import { mount } from 'enzyme';
import { DiProvider } from 'react-magnetic-di';

export const createMockComponent = (
    displayName,
    {
        hasChildren = false,
        shouldMockChildComponent = false,
        shouldRenderChildren = false,
        renderChildrenArgs = []
    } = {
        hasChildren: false,
        shouldRenderChildren: false,
        renderChildrenArgs: []
    }
) => {
    const MockComponent = shouldMockChildComponent ?
        () => {
        // eslint-disable-next-line lodash/prefer-constant
            const MockComponent = () => null;
            MockComponent.displayName = 'MockComponent';
            return <MockComponent />;
        } :
        shouldRenderChildren ?
            ({ children }) => children(...renderChildrenArgs) :
            hasChildren ?
                ({ children }) => children :
            // eslint-disable-next-line lodash/prefer-constant
                () => null;
    MockComponent.displayName = displayName;
    return MockComponent;
};

export const mountWithDi = (node, { deps = [] } = { deps: [] }) => mount(node, {
    wrappingComponent: DiProvider,
    wrappingComponentProps: {
        use: deps
    }
});
