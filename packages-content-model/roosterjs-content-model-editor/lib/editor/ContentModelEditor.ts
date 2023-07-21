import { ContentModelEditorCore } from '../publicTypes/ContentModelEditorCore';
import { ContentModelEditorOptions, IContentModelEditor } from '../publicTypes/IContentModelEditor';
import { createContentModelEditorCore } from './createContentModelEditorCore';
import { EditorBase } from 'roosterjs-editor-core';
import { getInsertPoint } from '../modelApi/selection/collectSelections';
import { InsertPoint } from '../publicTypes/selection/InsertPoint';
import {
    ContentModelDocument,
    ContentModelSegmentFormat,
    DomToModelOption,
    ModelToDomOption,
} from 'roosterjs-content-model-types';

/**
 * Editor for Content Model.
 * (This class is still under development, and may still be changed in the future with some breaking changes)
 */
export default class ContentModelEditor
    extends EditorBase<ContentModelEditorCore, ContentModelEditorOptions>
    implements IContentModelEditor {
    /**
     * Creates an instance of Editor
     * @param contentDiv The DIV HTML element which will be the container element of editor
     * @param options An optional options object to customize the editor
     */
    constructor(contentDiv: HTMLDivElement, options: ContentModelEditorOptions = {}) {
        super(contentDiv, options, createContentModelEditorCore);
    }

    /**
     * Create Content Model from DOM tree in this editor
     * @param option The option to customize the behavior of DOM to Content Model conversion
     */
    createContentModel(option?: DomToModelOption): ContentModelDocument {
        const core = this.getCore();

        return core.api.createContentModel(core, option);
    }

    /**
     * Set content with content model
     * @param model The content model to set
     * @param option Additional options to customize the behavior of Content Model to DOM conversion
     */
    setContentModel(model: ContentModelDocument, option?: ModelToDomOption) {
        const core = this.getCore();

        core.api.setContentModel(core, model, option);
    }

    /**
     * Cache a content model object. Next time when format with content model, we can reuse it.
     * @param model
     */
    cacheContentModel(model: ContentModelDocument | null) {
        const core = this.getCore();

        if (core.reuseModel && !core.lifecycle.shadowEditFragment) {
            core.cachedModel = model || undefined;
            core.cachedInsertPoint = undefined;
        }
    }

    /**
     * Get insert point of current content model. When it returns null, it could because
     * 1. There is no cached Content Model, or
     * 2. The cached Content Model does not have selection, or
     * 3. The cached Content Model have expanded selection, or
     * 4. The cached Content Model have other type of selection than "Normal", e.g. Table selection or image selection
     */
    getInsertPoint(): InsertPoint | null {
        const core = this.getCore();

        if (core.cachedInsertPoint) {
            return core.cachedInsertPoint;
        }

        const model = core.reuseModel && core.cachedModel;

        if (model) {
            core.cachedInsertPoint = getInsertPoint(model);
        }

        return core.cachedInsertPoint || null;
    }

    /**
     * Get default format as ContentModelSegmentFormat.
     * This is a replacement of IEditor.getDefaultFormat for Content Model.
     * @returns The default format
     */
    getContentModelDefaultFormat(): ContentModelSegmentFormat {
        const core = this.getCore();

        return core.defaultFormat;
    }
}
