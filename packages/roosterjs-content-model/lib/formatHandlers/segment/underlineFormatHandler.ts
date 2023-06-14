import { FormatApplier } from '../../publicTypes/context/ModelToDomSettings';
import { FormatHandler } from '../FormatHandler';
import { FormatParser } from '../../publicTypes/context/DomToModelSettings';
import { ModelToDomContext } from '../../publicTypes/context/ModelToDomContext';
import { moveChildNodes } from 'roosterjs-editor-dom';
import { UnderlineFormat } from '../../publicTypes/format/formatParts/UnderlineFormat';

const parse: FormatParser<UnderlineFormat> = (format, element, context, defaultStyle) => {
    const textDecoration = element.style.textDecoration || defaultStyle.textDecoration;

    if (textDecoration?.indexOf('underline')! >= 0) {
        format.underline = true;
    } else if (element.tagName == 'A' && textDecoration == 'none') {
        format.underline = false;
    }
};

function shouldApply(format: UnderlineFormat, context: ModelToDomContext): boolean {
    if (typeof format.underline === 'undefined') {
        return false;
    }

    const blockUnderline = context.implicitFormat.underline;

    return !!blockUnderline != !!format.underline;
}

const apply: FormatApplier<UnderlineFormat> = (format, element, context) => {
    if (shouldApply(format, context)) {
        if (format.underline) {
            const u = element.ownerDocument.createElement('u');
            moveChildNodes(u, element);
            element.appendChild(u);
        } else {
            element.style.textDecoration = 'none';
        }
    }
};

const applyToBlock: FormatApplier<UnderlineFormat> = (format, element, context) => {
    if (shouldApply(format, context)) {
        element.style.textDecoration =
            [element.style.textDecoration, 'underline'].filter(x => !!x).join(' ') || 'none';
    }
};

/**
 * @internal
 */
export const underlineFormatHandler: FormatHandler<UnderlineFormat> = { parse, apply };

/**
 * @internal
 */
export const blockUnderlineFormatHandler: FormatHandler<UnderlineFormat> = {
    parse,
    apply: applyToBlock,
};
