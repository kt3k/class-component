(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.capsidOutsideEventsPlugin = factory());
}(this, (function () { 'use strict';

var debugMessage = (function (message) {
    if (typeof capsidDebugMessage === 'function') {
        capsidDebugMessage(message);
    }
});

var KEY_OUTSIDE_EVENT_LISTENERS = '#O';
var install = function (capsid) {
    var on = capsid.on, pluginHooks = capsid.pluginHooks;
    on.outside = function (event) { return function (descriptor) {
        var key = descriptor.key;
        descriptor.finisher = function (constructor) {
            constructor[KEY_OUTSIDE_EVENT_LISTENERS] = (constructor[KEY_OUTSIDE_EVENT_LISTENERS] || []).concat(function (el, coelem) {
                var listener = function (e) {
                    if (el !== e.target && !el.contains(e.target)) {
                        {
                            debugMessage({
                                type: 'event',
                                module: 'outside-events',
                                color: '#39cccc',
                                el: el,
                                e: e,
                                coelem: coelem
                            });
                        }
                        coelem[key](e);
                    }
                };
                document.addEventListener(event, listener);
            });
        };
    }; };
    pluginHooks.push(function (el, coelem) {
        
        (coelem.constructor[KEY_OUTSIDE_EVENT_LISTENERS] || []).map(function (eventListenerBinder) {
            eventListenerBinder(el, coelem);
        });
    });
};
var outsideEventsPlugin = { install: install };

return outsideEventsPlugin;

})));
