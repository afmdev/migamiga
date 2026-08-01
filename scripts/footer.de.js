/* migamiga footer.de.js — injects translated footer into <div id="site-footer">. */
(function () {
  var mount = document.getElementById('site-footer');
  if (!mount) return;
  var year = new Date().getFullYear();
  mount.innerHTML =
    '<footer class="footer"><div class="footer__inner">' +
      '<div>' +
        '<strong>migamiga</strong><br>' +
        'Sandwiches, wie zuhause. Aber besser.<br>' +
        'Berlin · Mo–Fr 11:30–14:30' +
      '</div>' +
      '<div class="footer__links">' +
        '<strong>Kontakt</strong>' +
        '<a href="https://wa.me/491701234567">WhatsApp</a>' +
        '<a href="https://instagram.com/migamiga_berlin">Instagram</a>' +
        '<a href="mailto:hola@migamiga.de">hola@migamiga.de</a>' +
      '</div>' +
      '<div class="footer__links">' +
        '<strong>Rechtliches</strong>' +
        '<a href="../impressum">Impressum</a>' +
        '<a href="../datenschutz">Datenschutz</a>' +
        '<span>© ' + year + ' migamiga</span>' +
      '</div>' +
    '</div></footer>';
})();
