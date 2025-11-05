import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const initSocket = (userId: string) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket conectado');
      socket?.emit('join_room', userId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    socket.on('notification', (data) => {
      console.log('📬 Nueva notificación:', data);
      // Puedes agregar una toast notification aquí
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(data.title, {
            body: data.message,
            icon: '/icon-192x192.png',
          });
        }
      }
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const requestNotificationPermission = async () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }
};
