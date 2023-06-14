import { FormatApplier } from 'roosterjs-content-model/lib/publicTypes/context/ModelToDomSettings';
import { FormatHandler } from '../FormatHandler';
import { FormatParser } from 'roosterjs-content-model/lib/publicTypes/context/DomToModelSettings';
import { ItalicFormat } from '../../publicTypes/format/formatParts/ItalicFormat';
import { ModelToDomContext } from 'roosterjs-content-model/lib/publicTypes/context/ModelToDomContext';
import { moveChildNodes } from 'roosterjs-editor-dom';

const parse: FormatParser<ItalicFormat> = (format, element, context, defaultStyle) => {
    const fontStyle = element.style.fontStyle || defaultStyle.fontStyle;

    if (fontStyle == 'italic' || fontStyle == 'oblique') {
        format.italic = true;
    } else if (fontStyle == 'initial' || fontStyle == 'normal') {
        format.italic = false;
    }
};

function shouldApply(format: ItalicFormat, context: ModelToDomContext): boolean {
    if (typeof format.italic === 'undefined') {
        return false;
    }

    const implicitItalic = context.implicitFormat.italic;

    return !!implicitItalic != !!format.italic;
}

const apply: FormatApplier<ItalicFormat> = (format, element, context) => {
    if (shouldApply(format, context)) {
        if (format.italic) {
            const i = element.ownerDocument.createElement('i');
            moveChildNodes(i, element);
            element.appendChild(i);
        } else {
            element.style.fontStyle = 'normal';
        }
    }
};

const applyToBlock: FormatApplier<ItalicFormat> = (format, element, context) => {
    if (shouldApply(format, context)) {
        element.style.fontStyle = format.italic ? 'italic' : 'normal';
    }
};

/**
 * @internal
 */
export const italicFormatHandler: FormatHandler<ItalicFormat> = { parse, apply };

/**
 * @internal
 */
export const blockItalicFormatHandler: FormatHandler<ItalicFormat> = { parse, apply: applyToBlock };
