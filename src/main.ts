import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Swagger
  const config = new DocumentBuilder()
    .setTitle('TMDB APIs')
    .setDescription('API documentation for the TMDB APIs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('tmdb/docs', app, document);

  await app.listen(3000);
}
bootstrap();
