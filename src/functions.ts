import { sequenceT } from 'fp-ts/lib/Apply';
import * as E from 'fp-ts/lib/Either';
import { NonEmptyArray, getSemigroup } from 'fp-ts/lib/NonEmptyArray';
import { pipe } from 'fp-ts/lib/function';
import {
  CreateUser,
  Europe,
  FindGender,
  FindRegion,
  NorthAmerica,
  Other,
  Region,
  UserRegistrationDto,
  firstNameIso,
  lastNameIso,
} from './domain';
import * as O from 'fp-ts/lib/Option';
import { prismPositiveInteger } from 'newtype-ts/lib/PositiveInteger';

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

const america: NorthAmerica = { _type: 'NorthAmerica' };
const europe: Europe = { _type: 'Europe' };
const other: Other = { _type: 'Other' };

const countryMappings: Record<string, Region> = {
  Belgium: europe,
  USA: america,
  Germany: europe,
  Thailand: other,
};

const createUser: CreateUser = (firstName, lastName, age, gender, region) => ({
  firstName,
  lastName,
  age,
  gender,
  region,
});

const findRegion: FindRegion = country =>
  countryMappings[country] ? O.some(countryMappings[country]) : O.none;

const findGender: FindGender = sex =>
  sex === 'M' || sex === 'F' || sex === 'X' ? O.some(sex) : O.none;

const sequenceForOption = sequenceT(O.option);

const newUserRegistrationEvent: UserRegistrationDto = {
  firstName: 'Teerapat',
  lastName: 'Xeus',
  age: 37,
  sex: 'M',
  country: 'Thailand',
};

const newUser = pipe(
  newUserRegistrationEvent,
  evt =>
    sequenceForOption(
      O.some(firstNameIso.wrap(evt.firstName)),
      O.some(lastNameIso.wrap(evt.lastName)),
      prismPositiveInteger.getOption(evt.age),
      findGender(evt.sex),
      findRegion(evt.country)
    ),
  O.map(([f, l, a, g, c]) => createUser(f, l, a, g, c))
);

console.log(newUser);
/**
{
  _tag: 'Some',
  value: {
    firstName: 'Teerapat',
    lastName: 'Xeus',
    age: 37,
    gender: 'M',
    region: { _type: 'Other' }
  }
}
*/

// example for failed validation
const failedUserRegistrationEvent: UserRegistrationDto = {
  firstName: 'Jane',
  lastName: 'Doe',
  age: 37,
  sex: 'M',
  country: 'Canada',
};

const failedValidateUser = pipe(
  failedUserRegistrationEvent,
  evt =>
    sequenceForOption(
      O.some(firstNameIso.wrap(evt.firstName)),
      O.some(lastNameIso.wrap(evt.lastName)),
      prismPositiveInteger.getOption(evt.age),
      findGender(evt.sex),
      findRegion(evt.country)
    ),
  O.map(([f, l, a, g, c]) => createUser(f, l, a, g, c))
);

console.log(failedValidateUser); // { _tag: 'None' }
