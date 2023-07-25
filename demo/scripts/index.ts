import { mount as mountClassicalEditorMainPane } from './controls/MainPane';

(window as any)['mountKqcRoosterEditor'] = (elementId: string, callback?: Function) => {
    return mountClassicalEditorMainPane(
        document.getElementById(elementId),
        callback ? callback() : null
    );
};

// mountClassicalEditorMainPane(document.getElementById('mainPane'));
