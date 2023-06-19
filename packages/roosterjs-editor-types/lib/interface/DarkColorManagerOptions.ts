import ModeIndependentColor from './ModeIndependentColor';

/**
 * Type of callback function to get dark color of a given color
 * @param color The light mode color string
 * @param lightnessOfDarkColorBase  Lightness value of base dark color, from 0 to 100, * @default 21.247, the Lightness value of color #333333
 * @returns Dark mode color string
 */
export type GetDarkColor = (color: string, lightnessOfDarkColorBase?: number) => string;

/**
 * Represents the options object of DarkColorHandler for an editor
 */
export default interface DarkColorManagerOptions {
    /**
     * If the editor is currently in dark mode
     * @default false
     */
    inDarkMode?: boolean;

    /**
     * A util function to transform light mode color to dark mode color
     * Default value is to return the original light color.
     */
    getDarkColor?: GetDarkColor;

    /**
     * Map from color key to its mode-independent colors, used for restore known colors across editor sessions
     * @default {}
     */
    knownColors?: Record<string, Readonly<ModeIndependentColor>>;

    /**
     * @deprecated
     * RoosterJS provides an experimental "external content handler" that transforms text
     * This is used when content is pasted or inserted via a method we can hook into.
     * This transform is currently "lossy" and will eliminate color information.
     * If you want to change this behavior, you may define a different function here.
     * It takes in the impacted HTMLElement
     */
    onExternalContentTransform?: (htmlIn: HTMLElement) => void;
}
