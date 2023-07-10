import { mount as mountClassicalEditorMainPane } from './controls/MainPane';

(window as any)['mountKqcRoosterEditor'] = (callback?: Function) => {
    return mountClassicalEditorMainPane(
        document.getElementById('mainPane'),
        callback ? callback() : null
    );
};

// mountClassicalEditorMainPane(document.getElementById('mainPane'));
