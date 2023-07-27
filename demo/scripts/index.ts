import { mount as mountClassicalEditorMainPane } from './controls/MainPane';

(window as any)['mountKqcRoosterEditor'] = (elementId: string, callback?: Function) => {
    return mountClassicalEditorMainPane(
        elementId,
        document.getElementById(elementId),
        callback ? callback() : null
    );
};

// mountClassicalEditorMainPane('demo', document.getElementById('mainPane'));
