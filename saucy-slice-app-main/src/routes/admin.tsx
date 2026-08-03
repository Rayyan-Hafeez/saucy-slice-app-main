import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChefHat, Bike, CheckCircle, Store, Archive, Lock, KeyRound, BarChart3, ListOrdered, CalendarDays, DollarSign, Activity, Trophy, RotateCcw, Clock, Printer, Star, MessageCircle, Tag, Trash2, PlusCircle } from "lucide-react";

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
  rating: number | null;
};

type PromoCode = {
  id: string;
  code: string;
  type: string;
  value: number;
};

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
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

function formatGroupDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const SECRET_PIN = "1234";

  const [activeTab, setActiveTab] = useState<'queue' | 'archive' | 'analytics' | 'promos'>('queue');
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  
  const [newPromoCode, setNewPromoCode] = useState("");
  const [newPromoType, setNewPromoType] = useState("percentage");
  const [newPromoValue, setNewPromoValue] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
    fetchPromos();

    const channel = supabase
      .channel('live-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
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

  async function fetchPromos() {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPromos(data);
    if (error) console.error("Error fetching promos:", error);
  }

  async function handleAddPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!newPromoCode || !newPromoValue) return;

    const { error } = await supabase.from('promo_codes').insert({
      code: newPromoCode.trim().toUpperCase(),
      type: newPromoType,
      value: parseInt(newPromoValue, 10)
    });

    if (error) {
      alert("Failed to add promo code.");
    } else {
      setNewPromoCode("");
      setNewPromoValue("");
      fetchPromos();
    }
  }

  async function handleDeletePromo(id: string) {
    if (!confirm("Are you sure you want to delete this promo code?")) return;
    const { error } = await supabase.from('promo_codes').delete().eq('id', id);
    if (!error) fetchPromos();
  }

  // INSTANT LOCAL STATE UPDATE FOR STATUS
  async function updateStatus(id: string, newStatus: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (error) {
      alert("Failed to update status.");
      fetchOrders();
    }
  }

  // INSTANT LOCAL STATE UPDATE FOR ARCHIVE
  async function archiveOrder(id: string) {
    if (!confirm("Archive this order? It will move to the Archive section.")) return;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Archived' } : o));

    const { error } = await supabase.from('orders').update({ status: 'Archived' }).eq('id', id);
    if (error) {
      alert("Failed to archive order.");
      fetchOrders();
    }
  }

  // INSTANT LOCAL STATE UPDATE FOR RESTORE
  async function restoreOrder(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Delivered' } : o));

    const { error } = await supabase.from('orders').update({ status: 'Delivered' }).eq('id', id);
    if (error) {
      alert("Failed to restore order.");
      fetchOrders();
    }
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

  const printReceipt = (order: Order) => {
    const orderNumber = order.order_ref || order.id.split('-')[0].toUpperCase();
    
    const htmlContent = `
      <html>
        <head>
          <title>Receipt #${orderNumber}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              padding: 20px; 
              width: 300px; 
              margin: 0 auto; 
              color: #000; 
              background: #fff;
            }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .title { font-size: 26px; font-weight: bold; margin: 0; text-transform: uppercase; }
            .subtitle { font-size: 14px; margin: 5px 0; }
            .order-num { font-size: 18px; font-weight: bold; margin: 10px 0 0 0; }
            .details { margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .details p { margin: 4px 0; font-size: 14px; }
            .items { margin-bottom: 15px; border-bottom: 2px dashed #000; padding-bottom: 15px; }
            .item-title { font-size: 14px; font-weight: bold; margin-bottom: 5px; }
            .item-list { font-size: 14px; margin: 0; white-space: pre-wrap; line-height: 1.4; }
            .total-section { text-align: right; margin-bottom: 20px; }
            .total { font-size: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
            .footer p { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">PIZZA SAUCY</h1>
            <p class="subtitle">Hot, Fresh & Saucy</p>
            <p class="order-num">ORDER #${orderNumber}</p>
          </div>
          <div class="details">
            <p><strong>Date:</strong> ${formatDateTime(order.created_at)}</p>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>Address:</strong><br/>${order.customer_address}</p>
          </div>
          <div class="items">
            <div class="item-title">ORDER ITEMS:</div>
            <div class="item-list">${order.order_details}</div>
          </div>
          <div class="total-section">
            <div class="total">TOTAL: ${formatPrice(order.total_price)}</div>
          </div>
          <div class="footer">
            <p>Thank you for choosing Pizza Saucy!</p>
          </div>
        </body>
      </html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    }
  };

  const getWhatsAppLink = (order: Order) => {
    let phone = order.customer_phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '92' + phone.substring(1);
    }
    const orderNum = order.order_ref || order.id.split('-')[0].toUpperCase();
    const message = encodeURIComponent(`Hi ${order.customer_name}, this is Pizza Saucy! 🍕 We are reaching out regarding your Order #${orderNum}.`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  const activeOrders = orders.filter(o => o.status !== 'Archived');
  const archivedOrders = orders.filter(o => o.status === 'Archived');

  const groupedArchivedOrders = archivedOrders.reduce((acc, order) => {
    const dateKey = formatGroupDate(order.created_at);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

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

  const ratedOrders = orders.filter(o => o.rating !== null && o.rating > 0);
  const totalRatingsCount = ratedOrders.length;
  const averageRating = totalRatingsCount > 0 
    ? (ratedOrders.reduce((sum, order) => sum + order.rating!, 0) / totalRatingsCount).toFixed(1)
    : "N/A";

  const bestSeller = (() => {
    const itemCounts: Record<string, number> = {};
    orders.forEach(order => {
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

  return (
    <div className="min-h-screen bg-secondary/20 pb-10">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline text-lg font-bold tracking-tight">Pizza Saucy | Live Kitchen</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              <button 
                onClick={() => setActiveTab('queue')} 
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'queue' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              >
                <ListOrdered className="w-4 h-4" /> Queue
              </button>
              <button 
                onClick={() => setActiveTab('archive')} 
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'archive' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              >
                <Archive className="w-4 h-4" /> Archive
              </button>
              <button 
                onClick={() => setActiveTab('analytics')} 
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              >
                <BarChart3 className="w-4 h-4" /> Analytics
              </button>
              <button 
                onClick={() => setActiveTab('promos')} 
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === 'promos' ? 'bg-primary text-primary-foreground' : 'text-slate-400 hover:text-white'}`}
              >
                <Tag className="w-4 h-4" /> Promos
              </button>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)} className="text-slate-300 hover:text-white text-xs sm:text-sm">
              Lock
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        {activeTab === 'queue' && (
          <div className="animate-in fade-in duration-300">
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
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-foreground">{order.customer_name}</h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                            <Clock className="w-3 h-3" /> {formatDateTime(order.created_at)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-primary mt-1">{order.customer_phone}</p>
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
                          <Button onClick={() => updateStatus(order.id, 'Preparing')} className="col-span-2 bg-blue-500 hover:bg-blue-600 font-bold">
                            <ChefHat className="mr-2 h-4 w-4" /> Start Preparing
                          </Button>
                        )}
                        {order.status === 'Preparing' && (
                          <Button onClick={() => updateStatus(order.id, 'Out for Delivery')} className="col-span-2 bg-purple-500 hover:bg-purple-600 font-bold">
                            <Bike className="mr-2 h-4 w-4" /> Send to Delivery
                          </Button>
                        )}
                        {order.status === 'Out for Delivery' && (
                          <Button onClick={() => updateStatus(order.id, 'Delivered')} className="col-span-2 bg-green-500 hover:bg-green-600 font-bold">
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark Delivered
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          className="col-span-2 bg-[#25D366]/10 text-[#25D366] border-[#25D366]/50 hover:bg-[#25D366]/20 transition-colors p-0 overflow-hidden font-bold"
                        >
                          <a 
                            href={getWhatsAppLink(order)} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full h-full flex items-center justify-center px-4 py-2"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp Customer
                          </a>
                        </Button>

                        <Button onClick={() => printReceipt(order)} variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-100">
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                        <Button onClick={() => archiveOrder(order.id)} variant="outline" className="w-full text-slate-500 hover:text-slate-600 hover:bg-slate-100 border-slate-200">
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Archived Orders</h1>
                <p className="text-muted-foreground mt-1">Past completed orders automatically grouped by calendar date.</p>
              </div>
              <div className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg font-bold">
                {archivedOrders.length} Total Archived
              </div>
            </div>

            {archivedOrders.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-xl border border-border/50">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-muted-foreground">No archived orders yet.</h2>
                <p className="text-sm text-muted-foreground">Orders you archive from the queue will appear here.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedArchivedOrders).map(([dateLabel, dateOrders]) => (
                  <div key={dateLabel} className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/60 pb-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold text-foreground">{dateLabel}</h2>
                      <span className="text-xs font-semibold bg-secondary px-2.5 py-1 rounded-full text-muted-foreground">
                        {dateOrders.length} {dateOrders.length === 1 ? 'order' : 'orders'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dateOrders.map((order) => (
                        <Card key={order.id} className="border-border/60 shadow-sm overflow-hidden flex flex-col bg-background/60">
                          <div className="p-4 border-b bg-slate-700 text-white flex justify-between items-center">
                            <span className="font-bold text-sm tracking-wider">
                              {order.order_ref ? `#${order.order_ref}` : `#${order.id.split('-')[0].toUpperCase()}`}
                            </span>
                            <span className="font-bold bg-white/20 px-2 py-1 rounded text-xs backdrop-blur-sm">
                              ARCHIVED
                            </span>
                          </div>

                          <CardContent className="p-5 flex-1 flex flex-col">
                            <div className="mb-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg text-foreground">{order.customer_name}</h3>
                                <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary px-2 py-1 rounded-md">
                                  <Clock className="w-3 h-3" /> {formatDateTime(order.created_at)}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-primary mt-1">{order.customer_phone}</p>
                              <p className="text-sm text-muted-foreground mt-1 bg-secondary/50 p-2 rounded-md">
                                {order.customer_address}
                              </p>
                            </div>

                            <div className="mb-6 flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">Items:</p>
                              <p className="font-medium text-foreground">{order.order_details}</p>
                              <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Total Collected:</span>
                                <span className="text-lg font-bold text-foreground">{formatPrice(order.total_price)}</span>
                              </div>

                              {order.rating && (
                                <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Customer Rating:</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star} 
                                        className={`w-4 h-4 ${star <= order.rating! ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} 
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                              <Button onClick={() => printReceipt(order)} variant="outline" className="w-full text-slate-700 border-slate-300 hover:bg-slate-100">
                                <Printer className="mr-2 h-4 w-4" /> Print
                              </Button>
                              <Button onClick={() => restoreOrder(order.id)} variant="outline" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                                <RotateCcw className="mr-2 h-4 w-4" /> Restore
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Revenue Analytics</h1>
              <p className="text-muted-foreground mt-1">Real-time performance and historical metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <Card className="border-border/60 shadow-sm bg-background">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Store Rating</p>
                      <h3 className="text-2xl lg:text-3xl font-bold text-foreground">
                        {averageRating} <span className="text-base text-muted-foreground font-normal">/ 5.0</span>
                      </h3>
                      <p className="text-sm font-bold text-amber-500 mt-1">{totalRatingsCount} reviews</p>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl shrink-0">
                      <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

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

        {activeTab === 'promos' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Promo Codes</h1>
              <p className="text-muted-foreground mt-1">Create and manage discounts for your customers.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-1 shadow-sm border-border/60 bg-background">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4 text-foreground">
                    <PlusCircle className="text-primary w-5 h-5"/> Create Promo
                  </h3>
                  <form onSubmit={handleAddPromo} className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-foreground">Code Name</label>
                      <Input 
                        placeholder="e.g. FREEDRINK" 
                        value={newPromoCode} 
                        onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())} 
                        className="mt-1 uppercase bg-background" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground">Discount Type</label>
                      <select 
                        className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm text-foreground"
                        value={newPromoType} 
                        onChange={(e) => setNewPromoType(e.target.value)}
                      >
                        <option value="percentage">Percentage Off (%)</option>
                        <option value="fixed">Fixed Cash Off (Rs.)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground">Value</label>
                      <Input 
                        type="number" 
                        placeholder={newPromoType === 'percentage' ? "e.g. 10" : "e.g. 200"} 
                        value={newPromoValue} 
                        onChange={(e) => setNewPromoValue(e.target.value)} 
                        className="mt-1 bg-background" 
                        required 
                        min="1" 
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                      Add Promo Code
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {promos.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-background border rounded-xl">
                    <Tag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3"/>
                    <p className="font-medium text-muted-foreground">No promo codes active.</p>
                  </div>
                ) : (
                  promos.map((promo) => (
                    <Card key={promo.id} className="border-border/60 shadow-sm bg-background">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-xl text-primary uppercase tracking-wider">{promo.code}</h4>
                          <p className="text-sm font-medium text-muted-foreground mt-1">
                            {promo.type === 'percentage' ? `${promo.value}% OFF Order` : `Rs. ${promo.value} OFF Order`}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeletePromo(promo.id)} 
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}