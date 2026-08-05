import { Prisma, TransactionType } from "@prisma/client";
import { ApiError } from "@/shared/ApiError";
import { prisma } from "@/database/prisma";

type Tx = Prisma.TransactionClient;

interface LedgerEntryInput {
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

export const pointsService = {
  async debit(tx: Tx, input: LedgerEntryInput) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: input.userId } });
    if (user.points < input.amount) {
      throw ApiError.badRequest("Insufficient points balance");
    }
    const balanceAfter = user.points - input.amount;
    await tx.user.update({ where: { id: input.userId }, data: { points: balanceAfter } });
    return tx.transaction.create({
      data: {
        userId: input.userId,
        type: input.type,
        amount: -input.amount,
        balanceBefore: user.points,
        balanceAfter,
        description: input.description,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
    });
  },

  async credit(tx: Tx, input: LedgerEntryInput) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: input.userId } });
    const balanceAfter = user.points + input.amount;
    await tx.user.update({ where: { id: input.userId }, data: { points: balanceAfter } });
    return tx.transaction.create({
      data: {
        userId: input.userId,
        type: input.type,
        amount: input.amount,
        balanceBefore: user.points,
        balanceAfter,
        description: input.description,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
    });
  },

  async history(userId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);
    return { items, total };
  },
};
