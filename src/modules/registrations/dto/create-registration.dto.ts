import { IsOptional, IsString, IsEnum, IsUrl } from 'class-validator';
import { education_level } from '../enums/education-level.enum';

export class CreateRegistrationDto {
  @IsOptional()
  @IsUrl()
  linkedinProfile?: string;

  @IsOptional()
  @IsEnum(education_level)
  educationLevel?: education_level;

  @IsOptional()
  @IsString()
  motivation?: string;
}
