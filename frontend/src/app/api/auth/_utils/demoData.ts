export type DemoRole = 'ADMIN' | 'PUBLISHER' | 'USER';

export interface DemoUserRecord {
  id: string;
  email: string;
  password: string;
  role: DemoRole;
  name: string;
  phone?: string;
  isActive?: boolean;
  emailConfirmed?: boolean;
}

export const demoUsers: DemoUserRecord[] = [
  {
    id: 'admin-demo-1',
    email: 'admin@mipage.cl',
    password: 'password123',
    role: 'ADMIN',
    name: 'Administrador General',
    phone: '+56 9 1234 5678',
    isActive: true,
    emailConfirmed: true,
  },
  {
    id: 'publisher-demo-1',
    email: 'maria@example.com',
    password: 'password123',
    role: 'PUBLISHER',
    name: 'María Campos',
    phone: '+56 9 8888 7777',
    isActive: true,
    emailConfirmed: true,
  },
  {
    id: 'user-demo-1',
    email: 'juan@example.com',
    password: 'password123',
    role: 'USER',
    name: 'Juan Torres',
    phone: '+56 9 4444 3333',
    isActive: true,
    emailConfirmed: true,
  },
];

export const sanitizeDemoUser = (user: DemoUserRecord) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  isVerified: !!user.emailConfirmed,
  emailConfirmed: !!user.emailConfirmed,
  isActive: user.isActive ?? true,
  phone: user.phone,
});
