import formatUndoSnapshot from '../utils/formatUndoSnapshot';
import { IEditor, ModeIndependentColor } from 'roosterjs-editor-types';
import { safeInstanceOf, saveTableCellMetadata } from 'roosterjs-editor-dom';

/**
 * Set background color of cells.
 * @param editor The editor instance
 * @param color One of two options:
 **/
export default function applyCellShading(editor: IEditor, color: string | ModeIndependentColor) {
    editor.focus();
    formatUndoSnapshot(
        editor,
        () => {
            const regions = editor.getSelectedRegions();
            regions.forEach(region => {
                if (safeInstanceOf(region.rootNode, 'HTMLTableCellElement')) {
                    editor
                        .getDarkColorHandler()
                        .setColor(
                            region.rootNode,
                            true /*isBackgroundColor*/,
                            typeof color == 'string' ? color : color.lightModeColor
                        );

                    // TODO: set text color from background color

                    saveTableCellMetadata(region.rootNode, { bgColorOverride: true });
                }
            });
        },
        'applyCellShading'
    );
}
