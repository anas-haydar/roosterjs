import ColorManager from '../style/ColorManager';
import { calculateLightness } from './parseColor';
import { IColorManager, ModeIndependentColor } from 'roosterjs-editor-types';

const WHITE = '#ffffff';
const BLACK = '#000000';
const TRANSPARENT = 'transparent';

//Using the HSL (hue, saturation and lightness) representation for RGB color values, if the value of the lightness is less than 20, the color is dark
const DARK_COLORS_LIGHTNESS = 20;
//If the value of the lightness is more than 80, the color is bright
const BRIGHT_COLORS_LIGHTNESS = 80;

/**
 * Set text color or background color to the given element
 * @param element The element to set color to
 * @param color The color to set, it can be a string of color name/value or a ModeIndependentColor object
 * @param isBackgroundColor Whether set background color or text color
 * @param isDarkMode Whether current mode is dark mode. @default false
 * @param shouldAdaptTheFontColor Whether the font color needs to be adapted to be visible in a dark or bright background color. @default false
 * @param colorManager A dark color handler object. This is now required.
 * We keep it optional only for backward compatibility. If it is not passed, color will not be set.
 */
export default function setColor(
    element: HTMLElement,
    color: string | ModeIndependentColor,
    isBackgroundColor: boolean,
    isDarkMode?: boolean,
    shouldAdaptTheFontColor?: boolean,
    colorManager?: IColorManager | null
) {
    colorManager = colorManager || new ColorManager();

    color = typeof color == 'string' ? color : color.lightModeColor;
    colorManager.setColor(element, isBackgroundColor, color);

    if (isBackgroundColor && shouldAdaptTheFontColor && color != TRANSPARENT) {
        const lightness = calculateLightness(color);

        if (lightness < DARK_COLORS_LIGHTNESS) {
            colorManager.setColor(element, false /*isBackground*/, WHITE);
        } else if (lightness > BRIGHT_COLORS_LIGHTNESS) {
            colorManager.setColor(element, false /*isBackground*/, BLACK);
        }
    }
}
