import { apiClient, API_BASE_URL } from './apiClient';
import {
  Manuscript,
  ManuscriptSubmissionPayload,
  PublicationDetails,
} from '../types/manuscript.types';

export const manuscriptService = {
  // Public / Author manuscript submission
  async submitManuscript(payload: ManuscriptSubmissionPayload): Promise<any> {
    const res: any = await apiClient.post('/manuscripts', {
      author: payload.author,
      title: payload.title,
      domain: payload.domain,
      abstractText: payload.abstract,
      keywords:
        typeof payload.keywords === 'string'
          ? payload.keywords
          : Array.isArray(payload.keywords)
          ? (payload.keywords as string[]).join(', ')
          : '',
      coauthors: payload.coauthors,
      file: payload.file,
      declaration: payload.declaration ?? true,
    });
    return res.data;
  },

  // Author Submissions
  async getAuthorManuscripts(status?: string, search?: string): Promise<Manuscript[]> {
    const res: any = await apiClient.get('/author/manuscripts', {
      params: { status, search },
    });
    return res.data;
  },

  async getAuthorManuscriptById(id: string): Promise<Manuscript> {
    const res: any = await apiClient.get(`/author/manuscripts/${id}`);
    return res.data;
  },

  async submitRevision(
    manuscriptId: string,
    response: string,
    file?: { name: string; size: number; type: string }
  ): Promise<Manuscript> {
    const res: any = await apiClient.post(`/author/manuscripts/${manuscriptId}/revision`, {
      response,
      file: file || { name: 'revised-manuscript.pdf', size: 1024, type: 'application/pdf' },
    });
    return res.data;
  },

  // Editor Submissions
  async getEditorManuscripts(status?: string, domain?: string, search?: string): Promise<Manuscript[]> {
    const res: any = await apiClient.get('/editor/manuscripts', {
      params: { status, domain, search },
    });
    return res.data;
  },

  async getEditorManuscriptById(id: string): Promise<Manuscript> {
    const res: any = await apiClient.get(`/editor/manuscripts/${id}`);
    return res.data;
  },

  async assignReviewer(
    manuscriptId: string,
    reviewerId: string,
    reviewerName: string,
    deadlineDays: number = 14,
    notes?: string
  ): Promise<Manuscript> {
    const res: any = await apiClient.post(`/editor/manuscripts/${manuscriptId}/assign-reviewer`, {
      reviewerId,
      reviewerName,
      deadlineDays,
      notes,
    });
    return res.data;
  },

  async requestRevision(manuscriptId: string, comments: string): Promise<Manuscript> {
    const res: any = await apiClient.post(`/editor/manuscripts/${manuscriptId}/decision`, {
      decision: 'REQUEST_REVISION',
      comments,
    });
    return res.data;
  },

  async acceptManuscript(manuscriptId: string, comment?: string): Promise<Manuscript> {
    const res: any = await apiClient.post(`/editor/manuscripts/${manuscriptId}/decision`, {
      decision: 'ACCEPT',
      comments: comment,
    });
    return res.data;
  },

  async rejectManuscript(manuscriptId: string, reason: string): Promise<Manuscript> {
    const res: any = await apiClient.post(`/editor/manuscripts/${manuscriptId}/decision`, {
      decision: 'REJECT',
      rejectionReason: reason,
    });
    return res.data;
  },

  async publishManuscript(manuscriptId: string, details: PublicationDetails): Promise<Manuscript> {
    const res: any = await apiClient.post(`/editor/manuscripts/${manuscriptId}/decision`, {
      decision: 'PUBLISH',
      doi: details.doi,
      volume: details.volume,
      issue: details.issue,
      publishedDate: details.publishedDate,
    });
    return res.data;
  },

  // Public Published Articles
  async getPublishedPapers(search?: string, domain?: string): Promise<Manuscript[]> {
    const res: any = await apiClient.get('/published', {
      params: { search, domain },
    });
    return res.data;
  },

  // Download binary file
  async downloadFile(fileIdOrUrl: string, fileName?: string): Promise<void> {
    let downloadUrl = fileIdOrUrl;
    if (!fileIdOrUrl.startsWith('http') && !fileIdOrUrl.startsWith('/api')) {
      downloadUrl = `/files/${fileIdOrUrl}/download`;
    } else if (fileIdOrUrl.startsWith('/api/v1')) {
      downloadUrl = fileIdOrUrl.replace('/api/v1', '');
    }

    try {
      const response = await apiClient.get(downloadUrl, {
        responseType: 'blob',
      });
      const blob = new Blob([response as any]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'manuscript-document.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('File download failed, attempting window open fallback:', err);
      window.open(`${API_BASE_URL}${downloadUrl}`, '_blank');
    }
  },
};
