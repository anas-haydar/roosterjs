import { calculateLightness } from 'roosterjs-editor-dom';
import { ContentModelTableCell } from '../../publicTypes/group/ContentModelTableCell';
import { updateTableCellMetadata } from '../../domUtils/metadata/updateTableCellMetadata';

// Using the HSL (hue, saturation and lightness) representation for RGB color values.
// If the value of the lightness is less than 20, the color is dark.
// If the value of the lightness is more than 80, the color is bright
const DARK_COLORS_LIGHTNESS = 20;
const BRIGHT_COLORS_LIGHTNESS = 80;
const White = '#ffffff';
const Black = '#000000';

/**
 * @internal
 */
export function setTableCellBackgroundColor(
    cell: ContentModelTableCell,
    color: string | null | undefined,
    isColorOverride?: boolean
) {
    if (color) {
        cell.format.backgroundColor = color;

        if (isColorOverride) {
            updateTableCellMetadata(cell, metadata => {
                metadata = metadata || {};
                metadata.bgColorOverride = true;
                return metadata;
            });
        }

        const lightness = calculateLightness(color);

        if (lightness < DARK_COLORS_LIGHTNESS) {
            cell.format.textColor = White;
        } else if (lightness > BRIGHT_COLORS_LIGHTNESS) {
            cell.format.textColor = Black;
        } else {
            delete cell.format.textColor;
        }
    } else {
        delete cell.format.backgroundColor;
        delete cell.format.textColor;
    }

    delete cell.cachedElement;
}
