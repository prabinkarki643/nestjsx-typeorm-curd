import { Module } from '@nestjs/common';
import { ExampleService } from './example.service';
import { ExampleController } from './example.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Example } from './entities/example.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Example]),],
  controllers: [ExampleController],
  providers: [ExampleService]
})
export class ExampleModule {}
