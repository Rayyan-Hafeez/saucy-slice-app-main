import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChefHat, Bike, CheckCircle, Store, Archive, Lock, KeyRound, BarChart3, ListOrdered, CalendarDays, DollarSign, Activity, Trophy } from "lucide-react";

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
  const SECRET_PIN = "1234";

  // Dashboard Navigation State
  const [activeTab, setActiveTab] = useState<'queue' | 'analytics'>('queue');

  // Order & Audio State
  const [orders, setOrders] = useState<Order[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

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

  // Changed from Delete to Archive
  async function archiveOrder(id: string) {
    if (!confirm("Archive this order? It will clear from the queue but stay in your analytics.")) return;
    const { error } = await supabase.from('orders').update({ status: 'Archived' }).eq('id', id);
    if (error) alert("Failed to archive order.");
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
  // DATA CALCULATIONS
  // ----------------------------------------------------------------
  
  // Filter out archived orders for the Live Queue
  const activeOrders = orders.filter(o => o.status !== 'Archived');

  // Analytics Metrics
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const monthlyOrders = orders.filter(o => {
    const date = new Date(o.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total_price, 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
  const totalOrdersCount = orders.length;

  const pendingCount = activeOrders.filter(o => o.status === 'Pending').length;
  const preparingCount = activeOrders.filter(o => o.status === 'Preparing').length;
  const deliveringCount = activeOrders.filter(o => o.status === 'Out for Delivery').length;
  const deliveredCount = activeOrders.filter(o => o.status === 'Delivered').length;

  // Calculate the most selling product
  const bestSeller = (() => {
    const itemCounts: Record<string, number> = {};
    orders.forEach(order => {
      // Split the order details by comma (e.g., "2x Deal No. 1, 1x Zinger")
      const items = order.order_details.split(', ');
      items.forEach(itemStr => {
        const match = itemStr.match(/^(\d+)x\s+(.+)$/);
        if (match) {
          const qty = parseInt(match[1], 10);
          const name = match[2];
          itemCounts[name] = (itemCounts[name] || 0) + qty;
        } else {
          itemCounts[itemStr] = (itemCounts[itemStr] || 0) + 1;
        }
      });
    });
    
    let bestName = "N/A";
    let maxQty = 0;
    for (const [name, qty] of Object.entries(itemCounts)) {
      if (qty > maxQty) {
        maxQty = qty;
        bestName = name;
      }
    }
    return { name: bestName, qty: maxQty };
  })();

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
            <span className="hidden sm:inline text-lg font-bold tracking-tight">Pizza Saucy | Live Kitchen</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button 
                onClick={() => setActiveTab('queue')} 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'queue' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              >
                <ListOrdered className="w-4 h-4" /> Queue
              </button>
              <button 
                onClick={() => setActiveTab('analytics')} 
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              >
                <BarChart3 className="w-4 h-4" /> Analytics
              </button>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)} className="text-slate-300 hover:text-white">
              Lock
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        
        {/* =========================================
            TAB 1: LIVE ORDER QUEUE
            ========================================= */}
        {activeTab === 'queue' && (
          <>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Order Queue</h1>
                <p className="text-muted-foreground mt-1">Listening for new orders in real-time...</p>
              </div>
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {activeOrders.length} Active
              </div>
            </div>

            {activeOrders.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-xl border border-border/50">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-muted-foreground">Kitchen is quiet...</h2>
                <p className="text-sm text-muted-foreground">Waiting for new orders to arrive.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
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
                        
                        {/* New Archive Button */}
                        <Button onClick={() => archiveOrder(order.id)} variant="outline" className="col-span-2 text-slate-500 hover:text-slate-600 hover:bg-slate-100 mt-2 border-slate-200">
                          <Archive className="mr-2 h-4 w-4" /> Archive Record
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* =========================================
            TAB 2: ANALYTICS DASHBOARD
            ========================================= */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Revenue Analytics</h1>
              <p className="text-muted-foreground mt-1">Real-time performance and historical metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <Card className="border-border/60 shadow-sm bg-background">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Revenue ({monthName})</p>
                      <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{formatPrice(monthlyRevenue)}</h3>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                    <Activity className="h-3 w-3 text-green-500" /> Automatically updating
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm bg-background">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Lifetime Revenue</p>
                      <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{formatPrice(totalRevenue)}</h3>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-xl shrink-0">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm bg-background">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Top Selling Item</p>
                      <h3 className="text-xl font-bold text-foreground truncate pr-2" title={bestSeller.name}>
                        {bestSeller.name}
                      </h3>
                      <p className="text-sm font-bold text-primary mt-1">{bestSeller.qty} units sold</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl shrink-0">
                      <Trophy className="h-6 w-6 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm bg-background">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                      <h3 className="text-2xl lg:text-3xl font-bold text-foreground">{totalOrdersCount}</h3>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl shrink-0">
                      <ListOrdered className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
            </div>

            <h2 className="text-xl font-bold text-foreground mt-8 mb-4">Current Workflow Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
                <span className="block text-3xl font-bold text-orange-600">{pendingCount}</span>
                <span className="text-sm font-medium text-orange-800">Pending</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center">
                <span className="block text-3xl font-bold text-blue-600">{preparingCount}</span>
                <span className="text-sm font-medium text-blue-800">Preparing</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-center">
                <span className="block text-3xl font-bold text-purple-600">{deliveringCount}</span>
                <span className="text-sm font-medium text-purple-800">Out for Delivery</span>
              </div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center">
                <span className="block text-3xl font-bold text-green-600">{deliveredCount}</span>
                <span className="text-sm font-medium text-green-800">Delivered</span>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}