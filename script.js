let expression = '';
let justCalculated = false;

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

function updateDisplay(value) {
  resultEl.textContent = value;
}

function appendToDisplay(value) {
  const operators = ['+', '-', '*', '/'];
  const lastChar = expression.slice(-1);

  // If a calculation was just done and user types a number, start fresh
  if (justCalculated) {
    if (!operators.includes(value)) {
      expression = '';
    }
    justCalculated = false;
  }

  // Prevent multiple operators in a row
  if (operators.includes(value) && operators.includes(lastChar)) {
    expression = expression.slice(0, -1);
  }

  // Prevent multiple decimal points in the same number
  if (value === '.') {
    const parts = expression.split(/[\+\-\*\/]/);
    const currentPart = parts[parts.length - 1];
    if (currentPart.includes('.')) return;
  }

  // Prevent leading operator (except minus for negative)
  if (expression === '' && operators.includes(value) && value !== '-') return;

  expression += value;
  expressionEl.textContent = formatExpression(expression);
  updateDisplay(expression === '' ? '0' : formatExpression(expression));
}

function formatExpression(expr) {
  return expr
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−');
}

function clearAll() {
  expression = '';
  justCalculated = false;
  expressionEl.textContent = '';
  updateDisplay('0');
}

function deleteLast() {
  if (justCalculated) {
    clearAll();
    return;
  }
  expression = expression.slice(0, -1);
  expressionEl.textContent = formatExpression(expression);
  updateDisplay(expression === '' ? '0' : formatExpression(expression));
}

function toggleSign() {
  if (!expression || expression === '0') return;

  if (expression.startsWith('-')) {
    expression = expression.slice(1);
  } else {
    expression = '-' + expression;
  }

  expressionEl.textContent = formatExpression(expression);
  updateDisplay(formatExpression(expression));
}

function calculate() {
  if (!expression) return;

  try {
    // Evaluate safely — only allow numbers and basic operators
    if (!/^[-\d+\-*/().]+$/.test(expression)) {
      updateDisplay('Error');
      return;
    }

    const rawResult = Function('"use strict"; return (' + expression + ')')();

    if (!isFinite(rawResult)) {
      expressionEl.textContent = formatExpression(expression);
      updateDisplay('Error');
      expression = '';
      return;
    }

    // Round to avoid floating point noise (e.g. 0.1 + 0.2)
    const rounded = parseFloat(rawResult.toPrecision(12));

    expressionEl.textContent = formatExpression(expression) + ' =';
    updateDisplay(rounded);
    expression = String(rounded);
    justCalculated = true;
  } catch {
    updateDisplay('Error');
    expression = '';
  }
}

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') appendToDisplay(e.key);
  else if (e.key === '+') appendToDisplay('+');
  else if (e.key === '-') appendToDisplay('-');
  else if (e.key === '*') appendToDisplay('*');
  else if (e.key === '/') { e.preventDefault(); appendToDisplay('/'); }
  else if (e.key === '.') appendToDisplay('.');
  else if (e.key === 'Enter' || e.key === '=') calculate();
  else if (e.key === 'Backspace') deleteLast();
  else if (e.key === 'Escape') clearAll();
});
