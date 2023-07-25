import EventViewPane from './EventViewPane';
import SidePanePluginImpl from '../SidePanePluginImpl';
import { PluginEvent } from 'roosterjs-editor-types';
import { SidePaneElementProps } from '../SidePaneElement';

export default class EventViewPlugin extends SidePanePluginImpl<
    EventViewPane,
    SidePaneElementProps
> {
    constructor() {
        super(EventViewPane, 'event', 'Event Viewer');
    }

    onPluginEvent(e: PluginEvent) {
        const targetEvents = [3, 7];
        if (targetEvents.includes(e.eventType)) {
            this.triggerCustomEvent(e);
        }
        this.getComponent(component => component.addEvent(e));
    }

    triggerCustomEvent(e: PluginEvent) {
        const customEvent = new CustomEvent('contentUpdated', { detail: e });
        window.dispatchEvent(customEvent);
    }

    getComponentProps(base: SidePaneElementProps) {
        return base;
    }
}
