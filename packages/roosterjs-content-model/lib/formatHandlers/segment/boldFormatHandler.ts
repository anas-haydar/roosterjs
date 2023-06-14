import { BoldFormat } from '../../publicTypes/format/formatParts/BoldFormat';
import { FormatApplier } from '../../publicTypes/context/ModelToDomSettings';
import { FormatHandler } from '../FormatHandler';
import { FormatParser } from '../../publicTypes/context/DomToModelSettings';
import { ModelToDomContext } from '../../publicTypes/context/ModelToDomContext';
import { moveChildNodes } from 'roosterjs-editor-dom';

const parse: FormatParser<BoldFormat> = (format, element, _, defaultStyle) => {
    const fontWeight = element.style.fontWeight || defaultStyle.fontWeight;

    if (fontWeight) {
        format.fontWeight = fontWeight;
    }
};

function shouldApply(format: BoldFormat, context: ModelToDomContext): boolean {
    if (typeof format.fontWeight === 'undefined') {
        return false;
    }

    const blockFontWeight = context.implicitFormat.fontWeight;

    return !!(
        (blockFontWeight && blockFontWeight != format.fontWeight) ||
        (!blockFontWeight && format.fontWeight && format.fontWeight != 'normal')
    );
}

const apply: FormatApplier<BoldFormat> = (format, element, context) => {
    if (shouldApply(format, context)) {
        if (format.fontWeight == 'bold') {
            const b = element.ownerDocument.createElement('b');
            moveChildNodes(b, element);
            element.appendChild(b);
        } else {
            element.style.fontWeight = format.fontWeight || 'normal';
        }
    }
};

const applyToBlock: FormatApplier<BoldFormat> = (format, element, context) => {
    if (shouldApply(format, context)) {
        element.style.fontWeight = format.fontWeight || 'normal';
    }
};

/**
 * @internal
 */
export const boldFormatHandler: FormatHandler<BoldFormat> = { parse, apply };

/**
 * @internal
 */
export const blockBoldFormatHandler: FormatHandler<BoldFormat> = { parse, apply: applyToBlock };
