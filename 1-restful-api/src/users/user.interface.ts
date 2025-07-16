export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address: string;
  subscribeToNewsletter: boolean;
  createdAt: Date;
  updatedAt: Date;
}
