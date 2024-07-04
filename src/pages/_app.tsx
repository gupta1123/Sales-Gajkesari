import '../app/globals.css';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Sidebar from '../components/Sidebar';
import styles from './App.module.css';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store, loginUser, logoutUser, setToken, setRole } from '../store';
import React, { useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Card = ({ children }: { children: ReactNode }) => (
  <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">{children}</div>
);

const Input = ({ type, id, placeholder, value, onChange }: { type: string; id: string; placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <input
    type={type}
    id={id}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    autoComplete="off"
    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
  />
);

const Button = ({ children, className, onClick }: { children: ReactNode; className?: string; onClick: (e: React.MouseEvent<HTMLButtonElement>) => void }) => (
  <button
    className={`${className} w-full px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Typography = {
  Title: ({ level, children }: { level: number; children: ReactNode }) => <h2 className="text-3xl font-bold mb-6 text-black">{children}</h2>,
  Text: ({ className, children }: { className?: string; children: ReactNode }) => <p className={`${className} text-gray-600`}>{children}</p>,
};

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const authStatus = useSelector((state: any) => state.auth.status);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await dispatch(loginUser({ username, password }) as any).unwrap();
    } catch (error: any) {
      if (error.response && error.response.data) {
        const { message } = error.response.data;
        if (message.includes('password')) {
          setErrorMessage('Invalid password. Please try again.');
        } else if (message.includes('username')) {
          setErrorMessage('Invalid username. Please check your username and try again.');
        } else {
          setErrorMessage('Invalid username or password. Please try again.');
        }
      } else {
        setErrorMessage('Invalid username or password. Please try again.');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card>
        <div className="text-center">
          <Typography.Title level={2}>Gajkesari</Typography.Title>
          <img src="/GajkesariLogo.jpeg" alt="Gajkesari Logo" className="mx-auto mb-6" style={{ maxWidth: '200px' }} />
          {errorMessage && <p className="text-center mb-4 text-red-500">{errorMessage}</p>}

          <div className="mb-4">
            <Input
              type="text"
              id="username"
              placeholder="SalesAdmin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mb-6 relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                    clipRule="evenodd"
                  />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={(e) => handleLogin(e)}>
            Login
          </Button>
          {authStatus === 'loading' && <p className="text-center mt-4">Loading...</p>}
        </div>
      </Card>
    </div>
  );
};

type AppDispatch = typeof store.dispatch;
type AppPropsWithLayout = AppProps & {
  Component: NextPage & {
    getLayout?: (page: React.ReactElement) => React.ReactNode;
  };
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <Provider store={store}>
      <AuthWrapper>
        <div className={styles.appContainer}>
          <Sidebar />
          <main className={styles.mainContent}>{getLayout(<Component {...pageProps} />)}</main>
        </div>
      </AuthWrapper>
    </Provider>
  );
}

const AuthWrapper = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: any) => state.auth.token);
  const role = useSelector((state: any) => state.auth.role);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && !token) {
      dispatch(setToken(storedToken));
    }
    if (storedRole && !role) {
      dispatch(setRole(storedRole as 'Admin' | 'Manager'));
    }
  }, [dispatch, token, role]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        await axios.get('http://ec2-51-20-32-8.eu-north-1.compute.amazonaws.com:8081/user/info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error: any) {
        if (error.response && error.response.status === 401) {
          router.push('/login');
        }
      }
    };

    if (token) {
      checkTokenValidity();
      const interval = setInterval(checkTokenValidity, 60000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [dispatch, token, router]);

  if (!token) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

export default MyApp;
