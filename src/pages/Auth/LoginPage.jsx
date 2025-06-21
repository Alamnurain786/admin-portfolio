import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TextInput from '../../components/UI/TextInput';
import Button from '../../components/UI/Button';
import Alert from '../../components/UI/Alert';
import PasswordInput from '../../components/UI/PasswordInput';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Pass the entire credentials object to the login function
      await login(credentials);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(
        err.message || 'Failed to login. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to manage your blog
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <TextInput
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
                className="rounded-t-md"
              />
            </div>
            <div>
              <PasswordInput
                id="password"
                name="password"
                // type="password"
                required
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
                className="rounded-b-md"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
              className="group relative"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
