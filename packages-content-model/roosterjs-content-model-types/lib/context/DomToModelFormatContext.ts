import { ContentModelBlockFormat } from '../format/ContentModelBlockFormat';
import { ContentModelBlockGroup } from '../group/ContentModelBlockGroup';
import { ContentModelCode } from '../decorator/ContentModelCode';
import { ContentModelLink } from '../decorator/ContentModelLink';
import { ContentModelListLevel } from '../decorator/ContentModelListLevel';
import { ContentModelParagraphDecorator } from '../decorator/ContentModelParagraphDecorator';
import { ContentModelSegmentFormat } from '../format/ContentModelSegmentFormat';

/**
 * Represents the context object used when do DOM to Content Model conversion and processing a List
 */
export interface DomToModelListFormat {
    /**
     * Current number of each level of current thread
     */
    threadItemCounts: number[];

    /**
     * The list that is currently processing
     */
    listParent?: ContentModelBlockGroup;

    /**
     * Current list type stack
     */
    levels: ContentModelListLevel[];
}

/**
 * Represents format info used by DOM to Content Model conversion
 */
export interface DomToModelFormatContext {
    /**
     * Format of current block
     */
    blockFormat: ContentModelBlockFormat;

    /**
     * Format of current segment
     */
    segmentFormat: ContentModelSegmentFormat;

    /**
     * Context of list that is currently processing
     */
    listFormat: DomToModelListFormat;

    /**
     * Whether put the source element into Content Model when possible.
     * When pass true, this cached element will be used to create DOM tree back when convert Content Model to DOM
     */
    allowCacheElement?: boolean;
}

/**
 * Represents decorator info used by DOM to Content Model conversion
 */
export interface DomToModelDecoratorContext {
    /**
     * Context of hyper link info
     */
    link: ContentModelLink;

    /**
     * Context of code info
     */
    code: ContentModelCode;

    /**
     * Context for paragraph decorator
     */
    blockDecorator: ContentModelParagraphDecorator;
}
