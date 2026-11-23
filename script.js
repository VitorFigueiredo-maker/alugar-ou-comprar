const form = document.querySelector('#comparison-form');
const purchaseInput = document.querySelector('#purchase-price');
const rentalInput = document.querySelector('#rental-price');
const durationInput = document.querySelector('#duration');
const results = document.querySelector('#results');
const rentalLabel = document.querySelector('#rental-label');
const durationUnit = document.querySelector('#duration-unit');
const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});
const quantity = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1
});

function selectedUnit() {
  return form.querySelector('input[name="rate-unit"]:checked').value;
}

function updateUnitLabels() {
  const isDaily = selectedUnit() === 'day';
  rentalLabel.textContent = isDaily ? 'Aluguel por dia' : 'Aluguel por mês';
  durationUnit.textContent = isDaily ? 'dias' : 'meses';
  rentalInput.placeholder = isDaily ? '35,00' : '250,00';
}

function hideResultsOnEdit() {
  results.hidden = true;
}

function showComparison() {
  rentalInput.setCustomValidity('');
  if (!form.reportValidity()) return;

  const purchasePrice = purchaseInput.valueAsNumber;
  const rentalPrice = rentalInput.valueAsNumber;
  const duration = durationInput.valueAsNumber;
  const rentalTotal = rentalPrice * duration;
  const breakEven = purchasePrice / rentalPrice;

  if (![purchasePrice, rentalPrice, duration, rentalTotal, breakEven].every(Number.isFinite)) {
    rentalInput.setCustomValidity('Use valores menores para que a estimativa possa ser calculada.');
    rentalInput.reportValidity();
    return;
  }

  const difference = Math.abs(rentalTotal - purchasePrice);
  const tie = difference < 0.005;
  const rentalWins = rentalTotal < purchasePrice && !tie;
  const unit = selectedUnit() === 'day' ? 'dias' : 'meses';

  document.querySelector('#rent-total').textContent = currency.format(rentalTotal);
  document.querySelector('#purchase-total').textContent = currency.format(purchasePrice);
  document.querySelector('#difference-total').textContent = currency.format(difference);
  document.querySelector('#rent-caption').textContent = `${currency.format(rentalPrice)} × ${quantity.format(duration)} ${unit}`;
  document.querySelector('#difference-caption').textContent = tie
    ? 'Os valores são praticamente iguais'
    : `Economia estimada ${rentalWins ? 'alugando' : 'comprando'}`;

  document.querySelector('#result-title').textContent = tie
    ? 'Os custos ficam praticamente iguais'
    : rentalWins ? 'Alugar custa menos neste período' : 'Comprar custa menos neste período';
  document.querySelector('#result-message').textContent = tie
    ? 'Com os valores informados, a diferença entre os cenários é inferior a um centavo.'
    : `A estimativa indica que ${rentalWins ? 'alugar' : 'comprar'} custa ${currency.format(difference)} menos neste período.`;
  document.querySelector('#winner-badge').textContent = tie
    ? 'CUSTOS EQUIVALENTES'
    : `MAIS ECONÔMICO: ${rentalWins ? 'ALUGAR' : 'COMPRAR'}`;

  const scale = Math.max(rentalTotal, purchasePrice);
  document.querySelector('#rent-bar').style.width = `${(rentalTotal / scale) * 100}%`;
  document.querySelector('#purchase-bar').style.width = `${(purchasePrice / scale) * 100}%`;
  document.querySelector('#break-even').textContent = `Ponto de equilíbrio: o custo acumulado do aluguel alcança o preço de compra em cerca de ${quantity.format(breakEven)} ${unit}. Depois desse período, comprar tende a custar menos.`;
  results.hidden = false;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  showComparison();
});

form.addEventListener('input', hideResultsOnEdit);
form.querySelectorAll('input[name="rate-unit"]').forEach((input) => {
  input.addEventListener('change', () => {
    updateUnitLabels();
    hideResultsOnEdit();
  });
});

rentalInput.addEventListener('input', () => rentalInput.setCustomValidity(''));
updateUnitLabels();
