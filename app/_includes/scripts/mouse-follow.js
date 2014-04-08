var shine = new Shine(document.getElementById('shine-example'));

function handleMouseMove(event) {
  shine.light.position.x = event.clientX;
  shine.light.position.y = event.clientY;
  shine.draw();
}

function handleViewportUpdate(){
  shine.draw();
}

window.addEventListener('resize', handleViewportUpdate);
window.addEventListener('scroll', handleViewportUpdate);
window.addEventListener('mousemove', handleMouseMove);

shine.draw();
