Screw.Unit(function() {
    describe('CentralDispatch', function() {
        describe('requesting data from a url', function() {
            it('should write a script tag', function() {
                var url = 'http://test.host/';
                CentralDispatch.requestData(url, function() {});
                expect(document.body.lastChild.src).to(equal, url);
            });
        });

        describe('registered to receive data from http://test.host/test.js', function() {
            var callback, requestedUrl, storedData;

            before(function() {
                callback = function(data) { storedData = data };
                requestedUrl = 'http://test.host/test.js';
                CentralDispatch.requestData(requestedUrl, callback);
            });

            it('should callback when receiving data for http://test.host/test.js', function() {
                var url = 'http://test.host/test.js';
                var data = {hello: 'bob'};
                CentralDispatch.receiveData(url, data);
                expect(storedData).to(equal, data);
            });
        });
    });
});
