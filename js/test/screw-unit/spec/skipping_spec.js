Screw.Unit(function() {
  
  describe('Skipping Tests', function() {
    it( 'should skip this test. ', function(me){
      skip(me).because('skipping needs to be tested');
      alert('you should not see this!');
    });
    
    it( 'should skip this test in the asynchronous part ', function(me){
      using(me).wait(2).and_then(function(){
        skip(me).because('skipping in ansychronous functions needs to be tested');
      });
    });
    
    describe('Skipping Tests In Groups', function() {

      before(function(me){
        skip(me).because('skipping in the before prevents these tests from being executed at all');
      });
      
      it( 'should not fail ', function(me){
        throw "an error";
      });
      
      it( 'should not succeed ', function(me){
        expect(true).to(be_true);
      });

      it( 'should not execute - no alert should be shown ', function(me){
        alert('you should never see this alert');
      });

    });
    
  });
  
});
