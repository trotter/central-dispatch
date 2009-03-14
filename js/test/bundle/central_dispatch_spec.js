Screw.Unit(function() {
    describe('CentralDispatch', function() {
        describe('requesting data from a url', function() {
            it('should write a script tag', function() {
                var url = 'http://test.host/';
                CentralDispatch.requestData(url, function() {});
                expect(document.body.lastChild.src).to(equal, url);
            });
        });
    });
});
