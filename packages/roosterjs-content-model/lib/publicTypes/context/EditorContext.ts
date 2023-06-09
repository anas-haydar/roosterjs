import { ContentModelSegmentFormat } from '../format/ContentModelSegmentFormat';
import { IDarkColorHandlerV2 } from 'roosterjs-editor-types';

/**
 * An editor context interface used by ContentModel PAI
 */
export interface EditorContext {
    // /**
    //  * Whether current content is in dark mode
    //  */
    // isDarkMode: boolean;

    /**
     * Default format of editor
     */
    defaultFormat?: ContentModelSegmentFormat;

    /**
     * Dark model color handler
     */
    darkColorHandler: IDarkColorHandlerV2;

    /**
     * Whether to handle delimiters in Content Model
     */
    addDelimiterForEntity?: boolean;
}
