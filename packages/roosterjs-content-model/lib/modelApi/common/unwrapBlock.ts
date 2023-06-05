import { ContentModelBlock } from '../../publicTypes/block/ContentModelBlock';
import { ContentModelBlockGroup } from '../../publicTypes/group/ContentModelBlockGroup';
import { setParagraphNotImplicit } from '../block/setParagraphNotImplicit';

/**
 * @internal
 */
export function unwrapBlock(
    parent: ContentModelBlockGroup | null,
    groupToUnwrap: ContentModelBlockGroup & ContentModelBlock
) {
    const index = parent?.blocks.indexOf(groupToUnwrap) ?? -1;

    if (index >= 0) {
        setParagraphNotImplicit(groupToUnwrap.blocks);

        parent?.blocks.splice(index, 1, ...groupToUnwrap.blocks);
    }
}
