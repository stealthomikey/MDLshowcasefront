// shape of data on the frontend get users name etc
export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthStatus {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refetchUser: () => void; 
}