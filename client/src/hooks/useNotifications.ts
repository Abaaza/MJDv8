
import { useState, useEffect } from 'react'
import { notificationService, Notification } from '@/services/notificationService'
import { useAuth } from '@/contexts/AuthContext'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(notificationService.getUnreadCount())
    })

    // Initialize with current notifications
    setNotifications(notificationService.getNotifications())
    setUnreadCount(notificationService.getUnreadCount())

    return unsubscribe
  }, [])

  useEffect(() => {
    if (user) {
      // Initialize realtime subscription for job updates
      const unsubscribeRealtime = notificationService.initializeRealtimeSubscription(user.id)
      return unsubscribeRealtime
    }
  }, [user])

  return {
    notifications,
    unreadCount,
    markAsRead: notificationService.markAsRead.bind(notificationService),
    markAllAsRead: notificationService.markAllAsRead.bind(notificationService),
    clearAll: notificationService.clearAll.bind(notificationService),
    showToast: notificationService.showToast.bind(notificationService)
  }
}
