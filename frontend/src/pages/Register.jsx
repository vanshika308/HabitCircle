import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../redux/slices/authSlice';
import { showToast } from '../redux/slices/uiSlice';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(showToast({ message: error, type: 'error' }));
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      dispatch(showToast({ message: 'Please fill in all fields', type: 'error' }));
      return;
    }

    if (password.length < 6) {
      dispatch(showToast({ message: 'Password must be at least 6 characters', type: 'error' }));
      return;
    }

    if (password !== confirmPassword) {
      dispatch(showToast({ message: 'Passwords do not match', type: 'error' }));
      return;
    }

    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 transition-colors duration-150">
      {/* Crisp Minimal Card Container */}
      <div className="w-full max-w-md p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 shadow-sm mb-4 font-black text-xl select-none leading-none">
            ⭕
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight font-sans">
            Create an account
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5 font-sans">
            Begin social habit tracking with accountability circles
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            icon={User}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            icon={UserPlus}
            className="mt-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 border-none rounded-xl"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-zinc-100 dark:border-zinc-800/80 pt-6">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-zinc-800 dark:text-zinc-300 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
