import type {
  Prisma,
  PrismaClient,
  QuoteStatus,
  QuoteItemSourceType
} from '@prisma/client';

export const quoteDetailInclude = {
  project: {
    include: {
      client: { include: { person: true } }
    }
  },
  cuttingList: {
    include: { design: true }
  },
  items: {
    include: {
      material: true,
      sourcePiece: true
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }]
  }
} satisfies Prisma.QuoteInclude;

export type QuoteDetailRecord = Prisma.QuoteGetPayload<{
  include: typeof quoteDetailInclude;
}>;

export class QuoteRepository {
  constructor(private readonly db: PrismaClient) {}

  listByProject(projectId: string) {
    return this.db.quote.findMany({
      where: { projectId },
      include: {
        cuttingList: {
          select: {
            id: true,
            version: true,
            status: true,
            updatedAt: true
          }
        },
        _count: { select: { items: true } }
      },
      orderBy: { version: 'desc' }
    });
  }

  findById(id: string) {
    return this.db.quote.findUnique({
      where: { id },
      include: quoteDetailInclude
    });
  }

  findLatestVersion(projectId: string) {
    return this.db.quote.findFirst({
      where: { projectId },
      orderBy: { version: 'desc' },
      select: { version: true }
    });
  }

  create(data: Prisma.QuoteCreateInput) {
    return this.db.quote.create({
      data,
      include: quoteDetailInclude
    });
  }

  findItemById(id: string) {
    return this.db.quoteItem.findUnique({
      where: { id },
      include: { quote: true }
    });
  }

  updateItem(id: string, data: Prisma.QuoteItemUncheckedUpdateInput) {
    return this.db.quoteItem.update({ where: { id }, data });
  }

  addItem(data: Prisma.QuoteItemUncheckedCreateInput) {
    return this.db.quoteItem.create({ data });
  }

  removeItem(id: string) {
    return this.db.quoteItem.delete({ where: { id } });
  }

  updateQuote(id: string, data: Prisma.QuoteUpdateInput) {
    return this.db.quote.update({ where: { id }, data });
  }

  updateStatus(id: string, status: QuoteStatus, decisionNotes: string) {
    return this.db.quote.update({
      where: { id },
      data: {
        status,
        clientDecisionNotes: decisionNotes || null,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        rejectedAt: status === 'REJECTED' ? new Date() : null
      }
    });
  }

  markByCuttingListOutdated(cuttingListId: string) {
    return this.db.quote.updateMany({
      where: {
        cuttingListId,
        status: { not: 'OUTDATED' }
      },
      data: { status: 'OUTDATED' }
    });
  }

  markProjectQuotesOutdated(projectId: string) {
    return this.db.quote.updateMany({
      where: {
        projectId,
        status: { not: 'OUTDATED' }
      },
      data: { status: 'OUTDATED' }
    });
  }

  updateExportedAt(id: string, exportedAt: Date) {
    return this.db.quote.update({
      where: { id },
      data: { exportedAt }
    });
  }

  countItemsByType(quoteId: string, sourceType: QuoteItemSourceType) {
    return this.db.quoteItem.count({ where: { quoteId, sourceType } });
  }
}
