import { Injectable } from '@nestjs/common';
import { TypeOrmCurdService } from '@nestjsx/typeorm-curd';
import { Example } from './entities/example.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ExampleService extends TypeOrmCurdService<Example> {
  constructor(
    @InjectRepository(Example)
    public readonly egRepository: Repository<Example>,
  ) {
    super(egRepository);
  }
}
