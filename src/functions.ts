import * as E from 'fp-ts/lib/Either';
import {
  FieldNotEmpty,
  ValidateAge,
  ValidateGender,
  UserRegistrationDto,
} from './domain';
import { pipe } from 'fp-ts/lib/function';
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray';
import { sequenceT } from 'fp-ts/lib/Apply';

const applicativeValidation = E.getApplicativeValidation(
  getSemigroup<string>()
);

type Validation = (
  evt: UserRegistrationDto
) => E.Either<NonEmptyArray<string>, UserRegistrationDto>;

const fieldsNotEmpty: Validation = evt =>
  evt.firstName && evt.lastName && evt.age && evt.sex && evt.country
    ? E.right(evt)
    : E.left(['Please fill in all required fields']);

const validateAge: Validation = evt =>
  evt.age >= 18 && evt.age < 150
    ? E.right(evt)
    : E.left([`Invalid age of ${evt.age}`]);

const validateGender: Validation = evt =>
  evt.sex === 'M' || evt.sex === 'F' || evt.sex === 'X'
    ? E.right(evt)
    : E.left([`Invalid sex of ${evt.sex}`]);

const exampleRegistrationEvent: UserRegistrationDto = {
  firstName: 'John',
  lastName: 'Doe',
  sex: 'M',
  age: 18,
  country: 'Thailand',
};

const first = fieldsNotEmpty(exampleRegistrationEvent); // E.Either<string, UserRegistrationDto>
const second = E.chain(validateAge)(first); // E.Either<string, UserRegistrationDto>
const result = E.chain(validateGender)(second);
console.log(result);

/* result:
{
  _tag: 'Right',
  right: {
    firstName: 'John',
    lastName: 'Doe',
    sex: 'M',
    age: 25,
    country: 'Thailand'
  }
}
*/

// with pipe
const result2 = pipe(
  exampleRegistrationEvent,
  fieldsNotEmpty,
  E.chain(validateAge),
  E.chain(validateGender)
);

console.log(result2); // same result as above

const exampleOfLeftResult: UserRegistrationDto = {
  firstName: 'John',
  lastName: 'Doe',
  sex: 'G',
  age: 13,
  country: 'Thailand',
};

// with pipe sequence
const resultWithSequence = pipe(
  exampleOfLeftResult,
  evt =>
    sequenceT(applicativeValidation)(
      fieldsNotEmpty(evt),
      validateAge(evt),
      validateGender(evt)
    ),
  E.map(([evt]) => evt)
);
console.log(resultWithSequence); // { _tag: 'Left', left: [ 'Invalid age of 13', 'Invalid sex of G' ] }
