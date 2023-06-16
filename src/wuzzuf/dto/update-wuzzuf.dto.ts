import { PartialType } from '@nestjs/mapped-types';
import { CreateWuzzufDto } from './create-wuzzuf.dto';

export class UpdateWuzzufDto extends PartialType(CreateWuzzufDto) {}
