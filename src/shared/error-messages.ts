import { ValidationArguments } from 'class-validator';

// Every function receives a ValidationArguments object from class-validator:
//   args.property    -> name of the validated field (e.g. "name")
//   args.value       -> the value the client sent
//   args.constraints -> the rule parameters (e.g. [3] for @MinLength(3))

// Message used when a required field is missing or empty
export const requiredMessage = (args: ValidationArguments): string =>
  `Le champ "${args.property}" est obligatoire.`;

// ONE function for both @MinLength and @MaxLength.
// It is a "function that returns a function": call it with 'min' or 'max',
// and it gives back the message function class-validator expects.
export const lengthMessage =
  (type: 'min' | 'max') =>
  (args: ValidationArguments): string => {
    // Wording changes with the condition being checked
    const condition = type === 'min' ? "d'au moins" : "d'au plus";
    // For @MinLength(3) / @MaxLength(10), constraints[0] holds 3 / 10
    const limit = args.constraints[0];
    // Length actually received (the value may be undefined, so we protect it)
    const received = args.value?.length ?? 0;

    return `Le champ '${args.property}' doit contenir ${condition} ${limit} caractères (reçu : ${received}).`;
  };

  // Message used when a value is not one of the allowed enum values.
// Object.values(enum) lists the allowed values, so the message stays
// correct automatically if the enum changes.
export const enumMessage =
  (allowed: object) =>
  (args: ValidationArguments): string =>
    `Le champ "${args.property}" doit être l'une de ces valeurs : ${Object.values(allowed).join(', ')}.`;