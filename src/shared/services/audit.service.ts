import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

interface AuditInput {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

export class AuditService {
  async log(input: AuditInput) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: input.userId,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId,
          details: (input.details ?? Prisma.JsonNull) as Prisma.InputJsonValue,
          ipAddress: input.ipAddress,
        },
      });
    } catch {
      // Silently fail - audit should never break the main flow
    }
  }
}

export const auditService = new AuditService();
