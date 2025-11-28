export interface UserAvatarData {
  avatarUrl?: string | null;
  fullName?: string | null;
}

export const getAvatarUrl = (
  user: UserAvatarData | null | undefined
): string => {
  if (!user) return '';

  if (user.avatarUrl) {
    // If the avatarUrl is already a full URL (e.g. from Google), use it as is.
    if (user.avatarUrl.startsWith('http')) {
      return user.avatarUrl;
    }

    // Otherwise, construct the URL using the backend API URL.
    // We need to ensure we don't double-append /api if the VITE_API_URL includes it.
    // The backend serves uploads at the root /uploads, so we strip /api from the base URL if present.
    const baseUrl = (
      import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    ).replace(/\/api$/, '');
    return `${baseUrl}${user.avatarUrl}`;
  }

  // Return null if no avatar is present, allowing components to render their own default (e.g. initials with CSS gradient)
  return '';
};
