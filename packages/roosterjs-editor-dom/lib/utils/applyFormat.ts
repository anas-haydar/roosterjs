import { DefaultFormat, IColorManager } from 'roosterjs-editor-types';

/**
 * Apply format to an HTML element
 * @param element The HTML element to apply format to
 * @param format The format to apply
 * @param isDarkMode Whether the content should be formatted in dark mode
 * @param darkColorHandler An optional dark color handler object. When it is passed, we will use this handler to do variable-based dark color instead of original dataset base dark color
 */
export default function applyFormat(
    element: HTMLElement,
    format: DefaultFormat,
    isDarkMode?: boolean,
    darkColorHandler?: IColorManager | null
) {
    if (format) {
        const elementStyle = element.style;
        const { fontFamily, fontSize, bold, italic, underline } = format;

        if (fontFamily) {
            elementStyle.fontFamily = fontFamily;
        }
        if (fontSize) {
            elementStyle.fontSize = fontSize;
        }

        if (darkColorHandler) {
            const textColor = format.textColors || format.textColor;
            const backColor = format.backgroundColors || format.backgroundColor;

            if (textColor) {
                darkColorHandler.setColor(element, false /*isBackground*/, textColor);
            }

            if (backColor) {
                darkColorHandler.setColor(element, true /*isBackground*/, backColor);
            }
        }

        if (bold) {
            elementStyle.fontWeight = 'bold';
        }
        if (italic) {
            elementStyle.fontStyle = 'italic';
        }
        if (underline) {
            elementStyle.textDecoration = 'underline';
        }
    }
}
