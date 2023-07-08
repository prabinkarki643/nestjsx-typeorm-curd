import { ApiProperty } from '@nestjs/swagger';

export class FindAllResponseDto<T> {
  @ApiProperty()
  page: number;

  @ApiProperty()
  pageSize: number;

  @ApiProperty()
  pageCount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  offset: number;

  @ApiProperty()
  pagination: boolean;

  @ApiProperty({ isArray: true })
  data: T[];
}
