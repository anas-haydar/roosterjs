import { ContentModelSegmentFormat } from '../format/ContentModelSegmentFormat';
import { IColorManager } from 'roosterjs-editor-types';

/**
 * An editor context interface used by ContentModel PAI
 */
export interface EditorContext {
    /**
     * Default format of editor
     */
    defaultFormat?: ContentModelSegmentFormat;

    /**
     * Dark model color handler
     */
    darkColorHandler: IColorManager;

    /**
     * Whether to handle delimiters in Content Model
     */
    addDelimiterForEntity?: boolean;
}
