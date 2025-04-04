import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirestore, collection, addDoc, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { BiBell, BiCalendar, BiMoney, BiInfoCircle } from 'react-icons/bi';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const auth = getAuth();
  const db = getFirestore();

  // Notification types and their corresponding icons
  const notificationTypes = {
    TAX_PAYMENT: { icon: BiMoney, color: 'text-green-500' },
    DEADLINE: { icon: BiCalendar, color: 'text-red-500' },
    POLICY_UPDATE: { icon: BiInfoCircle, color: 'text-blue-500' },
    INVESTMENT: { icon: BiMoney, color: 'text-purple-500' }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // Subscribe to user's notifications
    const notificationsRef = collection(db, 'notifications');
    const userNotificationsQuery = query(
      notificationsRef,
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(userNotificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
      
      setNotifications(newNotifications.sort((a, b) => b.timestamp - a.timestamp));
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    // Generate sample notifications (for demo)
    generateSampleNotifications();

    return () => unsubscribe();
  }, [auth.currentUser]);

  const generateSampleNotifications = async () => {
    if (!auth.currentUser) return;

    const sampleNotifications = [
      {
        type: 'TAX_PAYMENT',
        title: 'Upcoming Tax Payment',
        message: 'Your quarterly tax payment is due in 15 days',
        timestamp: Timestamp.fromDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
        priority: 'high'
      },
      {
        type: 'DEADLINE',
        title: 'Investment Deadline',
        message: 'Last date for Section 80C investments is approaching',
        timestamp: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        priority: 'medium'
      },
      {
        type: 'POLICY_UPDATE',
        title: 'New Tax Policy Update',
        message: 'Recent changes in tax slabs announced',
        timestamp: Timestamp.fromDate(new Date()),
        priority: 'low'
      }
    ];

    for (const notification of sampleNotifications) {
      try {
        await addDoc(collection(db, 'notifications'), {
          ...notification,
          userId: auth.currentUser.uid,
          read: false,
          createdAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error adding notification:', error);
      }
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <BiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </motion.button>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 w-80 mt-2 bg-white rounded-lg shadow-xl z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => {
                  const NotificationIcon = notificationTypes[notification.type]?.icon || BiInfoCircle;
                  const iconColor = notificationTypes[notification.type]?.color || 'text-gray-500';
                  
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 ${iconColor}`}>
                          <NotificationIcon className="w-6 h-6" />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {notification.timestamp?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem; 