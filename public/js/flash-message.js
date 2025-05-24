document.addEventListener('DOMContentLoaded', function() {
  const flashMsg = document.querySelector('.flash-message');
  if (flashMsg) {
    setTimeout(() => {
      flashMsg.style.transition = 'opacity 1s';
      flashMsg.style.opacity = '0';
      setTimeout(() => flashMsg.remove(), 1000);
    }, 7000);
  }
});
