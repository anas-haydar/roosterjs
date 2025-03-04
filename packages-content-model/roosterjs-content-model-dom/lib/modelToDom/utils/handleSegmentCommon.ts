import { applyFormat } from './applyFormat';
import { ContentModelSegment, ModelToDomContext } from 'roosterjs-content-model-types';

/**
 * @internal
 */
export function handleSegmentCommon(
    doc: Document,
    segmentNode: Node,
    containerNode: HTMLElement,
    segment: ContentModelSegment,
    context: ModelToDomContext
) {
    if (!segmentNode.firstChild) {
        context.regularSelection.current.segment = segmentNode;
    }

    applyFormat(containerNode, context.formatAppliers.styleBasedSegment, segment.format, context);

    context.modelHandlers.segmentDecorator(doc, containerNode, segment, context);

    applyFormat(containerNode, context.formatAppliers.elementBasedSegment, segment.format, context);

    context.onNodeCreated?.(segment, segmentNode);
}
