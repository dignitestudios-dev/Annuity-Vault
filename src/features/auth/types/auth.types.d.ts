interface LoginCredentials {
  username: string;
  email?: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
}

interface LoginResponse extends User {
  accessToken: string;
  refreshToken: string;
}
