var CentralDispatch = function() {
    var klass = {};
    var callbacks = {};

    klass.requestData = function(url, callback) {
        callbacks[url] = callback;
        var tag = document.createElement('script');
        tag.src = url;
        document.body.appendChild(tag);
    };

    klass.receiveData = function(url, data) {
        callbacks[url](data);
    };

    return klass;
}();
