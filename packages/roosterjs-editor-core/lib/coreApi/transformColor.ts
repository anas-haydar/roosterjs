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
    direction: ColorTransformDirection | CompatibleColorTransformDirection
) => {
    if (rootNode) {
        core.darkColorHandler.adjustColors(
            rootNode,
            direction == ColorTransformDirection.DarkToLight,
            includeSelf
        );
    }

    callback?.();
};
