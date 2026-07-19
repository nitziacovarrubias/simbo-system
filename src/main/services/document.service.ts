import { prisma } from '../database/prisma';
import { DocumentRepository } from '../repositories/document.repository';
import { toDocumentListItem } from './mappers';
import type { DocumentListItem } from '../../shared/types';

export class DocumentService {
  private readonly documents = new DocumentRepository(prisma);

  async listDocumentsByProject(projectId: string): Promise<DocumentListItem[]> {
    const documents = await this.documents.listByProject(projectId);
    return documents.map(toDocumentListItem);
  }
}
