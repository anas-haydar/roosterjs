import { ContentModelBlock } from '../../publicTypes/block/ContentModelBlock';
import { ContentModelSegmentFormat } from '../../publicTypes/format/ContentModelSegmentFormat';

/**
 * @internal
 */
export function setParagraphNotImplicit(
    blocks: ContentModelBlock | ContentModelBlock[],
    defaultFormat?: ContentModelSegmentFormat
) {
    if (!Array.isArray(blocks)) {
        blocks = [blocks];
    }

    blocks.forEach(block => {
        if (block.blockType == 'Paragraph' && block.isImplicit) {
            block.isImplicit = false;

            if (defaultFormat) {
                block.segmentFormat = Object.assign({}, defaultFormat, block.segmentFormat);
            }
        }
    });
}
