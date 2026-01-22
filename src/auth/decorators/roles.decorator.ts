import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator
 *
 * Restricts route access to specific roles.
 *
 * @example
 * @Roles(Role.ADMIN)
 * @Get('admin-only')
 * adminRoute() { }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
