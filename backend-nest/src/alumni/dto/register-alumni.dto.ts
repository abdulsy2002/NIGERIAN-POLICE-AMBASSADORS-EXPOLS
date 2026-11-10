import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const toOptionalInt = ({ value }: { value: unknown }) => value === '' || value == null ? undefined : Number(value);

export class RegisterAlumniDto {
  @IsEmail()
  email!: string;

  @IsOptional() @IsString() @MinLength(6)
  password?: string;

  @IsOptional() @IsString()
  fullName?: string;

  @IsOptional() @IsString() otherName?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() dateOfBirth?: string;
  @IsOptional() @IsString() nin?: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsString() residentialAddress?: string;
  @IsOptional() @IsString() @MaxLength(2_800_000) passportPhoto?: string;
  @IsOptional() @IsString() schoolAttended?: string;
  @IsOptional() @IsString() admissionNumber?: string;

  @Transform(toOptionalInt)
  @IsOptional() @IsInt() yearOfAdmission?: number;

  @Transform(toOptionalInt)
  @IsOptional() @IsInt() yearOfGraduation?: number;

  @IsOptional() @IsString() houseHostel?: string;
  @IsOptional() @IsString() positionsHeld?: string;
  @IsOptional() @IsString() @MaxLength(5_600_000) ssceCertificate?: string;
  @IsOptional() @IsString() highestQualification?: string;
  @IsOptional() @IsString() currentOccupation?: string;
  @IsOptional() @IsString() stateOfResidence?: string;
  @IsOptional() @IsString() alumniMember?: string;
  @IsOptional() @IsString() stateBase?: string;
  @IsOptional() @IsString() stateBaseCode?: string;
  @IsOptional() @IsString() stateBaseName?: string;
}
