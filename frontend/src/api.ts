export type Category = 'NOTE' | 'TASK' | 'EVENT' | 'DEADLINE' | 'REMINDER' | 'OTHER';

export interface Item {
  id: number;
  title: string;
  content: string;
  category: Category;
  remind_at?: string | null;
  reminder_status?: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemCreateInput {
  title?: string;
  content: string;
  category?: Category;
  remind_at?: string | null;
  reminder_status?: string | null;
  is_completed?: boolean;
}

export interface ItemUpdateInput {
  title?: string;
  content?: string;
  category?: Category;
  remind_at?: string | null;
  reminder_status?: string | null;
  is_completed?: boolean;
  clear_remind_at?: boolean;
}

export interface OCRResult {
  text: string;
  filename: string;
}

export interface OCRStatus {
  available: boolean;
  executable: string | null;
  supported_formats: string[];
  max_size_mb: number;
}

export interface AIExtractResult {
  title: string;
  category: Category;
  summary: string;
  action_items: string[];
  dates: string[];
  remind_at?: string | null;
  clarification_flags: string[];
}

export interface AIStatus {
  available: boolean;
  model: string;
}

export interface RemindersSummary {
  overdue: number;
  today: number;
  upcoming: number;
  completed: number;
  total: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errorJson = await res.json();
      if (typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail)) {
        errorDetail = errorJson.detail.map((d: { msg?: string }) => d.msg || '').join(', ');
      }
    } catch {
      errorDetail = `Request failed with status ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  async getItems(search?: string, category?: string): Promise<Item[]> {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (category && category !== 'ALL') {
      params.append('category', category);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/items${queryString}`);
    return handleResponse<Item[]>(res);
  },

  async getItem(id: number): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}`);
    return handleResponse<Item>(res);
  },

  async createItem(input: ItemCreateInput): Promise<Item> {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return handleResponse<Item>(res);
  },

  async updateItem(id: number, input: ItemUpdateInput): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    return handleResponse<Item>(res);
  },

  async deleteItem(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<void>(res);
  },

  async extractTextFromImage(file: File): Promise<OCRResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/ocr`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<OCRResult>(res);
  },

  async getOCRStatus(): Promise<OCRStatus> {
    const res = await fetch(`${API_BASE}/ocr/status`);
    return handleResponse<OCRStatus>(res);
  },

  async extractWithAI(text: string): Promise<AIExtractResult> {
    const res = await fetch(`${API_BASE}/ai/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    return handleResponse<AIExtractResult>(res);
  },

  async getAIStatus(): Promise<AIStatus> {
    const res = await fetch(`${API_BASE}/ai/status`);
    return handleResponse<AIStatus>(res);
  },

  async getReminders(filter?: string): Promise<Item[]> {
    const params = new URLSearchParams();
    if (filter) {
      params.append('filter', filter);
    }
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/reminders${queryString}`);
    return handleResponse<Item[]>(res);
  },

  async getRemindersSummary(): Promise<RemindersSummary> {
    const res = await fetch(`${API_BASE}/reminders/summary`);
    return handleResponse<RemindersSummary>(res);
  },

  async toggleItemComplete(id: number): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}/complete`, {
      method: 'POST',
    });
    return handleResponse<Item>(res);
  },

  async snoozeItem(id: number, minutes: number = 60, remind_at?: string): Promise<Item> {
    const res = await fetch(`${API_BASE}/items/${id}/snooze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ minutes, remind_at }),
    });
    return handleResponse<Item>(res);
  },
};
