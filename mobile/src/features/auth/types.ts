export type SignupStep = 'account' | 'verify' | 'profile' | 'interests' | 'safety' | 'complete';
export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export type SignupDraft = {
  step: SignupStep;
  phone: string;
  phoneVerified: boolean;
  name: string;
  username: string;
  dateOfBirth: string;
  city: string;
  bio: string;
  avatarColor: string;
  avatarUri?: string;
  interests: string[];
  preferredVibes: string[];
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  notificationsEnabled: boolean;
};

export type CompleteSignUpInput = Pick<SignupDraft,
  'phone' | 'name' | 'username' | 'dateOfBirth' | 'city' | 'bio' | 'avatarColor' | 'avatarUri' | 'interests' | 'preferredVibes' | 'notificationsEnabled'
>;
