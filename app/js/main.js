(function(){
  var shines = null;
  var lightPosition = new shinejs.Point();

  function init() {
    initShines();

    window.addEventListener('resize', handleViewportUpdates, false);
    window.addEventListener('scroll', handleViewportUpdates, false);

    handleViewportUpdates();
  }

  function initExampleLinks() {

  }

  function initShines() {
    destroyShines();

    shines = [];

    var shineElements = document.querySelectorAll('.demo-header .shine');

    for (var i = 0; i < shineElements.length; i++) {
      var element = shineElements[i];
      var shine = new Shine(element);
      shine.light.position = lightPosition;
      shine.draw();
      shines.push(shine);
    }
  }

  function destroyShines() {
    if (!shines) {
      return;
    }

    for (var i = 0; i < shines.length; i++) {
      var shine = shines[i];
      shine.destroy();
    }

    shines = null;
  }

  function handleViewportUpdates(event) {
    lightPosition.x = window.innerWidth * 0.5;
    lightPosition.y = window.innerHeight * 0.15;

    for (var i = 0; i < shines.length; i++) {
      shines[i].draw();
    }
  }

  init();
})();
