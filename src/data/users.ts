export type UserRole = 'Admin' | 'Manager' | 'Viewer';
export type UserStatus = 'Active' | 'Pending' | 'Suspended';
export type NewUser = {
  name: string;
  email: string;
  role: UserRole;
  timezone?: string;
  welcome?: boolean;
  mfa?: boolean;
};

export const seedUsers = [
  {
    name: 'Ava Rodriguez',
    email: 'ava@qaforge.dev',
    role: 'Admin',
    status: 'Active',
    lastActive: '2 minutes ago',
  },
  {
    name: 'Noah Williams',
    email: 'noah@qaforge.dev',
    role: 'Manager',
    status: 'Active',
    lastActive: '18 minutes ago',
  },
  { name: 'Mila Petrova', email: 'mila@qaforge.dev', role: 'Viewer', status: 'Pending', lastActive: 'Never' },
  { name: 'Liam Chen', email: 'liam@qaforge.dev', role: 'Admin', status: 'Active', lastActive: 'Yesterday' },
  {
    name: 'Sofia Anders',
    email: 'sofia@qaforge.dev',
    role: 'Manager',
    status: 'Suspended',
    lastActive: '5 days ago',
  },
  {
    name: 'Ethan Brooks',
    email: 'ethan@qaforge.dev',
    role: 'Viewer',
    status: 'Active',
    lastActive: '12 minutes ago',
  },
] as const;

export const newUser = (overrides: Partial<NewUser> = {}): NewUser => ({
  name: 'Maya Chen',
  email: 'maya@example.com',
  role: 'Manager',
  ...overrides,
});

export const auditEvents = [
  'Ava Rodriguez created user Mila Petrova',
  'Noah Williams exported the user list',
  'Liam Chen changed Sofia Anders role to Manager',
  'Ava Rodriguez suspended Sofia Anders',
  'System completed nightly permission sync',
  'Ethan Brooks accepted workspace invitation',
  'Noah Williams enabled MFA enforcement',
  'System archived 12 expired invitations',
];

export const exerciseTitles = [
  'Demo sign-in',
  'Required validation',
  'Filter users',
  'Create a manager',
  'Scope duplicate buttons',
  'Bulk invitation state',
  'Wait for status mutation',
  'Debounced audit filter',
  'Reject dynamic IDs',
];
