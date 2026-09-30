import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

import {
  ScreenType,
  UserRole,
  AuthUser,
} from '../types';


type ToastType =
  | 'success'
  | 'error'
  | 'info'
  | 'warning';


interface ToastState {
  message: string;
  type: ToastType;
}


interface AppContextType {
  activeScreen: ScreenType;

  setActiveScreen: (
    screen: ScreenType
  ) => void;

  isAuthenticated: boolean;

  currentUser: AuthUser | null;

  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    role?: UserRole
  ) => Promise<boolean>;

  logout: () => void;

  selectedCatalogCnmc: string | null;

  setSelectedCatalogCnmc: (
    cnmcCode: string | null
  ) => void;

  showToast: (
    message: string,
    type?: ToastType
  ) => void;

  toast: ToastState | null;

  candidateIndex: number;

  setCandidateIndex: (
    index: number
  ) => void;

  isWaveModalOpen: boolean;

  setIsWaveModalOpen: (
    open: boolean
  ) => void;
}


const AppContext =
  createContext<AppContextType | undefined>(
    undefined
  );


export const AppProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {

  const [
    activeScreen,
    setActiveScreen,
  ] = useState<ScreenType>('dashboard');


  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState<boolean>(false);


  const [
    currentUser,
    setCurrentUser,
  ] = useState<AuthUser | null>(null);


  const [
    selectedCatalogCnmc,
    setSelectedCatalogCnmc,
  ] = useState<string | null>(null);


  const [
    candidateIndex,
    setCandidateIndex,
  ] = useState<number>(0);


  const [
    toast,
    setToast,
  ] = useState<ToastState | null>(null);


  const [
    isWaveModalOpen,
    setIsWaveModalOpen,
  ] = useState<boolean>(false);


  /* =========================================================
     RESTORE REMEMBERED USER
     ========================================================= */

  useEffect(() => {

    try {

      const remembered =
        localStorage.getItem(
          'ncmh_remember_me'
        );

      const storedUser =
        localStorage.getItem(
          'ncmh_user'
        );

      if (
        remembered === 'true' &&
        storedUser
      ) {

        const user: AuthUser =
          JSON.parse(storedUser);

        if (user?.id) {

          setCurrentUser(user);

          setIsAuthenticated(true);

          setActiveScreen('dashboard');

        }

      }

    } catch (error) {

      console.error(
        'Failed to restore remembered user:',
        error
      );

      localStorage.removeItem(
        'ncmh_remember_me'
      );

      localStorage.removeItem(
        'ncmh_user'
      );

    }

  }, []);


  /* =========================================================
     TOAST
     ========================================================= */

  const showToast = (
    message: string,
    type: ToastType = 'info'
  ) => {

    setToast({
      message,
      type,
    });

    setTimeout(() => {

      setToast(null);

    }, 3500);

  };


  /* =========================================================
     LOGIN
     ========================================================= */

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
    role?: UserRole
  ): Promise<boolean> => {

    const enteredEmail =
      email.trim();


    if (
      enteredEmail.length === 0 ||
      password.length === 0
    ) {

      return false;

    }


    try {

      const response =
        await fetch(
          'http://127.0.0.1:8002/auth/login',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              username:
                enteredEmail,

              password,
            }),
          }
        );


      const data =
        await response.json();


      if (
  !response.ok ||
  data.user_id === undefined ||
  data.user_id === null
) {

        showToast(
          data.message ||
            'Invalid username or password.',
          'error'
        );

        return false;

      }


      /* =====================================================
         CREATE FRONTEND USER FROM BACKEND RESPONSE
         ===================================================== */

      const user: AuthUser = {

        id: String(
          data.user_id
        ),

        name:
          data.username ||
          enteredEmail.split('@')[0] ||
          'User',

        email:
          enteredEmail,

        role:
          role ?? 'admin',

        organization:
          'NCMH',

        title:
          'Authorized User',

      };


      /* =====================================================
         UPDATE AUTH STATE
         ===================================================== */

      setCurrentUser(user);

      setIsAuthenticated(true);

      setActiveScreen('dashboard');


      /* =====================================================
         SAVE USER
         ===================================================== */

      if (rememberMe) {

        localStorage.setItem(
          'ncmh_remember_me',
          'true'
        );

        localStorage.setItem(
          'ncmh_user',
          JSON.stringify(user)
        );

      } else {

        /*
         * Even without "Remember me", keep the current
         * logged-in user's ID available to apiClient so
         * authenticated API requests work during this
         * browser session.
         */

        localStorage.removeItem(
          'ncmh_remember_me'
        );

        localStorage.setItem(
          'ncmh_user',
          JSON.stringify(user)
        );

      }


      return true;

    } catch (error) {

      console.error(
        'Login request failed:',
        error
      );

      showToast(
        'Unable to connect to the backend.',
        'error'
      );

      return false;

    }

  };


  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout = () => {

    setCurrentUser(null);

    setIsAuthenticated(false);

    setActiveScreen('dashboard');

    setSelectedCatalogCnmc(null);

    setCandidateIndex(0);

    setToast(null);

    setIsWaveModalOpen(false);


    localStorage.removeItem(
      'ncmh_remember_me'
    );

    localStorage.removeItem(
      'ncmh_user'
    );

  };


  /* =========================================================
     CONTEXT VALUE
     ========================================================= */

  const value: AppContextType = {

    activeScreen,

    setActiveScreen,

    isAuthenticated,

    currentUser,

    login,

    logout,

    selectedCatalogCnmc,

    setSelectedCatalogCnmc,

    showToast,

    toast,

    candidateIndex,

    setCandidateIndex,

    isWaveModalOpen,

    setIsWaveModalOpen,

  };


  return (

    <AppContext.Provider
      value={value}
    >

      {children}

    </AppContext.Provider>

  );

};


export const useApp = () => {

  const context =
    useContext(AppContext);


  if (!context) {

    throw new Error(
      'useApp must be used inside AppProvider'
    );

  }


  return context;

};


export default AppContext;