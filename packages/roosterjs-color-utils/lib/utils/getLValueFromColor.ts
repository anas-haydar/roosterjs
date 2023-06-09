import * as Color from 'color';

export default function getLValueFromColor(color: string): number {
    try {
        const rgb = Color(color || undefined);
        const lab = rgb.lab().array();
        return lab[0];
    } catch {
        return 0;
    }
}
