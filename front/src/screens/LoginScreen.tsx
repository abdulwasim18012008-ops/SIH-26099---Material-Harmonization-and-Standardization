import React, { FormEvent, useState } from 'react';

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Building2,
  CircleAlert,
} from 'lucide-react';

import { useApp } from '../context/AppContext';


/* =========================================================
   LOGIN VIEW
   ========================================================= */

type AuthView =
  | 'login'
  | 'forgot'
  | 'signup';


/* =========================================================
   LOGIN SCREEN
   ========================================================= */

export const LoginScreen: React.FC = () => {

  const {
    login,
  } = useApp();


  /* =======================================================
     VIEW STATE
     ======================================================= */

  const [
    authView,
    setAuthView,
  ] = useState<AuthView>('login');


  /* =======================================================
     LOGIN STATE
     ======================================================= */

  const [
    email,
    setEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    rememberMe,
    setRememberMe,
  ] = useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);


  /* =======================================================
     FORGOT PASSWORD
     ======================================================= */

  const [
    forgotEmail,
    setForgotEmail,
  ] = useState('');

  const [
    forgotMessage,
    setForgotMessage,
  ] = useState('');


  /* =======================================================
     SIGNUP STATE
     ======================================================= */

  const [
    fullName,
    setFullName,
  ] = useState('');

  const [
    signupEmail,
    setSignupEmail,
  ] = useState('');

  const [
    organization,
    setOrganization,
  ] = useState('');

  const [
    employeeId,
    setEmployeeId,
  ] = useState('');

  const [
    designation,
    setDesignation,
  ] = useState('');

  const [
    signupPassword,
    setSignupPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    signupMessage,
    setSignupMessage,
  ] = useState('');


  /* =======================================================
     LOGIN SUBMIT
     ======================================================= */

  const handleLogin = async (
    event: FormEvent
  ) => {

    event.preventDefault();

    setError('');

    if (!email.trim()) {

      setError(
        'Please enter your email address.'
      );

      return;
    }

    if (!password) {

      setError(
        'Please enter your password.'
      );

      return;
    }

    setIsLoading(true);

    try {

      const success = await login(
        email,
        password,
        rememberMe
      );

      if (!success) {

        setError(
          'Invalid credentials. Please check your email and password.'
        );

      }

    } catch (error) {

      console.error(
        'Login failed:',
        error
      );

      setError(
        'Unable to connect to the backend.'
      );

    } finally {

      setIsLoading(false);

    }

  };


  /* =======================================================
     FORGOT PASSWORD SUBMIT
     ======================================================= */

  const handleForgotPassword = (
    event: FormEvent
  ) => {

    event.preventDefault();

    setForgotMessage('');

    if (!forgotEmail.trim()) {

      setForgotMessage(
        'Please enter your registered email address.'
      );

      return;
    }

    setForgotMessage(
      'Password reset is currently unavailable until the backend identity service is connected.'
    );

  };


  /* =======================================================
     CREATE ACCOUNT SUBMIT
     ======================================================= */

  const handleSignup = (
    event: FormEvent
  ) => {

    event.preventDefault();

    setSignupMessage('');

    if (
      !fullName.trim() ||
      !signupEmail.trim() ||
      !organization.trim() ||
      !employeeId.trim() ||
      !designation.trim()
    ) {

      setSignupMessage(
        'Please complete all required fields.'
      );

      return;
    }

    if (
      signupPassword.length < 6
    ) {

      setSignupMessage(
        'Password must contain at least 6 characters.'
      );

      return;
    }

    const password = signupPassword;
    const confirmedPassword = confirmPassword;

    console.log(
      'Signup password:',
      JSON.stringify(password)
    );

    console.log(
      'Confirm password:',
      JSON.stringify(confirmedPassword)
    );

    if (password !== confirmedPassword) {

      console.log(
        'PASSWORD MISMATCH'
      );

      setSignupMessage(
        'Passwords do not match.'
      );

      return;
    }

    console.log(
      'PASSWORD MATCHED'
    );

    setSignupMessage('');
    setAuthView('login');

  };


  /* =======================================================
     LOGIN VIEW
     ======================================================= */

  const renderLogin = () => {

    return (

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-[#e4e0d8]
          shadow-[0_10px_35px_rgba(46,50,48,0.08)]
          p-7
          sm:p-8
        "
      >

        {/* =================================================
           CARD HEADING
           ================================================= */}

        <div
          className="
            mb-7
          "
        >

          <div
            className="
              w-11
              h-11
              rounded-xl
              bg-[#f0ece4]
              border
              border-[#e4e0d8]
              flex
              items-center
              justify-center
              text-[#a5555a]
              mb-4
            "
          >

            <LockKeyhole
              size={20}
            />

          </div>


          <h2
            className="
              font-serif
              text-2xl
              font-semibold
              text-[#2e3230]
            "
          >
            Sign in
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-[#6a6d68]
            "
          >
            Access your authorized workspace.
          </p>

        </div>


        {/* =================================================
           ERROR MESSAGE
           ================================================= */}

        {error && (

          <div
            className="
              mb-5
              rounded-xl
              border
              border-[#efc9c7]
              bg-[#fff3f1]
              px-3.5
              py-3
              text-xs
              text-[#8b2f2c]
              flex
              items-start
              gap-2
            "
          >

            <CircleAlert
              size={15}
              className="mt-0.5 shrink-0"
            />

            <span>
              {error}
            </span>

          </div>

        )}


        {/* =================================================
           LOGIN FORM
           ================================================= */}

        <form
          onSubmit={handleLogin}
          className="
            space-y-5
          "
        >

          {/* EMAIL */}

          <div>

            <label
              htmlFor="login-email"
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-2
              "
            >
              Email address
            </label>


            <div
              className="
                relative
              "
            >

              <Mail
                size={17}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[#8a8d87]
                "
              />


              <input
                id="login-email"
                type="email"
                value={email}
                onChange={event =>
                  setEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email"
                autoComplete="email"
                className="
                  w-full
                  h-11
                  rounded-xl
                  border
                  border-[#d9d6ce]
                  bg-[#fffdfa]
                  pl-10
                  pr-3
                  text-sm
                  text-[#2e3230]
                  outline-none
                  placeholder:text-[#9a9d97]
                  focus:border-[#a5555a]
                  focus:ring-4
                  focus:ring-[#a5555a]/10
                  transition-all
                "
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div>

            <div
              className="
                flex
                items-center
                justify-between
                mb-2
              "
            >

              <label
                htmlFor="login-password"
                className="
                  text-[11px]
                  uppercase
                  tracking-wider
                  font-bold
                  text-[#4a4e4a]
                "
              >
                Password
              </label>


              <button
                type="button"
                onClick={() => {

                  setAuthView(
                    'forgot'
                  );

                  setForgotEmail(
                    email
                  );

                  setError('');

                }}
                className="
                  text-[11px]
                  font-semibold
                  text-[#a5555a]
                  hover:text-[#8c464b]
                  transition-colors
                "
              >
                Forgot password?
              </button>

            </div>


            <div
              className="
                relative
              "
            >

              <LockKeyhole
                size={17}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[#8a8d87]
                "
              />


              <input
                id="login-password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={event =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                className="
                  w-full
                  h-11
                  rounded-xl
                  border
                  border-[#d9d6ce]
                  bg-[#fffdfa]
                  pl-10
                  pr-11
                  text-sm
                  text-[#2e3230]
                  outline-none
                  placeholder:text-[#9a9d97]
                  focus:border-[#a5555a]
                  focus:ring-4
                  focus:ring-[#a5555a]/10
                  transition-all
                "
              />


              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    value => !value
                  )
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[#72766f]
                  hover:text-[#2e3230]
                  transition-colors
                "
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >

                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}

              </button>

            </div>

          </div>


          {/* REMEMBER ME */}

          <label
            className="
              flex
              items-center
              gap-2
              cursor-pointer
              select-none
            "
          >

            <input
              type="checkbox"
              checked={rememberMe}
              onChange={event =>
                setRememberMe(
                  event.target.checked
                )
              }
              className="
                h-4
                w-4
                rounded
                border-[#c7c5be]
                accent-[#4a7c59]
              "
            />


            <span
              className="
                text-xs
                text-[#5f625e]
              "
            >
              Remember this device
            </span>

          </label>


          {/* SIGN IN BUTTON */}

          <button
            type="submit"
            disabled={isLoading}
            className="
              w-full
              h-11
              rounded-xl
              bg-[#4a7c59]
              hover:bg-[#416c4e]
              disabled:opacity-60
              text-white
              text-sm
              font-bold
              inline-flex
              items-center
              justify-center
              gap-2
              shadow-[0_4px_12px_rgba(74,124,89,0.18)]
              transition-all
            "
          >

            {isLoading ? (

              <>
                <span
                  className="
                    w-4
                    h-4
                    rounded-full
                    border-2
                    border-white/40
                    border-t-white
                    animate-spin
                  "
                />

                Signing in...
              </>

            ) : (

              <>
                Sign in

                <ArrowRight
                  size={16}
                />
              </>

            )}

          </button>

        </form>


        {/* =================================================
           CREATE ACCOUNT
           ================================================= */}

        <div
          className="
            mt-6
            pt-5
            border-t
            border-[#eae6de]
            text-center
          "
        >

          <p
            className="
              text-[11px]
              text-[#74776f]
            "
          >
            Don't have an account?
          </p>


          <button
            type="button"
            onClick={() => {

              setAuthView(
                'signup'
              );

              setError('');

            }}
            className="
              mt-1
              text-sm
              font-bold
              text-[#a5555a]
              hover:text-[#8c464b]
              transition-colors
            "
          >
            Create an account
          </button>

        </div>

      </div>

    );

  };


  /* =======================================================
     FORGOT PASSWORD VIEW
     ======================================================= */

  const renderForgotPassword = () => {

    return (

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-[#e4e0d8]
          shadow-[0_10px_35px_rgba(46,50,48,0.08)]
          p-7
          sm:p-8
        "
      >

        <div
          className="
            w-11
            h-11
            rounded-xl
            bg-[#f0ece4]
            border
            border-[#e4e0d8]
            flex
            items-center
            justify-center
            text-[#a5555a]
            mb-5
          "
        >

          <Mail
            size={20}
          />

        </div>


        <h2
          className="
            font-serif
            text-2xl
            font-semibold
            text-[#2e3230]
          "
        >
          Forgot password?
        </h2>


        <p
          className="
            mt-1.5
            text-sm
            text-[#6a6d68]
          "
        >
          Enter your registered email address
          to begin password recovery.
        </p>


        <form
          onSubmit={
            handleForgotPassword
          }
          className="
            mt-6
            space-y-4
          "
        >

          <div>

            <label
              htmlFor="forgot-email"
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-2
              "
            >
              Email address
            </label>


            <div
              className="
                relative
              "
            >

              <Mail
                size={17}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[#8a8d87]
                "
              />


              <input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={event =>
                  setForgotEmail(
                    event.target.value
                  )
                }
                placeholder="Enter your email"
                className="
                  w-full
                  h-11
                  rounded-xl
                  border
                  border-[#d9d6ce]
                  bg-[#fffdfa]
                  pl-10
                  pr-3
                  text-sm
                  outline-none
                  placeholder:text-[#9a9d97]
                  focus:border-[#a5555a]
                  focus:ring-4
                  focus:ring-[#a5555a]/10
                "
              />

            </div>

          </div>


          {forgotMessage && (

            <div
              className="
                rounded-xl
                bg-[#f0ece4]
                border
                border-[#e4e0d8]
                px-3.5
                py-3
                text-xs
                text-[#5f625e]
              "
            >
              {forgotMessage}
            </div>

          )}


          <button
            type="submit"
            className="
              w-full
              h-11
              rounded-xl
              bg-[#4a7c59]
              hover:bg-[#416c4e]
              text-white
              text-sm
              font-bold
              transition-colors
            "
          >
            Send reset instructions
          </button>


          <button
            type="button"
            onClick={() => {

              setAuthView(
                'login'
              );

              setForgotMessage('');

            }}
            className="
              w-full
              text-xs
              font-bold
              text-[#a5555a]
              hover:text-[#8c464b]
            "
          >
            Back to sign in
          </button>

        </form>

      </div>

    );

  };


  /* =======================================================
     CREATE ACCOUNT VIEW
     ======================================================= */

  const renderSignup = () => {

    return (

      <div
        className="
          bg-white
          rounded-2xl
          border
          border-[#e4e0d8]
          shadow-[0_10px_35px_rgba(46,50,48,0.08)]
          p-7
          sm:p-8
        "
      >

        <div
          className="
            w-11
            h-11
            rounded-xl
            bg-[#f0ece4]
            border
            border-[#e4e0d8]
            flex
            items-center
            justify-center
            text-[#a5555a]
            mb-5
          "
        >

          <Building2
            size={20}
          />

        </div>


        <h2
          className="
            font-serif
            text-2xl
            font-semibold
            text-[#2e3230]
          "
        >
          Create an account
        </h2>


        <p
          className="
            mt-1.5
            text-sm
            text-[#6a6d68]
          "
        >
          Request access to the NCMH platform.
        </p>


        <form
          onSubmit={handleSignup}
          className="
            mt-6
            space-y-4
          "
        >

          {/* FULL NAME */}

          <div>

            <label
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-1.5
              "
            >
              Full name
            </label>


            <input
              type="text"
              value={fullName}
              onChange={event =>
                setFullName(
                  event.target.value
                )
              }
              placeholder="Your full name"
              className="
                w-full
                h-10
                rounded-xl
                border
                border-[#d9d6ce]
                bg-[#fffdfa]
                px-3
                text-sm
                outline-none
                focus:border-[#a5555a]
              "
            />

          </div>


          {/* EMAIL */}

          <div>

            <label
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-1.5
              "
            >
              Official email
            </label>


            <input
              type="email"
              value={signupEmail}
              onChange={event =>
                setSignupEmail(
                  event.target.value
                )
              }
              placeholder="name@ncmh.gov.in"
              className="
                w-full
                h-10
                rounded-xl
                border
                border-[#d9d6ce]
                bg-[#fffdfa]
                px-3
                text-sm
                outline-none
                focus:border-[#a5555a]
              "
            />

          </div>


          {/* ORGANIZATION */}

          <div>

            <label
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-1.5
              "
            >
              Organization / CPSE
            </label>


            <input
              type="text"
              value={organization}
              onChange={event =>
                setOrganization(
                  event.target.value
                )
              }
              placeholder="CPSE / organization"
              className="
                w-full
                h-10
                rounded-xl
                border
                border-[#d9d6ce]
                bg-[#fffdfa]
                px-3
                text-sm
                outline-none
                focus:border-[#a5555a]
              "
            />

          </div>


          {/* EMPLOYEE ID */}

          <div>

            <label
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-1.5
              "
            >
              Employee ID
            </label>


            <input
              type="text"
              value={employeeId}
              onChange={event =>
                setEmployeeId(
                  event.target.value
                )
              }
              placeholder="Employee ID"
              className="
                w-full
                h-10
                rounded-xl
                border
                border-[#d9d6ce]
                bg-[#fffdfa]
                px-3
                text-sm
                outline-none
                focus:border-[#a5555a]
              "
            />

          </div>


          {/* DESIGNATION */}

          <div>

            <label
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-1.5
              "
            >
              Designation
            </label>


            <input
              type="text"
              value={designation}
              onChange={event =>
                setDesignation(
                  event.target.value
                )
              }
              placeholder="Designation"
              className="
                w-full
                h-10
                rounded-xl
                border
                border-[#d9d6ce]
                bg-[#fffdfa]
                px-3
                text-sm
                outline-none
                focus:border-[#a5555a]
              "
            />

          </div>


          {/* PASSWORD */}

          <div>

            <label
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-1.5
              "
            >
              Password
            </label>


            <input
              type="password"
              value={signupPassword}
              onChange={event =>
                setSignupPassword(
                  event.target.value
                )
              }
              placeholder="Create a password"
              className="
                w-full
                h-10
                rounded-xl
                border
                border-[#d9d6ce]
                bg-[#fffdfa]
                px-3
                text-sm
                outline-none
                focus:border-[#a5555a]
              "
            />

          </div>


          {/* CONFIRM PASSWORD */}

          <div>

            <label
              className="
                block
                text-[11px]
                uppercase
                tracking-wider
                font-bold
                text-[#4a4e4a]
                mb-1.5
              "
            >
              Confirm password
            </label>


            <input
              type="password"
              value={confirmPassword}
              onChange={event =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm password"
              className="
                w-full
                h-10
                rounded-xl
                border
                border-[#d9d6ce]
                bg-[#fffdfa]
                px-3
                text-sm
                outline-none
                focus:border-[#a5555a]
              "
            />

          </div>


          {/* MESSAGE */}

          {signupMessage && (

            <div
              className="
                rounded-xl
                bg-[#f0ece4]
                border
                border-[#e4e0d8]
                px-3.5
                py-3
                text-xs
                text-[#5f625e]
              "
            >
              {signupMessage}
            </div>

          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="
              w-full
              h-11
              rounded-xl
              bg-[#4a7c59]
              hover:bg-[#416c4e]
              text-white
              text-sm
              font-bold
              transition-colors
            "
          >
            Create account
          </button>


          <button
            type="button"
            onClick={() => {

              setAuthView(
                'login'
              );

              setSignupMessage('');

            }}
            className="
              w-full
              text-xs
              font-bold
              text-[#a5555a]
              hover:text-[#8c464b]
            "
          >
            Back to sign in
          </button>

        </form>

      </div>

    );

  };


  /* =======================================================
     PAGE
     ======================================================= */

  return (

    <div
      className="
        min-h-screen
        w-full
        bg-[#f7f5f0]
        text-[#2e3230]
        flex
        items-center
        justify-center
        px-4
        py-10
        sm:px-6
      "
    >

      <div
        className="
          w-full
          max-w-[450px]
        "
      >

        {/* =================================================
           LOGIN
           ================================================= */}

        {authView === 'login' &&
          renderLogin()
        }


        {/* =================================================
           FORGOT PASSWORD
           ================================================= */}

        {authView === 'forgot' && (

          <>
            <div
              className="
                flex
                flex-col
                items-center
                text-center
                mb-8
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#f0ece4]
                  border
                  border-[#e4e0d8]
                  flex
                  items-center
                  justify-center
                  text-[#4a7c59]
                  mb-5
                "
              >

                <Building2
                  size={25}
                />

              </div>


              <h1
                className="
                  font-serif
                  text-3xl
                  sm:text-4xl
                  font-bold
                  tracking-tight
                "
              >
                National Material
                <br />
                Harmonization
              </h1>


              <p
                className="
                  mt-2
                  text-sm
                  text-[#6a6d68]
                "
              >
                CPSE Material Intelligence Portal
              </p>

            </div>


            {renderForgotPassword()}

          </>

        )}


        {/* =================================================
           SIGNUP
           ================================================= */}

        {authView === 'signup' && (

          <>
            <div
              className="
                flex
                flex-col
                items-center
                text-center
                mb-8
              "
            >

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#f0ece4]
                  border
                  border-[#e4e0d8]
                  flex
                  items-center
                  justify-center
                  text-[#4a7c59]
                  mb-5
                "
              >

                <Building2
                  size={25}
                />

              </div>


              <h1
                className="
                  font-serif
                  text-3xl
                  sm:text-4xl
                  font-bold
                  tracking-tight
                "
              >
                National Material
                <br />
                Harmonization
              </h1>


              <p
                className="
                  mt-2
                  text-sm
                  text-[#6a6d68]
                "
              >
                CPSE Material Intelligence Portal
              </p>

            </div>


            {renderSignup()}

          </>

        )}

      </div>

    </div>

  );
};


export default LoginScreen;