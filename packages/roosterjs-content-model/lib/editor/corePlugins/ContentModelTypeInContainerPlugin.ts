import { ContentModelSegmentFormat } from '../../publicTypes/format/ContentModelSegmentFormat';
import { DeleteResult, OnDeleteEntity } from '../../modelApi/edit/utils/DeleteSelectionStep';
import { deleteSelection } from '../../modelApi/edit/deleteSelection';
import { formatWithContentModel } from '../../publicApi/utils/formatWithContentModel';
import { getObjectKeys, isBlockElement, isCharacterValue, Position } from 'roosterjs-editor-dom';
import { getOnDeleteEntityCallback } from '../utils/handleKeyboardEventCommon';
import { getPendingFormat } from '../../modelApi/format/pendingFormat';
import { IContentModelEditor } from '../../publicTypes/IContentModelEditor';
import { normalizeContentModel } from '../../modelApi/common/normalizeContentModel';
import { setPendingFormat } from '../../modelApi/format/pendingFormat';
import {
    EditorPlugin,
    IEditor,
    PluginEvent,
    PluginEventType,
    SelectionRangeTypes,
} from 'roosterjs-editor-types';

// During IME input, KeyDown event will have "Process" as key
const ProcessKey = 'Process';

/**
 * ContentModelTypeInContainer plugin helps editor handle keyDown event and make sure typing happens
 * under a valid container with default format applied. This is a replacement of original ContentModelTypeInContainer plugin
 */
export default class ContentModelTypeInContainerPlugin implements EditorPlugin {
    private editor: IContentModelEditor | null = null;
    private hasDefaultFormat = false;
    private onDeleteEntity: OnDeleteEntity | undefined;

    /**
     * Get name of this plugin
     */
    getName() {
        return 'ContentModelTypeInContainer';
    }

    /**
     * The first method that editor will call to a plugin when editor is initializing.
     * It will pass in the editor instance, plugin should take this chance to save the
     * editor reference so that it can call to any editor method or format API later.
     * @param editor The editor object
     */
    initialize(editor: IEditor) {
        // TODO: Later we may need a different interface for Content Model editor plugin
        this.editor = editor as IContentModelEditor;
        this.hasDefaultFormat =
            getObjectKeys(this.editor.getContentModelDefaultFormat()).length > 0;
        this.onDeleteEntity = getOnDeleteEntityCallback(this.editor);
    }

    /**
     * The last method that editor will call to a plugin before it is disposed.
     * Plugin can take this chance to clear the reference to editor. After this method is
     * called, plugin should not call to any editor method since it will result in error.
     */
    dispose() {
        this.editor = null;
        this.onDeleteEntity = undefined;
    }

    /**
     * Core method for a plugin. Once an event happens in editor, editor will call this
     * method of each plugin to handle the event as long as the event is not handled
     * exclusively by another plugin.
     * @param event The event to handle:
     */
    onPluginEvent(event: PluginEvent) {
        if (!this.hasDefaultFormat) {
            return;
        }

        const editor = this.editor;
        const rangeEx =
            editor &&
            event.eventType == PluginEventType.KeyDown &&
            (isCharacterValue(event.rawEvent) || event.rawEvent.key == ProcessKey)
                ? editor.getSelectionRangeEx()
                : null;
        const range = rangeEx?.type == SelectionRangeTypes.Normal ? rangeEx.ranges[0] : null;

        if (range && editor) {
            let pos = Position.getStart(range).normalize();
            let node: Node | null = pos.element;

            while (node && editor.contains(node)) {
                if ((node as HTMLElement).getAttribute?.('style')) {
                    return;
                } else if (isBlockElement(node)) {
                    break;
                }

                node = node.parentNode;
            }

            formatWithContentModel(editor, 'input', model => {
                const result = deleteSelection(model, this.onDeleteEntity!);

                if (result.deleteResult == DeleteResult.Range) {
                    normalizeContentModel(model);
                    editor.addUndoSnapshot();

                    return true;
                } else if (result.deleteResult == DeleteResult.NotDeleted) {
                    if (
                        result.insertPoint &&
                        result.insertPoint.paragraph.segments.every(x => x.segmentType != 'Text')
                    ) {
                        const pendingFormat = getPendingFormat(editor) || {};
                        const defaultFormat = editor.getContentModelDefaultFormat();
                        const newFormat: ContentModelSegmentFormat = {
                            ...defaultFormat,
                            ...pendingFormat,
                            ...result.insertPoint?.marker.format,
                        };

                        setPendingFormat(editor, newFormat, Position.getStart(range));
                    }

                    return false;
                } else {
                    return false;
                }
            });
        }
    }
}
