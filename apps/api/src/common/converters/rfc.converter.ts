const DIGIT_WORDS: Record<string, string> = {
  '0': 'cero',
  '1': 'uno',
  '2': 'dos',
  '3': 'tres',
  '4': 'cuatro',
  '5': 'cinco',
  '6': 'seis',
  '7': 'siete',
  '8': 'ocho',
  '9': 'nueve',
};

const LETTER_WORDS: Record<string, string> = {
  A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H',
  I: 'I', J: 'J', K: 'K', L: 'L', M: 'M', N: 'N', Ñ: 'Ñ', O: 'O',
  P: 'P', Q: 'Q', R: 'R', S: 'S', T: 'T', U: 'U', V: 'V', W: 'W',
  X: 'X', Y: 'Y', Z: 'Z',
};

function charToWord(char: string): string {
  if (DIGIT_WORDS[char]) return DIGIT_WORDS[char];
  if (LETTER_WORDS[char.toUpperCase()]) return LETTER_WORDS[char.toUpperCase()];
  return char;
}

export function convertRfcToWords(rfc: string): string {
  // RFC format: AAAA######XXX (13 chars) or AAAA######XX (12 chars for moral)
  // Letters first 4 → keep as letters, digits → words, suffix → letters
  const upper = rfc.toUpperCase().trim();
  const parts: string[] = [];

  // First 4: letters (name initials) - spell as individual letters
  const nameChars = upper.slice(0, 4);
  parts.push(nameChars); // keep name initials grouped

  // Middle 6: digits (YYMMDD) - spell each digit
  const dateChars = upper.slice(4, 10);
  for (const c of dateChars) {
    parts.push(charToWord(c));
  }

  // Suffix: homoclave (2-3 chars, mix of letters/digits)
  const suffix = upper.slice(10);
  for (const c of suffix) {
    parts.push(charToWord(c));
  }

  return parts.join(' ');
}

export function convertCurpToWords(curp: string): string {
  const upper = curp.toUpperCase().trim();
  return upper.split('').map(charToWord).join(' ');
}

export function convertClaveElectorToWords(clave: string): string {
  const upper = clave.toUpperCase().trim();
  return upper.split('').map(charToWord).join(' ');
}
