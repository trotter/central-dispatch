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

CentralDispatch.request = function (spec, private) {
    var public;
    public = {};
    public.url = spec.url;

    private = private || {};
    private.timeout = null;

    // Private methods
    private.setCallbacks = function () {
        if (typeof(spec.callbacks) === 'function') {
            private.callbacks = { onSuccess: spec.callbacks };
        } else {
            private.callbacks = spec.callbacks;
        }
    };

    private.setTimeout = function () {
        if (CentralDispatch.timeout) {
            if (window) {
                private.timeout = window.setTimeout(function () {
                    public.timeout();
                }, CentralDispatch.timeout);
            }
        }
    };

    private.setElement = function () {
        var element;
        element = document.createElement('script');
        element.src = public.url;
        element.onerror = public.error;
        public.element = element;
    };

    private.process = function (func) {
        if (!private.executed) {
            private.executed = true;
            private.cleanupElement();
            func();
        }
    };

    private.cleanupElement = function () {
        if (public.element) {
            document.body.removeChild(public.element); 
            public.element = null; 
        }
    };

    private.cleanupTimeout = function () {
        if (private.timeout) {
            window.clearTimeout(private.timeout);
            private.timeout = null;
        }
    };

    // Public methods
    public.success = function (data) { 
        private.process(function () {
            private.cleanupTimeout();
            if (private.callbacks.onSuccess) {
                private.callbacks.onSuccess(data); 
            }
        });
    };

    public.error = function (msg, url, line) {
        private.process(function () {
            CentralDispatch.RequestMap.remove(public);
            private.cleanupTimeout();
            if (private.callbacks.onError) {
                private.callbacks.onError(msg, url, line);
            }
        });
    };

    public.timeout = function () {
        private.process(function () {
            CentralDispatch.RequestMap.remove(public);
            if (private.callbacks.onTimeout) {
                private.callbacks.onTimeout(public);
            }
        });
    };

    public.addToDom = function () {
        document.body.appendChild(public.element);
    };

    public.isExecuted = function () {
        return private.executed;
    };

    // Init
    private.executed = false;
    CentralDispatch.RequestMap.add(public);
    private.setCallbacks();
    private.setTimeout();
    private.setElement();

    return public;
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

