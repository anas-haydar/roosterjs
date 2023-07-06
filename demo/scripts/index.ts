import { mount as mountClassicalEditorMainPane } from './controls/MainPane';

(window as any)['mountKqcRoosterEditor'] = () => {
    return mountClassicalEditorMainPane(document.getElementById('mainPane'));
};
