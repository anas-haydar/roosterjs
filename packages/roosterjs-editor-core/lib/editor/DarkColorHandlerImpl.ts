import { calculateLightness, ColorManager, getObjectKeys, invertColor } from 'roosterjs-editor-dom';
import { ColorKeyAndValue, DarkColorHandler, ModeIndependentColor } from 'roosterjs-editor-types';

const VARIABLE_REGEX = /^\s*var\(\s*(\-\-[a-zA-Z0-9\-_]+)\s*(?:,\s*(.*))?\)\s*$/;
const VARIABLE_PREFIX = 'var(';
const COLOR_VAR_PREFIX = 'darkColor';

export default class DarkColorHandlerImpl extends ColorManager implements DarkColorHandler {
    private darkMode: boolean;
    private baseLValue: number;

    constructor(
        private getDarkColor: (color: string, baseLValue?: number) => string = invertColor,
        private contentDiv?: HTMLElement,
        isDarkMode: boolean = false,
        private knownColors: Record<string, Readonly<ModeIndependentColor>> = {},
        baseDarkColor: string = '#333333',
        private externalContentTransform?: (htmlIn: HTMLElement) => void
    ) {
        super();

        this.darkMode = isDarkMode;
        this.baseLValue = calculateLightness(baseDarkColor); // TODO, use LAB but not HSL
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

    /**
     * Get a copy of known colors
     * @returns
     */
    getKnownColorsCopy() {
        return Object.values(this.knownColors);
    }

    /**
     * Given a light mode color value and an optional dark mode color value, register this color
     * so that editor can handle it, then return the CSS color value for current color mode.
     * @param lightModeColor Light mode color value
     * @param isDarkMode Whether current color mode is dark mode
     * @param darkModeColor Optional dark mode color value. If not passed, we will calculate one.
     */
    private _registerColor(key: string, darkModeColor?: string | null) {
        if (this.contentDiv) {
            if (darkModeColor) {
                this.contentDiv.style.setProperty(key, darkModeColor);
            } else {
                this.contentDiv.style.removeProperty(key);
            }
        }
    }

    getColor(element: HTMLElement, isBackground: boolean): string {
        const color = super.getColor(element, isBackground);

        return color ? this.parseColorValue(color).lightModeColor : '';
    }

    setColor(
        element: HTMLElement,
        isBackground: boolean,
        color: string | ModeIndependentColor
    ): void {
        color = typeof color == 'string' ? color : color.lightModeColor;

        let { lightModeColor, darkModeColor, key } = this.parseColorValue(color);

        if (lightModeColor) {
            const colorKey =
                key || `--${COLOR_VAR_PREFIX}_${lightModeColor.replace(/[^\d\w]/g, '_')}`;

            if (!this.knownColors[colorKey]) {
                const modeIndependentColor: ModeIndependentColor = {
                    lightModeColor,
                    darkModeColor:
                        darkModeColor || this.getDarkColor(lightModeColor, this.baseLValue),
                };

                this.knownColors[colorKey] = modeIndependentColor;

                if (this.darkMode) {
                    this._registerColor(colorKey, modeIndependentColor.darkModeColor);
                }
            }

            lightModeColor = `var(${colorKey}, ${lightModeColor})`;
        }

        super.setColor(element, isBackground, lightModeColor);
    }

    formatColor(root: HTMLElement, includeSelf: boolean): void {
        this.transformElements(root, includeSelf, true /*isFormatting*/);
    }

    unformatColor(root: HTMLElement, includeSelf: boolean): void {
        this.transformElements(root, includeSelf, false /*isFormatting*/);
    }

    /**
     * Reset known color record, clean up registered color variables.
     */
    reset(): void {
        this.resetContainerColors(false /*isDarkMode*/);
    }

    /**
     * Parse an existing color value, if it is in variable-based color format, extract color key,
     * light color and query related dark color if any
     * @param color The color string to parse
     * @param isInDarkMode Whether current content is in dark mode. When set to true, if the color value is not in dark var format,
     * we will treat is as a dark mode color and try to find a matched dark mode color.
     */
    parseColorValue(color: string | null | undefined, isInDarkMode?: boolean): ColorKeyAndValue {
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
            lightModeColor = color || '';
        }

        return { key, lightModeColor, darkModeColor };
    }

    /**
     * Find related light mode color from dark mode color.
     * @param darkColor The existing dark color
     */
    findLightColorFromDarkColor(darkColor: string): string | null {
        // const rgbSearch = this.colorTransformer.getRgbOfColor(darkColor);

        // if (rgbSearch) {
        //     const key = getObjectKeys(this.knownColors).find(key => {
        //         const rgbCurrent = parseColor(this.knownColors[key].darkModeColor);

        //         return (
        //             rgbCurrent &&
        //             rgbCurrent[0] == rgbSearch[0] &&
        //             rgbCurrent[1] == rgbSearch[1] &&
        //             rgbCurrent[2] == rgbSearch[2]
        //         );
        //     });

        //     if (key) {
        //         return this.knownColors[key].lightModeColor;
        //     }
        // }

        return null;
    }

    registerColor(lightModeColor: string, isDarkMode: boolean, darkModeColor?: string): string {
        return '';
    }

    private resetContainerColors(isDarkMode: boolean) {
        getObjectKeys(this.knownColors).forEach(key => {
            this._registerColor(key, isDarkMode ? this.knownColors[key].darkModeColor : null);
        });
    }

    private transformElements(root: HTMLElement, includeSelf: boolean, isFormatting: boolean) {
        // const toDark = direction == ColorTransformDirection.LightToDark;

        const transformer =
            this.externalContentTransform ||
            ((element: HTMLElement) => {
                [false, true].forEach(isBackground => {
                    const color = this.getColor(element, isBackground);

                    if (color && color != 'inherit') {
                        if (isFormatting) {
                            this.setColor(element, isBackground, color);
                        } else {
                            super.setColor(element, isBackground, color);
                        }
                    }
                });
            });

        iterateElements(root, transformer, includeSelf);
    }
}

function iterateElements(
    root: Node,
    transformer: (element: HTMLElement) => void,
    includeSelf?: boolean
) {
    if (includeSelf && isHTMLElement(root)) {
        transformer(root);
    }

    for (let child = root.firstChild; child; child = child.nextSibling) {
        if (isHTMLElement(child)) {
            transformer(child);
        }

        iterateElements(child, transformer);
    }
}

// This is not a strict check, we just need to make sure this element has style so that we can set style to it
// We don't use safeInstanceOf() here since this function will be called very frequently when extract html content
// in dark mode, so we need to make sure this check is fast enough
function isHTMLElement(node: Node): node is HTMLElement {
    const htmlElement = <HTMLElement>node;
    return node.nodeType == Node.ELEMENT_NODE && !!htmlElement.style;
}
