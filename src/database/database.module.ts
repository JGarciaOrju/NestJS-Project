import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * DatabaseModule
 *
 * Global module responsible for database access.
 *
 * Why @global():
 * - Avoids importing DatabaseModule in every feature module.
 * - PrismaService becomes available application-wide
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
