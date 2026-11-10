import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

const toOptionalInt = ({ value }: { value: unknown }) => value === '' || value == null ? undefined : Number(value);

export class RegisterAmbassadorDto {
  @IsEmail() email!: string;
  @IsOptional() @IsString() @MinLength(6) password?: string;
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() gender?: string;
  @IsOptional() @IsString() dateOfBirth?: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() residentialAddress?: string;
  @IsOptional() @IsString() @MaxLength(2_800_000) passportPhoto?: string;
  @IsOptional() @IsString() occupation?: string;
  @IsOptional() @IsString() organization?: string;
  @IsOptional() @IsString() position?: string;
  @Transform(toOptionalInt) @IsOptional() @IsInt() yearsOfExperience?: number;
  @IsOptional() @IsString() linkedinWebsite?: string;
  @IsOptional() @IsString() ambassadorType?: string;
  @IsOptional() @IsString() supportCommitment?: string;
  @IsOptional() @IsString() supportType?: string;
  @IsOptional() @IsString() whyAmbassador?: string;
  @IsOptional() @IsString() messageToStudents?: string;
  @IsOptional() @IsString() @MaxLength(5_600_000) supportingDocument?: string;
  @IsOptional() @IsString() stateBase?: string;
  @IsOptional() @IsString() stateBaseCode?: string;
  @IsOptional() @IsString() stateBaseName?: string;
}
