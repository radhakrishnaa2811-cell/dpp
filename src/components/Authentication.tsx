import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, UserPlus, Eye, EyeOff } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  // role: 'parent' | 'teacher'; // Removed role field
  createdAt: string;
  hasSeenTutorial: boolean;
}

interface AuthenticationProps {
  onAuthSuccess: (user: User) => void;
}

export const Authentication: React.FC<AuthenticationProps> = ({ onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
    // role: 'parent' as 'parent' | 'teacher' // Removed role from formData
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (isSignup: boolean) => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignup && !formData.name) {
      newErrors.name = 'Name is required';
    }
    // No role validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm(false)) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('phonics-users') || '[]');
      const user = users.find((u: User) => u.email === formData.email);
      
      if (user) {
        localStorage.setItem('phonics-current-user', JSON.stringify(user));
        onAuthSuccess(user);
      } else {
        setErrors({ email: 'Account not found. Please sign up first.' });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = async () => {
    if (!validateForm(true)) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('phonics-users') || '[]');
      const existingUser = users.find((u: User) => u.email === formData.email);
      
      if (existingUser) {
        setErrors({ email: 'An account with this email already exists' });
        setIsLoading(false);
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.name,
        // role: formData.role, // Removed role
        createdAt: new Date().toISOString(),
        hasSeenTutorial: false
      };

      users.push(newUser);
      localStorage.setItem('phonics-users', JSON.stringify(users));
      localStorage.setItem('phonics-current-user', JSON.stringify(newUser));
      
      onAuthSuccess(newUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-300 via-pink-300 to-blue-300 p-4">
      <div className="w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <div className="text-9xl mb-4 animate-float">🦉</div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            Welcome to Phonics Fun!
          </h1>
          <p className="text-white/90 text-lg drop-shadow">
            Where learning to read becomes an adventure! 📚✨
          </p>
        </div>

        <Card className="p-8 bg-white/95 backdrop-blur border-4 border-white rounded-3xl shadow-2xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-purple-100 p-1 rounded-2xl">
              <TabsTrigger 
                value="login" 
                className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <User className="w-4 h-4 mr-2" />
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="rounded-xl data-[state=active]:bg-purple-500 data-[state=active]:text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800">Welcome Back!</h2>
                <p className="text-purple-600">Ready to continue the learning adventure?</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-purple-800">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1 border-2 border-purple-200 rounded-xl h-12"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-purple-800">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className="mt-1 border-2 border-purple-200 rounded-xl h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 bg-purple-500 hover:bg-purple-600 rounded-xl text-lg font-semibold"
                >
                  {isLoading ? 'Logging in...' : 'Start Learning! 🚀'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 mt-2 rounded-xl text-lg font-semibold border-gray-400 text-gray-700 hover:bg-gray-200"
                  onClick={() => {
                    const guestUser = {
                      id: 'guest',
                      email: '',
                      name: 'Guest',
                      createdAt: new Date().toISOString(),
                      hasSeenTutorial: true
                    };
                    onAuthSuccess(guestUser);
                  }}
                >
                  Skip Sign In
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-purple-800">Join the Adventure!</h2>
                <p className="text-purple-600">Create your account to start learning</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="signup-name" className="text-purple-800">Your Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your name"
                    className="mt-1 border-2 border-purple-200 rounded-xl h-12"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="signup-email" className="text-purple-800">Email Address</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="mt-1 border-2 border-purple-200 rounded-xl h-12"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-purple-800">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a password (6+ characters)"
                      className="mt-1 border-2 border-purple-200 rounded-xl h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  {/* Role selection removed */}
                </div>

                <Button 
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="w-full h-12 bg-purple-500 hover:bg-purple-600 rounded-xl text-lg font-semibold"
                >
                  {isLoading ? 'Creating Account...' : 'Start Adventure! 🌟'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 mt-2 rounded-xl text-lg font-semibold border-gray-400 text-gray-700 hover:bg-gray-200"
                  onClick={() => {
                    const guestUser = {
                      id: 'guest',
                      email: '',
                      name: 'Guest',
                      createdAt: new Date().toISOString(),
                      hasSeenTutorial: true
                    };
                    onAuthSuccess(guestUser);
                  }}
                >
                  Skip Sign In
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center mt-6 text-sm text-gray-600">
            <p>🔒 Your data is safely stored locally on your device</p>
          </div>
        </Card>
      </div>
    </div>
  );
};