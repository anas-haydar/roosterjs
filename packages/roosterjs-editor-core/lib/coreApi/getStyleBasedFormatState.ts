import { contains, getColor, getComputedStyles } from 'roosterjs-editor-dom';
import { EditorCore, GetStyleBasedFormatState, NodeType } from 'roosterjs-editor-types';

/**
 * @internal
 * Get style based format state from current selection, including font name/size and colors
 * @param core The EditorCore objects
 * @param node The node to get style from
 */
export const getStyleBasedFormatState: GetStyleBasedFormatState = (
    core: EditorCore,
    node: Node | null
) => {
    if (!node) {
        return {};
    }

    let override: string[] = [];
    const pendableFormatSpan = core.pendingFormatState.pendableFormatSpan;

    if (pendableFormatSpan) {
        override = [
            pendableFormatSpan.style.fontFamily,
            pendableFormatSpan.style.fontSize,
            pendableFormatSpan.style.color,
            pendableFormatSpan.style.backgroundColor,
        ];
    }

    const styles = node
        ? getComputedStyles(node, [
              'font-family',
              'font-size',
              'color',
              'background-color',
              'line-height',
              'margin-top',
              'margin-bottom',
              'text-align',
              'direction',
          ])
        : [];
    const { contentDiv, darkColorHandler } = core;

    let styleTextColor = override[2];
    let styleBackColor = override[3];

    while (
        node &&
        contains(contentDiv, node, true /*treatSameNodeAsContain*/) &&
        !(styleTextColor && styleBackColor)
    ) {
        if (node.nodeType == NodeType.Element) {
            const element = node as HTMLElement;

            styleTextColor =
                styleTextColor || getColor(element, false /*isBackground*/, darkColorHandler);
            styleBackColor =
                styleBackColor || getColor(element, true /*isBackground*/, darkColorHandler);
        }
        node = node.parentNode;
    }

    if (!core.darkColorHandler.isDarkMode && node == core.contentDiv) {
        styleTextColor = styleTextColor || styles[2];
        styleBackColor = styleBackColor || styles[3];
    }

    return {
        fontName: override[0] || styles[0],
        fontSize: override[1] || styles[1],
        textColor: styleTextColor,
        backgroundColor: styleBackColor,
        lineHeight: styles[4],
        marginTop: styles[5],
        marginBottom: styles[6],
        textAlign: styles[7],
        direction: styles[8],
    };
};
