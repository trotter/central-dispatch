var CentralDispatch = function() {
    var klass = {};

    klass.requestData = function(url, callback) {
        var tag = document.createElement('script');
        tag.src = url;
        document.body.appendChild(tag);
    };

    return klass;
}();
