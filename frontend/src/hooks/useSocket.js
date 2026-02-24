import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4005';

/**
 * useSocket — Custom hook for Socket.IO connection
 *
 * Production-grade patterns:
 * - Attaches JWT for authentication (matches backend socketAuthMiddleware)
 * - Auto-reconnects with exponential backoff
 * - Cleans up on unmount (prevents memory leaks)
 * - Room-based events (join/leave order rooms)
 *
 * Usage:
 *   const { joinOrder, leaveOrder, onStatusUpdate, onLocationUpdate } = useSocket();
 */
const useSocket = () => {
  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());

  // Initialize socket connection (lazy — only when needed)
  const getSocket = useCallback(() => {
    // Return existing socket if connected or connecting
    if (socketRef.current?.connected || socketRef.current?.connecting) {
      return socketRef.current;
    }

    // Disconnect stale socket if it exists
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // Read token fresh every time (avoids stale JWT after refresh)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('[Socket] No access token available for connection');
    }

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    socketRef.current.on('connect', () => {
      console.log('[Socket] Connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socketRef.current.on('error', (data) => {
      console.error('[Socket] Server error:', data?.message);
    });

    return socketRef.current;
  }, []);

  // Join an order room for real-time updates
  const joinOrder = useCallback(
    (orderId) => {
      const socket = getSocket();
      socket.emit('join:order', orderId);
    },
    [getSocket]
  );

  // Leave an order room
  const leaveOrder = useCallback(
    (orderId) => {
      const socket = getSocket();
      socket.emit('leave:order', orderId);
    },
    [getSocket]
  );

  // Listen for order status updates (prevents duplicate listeners)
  const onStatusUpdate = useCallback(
    (callback) => {
      const socket = getSocket();
      // Remove previous listener for this event to avoid duplicates
      socket.off('order:statusUpdated');
      socket.on('order:statusUpdated', callback);

      return () => socket.off('order:statusUpdated', callback);
    },
    [getSocket]
  );

  // Listen for delivery location updates
  const onLocationUpdate = useCallback(
    (callback) => {
      const socket = getSocket();
      socket.off('delivery:locationUpdate');
      socket.on('delivery:locationUpdate', callback);

      return () => socket.off('delivery:locationUpdate', callback);
    },
    [getSocket]
  );

  // Listen for order delivered event
  const onDelivered = useCallback(
    (callback) => {
      const socket = getSocket();
      socket.off('order:delivered');
      socket.on('order:delivered', callback);

      return () => socket.off('order:delivered', callback);
    },
    [getSocket]
  );

  // Listen for order picked up event
  const onPickedUp = useCallback(
    (callback) => {
      const socket = getSocket();
      socket.off('order:pickedUp');
      socket.on('order:pickedUp', callback);

      return () => socket.off('order:pickedUp', callback);
    },
    [getSocket]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    joinOrder,
    leaveOrder,
    onStatusUpdate,
    onLocationUpdate,
    onDelivered,
    onPickedUp,
  };
};

export default useSocket;
