const login = async (
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<boolean> => {
  try {
    const username = email.trim();

    if (!username || !password) {
      return false;
    }

    const response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );

    if (!response.ok) {
      console.error(
        'Login request failed:',
        response.status
      );

      return false;
    }

    const data = await response.json();

    console.log('Login response:', data);

    if (!data.success) {
      return false;
    }

    const user = {
      id: data.user_id,
      username: data.username,
      email: username,
    };

    /*
     * Store the logged-in user.
     * API client uses ncmh_user to send X-User-ID.
     */
    if (rememberMe) {
      localStorage.setItem(
        'ncmh_user',
        JSON.stringify(user)
      );
    } else {
      sessionStorage.setItem(
        'ncmh_user',
        JSON.stringify(user)
      );

      localStorage.removeItem('ncmh_user');
    }

    /*
     * Update React authentication state.
     * Keep this line according to the state name
     * already present in your AppContext.
     */
    setCurrentUser(user);

    return true;

  } catch (error) {
    console.error(
      'Login error:',
      error
    );

    return false;
  }
};
