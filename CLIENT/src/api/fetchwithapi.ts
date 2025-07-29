import { useAuth } from "../context/authContext"

export const useApi = () => {
  const { accessToken, refresh, logout } = useAuth();

  const fetchWithAuth = async (
    input: RequestInfo,
    init: RequestInit = {}
  ): Promise<Response> => {
    try {
      // Clone init to avoid mutating caller's object
      let requestInit: RequestInit = {
        ...init,
        headers: {
          ...(init.headers || {}),
          Authorization: `JWT ${accessToken}`,
        },
      };

      let res = await fetch(input, requestInit);

      if (res.status === 401) {
        // access token might be expired
        console.warn('Access token expired, trying refresh...');
        await refresh();

        // try again with new token
        requestInit = {
          ...init,
          headers: {
            ...(init.headers || {}),
            Authorization: `JWT ${localStorage.getItem('accessToken')}`,
          },
        };

        res = await fetch(input, requestInit);

        if (res.status === 401) {
          // refresh failed or user unauthorized
          logout();
          window.location.href = '/signin'; // redirect to login
        }
      }

      return res;
    } catch (err) {
      console.error('fetchWithAuth error:', err);
      throw err;
    }
  };

  return { fetchWithAuth };
};
