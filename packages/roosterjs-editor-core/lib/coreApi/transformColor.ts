import { ColorTransformDirection, EditorCore, TransformColor } from 'roosterjs-editor-types';
import type { CompatibleColorTransformDirection } from 'roosterjs-editor-types/lib/compatibleTypes';

/**
 * @deprecated
 */
export const transformColor: TransformColor = (
    core: EditorCore,
    rootNode: Node | null,
    includeSelf: boolean,
    callback: (() => void) | null,
    direction: ColorTransformDirection | CompatibleColorTransformDirection,
    forceTransform?: boolean,
    fromDarkMode?: boolean
) => {
    if (rootNode) {
        if (direction == ColorTransformDirection.LightToDark) {
            core.darkColorHandler.formatColor(rootNode, includeSelf);
        } else {
            core.darkColorHandler.unformatColor(rootNode, includeSelf);
        }
    }

    callback?.();
};
