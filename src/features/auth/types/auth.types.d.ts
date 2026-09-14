interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  status: "Active" | "Inactive";
  role: "Admin" | "Advisor";
  jobTitle?: string;
  firm?: string;
}

interface LoginResponse {
  token: string;
  account: User;
}

interface ForgotPasswordCredentials {
  email: string;
}

interface VerifyOtpCredentials {
  email: string;
  otp: string;
}

interface ResetPasswordCredentials {
  resetToken: string;
  password: string;
  confirmPassword: string;
}

interface ResendOtpCredentials {
  email: string;
}

interface UpdateFcmTokenPayload {
  fcmToken: string;
}

