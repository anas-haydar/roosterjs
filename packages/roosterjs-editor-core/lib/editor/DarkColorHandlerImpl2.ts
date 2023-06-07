import { ColorKeyAndValue, ModeIndependentColor } from 'roosterjs-editor-types';
import { getObjectKeys, parseColor, safeInstanceOf } from 'roosterjs-editor-dom';

const VARIABLE_REGEX = /^\s*var\(\s*(\-\-[a-zA-Z0-9\-_]+)\s*(?:,\s*(.*))?\)\s*$/;
const VARIABLE_PREFIX = 'var(';
const COLOR_VAR_PREFIX = 'roostercolor';
const enum ColorAttributeEnum {
    CssColor = 0,
    HtmlColor = 1,
}
const ColorAttributeName: { [key in ColorAttributeEnum]: string }[] = [
    {
        [ColorAttributeEnum.CssColor]: 'color',
        [ColorAttributeEnum.HtmlColor]: 'color',
    },
    {
        [ColorAttributeEnum.CssColor]: 'background-color',
        [ColorAttributeEnum.HtmlColor]: 'bgcolor',
    },
];

export interface IDarkColorHandlerV2 {
    isDarkMode: boolean;

    getColor(element: HTMLElement, isBackground: boolean): string;
    setColor(element: HTMLElement, isBackground: boolean, lightModeColor: string): void;
    transformElements(root: Node, includeSelf: boolean, isApplying: boolean): void;
}

export class DarkColorHandlerImplV2 implements IDarkColorHandlerV2 {
    private onRegisterColor: (key: string, darkColor: string | null) => void;
    private getDarkColor: (color: string) => string;
    private darkMode: boolean;
    private knownColors: Record<string, Readonly<ModeIndependentColor>> = {};

    constructor(
        onRegisterColor?: (key: string, darkColor: string | null) => void,
        getDarkColor?: (color: string) => string,
        isDarkMode: boolean = false
    ) {
        this.onRegisterColor = onRegisterColor || defaultOnRegisterColor;
        this.getDarkColor = getDarkColor || defaultGetDarkColor;
        this.darkMode = isDarkMode;
    }

    get isDarkMode() {
        return this.darkMode;
    }

    set isDarkMode(value: boolean) {
        if (value != this.darkMode) {
            this.darkMode = value;

            getObjectKeys(this.knownColors).forEach(key => {
                this.onRegisterColor(
                    key,
                    this.darkMode ? this.knownColors[key].darkModeColor : null
                );
            });
        }
    }

    getColor(element: HTMLElement, isBackground: boolean): string {
        const color =
            element.style.getPropertyValue(
                ColorAttributeName[isBackground ? 1 : 0][ColorAttributeEnum.CssColor]
            ) ??
            element.getAttribute(
                ColorAttributeName[isBackground ? 1 : 0][ColorAttributeEnum.HtmlColor]
            );

        return this.parseColorValue(color).lightModeColor;
    }

    setColor(element: HTMLElement, isBackground: boolean, lightModeColor: string): void {
        const effectiveColor = this.registerColor(lightModeColor, this.darkMode) || '';

        element.style.setProperty(
            ColorAttributeName[isBackground ? 1 : 0][ColorAttributeEnum.CssColor],
            effectiveColor
        );
    }

    transformElements(root: HTMLElement, includeSelf: boolean, isApplying: boolean): void {
        for (
            let iter = iterateElements(root, includeSelf), curr = iter.next();
            !curr.done;
            curr = iter.next()
        ) {
            this.transformElement(curr.value, fromDark, isApplying);
        }
    }

    private parseColorValue(color: string | null, fromDark?: boolean): ColorKeyAndValue {
        let key: string | undefined;
        let lightModeColor = '';
        let darkModeColor: string | undefined;

        if (color) {
            const match = color.startsWith(VARIABLE_PREFIX) ? VARIABLE_REGEX.exec(color) : null;

            if (match) {
                if (match[2]) {
                    key = match[1];
                    lightModeColor = match[2];
                    darkModeColor = this.knownColors[key]?.darkModeColor;
                } else {
                    lightModeColor = '';
                }
            } else if (fromDark) {
                // If editor is in dark mode but the color is not in dark color format, it is possible the color was inserted from external code
                // without any light color info. So we first try to see if there is a known dark color can match this color, and use its related
                // light color as light mode color. Otherwise we need to drop this color to avoid show "white on white" content.
                lightModeColor = this.findLightColorFromDarkColor(color) || '';

                if (lightModeColor) {
                    darkModeColor = color;
                }
            } else {
                lightModeColor = color;
            }
        }

        return { key, lightModeColor, darkModeColor };
    }

    private registerColor(
        lightModeColor: string,
        isDarkMode: boolean,
        darkModeColor?: string
    ): string {
        const parsedColor = this.parseColorValue(lightModeColor);
        let colorKey: string | undefined;

        if (parsedColor) {
            lightModeColor = parsedColor.lightModeColor;
            darkModeColor = parsedColor.darkModeColor || darkModeColor;
            colorKey = parsedColor.key;
        }

        if (isDarkMode && lightModeColor) {
            colorKey =
                colorKey || `--${COLOR_VAR_PREFIX}_${lightModeColor.replace(/[^\d\w]/g, '_')}`;

            if (!this.knownColors[colorKey]) {
                darkModeColor = darkModeColor || this.getDarkColor(lightModeColor);

                this.knownColors[colorKey] = { lightModeColor, darkModeColor };
                this.onRegisterColor(colorKey, darkModeColor);
            }

            return `var(${colorKey}, ${lightModeColor})`;
        } else {
            return lightModeColor;
        }
    }

    private findLightColorFromDarkColor(darkColor: string): string | null {
        const rgbSearch = parseColor(darkColor);

        if (rgbSearch) {
            const key = getObjectKeys(this.knownColors).find(key => {
                const rgbCurrent = parseColor(this.knownColors[key].darkModeColor);

                return (
                    rgbCurrent &&
                    rgbCurrent[0] == rgbSearch[0] &&
                    rgbCurrent[1] == rgbSearch[1] &&
                    rgbCurrent[2] == rgbSearch[2]
                );
            });

            if (key) {
                return this.knownColors[key].lightModeColor;
            }
        }

        return null;
    }

    private transformElement(element: HTMLElement, fromDark: boolean, isApplying: boolean) {
        ColorAttributeName.forEach((names, i) => {
            const color = this.parseColorValue(
                element.style.getPropertyValue(names[ColorAttributeEnum.CssColor]) ||
                    element.getAttribute(names[ColorAttributeEnum.HtmlColor]),
                fromDark
            ).lightModeColor;

            element.style.setProperty(names[ColorAttributeEnum.CssColor], null);
            element.removeAttribute(names[ColorAttributeEnum.HtmlColor]);

            if (color && color != 'inherit') {
                if (isApplying) {
                    this.setColor(element, i != 0, color);
                } else {
                    element.style.setProperty(
                        ColorAttributeName[i][ColorAttributeEnum.CssColor],
                        color
                    );
                }
            }
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
        : [];

    for (let i = 0; i < elements.length; i++) {
        yield elements[i] as HTMLElement;
    }
}
