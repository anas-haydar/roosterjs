import { DarkColorHandlerImplV2 } from 'roosterjs-editor-core/lib/editor/DarkColorHandlerImpl2';
import { defaultContentModelHandlers } from './defaultContentModelHandlers';
import { defaultImplicitFormatMap } from '../../formatHandlers/utils/defaultStyles';
import { EditorContext } from '../../publicTypes/context/EditorContext';
import { ModelToDomContext } from '../../publicTypes/context/ModelToDomContext';
import { ModelToDomOption } from '../../publicTypes/IContentModelEditor';
import {
    defaultFormatAppliers,
    getFormatAppliers,
} from '../../formatHandlers/defaultFormatHandlers';

const globalDarkHandler = new DarkColorHandlerImplV2();

/**
 * @internal
 * @param editorContext
 * @returns
 */
export function createModelToDomContext(
    editorContext?: EditorContext,
    options?: ModelToDomOption
): ModelToDomContext {
    options = options || {};

    return {
        ...(editorContext || {
            darkColorHandler: globalDarkHandler,
        }),
        regularSelection: {
            current: {
                block: null,
                segment: null,
            },
        },
        listFormat: {
            threadItemCounts: [],
            nodeStack: [],
        },
        implicitFormat: {},
        formatAppliers: getFormatAppliers(
            options.formatApplierOverride,
            options.additionalFormatAppliers
        ),
        modelHandlers: {
            ...defaultContentModelHandlers,
            ...(options.modelHandlerOverride || {}),
        },
        defaultImplicitFormatMap: {
            ...defaultImplicitFormatMap,
            ...(options.defaultImplicitFormatOverride || {}),
        },

        defaultModelHandlers: defaultContentModelHandlers,
        defaultFormatAppliers: defaultFormatAppliers,
        onNodeCreated: options.onNodeCreated,
    };
}
