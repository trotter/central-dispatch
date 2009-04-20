var CentralDispatch = function () {
    var klass = {};

    klass.requestData = function (url, callbacks) {
        var request = CentralDispatch.request({url: url, callbacks: callbacks});
        request.addToDom();
        return request;
    };

    klass.receiveData = function (version, url, data) {
        CentralDispatch.RequestMap.runAllFor(url, data);
    };

    klass.timeout = 60000; // 60 seconds

    return klass;
}();

CentralDispatch.request = function (spec, private) {
    var public, url;
    url = spec.url;

    private = private || {};

    private.setCallbacks = function () {
        if (typeof(spec.callbacks) === 'function') {
            private.callbacks = { onSuccess: spec.callbacks };
        } else {
            private.callbacks = spec.callbacks
        }
    };

    private.setTimeout = function () {
        if (CentralDispatch.timeout) {
            setTimeout(function () {
                public.timeout();
            }, CentralDispatch.timeout);
        }
    };

    private.setElement = function () {
        var element;
        element = document.createElement('script');
        element.src = url;
        element.onerror = public.error;
        public.element = element;
    };

    public = {};
    public.url = spec.url;

    public.success = function (data) { 
        if (!public.executed) {
            private.callbacks.onSuccess(data); 
            if (public.element) {
                document.body.removeChild(public.element); 
                public.element = null; 
            }
        }
        public.executed = true;
    };

    public.error = function (msg, url, line) {
        if (!public.executed) {
            if (private.callbacks.onError) {
                private.callbacks.onError(msg, url, line);
            }
            if (public.element) {
                document.body.removeChild(public.element);
                CentralDispatch.RequestMap.remove(public);
                public.element = null;
            }
        }
        public.executed = true;
    };

    public.timeout = function () {
        if (!public.executed) {
            if (private.callbacks.onTimeout) {
                private.callbacks.onTimeout(public);
            }
            if (public.element) {
                document.body.removeChild(public.element);
            }
            CentralDispatch.RequestMap.remove(public);
            public.element = null;
            public.executed = true;
        }
    };

    public.addToDom = function () {
        document.body.appendChild(public.element);
    };

    // Init
    public.executed = false;
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

