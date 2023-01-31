import isContentModelEditor from '../../editor/isContentModelEditor';
import { SpacingButtonStringKey, RibbonButton } from 'roosterjs-react';
import { setSpacing } from 'roosterjs-content-model';

const SPACING_OPTIONS = ['1.0', '1.15', '1.5', '2.0'];
const NORMAL_SPACING = 1.2;

function findClosest(lineHeight?: string) {
    if (Number.isNaN(+lineHeight)) {
        return '';
    }
    const query = +lineHeight / NORMAL_SPACING;
    return SPACING_OPTIONS.find(opt => Math.abs(query - +opt) < 0.05);
}

/**
 * @internal
 * "Spacing" button on the format ribbon
 */
export const spacingButton: RibbonButton<SpacingButtonStringKey> = {
    key: 'buttonNameSpacing',
    unlocalizedText: 'Spacing',
    iconName: 'LineSpacing',
    dropDownMenu: {
        items: SPACING_OPTIONS.reduce((map, size) => {
            map[size] = size;
            return map;
        }, <Record<string, string>>{}),
        getSelectedItemKey: formatState => findClosest(formatState.lineHeight),
        allowLivePreview: true,
    },
    onClick: (editor, size) => {
        if (isContentModelEditor(editor)) {
            setSpacing(editor, +size * NORMAL_SPACING);
        }
    },
};
