'use strict'

export class EventManager {
    constructor(domElement) {
        this._domElement = domElement;
        this._events = {};
    } 

    registerEventHandler(event, eventHandler) {
        console.log(this._events);
        if (!(event in this._events)) {
            this._events[event] = [];
            this._domElement.addEventListener(event, this._getEventHandler(this._events));
        }
        this._events[event].push(eventHandler);
    }

    _getEventHandler(events) {
        return event => {
            events[event.type].forEach(eventHandler => {
                eventHandler.process(event);
            });
        }
    }
}