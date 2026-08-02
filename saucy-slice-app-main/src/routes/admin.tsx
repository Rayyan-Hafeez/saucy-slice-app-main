import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Bike, CheckCircle, Store, Trash2, ChevronLeft, Lock, KeyRound } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
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
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

function AdminDashboard() {
  // Security State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const SECRET_PIN = "1234"; // 🔒 Change this to whatever PIN you want!

  // Order & Audio State
  const [orders, setOrders] = useState<Order[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Setup the audio sound
  useEffect(() => {
    // This is a classic "Restaurant Service Bell" sound
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  // Database Connection (Only runs AFTER they log in)
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchOrders();

    const channel = supabase
      .channel('live-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log("Database changed!", payload);
          fetchOrders(); 
          
          // 🔔 Play the "Ding!" ONLY if a brand new order was just inserted
          if (payload.eventType === 'INSERT' && audioRef.current) {
            audioRef.current.play().catch(err => console.log("Audio blocked:", err));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    if (error) console.error("Error fetching orders:", error);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (error) alert("Failed to update status.");
  }

  async function deleteOrder(id: string) {
    if (!confirm("Are you sure you want to delete this order?")) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) alert("Failed to delete order.");
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SECRET_PIN) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect PIN. Access Denied.");
      setPin("");
    }
  };

  // ----------------------------------------------------------------
  // VIEW 1: THE LOCK SCREEN
  // ----------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-border/10 bg-slate-800 text-slate-100 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-2">
                <Lock className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Manager Portal</h1>
                <p className="text-slate-400 mt-2 text-sm">Enter the kitchen PIN to access live orders.</p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-4">
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-center text-xl tracking-[0.5em] text-white"
                    required
                    autoFocus
                  />
                </div>
                <Button type="submit" size="lg" className="w-full text-lg font-bold rounded-xl h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Unlock Dashboard
                </Button>
              </form>
              <Link to="/" className="text-sm text-slate-500 hover:text-white transition-colors">
                Return to Storefront
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // VIEW 2: THE SECURE LIVE DASHBOARD
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-secondary/20 pb-10">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">Pizza Saucy | Live Kitchen POS</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              SYSTEM LIVE
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)} className="text-slate-300 hover:text-white">
              Lock
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order Queue</h1>
            <p className="text-muted-foreground mt-1">Listening for new orders in real-time...</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold">
            {orders.length} Total Orders
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-xl border border-border/50">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-muted-foreground">Kitchen is quiet...</h2>
            <p className="text-sm text-muted-foreground">Waiting for new orders to arrive.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-border/60 shadow-sm overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
                
                <div className={`p-4 border-b flex justify-between items-center text-white
                  ${order.status === 'Pending' ? 'bg-orange-500' : ''}
                  ${order.status === 'Preparing' ? 'bg-blue-500' : ''}
                  ${order.status === 'Out for Delivery' ? 'bg-purple-500' : ''}
                  ${order.status === 'Delivered' ? 'bg-green-500' : ''}
                `}>
                  <span className="font-bold text-sm tracking-wider">
                    {order.order_ref ? `#${order.order_ref}` : `#${order.id.split('-')[0].toUpperCase()}`}
                  </span>
                  <span className="font-bold bg-white/20 px-2 py-1 rounded text-xs backdrop-blur-sm">
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col bg-background">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-foreground">{order.customer_name}</h3>
                    <p className="text-sm font-medium text-primary">{order.customer_phone}</p>
                    <p className="text-sm text-muted-foreground mt-1 bg-secondary/50 p-2 rounded-md">
                      {order.customer_address}
                    </p>
                  </div>

                  <div className="mb-6 flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Items:</p>
                    <p className="font-medium text-foreground">{order.order_details}</p>
                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total to Collect:</span>
                      <span className="text-lg font-bold text-foreground">{formatPrice(order.total_price)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-auto">
                    {order.status === 'Pending' && (
                      <Button onClick={() => updateStatus(order.id, 'Preparing')} className="col-span-2 bg-blue-500 hover:bg-blue-600">
                        <ChefHat className="mr-2 h-4 w-4" /> Start Preparing
                      </Button>
                    )}
                    {order.status === 'Preparing' && (
                      <Button onClick={() => updateStatus(order.id, 'Out for Delivery')} className="col-span-2 bg-purple-500 hover:bg-purple-600">
                        <Bike className="mr-2 h-4 w-4" /> Send to Delivery
                      </Button>
                    )}
                    {order.status === 'Out for Delivery' && (
                      <Button onClick={() => updateStatus(order.id, 'Delivered')} className="col-span-2 bg-green-500 hover:bg-green-600">
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Delivered
                      </Button>
                    )}
                    
                    <Button onClick={() => deleteOrder(order.id)} variant="outline" className="col-span-2 text-red-500 hover:text-red-600 hover:bg-red-50 mt-2 border-red-200">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}