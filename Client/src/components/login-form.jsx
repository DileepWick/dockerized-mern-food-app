import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../util/axiosInstance'; // Import centralized API instance
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle form submission
  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.status === 200) {
        // Assuming the token is returned as response.data.token
        const { token } = response.data;

        // Set token in cookies
        document.cookie = `token=${token}; path=/; SameSite=Strict; Secure`;

        // Redirect to the Home page
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        'flex w-screen justify-center h-screen items-center bg-gradient-to-b from-[#B9D1FF] to-white',
        className
      )}
      {...props}
    >
      <Card className='overflow-hidden p-0 border-2 poppins-regular'>
        <CardContent className='grid p-0 md:grid-cols-2'>
          {' '}
          <div className='m-10'>
            <div className='bg-[#D9E6FF] h-full w-full rounded-2xl'>
              <p className='relative top-0 left-0 p-5 text-[#1648A6] font-semibold'>
                SnapBite
              </p>
            </div>
          </div>
          <form className='px-20 py-19' onSubmit={handleLogin}>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col  text-left'>
                <h1 className='text-5xl font-bold'>LOGIN</h1>
                <p className='text-muted-foreground mt-5'>
                  &quot;Welcome back! Ready to pick up where you left off?&quot;
                </p>
              </div>

              <div className='grid gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='name@example.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='h-11'
                  />
                </div>
                <div className='grid gap-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='password'>Password</Label>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='px-0 font-normal'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className='h-11 pr-10'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <></> : <></>}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    id='remember'
                    className='h-4 w-4 rounded border-gray-300'
                  />
                  <Label htmlFor='remember' className='text-sm'>
                    Remember me
                  </Label>
                </div>
                <Button variant='link' className='px-0 font-normal'>
                  Forgot password?
                </Button>
              </div>

              {error && (
                <div className='rounded-md bg-destructive/15 p-3 text-sm text-destructive'>
                  {error}
                </div>
              )}

              <Button type='submit' className='w-full h-11' disabled={loading}>
                {loading ? <>Signing in...</> : 'Sign in'}
              </Button>

              <div className='text-center text-sm'>
                Don&apos;t have an account?{' '}
                <Button
                  variant='link'
                  className='px-0 font-normal text-red-600'
                >
                  Sign up
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
