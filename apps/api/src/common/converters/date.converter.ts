const UNITS = [
  '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho',
  'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis',
  'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós',
  'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete',
  'veintiocho', 'veintinueve', 'treinta', 'treinta y uno',
];

const TENS = [
  '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta',
  'setenta', 'ochenta', 'noventa',
];

const HUNDREDS = [
  '', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos',
  'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function numberToWords(n: number): string {
  if (n === 0) return 'cero';
  if (n < 0) return `menos ${numberToWords(-n)}`;
  if (n <= 31) return UNITS[n];
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const unit = n % 10;
    return unit === 0 ? TENS[tens] : `${TENS[tens]} y ${UNITS[unit]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    if (rest === 0) return HUNDREDS[h];
    const hundredWord = h === 1 ? 'ciento' : HUNDREDS[h];
    return `${hundredWord} ${numberToWords(rest)}`;
  }
  if (n < 2000) {
    const rest = n % 1000;
    return rest === 0 ? 'mil' : `mil ${numberToWords(rest)}`;
  }
  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const rest = n % 1000;
    return rest === 0
      ? `${numberToWords(thousands)} mil`
      : `${numberToWords(thousands)} mil ${numberToWords(rest)}`;
  }
  return String(n);
}

export function convertDateToWords(dateStr: string): string {
  // Accepts DD/MM/YYYY or YYYY-MM-DD
  let day: number, month: number, year: number;

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    return dateStr;
  }

  const dayWord = numberToWords(day);
  const monthWord = MONTHS[month - 1] ?? '';
  const yearWord = numberToWords(year);

  return `${dayWord} de ${monthWord} de ${yearWord}`;
}

export { numberToWords };
