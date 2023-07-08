import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TypeOrmCurdControllerFactory } from '@nestjsx/typeorm-curd';
import { CreateExampleDto } from './dto/create-example.dto';
import { UpdateExampleDto } from './dto/update-example.dto';
import { Example } from './entities/example.entity';
import { ExampleService } from './example.service';

@ApiTags('Example Controller')
@Controller('example')
export class ExampleController extends TypeOrmCurdControllerFactory<Example>({
  modal: {
    type: Example,
  },
  routes: {
    create: {
      dto: CreateExampleDto,
    },
    update: {
      dto: UpdateExampleDto,
    },
  },
}) {
  constructor(private readonly exampleService: ExampleService) {
    super(exampleService);
  }
}
