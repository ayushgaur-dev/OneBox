import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Inbox,
  FileText,
  CheckSquare,
  Calendar,
  Layers,
  Search,
  Plus,
  Trash2,
  Edit3,
  Clock,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  X,
  Check,
  Send,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ListTodo,
  CalendarClock,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Circle,
  CalendarDays,
  AlarmClock,
  CheckCheck,
  Clock3,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { api, Item, Category, OCRStatus, AIStatus, AIExtractResult, RemindersSummary } from '../api';
import {
  getUrgencyInfo,
  toInputDateTime,
  playReminderChime,
  triggerBrowserNotification,
  downloadIcsFile,
} from '../utils/reminders';

interface ProductWorkspaceProps {
  onBackToWebsite?: () => void;
  isStandalone?: boolean;
}

const CATEGORIES: {
  label: string;
  value: Category;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  badgeText: string;
}[] = [
  { label: 'Note', value: 'NOTE', icon: FileText, color: 'text-blue-600', badgeBg: 'bg-blue-50 border-blue-200', badgeText: 'text-blue-700' },
  { label: 'Task', value: 'TASK', icon: CheckSquare, color: 'text-emerald-600', badgeBg: 'bg-emerald-50 border-emerald-200', badgeText: 'text-emerald-700' },
  { label: 'Event', value: 'EVENT', icon: Calendar, color: 'text-purple-600', badgeBg: 'bg-purple-50 border-purple-200', badgeText: 'text-purple-700' },
  { label: 'Deadline', value: 'DEADLINE', icon: AlertCircle, color: 'text-rose-600', badgeBg: 'bg-rose-50 border-rose-200', badgeText: 'text-rose-700' },
  { label: 'Reminder', value: 'REMINDER', icon: Bell, color: 'text-amber-600', badgeBg: 'bg-amber-50 border-amber-200', badgeText: 'text-amber-700' },
  { label: 'Other', value: 'OTHER', icon: Layers, color: 'text-slate-600', badgeBg: 'bg-slate-100 border-slate-200', badgeText: 'text-slate-700' },
];

export default function ProductWorkspace({ onBackToWebsite, isStandalone = false }: ProductWorkspaceProps) {
  const shouldReduceMotion = useReducedMotion();

  // Full-screen mode toggle
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Inbox data state
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Smart Reminders State
  const [remindersView, setRemindersView] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'completed' | null>(null);
  const [remindersSummary, setRemindersSummary] = useState<RemindersSummary | null>(null);
  const [newRemindAt, setNewRemindAt] = useState<string>('');
  const [showReminderPicker, setShowReminderPicker] = useState<boolean>(false);
  const [aiRemindAt, setAiRemindAt] = useState<string>('');
  const [editRemindAt, setEditRemindAt] = useState<string>('');
  const [snoozeMenuOpenId, setSnoozeMenuOpenId] = useState<number | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const notifiedItemIdsRef = useRef<Set<number>>(new Set());

  // Capture Mode: 'text' or 'ocr'
  const [captureMode, setCaptureMode] = useState<'text' | 'ocr'>('text');

  // Standard Text Capture Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory, setNewCategory] = useState<Category>('NOTE');
  const [saving, setSaving] = useState<boolean>(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // OCR Screenshot State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState<boolean>(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<OCRStatus | null>(null);
  const [extractedFilename, setExtractedFilename] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Extraction State (Milestone 3)
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null);
  const [aiProposal, setAiProposal] = useState<AIExtractResult | null>(null);

  // Editable AI Review fields
  const [aiTitle, setAiTitle] = useState<string>('');
  const [aiCategory, setAiCategory] = useState<Category>('NOTE');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [aiActionItems, setAiActionItems] = useState<string[]>([]);
  const [aiDates, setAiDates] = useState<string[]>([]);
  const [aiClarificationFlags, setAiClarificationFlags] = useState<string[]>([]);
  const [newActionItemInput, setNewActionItemInput] = useState<string>('');
  const [newDateInput, setNewDateInput] = useState<string>('');

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editContent, setEditContent] = useState<string>('');
  const [editCategory, setEditCategory] = useState<Category>('NOTE');
  const [updating, setUpdating] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Load reminders summary
  const loadRemindersSummary = useCallback(async () => {
    try {
      const summary = await api.getRemindersSummary();
      setRemindersSummary(summary);
    } catch {
      // Ignore background summary load errors
    }
  }, []);

  // Load items from backend
  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getItems();
      setItems(data);
      loadRemindersSummary();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to backend server';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [loadRemindersSummary]);

  // Check OCR engine status
  const checkOCRStatus = useCallback(async () => {
    try {
      const status = await api.getOCRStatus();
      setOcrStatus(status);
    } catch {
      // Ignore background OCR status errors
    }
  }, []);

  // Check AI engine status
  const checkAIStatus = useCallback(async () => {
    try {
      const status = await api.getAIStatus();
      setAiStatus(status);
    } catch {
      // Ignore background AI status errors
    }
  }, []);

  useEffect(() => {
    loadItems();
    checkOCRStatus();
    checkAIStatus();
  }, [loadItems, checkOCRStatus, checkAIStatus]);

  // Background Reminder Checker (runs every 30s)
  useEffect(() => {
    const checkDueReminders = () => {
      const now = new Date();
      items.forEach((item) => {
        if (!item.is_completed && item.remind_at) {
          const target = new Date(item.remind_at);
          // If due within the last 2 minutes and not yet alerted this session
          const diffSec = (now.getTime() - target.getTime()) / 1000;
          if (diffSec >= 0 && diffSec < 120 && !notifiedItemIdsRef.current.has(item.id)) {
            notifiedItemIdsRef.current.add(item.id);
            playReminderChime();
            triggerBrowserNotification(
              `Reminder: ${item.title}`,
              item.content.length > 100 ? `${item.content.slice(0, 97)}...` : item.content
            );
          }
        }
      });
      loadRemindersSummary();
    };

    const interval = setInterval(checkDueReminders, 30000);
    return () => clearInterval(interval);
  }, [items, loadRemindersSummary]);

  // Request browser notification permission
  const handleRequestNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        playReminderChime();
        triggerBrowserNotification('OneBox Smart Reminders Active', 'You will receive desktop alerts for due deadlines & events.');
      }
    }
  };

  // Toggle Item Complete
  const handleToggleComplete = async (id: number) => {
    try {
      const updated = await api.toggleItemComplete(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      loadRemindersSummary();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update reminder status';
      alert(message);
    }
  };

  // Snooze Reminder
  const handleSnooze = async (id: number, minutes: number) => {
    try {
      const updated = await api.snoozeItem(id, minutes);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setSnoozeMenuOpenId(null);
      loadRemindersSummary();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to snooze reminder';
      alert(message);
    }
  };

  // Quick Date presets for capture
  const setQuickDate = (type: 'today_6pm' | 'tomorrow_9am' | 'friday_5pm' | 'next_week') => {
    const d = new Date();
    if (type === 'today_6pm') {
      d.setHours(18, 0, 0, 0);
    } else if (type === 'tomorrow_9am') {
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
    } else if (type === 'friday_5pm') {
      const day = d.getDay();
      const diff = (5 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
      d.setHours(17, 0, 0, 0);
    } else if (type === 'next_week') {
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
    }
    setNewRemindAt(toInputDateTime(d.toISOString()));
  };

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setOcrError('Unsupported file type. Please upload a PNG, JPG, JPEG, or WebP screenshot.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setOcrError('File size exceeds the 10MB limit.');
      return;
    }

    setSelectedFile(file);
    setOcrError(null);
    setExtractedFilename(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // Clear selected OCR image
  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setOcrError(null);
    setExtractedFilename(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run OCR Extraction
  const handleExtractText = async () => {
    if (!selectedFile) {
      setOcrError('Please select or upload an image first.');
      return;
    }

    try {
      setOcrLoading(true);
      setOcrError(null);

      const result = await api.extractTextFromImage(selectedFile);
      setExtractedFilename(result.filename);

      if (result.text && result.text.trim()) {
        setNewContent(result.text.trim());
        if (!newTitle.trim()) {
          const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
          setNewTitle(`Screenshot: ${nameWithoutExt}`);
        }
      } else {
        setNewContent('');
        setOcrError('No text could be extracted from this image. The image may be blank or blurry.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'OCR extraction failed';
      setOcrError(message);
    } finally {
      setOcrLoading(false);
    }
  };

  // Support paste screenshot anywhere in the workspace
  const handlePaste = (e: React.ClipboardEvent) => {
    const clipboardItems = e.clipboardData?.items;
    if (!clipboardItems) return;

    for (let i = 0; i < clipboardItems.length; i++) {
      if (clipboardItems[i].type.indexOf('image') !== -1) {
        const file = clipboardItems[i].getAsFile();
        if (file) {
          setCaptureMode('ocr');
          setSelectedFile(file);
          setOcrError(null);
          setExtractedFilename(null);
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
          break;
        }
      }
    }
  };

  // Run Gemini AI Organization (Milestone 3)
  const handleOrganizeWithAI = async () => {
    if (!newContent.trim()) {
      setCaptureError('Please enter some text or extract a screenshot before organizing with AI.');
      return;
    }

    try {
      setAiLoading(true);
      setAiError(null);
      setCaptureError(null);

      const result = await api.extractWithAI(newContent.trim());
      setAiProposal(result);

      // Populate editable review fields
      setAiTitle(result.title || newTitle || 'Untitled');
      setAiCategory(result.category || 'NOTE');
      setAiSummary(result.summary || '');
      setAiActionItems([...(result.action_items || [])]);
      setAiDates([...(result.dates || [])]);
      setAiRemindAt(toInputDateTime(result.remind_at));
      setAiClarificationFlags([...(result.clarification_flags || [])]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI organization failed';
      setAiError(message);
    } finally {
      setAiLoading(false);
    }
  };

  // Cancel AI proposal
  const handleDismissAIProposal = () => {
    setAiProposal(null);
    setAiError(null);
  };

  // Save AI-Organized Item
  const handleSaveAIOrganizedItem = async () => {
    if (!aiSummary.trim() && !newContent.trim()) {
      setCaptureError('Summary or content cannot be empty.');
      return;
    }

    // Build synthesized content
    const sections: string[] = [];
    if (aiSummary.trim()) {
      sections.push(aiSummary.trim());
    }

    if (aiActionItems.length > 0) {
      sections.push(`Action Items:\n${aiActionItems.map((a) => `• ${a}`).join('\n')}`);
    }

    if (aiDates.length > 0) {
      sections.push(`Dates & Deadlines:\n${aiDates.map((d) => `• ${d}`).join('\n')}`);
    }

    if (newContent.trim() && newContent.trim() !== aiSummary.trim()) {
      sections.push(`Original Note:\n${newContent.trim()}`);
    }

    const finalContent = sections.join('\n\n');

    try {
      setSaving(true);
      setCaptureError(null);

      const created = await api.createItem({
        title: aiTitle.trim() || undefined,
        content: finalContent,
        category: aiCategory,
        remind_at: aiRemindAt ? new Date(aiRemindAt).toISOString() : undefined,
      });

      setItems((prev) => [created, ...prev]);
      loadRemindersSummary();

      // Reset form, proposal, and image
      setNewTitle('');
      setNewContent('');
      setNewCategory('NOTE');
      setNewRemindAt('');
      setAiRemindAt('');
      setShowReminderPicker(false);
      setAiProposal(null);
      handleClearImage();
      setCaptureMode('text');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save item';
      setCaptureError(message);
    } finally {
      setSaving(false);
    }
  };

  // Standard Save Item
  const handleSaveItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newContent.trim()) {
      setCaptureError('Please enter some content or extract text from a screenshot.');
      return;
    }

    try {
      setSaving(true);
      setCaptureError(null);
      const created = await api.createItem({
        title: newTitle.trim() || undefined,
        content: newContent.trim(),
        category: newCategory,
        remind_at: newRemindAt ? new Date(newRemindAt).toISOString() : undefined,
      });
      setItems((prev) => [created, ...prev]);
      loadRemindersSummary();

      // Reset form & image
      setNewTitle('');
      setNewContent('');
      setNewCategory('NOTE');
      setNewRemindAt('');
      setShowReminderPicker(false);
      setAiProposal(null);
      handleClearImage();
      setCaptureMode('text');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save item';
      setCaptureError(message);
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditContent(item.content);
    setEditCategory(item.category);
    setEditRemindAt(toInputDateTime(item.remind_at));
    setEditError(null);
  };

  // Save Edit
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editContent.trim()) {
      setEditError('Content cannot be empty.');
      return;
    }

    try {
      setUpdating(true);
      setEditError(null);
      const updated = await api.updateItem(editingItem.id, {
        title: editTitle.trim() || undefined,
        content: editContent.trim(),
        category: editCategory,
        remind_at: editRemindAt ? new Date(editRemindAt).toISOString() : null,
        clear_remind_at: !editRemindAt,
      });

      setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      loadRemindersSummary();
      setEditingItem(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setEditError(message);
    } finally {
      setUpdating(false);
    }
  };

  // Confirm Delete
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      await api.deleteItem(itemToDelete.id);
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      loadRemindersSummary();
      setItemToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      alert(`Error deleting item: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Filtered Items (Client-side filtering for instant UX)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. If a Reminders Hub View is active
      if (remindersView !== null) {
        const isTimeSensitive = Boolean(item.remind_at) || ['DEADLINE', 'EVENT', 'REMINDER'].includes(item.category);
        if (!isTimeSensitive) return false;

        const info = getUrgencyInfo(item);
        if (remindersView === 'completed' && !item.is_completed) return false;
        if (remindersView === 'overdue' && info.urgency !== 'OVERDUE') return false;
        if (remindersView === 'today' && info.urgency !== 'TODAY') return false;
        if (remindersView === 'upcoming' && !['UPCOMING', 'TODAY', 'FUTURE'].includes(info.urgency)) return false;
      } else if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }

      // 2. Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesContent = item.content.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent) {
          return false;
        }
      }
      return true;
    });
  }, [items, selectedCategory, searchQuery, remindersView]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: items.length };
    CATEGORIES.forEach((c) => {
      counts[c.value] = 0;
    });
    items.forEach((item) => {
      if (counts[item.category] !== undefined) {
        counts[item.category] += 1;
      }
    });
    return counts;
  }, [items]);

  // Instant local reminder counts
  const localRemindersSummary = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let upcoming = 0;
    let completed = 0;
    let total = 0;

    items.forEach((item) => {
      const isTimeSensitive = Boolean(item.remind_at) || ['DEADLINE', 'EVENT', 'REMINDER'].includes(item.category);
      if (!isTimeSensitive) return;
      total += 1;

      if (item.is_completed) {
        completed += 1;
        return;
      }

      const urgency = getUrgencyInfo(item).urgency;
      if (urgency === 'OVERDUE') overdue += 1;
      else if (urgency === 'TODAY') today += 1;
      else if (urgency === 'UPCOMING' || urgency === 'FUTURE') upcoming += 1;
    });

    return {
      overdue: remindersSummary?.overdue ?? overdue,
      today: remindersSummary?.today ?? today,
      upcoming: remindersSummary?.upcoming ?? upcoming,
      completed: remindersSummary?.completed ?? completed,
      total: remindersSummary?.total ?? total,
    };
  }, [items, remindersSummary]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getCategoryMeta = (cat: Category) => {
    return (
      CATEGORIES.find((c) => c.value === cat) || {
        label: cat,
        value: cat,
        icon: Layers,
        color: 'text-slate-600',
        badgeBg: 'bg-slate-100 border-slate-200',
        badgeText: 'text-slate-700',
      }
    );
  };

  return (
    <section
      id="workspace"
      onPaste={handlePaste}
      className={`scroll-mt-20 transition-all duration-300 ${
        isStandalone
          ? 'w-full py-2 sm:py-4'
          : isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md p-2 sm:p-6 flex flex-col justify-center'
          : 'py-20 bg-gradient-to-b from-white via-slate-50 to-slate-100 relative'
      }`}
    >
      <div className={`mx-auto w-full transition-all ${isStandalone ? 'max-w-7xl px-2 sm:px-4' : isFullscreen ? 'h-full max-w-7xl' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
        {/* Workspace Shell Container (Revealed smoothly on scroll) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col h-full"
        >
          {/* Top Window Bar (macOS / SaaS Style Header) */}
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
            {/* Window controls & Title */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block" />
              </div>
              <span className="text-slate-500 font-mono text-xs">|</span>
              <div className="flex items-center space-x-2">
                <img
                  src="/onebox_logo.png"
                  alt="OneBox"
                  className="w-5 h-5 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                  }}
                />
                <span className="text-xs font-semibold tracking-wide text-slate-200">
                  OneBox Workspace <span className="text-blue-400 font-mono text-[11px]">(Live Interactive Mode)</span>
                </span>
              </div>
            </div>

            {/* Live System Status Badges & Controls */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-2 text-[11px]">
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SQLite</span>
                </span>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${ocrStatus?.available ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  />
                  <span>OCR: {ocrStatus?.available ? 'Ready' : 'Check Engine'}</span>
                </span>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${aiStatus?.available ? 'bg-emerald-400' : 'bg-amber-400'}`}
                  />
                  <span>AI: {aiStatus?.available ? aiStatus.model : 'No Key'}</span>
                </span>
              </div>

              {/* Back to Website Button if provided */}
              {onBackToWebsite && (
                <button
                  type="button"
                  onClick={onBackToWebsite}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition text-xs font-semibold flex items-center space-x-1.5 cursor-pointer border border-slate-700"
                  title="Return to OneBox Website"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Website</span>
                </button>
              )}

              {/* Fullscreen Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition text-xs flex items-center space-x-1 cursor-pointer"
                title={isFullscreen ? 'Collapse to page view' : 'Maximize to full screen'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Collapse</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Maximize</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MAIN WORKSPACE BODY: Sidebar + Content */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/50">
            {/* SIDEBAR NAVIGATION */}
            <aside className="w-full md:w-60 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col justify-between border-r border-slate-800">
              <div className="overflow-y-auto">
                {/* Navigation & Category Filter */}
                <div className="p-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                    Categories & Inbox
                  </div>
                  <nav className="space-y-1">
                    {/* All Items */}
                    <button
                      onClick={() => {
                        setSelectedCategory('ALL');
                        setRemindersView(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === 'ALL' && remindersView === null
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Inbox className="w-4 h-4" />
                        <span>All Items</span>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                          selectedCategory === 'ALL' && remindersView === null ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {categoryCounts.ALL || 0}
                      </span>
                    </button>

                    {/* Specific Categories */}
                    {CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory === cat.value && remindersView === null;
                      const count = categoryCounts[cat.value] || 0;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setSelectedCategory(cat.value);
                            setRemindersView(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{cat.label}s</span>
                          </div>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                              isSelected ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* SMART REMINDERS & DEADLINES HUB SECTION */}
                  <div className="mt-5 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                      <span className="flex items-center space-x-1.5">
                        <AlarmClock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Smart Reminders</span>
                      </span>
                      {localRemindersSummary.overdue > 0 && (
                        <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] rounded font-bold animate-pulse">
                          {localRemindersSummary.overdue} DUE
                        </span>
                      )}
                    </div>

                    <nav className="space-y-1">
                      {/* All Time-Sensitive Items */}
                      <button
                        onClick={() => {
                          setRemindersView('all');
                          setSelectedCategory('ALL');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          remindersView === 'all'
                            ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Clock3 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>All Time-Sensitive</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400">
                          {localRemindersSummary.total}
                        </span>
                      </button>

                      {/* Overdue */}
                      <button
                        onClick={() => {
                          setRemindersView('overdue');
                          setSelectedCategory('ALL');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          remindersView === 'overdue'
                            ? 'bg-rose-600 text-white shadow-sm font-semibold'
                            : 'text-rose-300 hover:bg-rose-950/40 hover:text-rose-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Overdue</span>
                        </div>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            localRemindersSummary.overdue > 0
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {localRemindersSummary.overdue}
                        </span>
                      </button>

                      {/* Due Today */}
                      <button
                        onClick={() => {
                          setRemindersView('today');
                          setSelectedCategory('ALL');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          remindersView === 'today'
                            ? 'bg-amber-600 text-white shadow-sm font-semibold'
                            : 'text-amber-300 hover:bg-amber-950/40 hover:text-amber-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <AlarmClock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Due Today</span>
                        </div>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            localRemindersSummary.today > 0
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {localRemindersSummary.today}
                        </span>
                      </button>

                      {/* Upcoming (7 Days) */}
                      <button
                        onClick={() => {
                          setRemindersView('upcoming');
                          setSelectedCategory('ALL');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          remindersView === 'upcoming'
                            ? 'bg-blue-600 text-white shadow-sm font-semibold'
                            : 'text-blue-300 hover:bg-blue-950/40 hover:text-blue-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                          <span>Upcoming (7d)</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400">
                          {localRemindersSummary.upcoming}
                        </span>
                      </button>

                      {/* Completed */}
                      <button
                        onClick={() => {
                          setRemindersView('completed');
                          setSelectedCategory('ALL');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          remindersView === 'completed'
                            ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                            : 'text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Completed</span>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-slate-800 text-slate-400">
                          {localRemindersSummary.completed}
                        </span>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>

              {/* Sidebar bottom status & actions */}
              <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Backend Connected</span>
                  </span>
                  <button
                    onClick={loadItems}
                    title="Refresh database"
                    className="p-1 hover:text-white hover:bg-slate-800 rounded transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Desktop Alerts Notification Permission Toggle */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleRequestNotifications}
                    className="flex items-center space-x-1.5 text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
                    title="Enable desktop notifications for due reminders"
                  >
                    <Bell className={`w-3.5 h-3.5 ${notificationPermission === 'granted' ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{notificationPermission === 'granted' ? 'Alerts Active' : 'Enable Alerts'}</span>
                  </button>
                  {notificationPermission === 'granted' && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Desktop alerts enabled" />
                  )}
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
              {/* TOP TOOLBAR: Search & Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Active Inbox</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Capture thoughts, run screenshot OCR, or let Gemini AI propose structure.
                  </p>
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search title or content..."
                    className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm text-black font-medium bg-white border border-slate-300 rounded-xl shadow-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* SERVER ERROR ALERT */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between text-red-800 text-sm shadow-xs">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-semibold text-xs sm:text-sm">Unable to connect to OneBox backend</p>
                      <p className="text-xs text-red-600 mt-0.5">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={loadItems}
                    className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 font-medium rounded-lg text-xs transition"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* SMART REMINDERS & DEADLINES STATUS BAR */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                      <AlarmClock className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center space-x-2">
                      <span>Smart Reminders & Deadlines Hub</span>
                      {remindersView && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white">
                          Filter: {remindersView}
                        </span>
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Track actionable events, due deadlines, and alerts in one organized place.
                  </p>
                </div>

                {/* Quick urgency filter pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRemindersView(remindersView === 'overdue' ? null : 'overdue')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition cursor-pointer ${
                      remindersView === 'overdue'
                        ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                        : 'bg-rose-950/40 text-rose-300 border-rose-800 hover:bg-rose-900/60'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span>Overdue: {localRemindersSummary.overdue}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRemindersView(remindersView === 'today' ? null : 'today')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition cursor-pointer ${
                      remindersView === 'today'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-amber-950/40 text-amber-300 border-amber-800 hover:bg-amber-900/60'
                    }`}
                  >
                    <Clock3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Today: {localRemindersSummary.today}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRemindersView(remindersView === 'upcoming' ? null : 'upcoming')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition cursor-pointer ${
                      remindersView === 'upcoming'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                        : 'bg-blue-950/40 text-blue-300 border-blue-800 hover:bg-blue-900/60'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
                    <span>Upcoming: {localRemindersSummary.upcoming}</span>
                  </button>

                  {remindersView !== null && (
                    <button
                      type="button"
                      onClick={() => setRemindersView(null)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                      title="Clear reminders filter and view all items"
                    >
                      <span>Show All</span>
                    </button>
                  )}
                </div>
              </div>

              {/* QUICK CAPTURE CARD */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-shadow hover:shadow-md">
                {/* Capture Mode Tabs */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCaptureMode('text')}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        captureMode === 'text'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600" />
                      <span>Text Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCaptureMode('ocr')}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        captureMode === 'ocr'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Screenshot OCR</span>
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {captureMode === 'ocr' ? 'Upload or paste (Ctrl+V) screenshot' : 'Ctrl + Enter to quick-save'}
                  </span>
                </div>

                {/* OCR SCREENSHOT FILE PICKER & PREVIEW */}
                {captureMode === 'ocr' && (
                  <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-800 flex items-center space-x-2">
                          <Upload className="w-4 h-4 text-blue-600" />
                          <span>Upload Screenshot for OCR</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Select a PNG, JPG, JPEG, or WebP screenshot, or paste directly with Ctrl+V.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                          onChange={handleFileChange}
                          className="hidden"
                          id="workspace-screenshot-input"
                        />
                        <label
                          htmlFor="workspace-screenshot-input"
                          className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>{selectedFile ? 'Change Screenshot' : 'Upload Screenshot'}</span>
                        </label>

                        {selectedFile && (
                          <button
                            type="button"
                            onClick={handleExtractText}
                            disabled={ocrLoading}
                            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                          >
                            {ocrLoading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>Extracting...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Extract Text</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Image Preview */}
                    {previewUrl && (
                      <div className="relative mt-2 p-2 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
                        <img
                          src={previewUrl}
                          alt="Screenshot Preview"
                          className="max-h-36 max-w-xs object-contain rounded border border-slate-100 bg-slate-900/5 shadow-2xs"
                        />
                        <div className="flex-1 text-xs text-slate-600 space-y-1">
                          <p className="font-semibold text-slate-800 break-all">{selectedFile?.name}</p>
                          <p className="text-slate-500">
                            Size: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB
                          </p>
                          <p className="text-slate-400">Click "Extract Text" to process with Tesseract OCR.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearImage}
                          title="Remove Image"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* OCR Error Display */}
                    {ocrError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                        <div>
                          <span className="font-semibold">Extraction issue: </span>
                          <span>{ocrError}</span>
                        </div>
                      </div>
                    )}

                    {/* Success Badge */}
                    {extractedFilename && !ocrError && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>
                            Text extracted from <strong className="font-mono">{extractedFilename}</strong>. You can refine it or click <strong>Organize with AI</strong> below!
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* AI ERROR ALERT */}
                {aiError && (
                  <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-3 shadow-2xs">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Gemini AI Organization Issue</p>
                        <p className="mt-0.5 text-amber-800">{aiError}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={handleOrganizeWithAI}
                        disabled={aiLoading}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-medium rounded-md transition"
                      >
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiError(null)}
                        className="text-amber-500 hover:text-amber-700 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* EDITABLE AI PROPOSAL REVIEW PANEL */}
                {aiProposal ? (
                  <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                          <Sparkles className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-indigo-950">AI Organized Proposal</h4>
                          <p className="text-[11px] text-indigo-700">Review and edit any field before saving to your inbox.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleDismissAIProposal}
                        className="text-xs text-slate-500 hover:text-slate-800 underline transition"
                      >
                        Cancel AI Proposal
                      </button>
                    </div>

                    {/* Title & Category Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={aiTitle}
                          onChange={(e) => setAiTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm text-black font-bold bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Category
                        </label>
                        <select
                          value={aiCategory}
                          onChange={(e) => setAiCategory(e.target.value as Category)}
                          className="w-full px-3 py-1.5 text-xs sm:text-sm text-black font-bold bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Summary */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Summary
                      </label>
                      <textarea
                        value={aiSummary}
                        onChange={(e) => setAiSummary(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm text-black font-medium bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>

                    {/* Action Items List */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                        <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Action Items</span>
                      </label>
                      <div className="space-y-1.5">
                        {aiActionItems.map((action, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={action}
                              onChange={(e) => {
                                const updated = [...aiActionItems];
                                updated[idx] = e.target.value;
                                setAiActionItems(updated);
                              }}
                              className="flex-1 px-3 py-1 text-xs text-black font-medium bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
                            />
                            <button
                              type="button"
                              onClick={() => setAiActionItems(aiActionItems.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 p-1"
                              title="Remove action item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Add action item */}
                        <div className="flex items-center space-x-2 pt-1">
                          <input
                            type="text"
                            placeholder="+ Add new action item..."
                            value={newActionItemInput}
                            onChange={(e) => setNewActionItemInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newActionItemInput.trim()) {
                                  setAiActionItems([...aiActionItems, newActionItemInput.trim()]);
                                  setNewActionItemInput('');
                                }
                              }
                            }}
                            className="flex-1 px-3 py-1 text-xs text-black font-medium bg-white border border-dashed border-indigo-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (newActionItemInput.trim()) {
                                setAiActionItems([...aiActionItems, newActionItemInput.trim()]);
                                setNewActionItemInput('');
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-md transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Dates & Deadlines */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1.5">
                        <CalendarClock className="w-3.5 h-3.5 text-purple-600" />
                        <span>Dates & Explicit Deadlines</span>
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {aiDates.map((dateStr, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white border border-purple-200 text-purple-800 rounded-md text-xs font-medium"
                          >
                            <span>{dateStr}</span>
                            <button
                              type="button"
                              onClick={() => setAiDates(aiDates.filter((_, i) => i !== idx))}
                              className="text-purple-400 hover:text-purple-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}

                        <div className="inline-flex items-center space-x-1">
                          <input
                            type="text"
                            placeholder="+ Add date..."
                            value={newDateInput}
                            onChange={(e) => setNewDateInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newDateInput.trim()) {
                                  setAiDates([...aiDates, newDateInput.trim()]);
                                  setNewDateInput('');
                                }
                              }
                            }}
                            className="w-28 px-2 py-0.5 text-xs text-black font-semibold bg-white border border-dashed border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-600"
                          />
                        </div>
                      </div>
                    </div>

                    {/* AI Scheduled Reminder / Event Time */}
                    <div className="p-3 bg-white rounded-lg border border-indigo-200">
                      <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span className="flex items-center space-x-1.5">
                          <AlarmClock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Scheduled Reminder / Due Date</span>
                        </span>
                        {aiRemindAt && (
                          <button
                            type="button"
                            onClick={() => setAiRemindAt('')}
                            className="text-[10px] text-slate-400 hover:text-red-600 transition"
                          >
                            Clear date
                          </button>
                        )}
                      </label>
                      <input
                        type="datetime-local"
                        value={aiRemindAt}
                        onChange={(e) => setAiRemindAt(e.target.value)}
                        className="w-full sm:w-72 px-3 py-1.5 text-xs text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      />
                    </div>

                    {/* Clarification Flags */}
                    {aiClarificationFlags.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                        <div className="flex items-center space-x-1.5 font-semibold text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Points Needing Your Clarification</span>
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                          {aiClarificationFlags.map((flag, idx) => (
                            <li key={idx}>{flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Save AI Action Button */}
                    <div className="flex items-center justify-end space-x-3 pt-2 border-t border-indigo-100">
                      <button
                        type="button"
                        onClick={handleDismissAIProposal}
                        className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveAIOrganizedItem}
                        disabled={saving}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Save Proposal to Inbox</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STANDARD CAPTURE FORM */
                  <form
                    onSubmit={handleSaveItem}
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveItem();
                      }
                    }}
                    className="space-y-3"
                  >
                    {/* Optional Title */}
                    <div>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title (optional — auto-generated if omitted)"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm text-black font-semibold bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      />
                    </div>

                    {/* Content Textarea */}
                    <div>
                      <textarea
                        value={newContent}
                        onChange={(e) => {
                          setNewContent(e.target.value);
                          if (captureError) setCaptureError(null);
                        }}
                        rows={captureMode === 'ocr' ? 4 : 3}
                        placeholder={
                          captureMode === 'ocr'
                            ? 'Extracted screenshot text will appear here. Edit as needed, or click Organize with AI...'
                            : 'Type or paste anything here... Notes, ideas, tasks, meeting items...'
                        }
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm text-black font-semibold bg-white border border-slate-300 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-y transition leading-relaxed"
                      />
                    </div>

                    {captureError && (
                      <p className="text-xs text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{captureError}</span>
                      </p>
                    )}

                    {/* SMART REMINDER DATE SECTION (Shown if toggled or category is DEADLINE/EVENT/REMINDER) */}
                    {(showReminderPicker || ['DEADLINE', 'EVENT', 'REMINDER'].includes(newCategory) || newRemindAt) && (
                      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <AlarmClock className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-semibold text-amber-950">Schedule Smart Reminder / Due Date:</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setQuickDate('today_6pm')}
                              className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md transition cursor-pointer"
                            >
                              Today 6 PM
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickDate('tomorrow_9am')}
                              className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md transition cursor-pointer"
                            >
                              Tomorrow 9 AM
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickDate('friday_5pm')}
                              className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md transition cursor-pointer"
                            >
                              Friday 5 PM
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuickDate('next_week')}
                              className="px-2 py-0.5 text-[11px] font-medium bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-md transition cursor-pointer"
                            >
                              Next Week
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="datetime-local"
                            value={newRemindAt}
                            onChange={(e) => setNewRemindAt(e.target.value)}
                            className="px-3 py-1.5 text-xs text-black font-semibold bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          {newRemindAt && (
                            <button
                              type="button"
                              onClick={() => setNewRemindAt('')}
                              className="text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1 transition cursor-pointer"
                            >
                              Clear date
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Controls Bar: Category Selector & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">Category:</span>
                        <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200 overflow-x-auto max-w-full">
                          {CATEGORIES.map((cat) => {
                            const isSelected = newCategory === cat.value;
                            const Icon = cat.icon;
                            return (
                              <button
                                type="button"
                                key={cat.value}
                                onClick={() => setNewCategory(cat.value)}
                                className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition ${
                                  isSelected
                                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Toggle Reminder Date Button */}
                        <button
                          type="button"
                          onClick={() => setShowReminderPicker(!showReminderPicker)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer ${
                            newRemindAt
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                              : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                          }`}
                          title="Attach reminder date/time"
                        >
                          <AlarmClock className={`w-3.5 h-3.5 ${newRemindAt ? 'text-amber-600' : 'text-slate-400'}`} />
                          <span>{newRemindAt ? '⏰ Scheduled' : '+ Add Reminder'}</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* ORGANIZE WITH AI BUTTON */}
                        <button
                          type="button"
                          onClick={handleOrganizeWithAI}
                          disabled={aiLoading || !newContent.trim()}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 text-xs sm:text-sm font-medium rounded-lg shadow-2xs transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          title="Intelligently organize with Gemini AI"
                        >
                          {aiLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                              <span>Organizing...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Organize with AI</span>
                            </>
                          )}
                        </button>

                        {/* Standard Save Button */}
                        <button
                          type="submit"
                          disabled={saving || !newContent.trim()}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {saving ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Save to Inbox</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* SAVED ITEMS INBOX */}
              <div className="space-y-4">
                {/* Inbox Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-base font-bold text-slate-800 tracking-tight">Saved Items</h4>
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                      {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
                    </span>
                    {selectedCategory !== 'ALL' && (
                      <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                        <span>Filtering:</span>
                        <span className="text-blue-600 font-semibold">{selectedCategory}</span>
                        <button
                          onClick={() => setSelectedCategory('ALL')}
                          className="text-slate-400 hover:text-slate-600"
                          title="Clear category filter"
                        >
                          <X className="w-3.5 h-3.5 inline" />
                        </button>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={loadItems}
                    disabled={loading}
                    className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-xs transition hover:bg-slate-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Loading Skeleton */}
                {loading && items.length === 0 && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
                        </div>
                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!loading && filteredItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-10 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-semibold text-slate-800">
                      {searchQuery || selectedCategory !== 'ALL' ? 'No matching items found' : 'Your OneBox is empty'}
                    </h5>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      {searchQuery || selectedCategory !== 'ALL'
                        ? 'Try modifying your search query or reset your category filter.'
                        : 'Capture your first note, task, or screenshot above to get organized.'}
                    </p>
                    {(searchQuery || selectedCategory !== 'ALL') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSelectedCategory('ALL');
                        }}
                        className="mt-3 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                )}

                {/* Item Cards List */}
                <div className="space-y-3">
                  {filteredItems.map((item) => {
                    const meta = getCategoryMeta(item.category);
                    const CategoryIcon = meta.icon;
                    const urgency = getUrgencyInfo(item);
                    const isSnoozeOpen = snoozeMenuOpenId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`bg-white rounded-xl border p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between ${
                          item.is_completed
                            ? 'bg-slate-50/70 border-slate-200 opacity-80'
                            : urgency.urgency === 'OVERDUE'
                            ? 'border-rose-300 ring-1 ring-rose-200'
                            : urgency.urgency === 'TODAY'
                            ? 'border-amber-300 ring-1 ring-amber-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div>
                          {/* Card Header: Checkbox + Title & Category/Urgency Badges */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleComplete(item.id)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-600 transition flex-shrink-0 cursor-pointer"
                                title={item.is_completed ? 'Mark as incomplete' : 'Mark as completed'}
                              >
                                {item.is_completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                                ) : (
                                  <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
                                )}
                              </button>
                              <h4
                                className={`text-sm sm:text-base font-bold tracking-tight leading-snug break-words transition ${
                                  item.is_completed ? 'line-through text-slate-400 font-normal' : 'text-black'
                                }`}
                              >
                                {item.title}
                              </h4>
                            </div>

                            {/* Badges Container */}
                            <div className="flex flex-wrap items-center justify-end gap-1.5 flex-shrink-0">
                              {/* Urgency Badge */}
                              {(item.remind_at || ['DEADLINE', 'EVENT', 'REMINDER'].includes(item.category)) && (
                                <span
                                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${urgency.badgeBg} ${urgency.badgeText}`}
                                >
                                  {urgency.urgency === 'OVERDUE' && <AlertCircle className="w-2.5 h-2.5" />}
                                  {urgency.urgency === 'TODAY' && <AlarmClock className="w-2.5 h-2.5" />}
                                  {urgency.urgency === 'UPCOMING' && <CalendarDays className="w-2.5 h-2.5" />}
                                  {urgency.urgency === 'COMPLETED' && <Check className="w-2.5 h-2.5" />}
                                  <span>{urgency.label}</span>
                                </span>
                              )}

                              {/* Category Badge */}
                              <span
                                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${meta.badgeBg} ${meta.badgeText}`}
                              >
                                <CategoryIcon className="w-3 h-3" />
                                <span>{meta.label}</span>
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <p
                            className={`text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words font-medium transition ${
                              item.is_completed ? 'text-slate-400 line-through' : 'text-black'
                            }`}
                          >
                            {item.content}
                          </p>
                        </div>

                        {/* Footer: Timestamp, Reminder Info & Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                          <div className="flex items-center space-x-2 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDate(item.created_at)}</span>
                            {item.updated_at && item.updated_at !== item.created_at && (
                              <span className="text-[10px] text-slate-400 italic">(edited)</span>
                            )}
                            {item.remind_at && (
                              <span className="inline-flex items-center space-x-1 text-slate-600 font-medium">
                                <span>•</span>
                                <AlarmClock className="w-3 h-3 text-amber-500" />
                                <span>{new Date(item.remind_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 relative">
                            {/* Snooze Dropdown */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setSnoozeMenuOpenId(isSnoozeOpen ? null : item.id)}
                                className="inline-flex items-center space-x-1 px-2 py-1 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded transition text-xs font-medium cursor-pointer"
                                title="Snooze reminder"
                              >
                                <AlarmClock className="w-3.5 h-3.5 text-amber-600" />
                                <span className="hidden sm:inline">Snooze</span>
                              </button>

                              {isSnoozeOpen && (
                                <div className="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30 text-xs">
                                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                    Snooze For
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSnooze(item.id, 60)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-medium transition cursor-pointer"
                                  >
                                    + 1 Hour
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSnooze(item.id, 180)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-medium transition cursor-pointer"
                                  >
                                    + 3 Hours
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSnooze(item.id, 1440)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-medium transition cursor-pointer"
                                  >
                                    Tomorrow (24h)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSnooze(item.id, 2880)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-amber-50 hover:text-amber-800 text-slate-700 font-medium transition cursor-pointer"
                                  >
                                    + 2 Days
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Export .ics iCalendar */}
                            <button
                              type="button"
                              onClick={() => downloadIcsFile(item)}
                              className="inline-flex items-center space-x-1 px-2 py-1 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded transition text-xs font-medium cursor-pointer"
                              title="Export to Calendar (.ics for Google / Apple / Outlook)"
                            >
                              <Calendar className="w-3.5 h-3.5 text-purple-600" />
                              <span className="hidden sm:inline">.ics</span>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(item)}
                              className="inline-flex items-center space-x-1 px-2 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition text-xs"
                              title="Edit Item"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setItemToDelete(item)}
                              className="inline-flex items-center space-x-1 px-2 py-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition text-xs"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Edit Item</span>
              </h4>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title (or leave empty to auto-derive)"
                  className="w-full px-3.5 py-2 text-sm text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as Category)}
                  className="w-full px-3.5 py-2 text-sm text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduled Reminder / Due Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <AlarmClock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Scheduled Reminder / Due Date</span>
                  </span>
                  {editRemindAt && (
                    <button
                      type="button"
                      onClick={() => setEditRemindAt('')}
                      className="text-[11px] text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Clear reminder
                    </button>
                  )}
                </label>
                <input
                  type="datetime-local"
                  value={editRemindAt}
                  onChange={(e) => setEditRemindAt(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  required
                  className="w-full px-3.5 py-2.5 text-sm text-black font-semibold bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-y transition leading-relaxed"
                />
              </div>

              {editError && (
                <p className="text-xs text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{editError}</span>
                </p>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating || !editContent.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg shadow-sm transition"
                >
                  {updating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Delete Item?</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{itemToDelete.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
