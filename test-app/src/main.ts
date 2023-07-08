import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //Global prefix
  app.setGlobalPrefix('/api');

  const config = new DocumentBuilder()
    .setTitle('API Spec')
    .setDescription('The Test-App API description')
    .setVersion('1.0')
    .addTag('example')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/swagger', app, document);
  await app.listen(3000);

  //Logger Instance
  const logger = new Logger('Main');
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(`Swagger API is running on: ${await app.getUrl()}/swagger`);
}
bootstrap();
