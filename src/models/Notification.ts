
// Notification model definition
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}
