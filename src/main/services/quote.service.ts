import { QuoteStatus } from '@prisma/client';
import { prisma } from '../database/prisma';
import { QuoteRepository } from '../repositories/quote.repository';
import { HistoryRepository } from '../repositories/history.repository';
import { toQuoteListItem } from './mappers';
import type { QuoteListItem } from '../../shared/types';

export class QuoteService {
  private readonly quotes = new QuoteRepository(prisma);
  private readonly history = new HistoryRepository(prisma);

  async listQuotesByProject(projectId: string): Promise<QuoteListItem[]> {
    const quotes = await this.quotes.listByProject(projectId);
    return quotes.map(toQuoteListItem);
  }

  async approveQuote(quoteId: string, userId: string, notes?: string): Promise<void> {
    const quote = await this.quotes.updateStatus(quoteId, QuoteStatus.APPROVED, notes);

    await this.history.create({
      project: { connect: { id: quote.projectId } },
      user: { connect: { id: userId } },
      action: 'APPROVED',
      entityType: 'Quote',
      entityId: quote.id,
      title: 'Cotización aprobada',
      description: notes ?? 'La cotización fue aprobada.',
    });
  }

  async rejectQuote(quoteId: string, userId: string, notes: string): Promise<void> {
    const quote = await this.quotes.updateStatus(quoteId, QuoteStatus.REJECTED, notes);

    await this.history.create({
      project: { connect: { id: quote.projectId } },
      user: { connect: { id: userId } },
      action: 'REJECTED',
      entityType: 'Quote',
      entityId: quote.id,
      title: 'Cotización rechazada',
      description: notes,
    });
  }
}
