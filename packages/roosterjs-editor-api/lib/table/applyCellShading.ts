import formatUndoSnapshot from '../utils/formatUndoSnapshot';
import { calculateLightness, safeInstanceOf, saveTableCellMetadata } from 'roosterjs-editor-dom';
import { IEditor, ModeIndependentColor } from 'roosterjs-editor-types';

//Using the HSL (hue, saturation and lightness) representation for RGB color values, if the value of the lightness is less than 20, the color is dark
const DARK_COLORS_LIGHTNESS = 20;
//If the value of the lightness is more than 80, the color is bright
const BRIGHT_COLORS_LIGHTNESS = 80;
const WHITE = '#ffffff';
const BLACK = '#000000';

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
                    const darkColorHandler = editor.getDarkColorHandler();

                    darkColorHandler.setColor(region.rootNode, true /*isBackgroundColor*/, color);

                    const lightness = calculateLightness(
                        typeof color == 'string' ? color : color.lightModeColor
                    );

                    if (lightness > BRIGHT_COLORS_LIGHTNESS) {
                        darkColorHandler.setColor(region.rootNode, false /*isBackground*/, BLACK);
                    } else if (lightness < DARK_COLORS_LIGHTNESS) {
                        darkColorHandler.setColor(region.rootNode, false /*isBackground*/, WHITE);
                    }

                    saveTableCellMetadata(region.rootNode, { bgColorOverride: true });
                }
            });
        },
        'applyCellShading'
    );
}
