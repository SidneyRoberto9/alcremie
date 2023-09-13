export function validateTagNameString(str: string): boolean {
  const invalidString = [
    '0_0',
    '3:',
    '!',
    '!!',
    '!!?',
    '!?',
    '(9)',
    '(o)_(o)',
    '+++',
    '+_+',
    '...',
    '._.',
    '/\\/\\/\\',
    ':3',
    ':/',
    ':<',
    ':>',
    ':>=',
    ':d',
    ':i',
    ':o',
    ':p',
    ':q',
    ':t',
    ':x',
    ':|',
    ';3',
    ';)',
    ';d',
    ';o',
    ';p',
    ';q',
    '<o>_<o>',
    '=3',
    '=_=',
    '>:(',
    '>:)',
    '>_<',
    '>_o',
    '>o<',
    '?',
    '??',
    '@_@',
    'm/',
    '\n/',
    'o/',
    '||/',
    '^_^',
    '^o^',
  ];

  let isInvalid = false;

  invalidString.forEach((invalid) => {
    if (str == invalid) {
      isInvalid = true;
    }
  });

  return isInvalid;
}
