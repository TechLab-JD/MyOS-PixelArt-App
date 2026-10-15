// MyOS Pixel Art — a tiny grid painter. Pure static, saves to localStorage.
(function () {
  var grid = document.getElementById('pa-grid');
  if (!grid) return;
  var colorEl = document.getElementById('pa-color');
  var eraseBtn = document.getElementById('pa-erase');
  var sizeSel = document.getElementById('pa-size');
  var palEl = document.getElementById('pa-pal');
  var EMPTY = '#20242e';
  var PAL = ['#000000', '#ffffff', '#e23d3d', '#f0932b', '#f6e58d', '#6ab04c',
    '#22a6b3', '#4e8cff', '#be2edd', '#ff7979', '#7ed6df', '#535c68'];
  var KEY = 'myos.pixelart.';
  var painting = false, erasing = false, size = 16, cells = [];

  function cellPx(n) { return n <= 8 ? 30 : n <= 16 ? 20 : n <= 24 ? 14 : 10; }

  PAL.forEach(function (c) {
    var s = document.createElement('div');
    s.className = 'pa-sw'; s.style.background = c; s.title = c;
    s.onclick = function () { colorEl.value = c; setErase(false); };
    palEl.appendChild(s);
  });

  function setErase(on) { erasing = on; eraseBtn.classList.toggle('on', on); }
  eraseBtn.onclick = function () { setErase(!erasing); };

  function paint(cell) { cell.style.background = erasing ? EMPTY : colorEl.value; }

  function rgbToHex(s) {
    if (!s || s.charAt(0) === '#') return s;
    var m = s.match(/\d+/g);
    if (!m) return s;
    return '#' + m.slice(0, 3).map(function (n) {
      return ('0' + parseInt(n, 10).toString(16)).slice(-2);
    }).join('');
  }

  function save() {
    try {
      var a = cells.map(function (c) {
        var b = c.style.background;
        return (!b || b === EMPTY) ? 0 : rgbToHex(b);
      });
      localStorage.setItem(KEY + size, JSON.stringify(a));
    } catch (e) {}
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY + parseInt(sizeSel.value, 10))); }
    catch (e) { return null; }
  }

  function build(saved) {
    size = parseInt(sizeSel.value, 10);
    grid.innerHTML = ''; cells = [];
    var px = cellPx(size);
    grid.style.gridTemplateColumns = 'repeat(' + size + ',' + px + 'px)';
    for (var i = 0; i < size * size; i++) {
      var d = document.createElement('div');
      d.className = 'pa-cell';
      d.style.width = px + 'px'; d.style.height = px + 'px';
      d.style.background = (saved && saved[i]) ? saved[i] : EMPTY;
      (function (dd) {
        dd.addEventListener('mousedown', function (e) { e.preventDefault(); painting = true; paint(dd); });
        dd.addEventListener('mouseover', function () { if (painting) paint(dd); });
      })(d);
      grid.appendChild(d); cells.push(d);
    }
  }

  document.addEventListener('mouseup', function () { if (painting) { painting = false; save(); } });

  sizeSel.onchange = function () { build(load()); };
  document.getElementById('pa-clear').onclick = function () { build(null); save(); };
  document.getElementById('pa-export').onclick = function () {
    var scale = 16, cv = document.createElement('canvas');
    cv.width = size * scale; cv.height = size * scale;
    var ctx = cv.getContext('2d');
    for (var i = 0; i < cells.length; i++) {
      var b = cells[i].style.background;
      if (b && b !== EMPTY) {
        ctx.fillStyle = b;
        ctx.fillRect((i % size) * scale, Math.floor(i / size) * scale, scale, scale);
      }
    }
    var a = document.createElement('a');
    a.download = 'pixel-art-' + size + 'x' + size + '.png';
    a.href = cv.toDataURL('image/png'); a.click();
  };

  build(load());
})();
