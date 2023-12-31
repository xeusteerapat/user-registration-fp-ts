import { Newtype, iso } from 'newtype-ts';
import { PositiveInteger } from 'newtype-ts/lib/PositiveInteger';
import * as E from 'fp-ts/lib/Either';

export type UserRegistrationDto = {
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  country: string;
};

export type Gender = 'M' | 'F' | 'X';

export type Europe = {
  readonly _type: 'Europe';
};

export type NorthAmerica = {
  readonly _type: 'NorthAmerica';
};

export type Other = {
  readonly _type: 'Other';
};

export type Region = Europe | NorthAmerica | Other;

export type FirstName = Newtype<{ readonly FirstName: unique symbol }, string>;
export type LastName = Newtype<{ readonly LastName: unique symbol }, string>;

export const firstName = iso<FirstName>();
export const lastName = iso<LastName>();

export type User = {
  firstName: FirstName;
  lastName: LastName;
  age: PositiveInteger;
  gender: Gender;
  region: Region;
};

export type FieldNotEmpty = (
  e: UserRegistrationDto
) => E.Either<string, UserRegistrationDto>;

export type ValidateAge = FieldNotEmpty;
export type ValidateGender = FieldNotEmpty;
