import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { useNotifications } from '../contexts/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications()

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'info':
        return 'ℹ️'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'notification-success'
      case 'info':
        return 'notification-info'
      case 'warning':
        return 'notification-warning'
      case 'error':
        return 'notification-error'
      default:
        return 'notification-info'
    }
  }

  return (
    <div ref={dropdownRef} className="notification-dropdown">
      <button
        type="button"
        className="dashboard-topbar__icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ver notificaciones"
        aria-expanded={isOpen}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} notificaciones sin leer`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel animate-fade-in">
          <div className="notification-header">
            <h3 className="notification-title">
              Notificaciones
              {unreadCount > 0 && <span className="notification-count">({unreadCount})</span>}
            </h3>
            {notifications.length > 0 && (
              <button
                type="button"
                className="notification-action-btn"
                onClick={markAllAsRead}
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell className="h-12 w-12 text-neutral-300 mb-2" />
                <p className="text-neutral-500">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'notification-unread' : ''} ${getNotificationColor(notification.type)}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-body">
                      <div className="notification-item-header">
                        <h4 className="notification-item-title">{notification.title}</h4>
                        {!notification.read && (
                          <span className="notification-dot" aria-label="Sin leer" />
                        )}
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">
                        {formatDistanceToNow(notification.timestamp, {
                          addSuffix: true,
                          locale: es
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="notification-close"
                    onClick={(e) => {
                      e.stopPropagation()
                      clearNotification(notification.id)
                    }}
                    aria-label="Eliminar notificación"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button
                type="button"
                className="notification-footer-btn"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar todas como leídas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
