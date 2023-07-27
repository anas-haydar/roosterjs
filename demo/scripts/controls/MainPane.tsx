import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ApiPlaygroundPlugin from './sidePane/apiPlayground/ApiPlaygroundPlugin';
import EditorOptionsPlugin from './sidePane/editorOptions/EditorOptionsPlugin';
import EventViewPlugin from './sidePane/eventViewer/EventViewPlugin';
import FormatPainterPlugin from './contentModel/plugins/FormatPainterPlugin';
import FormatStatePlugin from './sidePane/formatState/FormatStatePlugin';
import getToggleablePlugins from './getToggleablePlugins';
import MainPaneBase from './MainPaneBase';
import SnapshotPlugin from './sidePane/snapshot/SnapshotPlugin';
import { arrayPush } from 'roosterjs-editor-dom';
import { darkMode, DarkModeButtonStringKey } from './ribbonButtons/darkMode';
import { Editor } from 'roosterjs-editor-core';
import { EditorOptions, EditorPlugin } from 'roosterjs-editor-types';
import { PartialTheme } from '@fluentui/react/lib/Theme';
import { zoom, ZoomButtonStringKey } from './ribbonButtons/zoom';
import {
    AllButtonKeys,
    AllButtonStringKeys,
    createEmojiPlugin,
    createPasteOptionPlugin,
    createRibbonPlugin,
    getButtons,
    Ribbon,
    RibbonButton,
    RibbonPlugin,
} from 'roosterjs-react';

const styles = (isDark: boolean): Record<string, string> => {
    return !isDark ? require('./MainPane.scss') : require('./MainPane-dark.scss');
};
type RibbonStringKeys = AllButtonStringKeys | DarkModeButtonStringKey | ZoomButtonStringKey;
// | ExportButtonStringKey;
// | PopoutButtonStringKey;

const LightTheme: PartialTheme = {
    palette: {
        themePrimary: '#0099aa',
        themeLighterAlt: '#f2fbfc',
        themeLighter: '#cbeef2',
        themeLight: '#a1dfe6',
        themeTertiary: '#52c0cd',
        themeSecondary: '#16a5b5',
        themeDarkAlt: '#008a9a',
        themeDark: '#007582',
        themeDarker: '#005660',
        neutralLighterAlt: '#faf9f8',
        neutralLighter: '#f3f2f1',
        neutralLight: '#edebe9',
        neutralQuaternaryAlt: '#e1dfdd',
        neutralQuaternary: '#d0d0d0',
        neutralTertiaryAlt: '#c8c6c4',
        neutralTertiary: '#a19f9d',
        neutralSecondary: '#605e5c',
        neutralPrimaryAlt: '#3b3a39',
        neutralPrimary: '#323130',
        neutralDark: '#201f1e',
        black: '#000000',
        white: '#ffffff',
    },
};

const DarkTheme: PartialTheme = {
    palette: {
        themePrimary: '#0091A1',
        themeLighterAlt: '#f1fafb',
        themeLighter: '#caecf0',
        themeLight: '#9fdce3',
        themeTertiary: '#4fbac6',
        themeSecondary: '#159dac',
        themeDarkAlt: '#008291',
        themeDark: '#006e7a',
        themeDarker: '#00515a',
        neutralLighterAlt: '#3c3c3c',
        neutralLighter: '#444444',
        neutralLight: '#515151',
        neutralQuaternaryAlt: '#595959',
        neutralQuaternary: '#5f5f5f',
        neutralTertiaryAlt: '#7a7a7a',
        neutralTertiary: '#c8c8c8',
        neutralSecondary: '#d0d0d0',
        neutralPrimaryAlt: '#dadada',
        neutralPrimary: '#ffffff',
        neutralDark: '#f4f4f4',
        black: '#f8f8f8',
        white: '#212529',
    },
};

class MainPane extends MainPaneBase {
    private formatStatePlugin: FormatStatePlugin;
    private editorOptionPlugin: EditorOptionsPlugin;
    private eventViewPlugin: EventViewPlugin;
    private apiPlaygroundPlugin: ApiPlaygroundPlugin;
    private ribbonPlugin: RibbonPlugin;
    private pasteOptionPlugin: EditorPlugin;
    private emojiPlugin: EditorPlugin;
    private toggleablePlugins: EditorPlugin[] | null = null;
    private formatPainterPlugin: FormatPainterPlugin;
    private mainWindowButtons: RibbonButton<RibbonStringKeys>[];
    private popoutWindowButtons: RibbonButton<RibbonStringKeys>[];

    constructor(props: { paneId: string }) {
        super(props);

        this.formatStatePlugin = new FormatStatePlugin();
        this.editorOptionPlugin = new EditorOptionsPlugin();
        this.eventViewPlugin = new EventViewPlugin(this.props.paneId);
        this.apiPlaygroundPlugin = new ApiPlaygroundPlugin();
        this.snapshotPlugin = new SnapshotPlugin();
        this.ribbonPlugin = createRibbonPlugin();
        this.pasteOptionPlugin = createPasteOptionPlugin();
        this.emojiPlugin = createEmojiPlugin();
        this.formatPainterPlugin = new FormatPainterPlugin();

        this.mainWindowButtons = getButtons([...AllButtonKeys, darkMode, zoom]);
        this.popoutWindowButtons = getButtons([...AllButtonKeys, darkMode, zoom]);

        this.state = {
            popoutWindow: null,
            showRibbon: true,
            initState: this.editorOptionPlugin.getBuildInPluginState(),
            scale: 1,
            isDarkMode: this.themeMatch?.matches || false,
            editorCreator: null,
            isRtl: false,
        };
    }

    getStyles(isDark: boolean): Record<string, string> {
        return styles(isDark);
    }

    renderRibbon(isPopout: boolean) {
        return (
            <Ribbon
                buttons={isPopout ? this.popoutWindowButtons : this.mainWindowButtons}
                plugin={this.ribbonPlugin}
                dir={this.state.isRtl ? 'rtl' : 'ltr'}
            />
        );
    }

    getPlugins() {
        this.toggleablePlugins =
            this.toggleablePlugins || getToggleablePlugins(this.state.initState);

        const plugins = [
            ...this.toggleablePlugins,
            this.ribbonPlugin,
            this.pasteOptionPlugin,
            this.emojiPlugin,
            this.formatPainterPlugin,
            // this.sampleEntityPlugin,
            this.eventViewPlugin,
        ];

        if (this.state.popoutWindow) {
            arrayPush(plugins, this.getSidePanePlugins());
        }

        plugins.push(this.updateContentPlugin);

        return plugins;
    }

    resetEditor() {
        this.toggleablePlugins = null;
        this.setState({
            editorCreator: (div: HTMLDivElement, options: EditorOptions) =>
                new Editor(div, options),
        });
    }

    getTheme(isDark: boolean): PartialTheme {
        return isDark ? DarkTheme : LightTheme;
    }

    private getSidePanePlugins() {
        return [
            this.formatStatePlugin,
            this.editorOptionPlugin,
            this.eventViewPlugin,
            this.apiPlaygroundPlugin,
            this.snapshotPlugin,
        ];
    }
}

export function mount(paneId: string, parent: HTMLElement, callback?: Function) {
    ReactDOM.render(<MainPane paneId={paneId} />, parent, callback ? callback() : null);
}
