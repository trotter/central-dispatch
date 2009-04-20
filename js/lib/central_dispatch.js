var CentralDispatch = {
    requestData: function (url, callbacks) {
        var request = CentralDispatch.request({url: url, callbacks: callbacks});
        request.addToDom();
        return request;
    },

    receiveData: function (version, url, data) {
        CentralDispatch.RequestMap.runAllFor(url, data);
    },

    timeout: 60000 // 60 seconds
};

CentralDispatch.request = function (spec, my) {
    var that;
    that = {};
    that.url = spec.url;

    my = my || {};
    my.timeout = null;

    // Private methods
    my.setCallbacks = function () {
        if (typeof(spec.callbacks) === 'function') {
            my.callbacks = { onSuccess: spec.callbacks };
        } else {
            my.callbacks = spec.callbacks;
        }
    };

    my.setTimeout = function () {
        if (CentralDispatch.timeout) {
            if (window) {
                my.timeout = window.setTimeout(function () {
                    that.timeout();
                }, CentralDispatch.timeout);
            }
        }
    };

    my.setElement = function () {
        var element;
        element = document.createElement('script');
        element.src = that.url;
        element.onerror = that.error;
        that.element = element;
    };

    my.process = function (func) {
        if (!my.executed) {
            my.executed = true;
            my.cleanupElement();
            func();
        }
    };

    my.cleanupElement = function () {
        if (that.element) {
            document.body.removeChild(that.element); 
            that.element = null; 
        }
    };

    my.cleanupTimeout = function () {
        if (my.timeout) {
            window.clearTimeout(my.timeout);
            my.timeout = null;
        }
    };

    // Public methods
    that.success = function (data) { 
        my.process(function () {
            my.cleanupTimeout();
            if (my.callbacks.onSuccess) {
                my.callbacks.onSuccess(data); 
            }
        });
    };

    that.error = function (msg, url, line) {
        my.process(function () {
            CentralDispatch.RequestMap.remove(that);
            my.cleanupTimeout();
            if (my.callbacks.onError) {
                my.callbacks.onError(msg, url, line);
            }
        });
    };

    that.timeout = function () {
        my.process(function () {
            CentralDispatch.RequestMap.remove(that);
            if (my.callbacks.onTimeout) {
                my.callbacks.onTimeout(that);
            }
        });
    };

    that.addToDom = function () {
        document.body.appendChild(that.element);
    };

    that.isExecuted = function () {
        return my.executed;
    };

    // Init
    my.executed = false;
    CentralDispatch.RequestMap.add(that);
    my.setCallbacks();
    my.setTimeout();
    my.setElement();

    return that;
};

CentralDispatch.RequestMap = function () {
    var klass = {}, requests = {}, findAllFor;

    findAllFor = function (url) {
        var regex, fullUrl;

        // Exit with an exact match if possible for speed
        if (requests[url]) {
            return requests[url];
        }

        // TODO: The following is innefficient in the case of many requests
        regex = new RegExp(url + '$');
        for (fullUrl in requests) {
            if (requests.hasOwnProperty(fullUrl)) {
                if (regex.test(fullUrl)) {
                    return requests[fullUrl];
                }
            }
        }
        // Incase we don't find anything
        return [];
    };

    klass.add = function (request) {
        requests[request.url] = requests[request.url] || [];
        requests[request.url].push(request);
    };

    klass.runAllFor = function (url, data) {
        var matches, current;
        matches = findAllFor(url);
        current = matches.pop();
        while (current) {
            // TODO: Should clone data so that functions don't spoil the fun for
            // others.
            current.success(data); 
            current = matches.pop();
        }
    };

    klass.remove = function (request) {
        var matches, i, match;
        matches = findAllFor(request.url);
        for (i = 0; i < matches.length; i += 1) {
            if (matches[i] === request) {
                match = i;
                break;
            }
        }

        if (match !== undefined) {
            matches.splice(match, 1);
        }
    };

    return klass;
}();

