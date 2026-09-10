

// ── FILTROS ──────────────────────────────────────────────────────
function getChecked(filterName) {
  return [...document.querySelectorAll(`input[data-filter="${filterName}"]:checked`)]
    .map(i => i.value);
}

function getRadio(name) {
  const r = document.querySelector(`input[name="${name}"]:checked`);
  return r ? r.value : null;
}

function applyFilters() {
  const tipos = getChecked('tipo');
  const hp    = getRadio('hp');
  const volts = getChecked('volt');

  document.querySelectorAll('[data-tipo]').forEach(card => {
    const visible =
      (!tipos.length || tipos.includes(card.dataset.tipo)) &&
      (!hp           || card.dataset.hp === hp)            &&
      (!volts.length || volts.includes(card.dataset.volt));

    card.style.display = visible ? '' : 'none';
  });
}

document.querySelectorAll('input[data-filter], input[name="hp"]')
  .forEach(input => input.addEventListener('change', applyFilters));
