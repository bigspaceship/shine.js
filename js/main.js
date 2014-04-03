(function(){
  var shines = [];
  var shineElements = document.querySelectorAll('.shine');

  for (var i = 0; i < shineElements.length; i++) {
    var element = shineElements[i];
    var rect = element.getBoundingClientRect();
    var shine = new Shine(element);
    shine.light.position.x = rect.left + rect.width * 0.5;
    shine.light.position.y = rect.top - rect.height;
    shine.draw();
    shines.push(shine);
  }
})();
