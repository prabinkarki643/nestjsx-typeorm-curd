import { ApiProperty } from '@nestjs/swagger';

export class CreateExampleDto {
  @ApiProperty({ required: true })
  title: string;

  @ApiProperty()
  description?: string;
}
