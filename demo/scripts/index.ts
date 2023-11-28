import { mount as mountClassicalEditorMainPane } from './controls/MainPane';

(window as any)['mountKqcRoosterEditor'] = (
    elementId: string,
    isDarkMode: boolean,
    callback?: Function
) => {
    return mountClassicalEditorMainPane(
        elementId,
        isDarkMode,
        document.getElementById(elementId),
        callback ? callback() : null
    );
};

mountClassicalEditorMainPane('demo', true, document.getElementById('mainPane'));
