/* migamiga footer.en.js */
(function () {
  var mount = document.getElementById('site-footer');
  if (!mount) return;
  var year = new Date().getFullYear();
  mount.innerHTML =
    '<footer class="footer"><div class="footer__inner">' +
      '<div>' +
        '<strong>migamiga</strong><br>' +
        'Sandwiches, like home. Just better.<br>' +
        'Berlin · Mon–Fri 11:30–14:30' +
      '</div>' +
      '<div class="footer__links">' +
        '<strong>Contact</strong>' +
        '<a href="https://wa.me/491701234567">WhatsApp</a>' +
        '<a href="https://instagram.com/migamiga_berlin">Instagram</a>' +
        '<a href="mailto:hola@migamiga.de">hola@migamiga.de</a>' +
      '</div>' +
      '<div class="footer__links">' +
        '<strong>Legal (DE)</strong>' +
        '<a href="../impressum">Impressum</a>' +
        '<a href="../datenschutz">Datenschutz</a>' +
        '<span>© ' + year + ' migamiga</span>' +
      '</div>' +
    '</div></footer>';
})();
