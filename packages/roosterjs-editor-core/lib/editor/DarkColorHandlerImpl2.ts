import {
    ColorKeyAndValue,
    IDarkColorHandlerV2,
    ModeIndependentColor,
} from 'roosterjs-editor-types';
import { getObjectKeys, safeInstanceOf } from 'roosterjs-editor-dom';

const VARIABLE_REGEX = /^\s*var\(\s*(\-\-[a-zA-Z0-9\-_]+)\s*(?:,\s*(.*))?\)\s*$/;
const VARIABLE_PREFIX = 'var(';
const COLOR_VAR_PREFIX = 'darkcolor';
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

export class DarkColorHandlerImplV2 implements IDarkColorHandlerV2 {
    private onRegisterColor: (key: string, darkColor: string | null) => void;
    private getDarkColor: (color: string) => string;
    private darkMode: boolean;
    private knownColors: Record<string, Readonly<ModeIndependentColor>>;

    constructor(
        onRegisterColor?: (key: string, darkColor: string | null) => void,
        getDarkColor?: (color: string) => string,
        isDarkMode: boolean = false,
        knownColors: Record<string, Readonly<ModeIndependentColor>> = {}
    ) {
        this.onRegisterColor = onRegisterColor || defaultOnRegisterColor;
        this.getDarkColor = getDarkColor || defaultGetDarkColor;
        this.darkMode = isDarkMode;
        this.knownColors = knownColors;

        this.resetContainerColors(this.isDarkMode);
    }

    get isDarkMode() {
        return this.darkMode;
    }

    set isDarkMode(value: boolean) {
        if (this.darkMode != value) {
            this.darkMode = value;

            this.resetContainerColors(this.darkMode);
        }
    }

    getColor(element: HTMLElement, isBackground: boolean): string {
        const color =
            element.style.getPropertyValue(
                getColorAttrName(isBackground, ColorAttributeEnum.CssColor)
            ) ?? element.getAttribute(getColorAttrName(isBackground, ColorAttributeEnum.HtmlColor));

        return color ? this.parseColorValue(color).lightModeColor : '';
    }

    setColor(
        element: HTMLElement,
        isBackground: boolean,
        color: string,
        skipDarkColor?: boolean
    ): void {
        const { lightModeColor, darkModeColor, key } = this.parseColorValue(color);
        const propName = getColorAttrName(isBackground, ColorAttributeEnum.CssColor);

        if (lightModeColor) {
            const colorKey =
                key || `--${COLOR_VAR_PREFIX}_${lightModeColor.replace(/[^\d\w]/g, '_')}`;

            element.style.setProperty(
                propName,
                skipDarkColor ? lightModeColor : `var(${colorKey}, ${lightModeColor})`
            );

            if (!skipDarkColor && !this.knownColors[colorKey]) {
                const modeIndependentColor: ModeIndependentColor = {
                    lightModeColor,
                    darkModeColor: darkModeColor || this.getDarkColor(lightModeColor),
                };

                this.knownColors[colorKey] = modeIndependentColor;

                if (this.darkMode) {
                    this.onRegisterColor(colorKey, modeIndependentColor.darkModeColor);
                }
            }
        } else {
            element.style.setProperty(propName, null);
        }
    }

    transformElements(root: HTMLElement, includeSelf: boolean, toDarkMode: boolean): void {
        for (
            let iter = iterateElements(root, includeSelf), curr = iter.next();
            !curr.done;
            curr = iter.next()
        ) {
            if (curr.value) {
                this.transformElement(curr.value, !toDarkMode);
            }
        }
    }

    dispose() {
        this.resetContainerColors(false /*isDarkMode*/);
    }

    private resetContainerColors(isDarkMode: boolean) {
        getObjectKeys(this.knownColors).forEach(key => {
            this.onRegisterColor(key, isDarkMode ? this.knownColors[key].darkModeColor : null);
        });
    }

    private parseColorValue(color: string): ColorKeyAndValue {
        let key: string | undefined;
        let lightModeColor = '';
        let darkModeColor: string | undefined;
        const match =
            color && color.startsWith(VARIABLE_PREFIX) ? VARIABLE_REGEX.exec(color) : null;

        if (match) {
            if (match[2]) {
                key = match[1];
                lightModeColor = match[2];
                darkModeColor = this.knownColors[key]?.darkModeColor;
            }
            // TODO
            // } else if (fromDark) {
            //     // If editor is in dark mode but the color is not in dark color format, it is possible the color was inserted from external code
            //     // without any light color info. So we first try to see if there is a known dark color can match this color, and use its related
            //     // light color as light mode color. Otherwise we need to drop this color to avoid show "white on white" content.
            //     lightModeColor = this.findLightColorFromDarkColor(color) || '';

            //     if (lightModeColor) {
            //         darkModeColor = color;
            //     }
        } else {
            lightModeColor = color;
        }

        return { key, lightModeColor, darkModeColor };
    }

    // private findLightColorFromDarkColor(darkColor: string): string | null {
    //     const rgbSearch = parseColor(darkColor);

    //     if (rgbSearch) {
    //         const key = getObjectKeys(this.knownColors).find(key => {
    //             const rgbCurrent = parseColor(this.knownColors[key].darkModeColor);

    //             return (
    //                 rgbCurrent &&
    //                 rgbCurrent[0] == rgbSearch[0] &&
    //                 rgbCurrent[1] == rgbSearch[1] &&
    //                 rgbCurrent[2] == rgbSearch[2]
    //             );
    //         });

    //         if (key) {
    //             return this.knownColors[key].lightModeColor;
    //         }
    //     }

    //     return null;
    // }

    private transformElement(element: HTMLElement, useOriginalColor: boolean) {
        [false, true].forEach(isBackground => {
            const color = this.getColor(element, isBackground);

            if (color && color != 'inherit') {
                this.setColor(element, isBackground, color, useOriginalColor);
            }

            element.removeAttribute(getColorAttrName(isBackground, ColorAttributeEnum.HtmlColor));
        });
    }
}

function defaultOnRegisterColor() {}

function defaultGetDarkColor(color: string) {
    return color;
}

function* iterateElements(
    rootNode: Node,
    includeSelf: boolean
): Generator<HTMLElement, void, never> {
    if (includeSelf && safeInstanceOf(rootNode, 'HTMLElement')) {
        yield rootNode;
    }

    const elements = safeInstanceOf(rootNode, 'HTMLElement')
        ? rootNode.getElementsByTagName('*')
        : safeInstanceOf(rootNode, 'DocumentFragment')
        ? rootNode.querySelectorAll('*')
        : <Element[]>[];

    for (let i = 0; i < elements.length; i++) {
        yield elements[i] as HTMLElement;
    }
}

function getColorAttrName(isBackground: boolean, type: ColorAttributeEnum) {
    return (isBackground ? BackColorAttributeName : TextColorAttributeName)[type];
}
