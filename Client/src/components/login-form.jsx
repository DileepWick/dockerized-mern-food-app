import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../util/axiosInstance"; // Import centralized API instance
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const response = await api.post("/api/auth/login", { email, password });


      if (response.status === 200) {
        // Assuming the token is returned as response.data.token
        const { token } = response.data;

        // Set token in cookies
       // document.cookie = `token=${token}; path=/; SameSite=Strict; Secure`; 

        // Redirect to the Home page
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-2">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-8 md:p-12" onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground text-balance mt-2">
                  Login to your account to continue
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                 
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                 
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-0 font-normal"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <></>
                      ) : (
                        <></>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Button variant="link" className="px-0 font-normal">
                  Forgot password?
                </Button>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Button variant="link" className="px-0 font-normal">
                  Sign up
                </Button>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/20 z-10" />
            <img
              src="https://res.cloudinary.com/dhcawltsr/image/upload/v1727609137/Games%20cover%20images/r8q7om4xv1dyz5o7qzuh.jpg"
              alt="Login background"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center justify-center p-8">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">Welcome to Our Platform</h2>
                <p className="text-white/80">
                  Experience seamless transactions and secure banking with our modern platform
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By continuing, you agree to our{" "}
        <Button variant="link" className="px-0 font-normal">
          Terms of Service
        </Button>{" "}
        and{" "}
        <Button variant="link" className="px-0 font-normal">
          Privacy Policy
        </Button>
        .
      </div>
    </div>
  );
}