'use strict'

export class EventManager {
    constructor(domElement) {
        this._domElement = domElement;
        this._events = {};
    }

    reset() {
        this._events = {};
    }

    registerEventHandler(event, eventHandler) {
        if (!(event in this._events)) {
            this._events[event] = [];
            this._domElement.addEventListener(event, this._getEventHandler(this._events));
        }
        this._events[event].push(eventHandler);
    }

    removeEventHandler(event, eventHandler) {
        if (!(event in this._events)) return;
        let eventHandlers = this._events[event];
        for (let i = 0; i < eventHandlers.length; ++i) {
            if (eventHandlers[i].id === eventHandler.id) {
                return eventHandlers.splice(i, 1);
            }
        }
    }

    _getEventHandler(events) {
        return event => {
            events[event.type].forEach(eventHandler => {
                eventHandler.process(event);
            });
        }
    }
}