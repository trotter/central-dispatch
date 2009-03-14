Screw.Unit(function() {
  
  describe('Asynchronous Testing', function() {

    it( 'should wait, and then fail, and then pass, showing that the last using-wait-and_then to run determines the final status', function(me) {

      using(me).wait(3).and_then(function() {
        throw "the first wait made it fail, as expected, and this text will remain on the results page.";
      });
      
      using(me).wait(5).and_then(function() {
        if (!me.hasClass('failed')){
          throw "it should have failed by now.";
        }
      });
      
    });

    it( 'should have neither passed nor failed until after all delayed tests have run', function(me){
      using(me).wait(3).and_then(function() {
        expect(me.hasClass('passed')).to(be_false);
        expect(me.hasClass('failed')).to(be_false);
      });
    });
    
    it( 'should allow nested asynchronous tests', function(me) {

      using(me).wait(3).and_then(function() {
        var x = false;
        setTimeout(function(){ x=true }, 1500);
        
        using(me).wait(3).and_then(function() {
          expect(x).to(be_true);
        });
        
      });
        
    });

  });
  
});
