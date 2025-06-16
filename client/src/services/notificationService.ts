
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  read: boolean
  created_at: string
  user_id: string
  metadata?: Record<string, any>
}

class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: Notification[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications))
  }

  // Show toast notification
  showToast(type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) {
    const toastMessage = message ? `${title}: ${message}` : title
    
    switch (type) {
      case 'success':
        toast.success(toastMessage)
        break
      case 'error':
        toast.error(toastMessage)
        break
      case 'info':
        toast.info(toastMessage)
        break
      case 'warning':
        toast.warning(toastMessage)
        break
    }
  }

  // Add notification to local state
  addNotification(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      read: false
    }

    this.notifications.unshift(newNotification)
    this.notifyListeners()
    
    // Also show as toast
    this.showToast(notification.type, notification.title, notification.message)
  }

  // Handle match completion notification
  notifyMatchCompleted(projectName: string, matchedItems: number, totalItems: number, avgConfidence: number) {
    this.addNotification({
      title: 'Price Matching Completed',
      message: `Project "${projectName}" completed with ${matchedItems}/${totalItems} items matched (${avgConfidence}% avg confidence)`,
      type: 'success',
      user_id: '', // Will be set when we have user context
      metadata: {
        projectName,
        matchedItems,
        totalItems,
        avgConfidence,
        type: 'match_completed'
      }
    })
  }

  // Handle match failed notification
  notifyMatchFailed(projectName: string, error: string) {
    this.addNotification({
      title: 'Price Matching Failed',
      message: `Project "${projectName}" failed: ${error}`,
      type: 'error',
      user_id: '',
      metadata: {
        projectName,
        error,
        type: 'match_failed'
      }
    })
  }

  // Mark notification as read
  markAsRead(notificationId: string) {
    this.notifications = this.notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    )
    this.notifyListeners()
  }

  // Mark all as read
  markAllAsRead() {
    this.notifications = this.notifications.map(notification => ({
      ...notification,
      read: true
    }))
    this.notifyListeners()
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications
  }

  // Clear all notifications
  clearAll() {
    this.notifications = []
    this.notifyListeners()
  }

  // Initialize realtime subscription for job updates
  initializeRealtimeSubscription(userId: string) {
    const channel = supabase
      .channel('job-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_matching_jobs',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const job = payload.new as any
          
          if (job.status === 'completed') {
            this.notifyMatchCompleted(
              job.project_name,
              job.matched_items || 0,
              job.total_items || 0,
              job.confidence_score || 0
            )
          } else if (job.status === 'failed') {
            this.notifyMatchFailed(
              job.project_name,
              job.error_message || 'Unknown error occurred'
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}

export const notificationService = NotificationService.getInstance()
