const HEX3_REGEX = /^#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/;
const HEX6_REGEX = /^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/;
const RGB_REGEX = /^rgb\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)$/;
const RGBA_REGEX = /^rgba\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)$/;

/**
 * Parse color string to r/g/b value.
 * If the given color is not in a recognized format, return null
 */
export default function parseColor(color: string): [number, number, number] | null {
    color = (color || '').trim();

    let match: RegExpMatchArray | null;
    if ((match = color.match(HEX3_REGEX))) {
        return [
            parseInt(match[1] + match[1], 16),
            parseInt(match[2] + match[2], 16),
            parseInt(match[3] + match[3], 16),
        ];
    } else if ((match = color.match(HEX6_REGEX))) {
        return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
    } else if ((match = color.match(RGB_REGEX) || color.match(RGBA_REGEX))) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    } else {
        // CSS color names such as red, green is not included for now.
        // If need, we can add those colors from https://www.w3.org/wiki/CSS/Properties/color/keywords
        return null;
    }
}

/**
 * Calculate lightness of a color
 * @param color The color to calculate
 * @returns Lightness value of the color, from 0 (darkest) to 255 (lightest)
 */
export function calculateLightness(color: string) {
    const colorValues = parseColor(color);

    // Use the values of r,g,b to calculate the lightness in the HSl representation
    // First calculate the fraction of the light in each color, since in css the value of r,g,b is in the interval of [0,255], we have
    if (colorValues) {
        const red = colorValues[0] / 255;
        const green = colorValues[1] / 255;
        const blue = colorValues[2] / 255;

        //Then the lightness in the HSL representation is the average between maximum fraction of r,g,b and the minimum fraction
        return (Math.max(red, green, blue) + Math.min(red, green, blue)) * 50;
    } else {
        return 255;
    }
}
