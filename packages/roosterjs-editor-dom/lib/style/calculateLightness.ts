import parseColor from './parseColor';

/**
 * Calculate lightness of a color
 * @param color The color to calculate
 * @returns Lightness value of the color, from 0 (darkest) to 255 (lightest)
 */
export default function calculateLightness(color: string) {
    const colorValues = parseColor(color);

    // Use the values of r,g,b to calculate the lightness in the HSl representation
    //First calculate the fraction of the light in each color, since in css the value of r,g,b is in the interval of [0,255], we have
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
