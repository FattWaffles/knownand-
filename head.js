/* Runs before first paint: apply the saved theme so the page does not flash. */
try {
  var t = localStorage.getItem('known-theme');
  if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
} catch (e) {}
