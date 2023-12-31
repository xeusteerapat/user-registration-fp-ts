import * as E from 'fp-ts/lib/Either';
import {
  FieldNotEmpty,
  ValidateAge,
  ValidateGender,
  UserRegistrationDto,
} from './domain';
import { pipe } from 'fp-ts/lib/function';

const fieldsNotEmpty: FieldNotEmpty = evt =>
  evt.firstName && evt.lastName && evt.age && evt.sex && evt.country
    ? E.right(evt)
    : E.left('Please fill in all required fields');

const validateAge: ValidateAge = evt =>
  evt.age >= 18 && evt.age < 150
    ? E.right(evt)
    : E.left(`Invalid age of ${evt.age}`);

const validateGender: ValidateGender = evt =>
  evt.sex === 'M' || evt.sex === 'F' || evt.sex === 'X'
    ? E.right(evt)
    : E.left(`Invalid sex of ${evt.sex}`);

const exampleRegistrationEvent: UserRegistrationDto = {
  firstName: 'John',
  lastName: 'Doe',
  sex: 'M',
  age: 25,
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
