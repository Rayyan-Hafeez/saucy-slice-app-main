import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, User, Mail, Lock, MapPin, Phone, History, RotateCcw, LogOut, ShoppingBag, Clock } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: CustomerProfile,
});

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_details: string;
  total_price: number;
  status: string;
  order_ref: string;
};

function formatPrice(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function CustomerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchCustomerOrders();
    }
    setLoading(false);
  }

  async function fetchCustomerOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) {
      setOrders(data);
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    if (isLoginMode) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(error.message);
      } else if (data.session?.user) {
        setUser(data.session.user);
        fetchCustomerOrders();
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        alert("Account created successfully! You can now log in.");
        setIsLoginMode(true);
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
  };

  const handleReorder = (order: Order) => {
    const cartItems = [{
      id: order.id,
      name: order.order_details,
      price: order.total_price,
      quantity: 1
    }];
    localStorage.setItem("saucy_cart", JSON.stringify(cartItems));
    navigate({ to: "/checkout" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-muted-foreground font-medium">Loading account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <header className="w-full bg-[#FDFBF7] border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
            </Link>
            <span className="font-bold text-foreground text-lg">Pizza Saucy</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-background rounded-3xl shadow-xl overflow-hidden border border-border/50">
            <CardContent className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-black text-foreground">
                  {isLoginMode ? "Welcome Back!" : "Create Account"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isLoginMode ? "Log in to view your saved addresses and order history." : "Sign up to track orders and reorder with one click."}
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      required 
                      type="email" 
                      placeholder="name@example.com" 
                      className="h-12 pl-10 bg-secondary/20 border-border/60 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <Input 
                      required 
                      type="password" 
                      placeholder="••••••••" 
                      className="h-12 pl-10 bg-secondary/20 border-border/60 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {authError && (
                  <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
                    {authError}
                  </p>
                )}

                <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md">
                  {isLoginMode ? "Log In" : "Sign Up"}
                </Button>
              </form>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <header className="w-full bg-[#FDFBF7] border-b border-border/50 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Link>
          <div className="flex items-center gap-4">
            <span className="font-bold text-foreground text-lg">My Account</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl font-bold text-red-500 border-red-200 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-1.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        <Card className="border-border/60 shadow-sm bg-background rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0">
              <User className="w-10 h-10" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h1 className="text-2xl font-black text-foreground">{user.email}</h1>
              <p className="text-sm text-muted-foreground">Registered Customer • Pizza Saucy VIP Member</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Past Orders & Reordering
            </h2>
            <span className="text-xs font-bold bg-secondary px-3 py-1.5 rounded-full text-muted-foreground">
              {orders.length} Total Orders
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-background rounded-3xl border border-border/50 shadow-sm">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-bold text-foreground">No order history found</h3>
              <p className="text-sm text-muted-foreground mt-1">Your past orders will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <Card key={order.id} className="border-border/60 shadow-sm bg-background rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-lg text-primary">
                          #{order.order_ref || order.id.split('-')[0].toUpperCase()}
                        </span>
                        <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground whitespace-pre-wrap">{order.order_details}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatDateTime(order.created_at)} • <MapPin className="w-3.5 h-3.5 ml-1" /> {order.customer_address}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      <span className="text-lg font-black text-foreground">{formatPrice(order.total_price)}</span>
                      <Button 
                        onClick={() => handleReorder(order)} 
                        variant="outline" 
                        className="rounded-xl font-bold text-primary border-primary/30 hover:bg-primary/5"
                      >
                        <RotateCcw className="w-4 h-4 mr-1.5" /> Reorder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}