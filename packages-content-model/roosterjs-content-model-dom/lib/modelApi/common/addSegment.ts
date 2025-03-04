import { addBlock } from './addBlock';
import { createParagraph } from '../creators/createParagraph';
import type {
    ContentModelBlockFormat,
    ContentModelBlockGroup,
    ContentModelParagraph,
    ContentModelSegment,
} from 'roosterjs-content-model-types';

/**
 * Add a given segment into a paragraph from its parent group. If the last block of the given group is not paragraph, create a new paragraph.
 * @param group The parent block group of the paragraph to add segment into
 * @param newSegment The segment to add
 * @param blockFormat The block format used for creating a new paragraph when need
 */
export function addSegment(
    group: ContentModelBlockGroup,
    newSegment: ContentModelSegment,
    blockFormat?: ContentModelBlockFormat
) {
    const lastBlock = group.blocks[group.blocks.length - 1];
    let paragraph: ContentModelParagraph;

    if (lastBlock?.blockType == 'Paragraph') {
        paragraph = lastBlock;
    } else {
        paragraph = createParagraph(true, blockFormat);
        addBlock(group, paragraph);
    }

    const lastSegment = paragraph.segments[paragraph.segments.length - 1];

    if (newSegment.segmentType == 'SelectionMarker') {
        if (!lastSegment || !lastSegment.isSelected) {
            paragraph.segments.push(newSegment);
        }
    } else {
        if (newSegment.isSelected && lastSegment?.segmentType == 'SelectionMarker') {
            paragraph.segments.pop();
        }

        paragraph.segments.push(newSegment);
    }
}
