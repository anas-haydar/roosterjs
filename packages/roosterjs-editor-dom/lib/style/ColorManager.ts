import { IColorManager, ModeIndependentColor } from 'roosterjs-editor-types';

const enum ColorAttributeEnum {
    CssColor = 0,
    HtmlColor = 1,
}
const TextColorAttributeName: Record<ColorAttributeEnum, string> = {
    [ColorAttributeEnum.CssColor]: 'color',
    [ColorAttributeEnum.HtmlColor]: 'color',
};
const BackColorAttributeName: Record<ColorAttributeEnum, string> = {
    [ColorAttributeEnum.CssColor]: 'background-color',
    [ColorAttributeEnum.HtmlColor]: 'bgcolor',
};

export default class ColorManager implements IColorManager {
    getColor(element: HTMLElement, isBackground: boolean): string {
        const color =
            element.style.getPropertyValue(
                getColorAttrName(isBackground, ColorAttributeEnum.CssColor)
            ) ?? element.getAttribute(getColorAttrName(isBackground, ColorAttributeEnum.HtmlColor));

        return color || '';
    }

    setColor(
        element: HTMLElement,
        isBackground: boolean,
        color: string | ModeIndependentColor
    ): void {
        const propName = getColorAttrName(isBackground, ColorAttributeEnum.CssColor);
        color = typeof color == 'string' ? color : color.lightModeColor;

        if (color) {
            element.style.setProperty(propName, color);
        } else {
            element.style.setProperty(propName, null);
        }

        element.removeAttribute(getColorAttrName(isBackground, ColorAttributeEnum.HtmlColor));
    }
}

function getColorAttrName(isBackground: boolean, type: ColorAttributeEnum) {
    return (isBackground ? BackColorAttributeName : TextColorAttributeName)[type];
}
