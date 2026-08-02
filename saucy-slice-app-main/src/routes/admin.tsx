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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
}

function formatGroupDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const SECRET_PIN = "1234";

  const [activeTab, setActiveTab] = useState<'queue' | 'archive' | 'analytics' | 'promos'>('queue');
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  
  // New Promo State
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders(); 
        if (payload.eventType === 'INSERT' && audioRef.current) audioRef.current.play().catch(e => console.log(e));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
  }

  async function fetchPromos() {
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    if (data) setPromos(data);
  }

  async function handleAddPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!newPromoCode || !newPromoValue) return;

    const { error } = await supabase.from('promo_codes').insert({
      code: newPromoCode.trim().toUpperCase(),
      type: newPromoType,
      value: parseInt(newPromoValue)
    });

    if (error) {
      alert("Failed to add promo.");
    } else {
      setNewPromoCode("");
      setNewPromoValue("");
      fetchPromos();
    }
  }

  async function handleDeletePromo(id: string) {
    await supabase.from('promo_codes').delete().eq('id', id);
    fetchPromos();
  }

  async function updateStatus(id: string, newStatus: string) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  }
  async function archiveOrder(id: string) {
    if (!confirm("Archive this order?")) return;
    await supabase.from('orders').update({ status: 'Archived' }).eq('id', id);
  }
  async function restoreOrder(id: string) {
    await supabase.from('orders').update({ status: 'Delivered' }).eq('id', id);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === SECRET_PIN) setIsAuthenticated(true);
    else { alert("Incorrect PIN."); setPin(""); }
  };

  const getWhatsAppLink = (order: Order) => {
    let phone = order.customer_phone.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '92' + phone.substring(1);
    const orderNum = order.order_ref || order.id.split('-')[0].toUpperCase();
    const message = encodeURIComponent(`Hi ${order.customer_name}, this is Pizza Saucy! 🍕 We are reaching out regarding your Order #${orderNum}.`);
    return `https://wa.me/${phone}?text=${message}`;
  };

  const printReceipt = (order: Order) => {
    const orderNumber = order.order_ref || order.id.split('-')[0].toUpperCase();
    const htmlContent = `<html><head><style>@page{margin:0;}body{font-family:'Courier New',Courier,monospace;padding:20px;width:300px;margin:0 auto;}.header{text-align:center;border-bottom:2px dashed #000;padding-bottom:15px;}.title{font-size:26px;font-weight:bold;margin:0;text-transform:uppercase;}.subtitle{font-size:14px;margin:5px 0;}.order-num{font-size:18px;font-weight:bold;margin:10px 0 0 0;}.details{margin-bottom:15px;border-bottom:2px dashed #000;padding-bottom:15px;}.details p{margin:4px 0;font-size:14px;}.items{margin-bottom:15px;border-bottom:2px dashed #000;padding-bottom:15px;}.item-title{font-size:14px;font-weight:bold;margin-bottom:5px;}.item-list{font-size:14px;margin:0;white-space:pre-wrap;line-height:1.4;}.total-section{text-align:right;margin-bottom:20px;}.total{font-size:20px;font-weight:bold;}.footer{text-align:center;margin-top:20px;font-size:12px;}.footer p{margin:4px 0;}</style></head><body><div class="header"><h1 class="title">PIZZA SAUCY</h1><p class="subtitle">Hot, Fresh & Saucy</p><p class="order-num">ORDER #${orderNumber}</p></div><div class="details"><p><strong>Date:</strong> ${formatDateTime(order.created_at)}</p><p><strong>Name:</strong> ${order.customer_name}</p><p><strong>Phone:</strong> ${order.customer_phone}</p><p><strong>Address:</strong><br/>${order.customer_address}</p></div><div class="items"><div class="item-title">ORDER ITEMS:</div><div class="item-list">${order.order_details}</div></div><div class="total-section"><div class="total">TOTAL: ${formatPrice(order.total_price)}</div></div><div class="footer"><p>Thank you for choosing Pizza Saucy!</p></div></body></html>`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open(); iframeDoc.write(htmlContent); iframeDoc.close();
      setTimeout(() => { iframe.contentWindow?.focus(); iframe.contentWindow?.print(); setTimeout(() => { document.body.removeChild(iframe); }, 1000); }, 250);
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'Archived');
  const archivedOrders = orders.filter(o => o.status === 'Archived');
  
  const groupedArchivedOrders = archivedOrders.reduce((acc, order) => { const dateKey = formatGroupDate(order.created_at); if (!acc[dateKey]) acc[dateKey] = []; acc[dateKey].push(order); return acc; }, {} as Record<string, Order[]>);
  const now = new Date(); const currentMonth = now.getMonth(); const currentYear = now.getFullYear(); const monthName = now.toLocaleString('default', { month: 'long' });
  const monthlyOrders = orders.filter(o => { const date = new Date(o.created_at); return date.getMonth() === currentMonth && date.getFullYear() === currentYear; });
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
      if (qty > maxQty) { maxQty = qty; bestName = name; }
    }
    return { name: bestName, qty: maxQty };
  })();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800 text-slate-100 shadow-2xl border-none">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-2"><Lock className="h-8 w-8" /></div>
            <div><h1 className="text-2xl font-bold">Manager Portal</h1><p className="text-slate-400 mt-2 text-sm">Enter the kitchen PIN.</p></div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-center text-xl tracking-[0.5em] text-white outline-none" required autoFocus />
              </div>
              <Button type="submit" size="lg" className="w-full text-lg font-bold rounded-xl h-12 bg-primary">Unlock</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pb-10">
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2"><Store className="h-5 w-5 text-primary" /><span className="hidden sm:inline font-bold">Live Kitchen</span></div>
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 shrink-0">
              <button onClick={() => setActiveTab('queue')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === 'queue' ? 'bg-primary text-white' : 'text-slate-400'}`}><ListOrdered className="w-4 h-4" /> Queue</button>
              <button onClick={() => setActiveTab('archive')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === 'archive' ? 'bg-primary text-white' : 'text-slate-400'}`}><Archive className="w-4 h-4" /> Archive</button>
              <button onClick={() => setActiveTab('analytics')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-primary text-white' : 'text-slate-400'}`}><BarChart3 className="w-4 h-4" /> Analytics</button>
              <button onClick={() => setActiveTab('promos')} className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 ${activeTab === 'promos' ? 'bg-primary text-white' : 'text-slate-400'}`}><Tag className="w-4 h-4" /> Promos</button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsAuthenticated(false)} className="text-slate-400 hover:text-white shrink-0">Lock</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        
        {activeTab === 'queue' && (
          <div className="animate-in fade-in">
            <div className="flex justify-between items-end mb-6">
              <div><h1 className="text-3xl font-bold">Order Queue</h1></div>
              <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2">{activeOrders.length} Active</div>
            </div>
            {activeOrders.length === 0 ? (
               <div className="text-center py-20 bg-background rounded-xl border"><h2 className="text-xl font-semibold text-muted-foreground">Kitchen is quiet...</h2></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeOrders.map((order) => (
                  <Card key={order.id} className="border-border/60 shadow-sm overflow-hidden flex flex-col">
                    <div className={`p-4 border-b flex justify-between items-center text-white ${order.status === 'Pending' ? 'bg-orange-500' : ''} ${order.status === 'Preparing' ? 'bg-blue-500' : ''} ${order.status === 'Out for Delivery' ? 'bg-purple-500' : ''} ${order.status === 'Delivered' ? 'bg-green-500' : ''}`}>
                      <span className="font-bold">#{order.order_ref}</span>
                      <span className="font-bold bg-white/20 px-2 py-1 rounded text-xs">{order.status.toUpperCase()}</span>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col bg-background">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg">{order.customer_name}</h3>
                        <p className="text-sm font-medium text-primary mt-1">{order.customer_phone}</p>
                        <p className="text-sm text-muted-foreground mt-1 bg-secondary/50 p-2 rounded-md">{order.customer_address}</p>
                      </div>
                      <div className="mb-6 flex-1">
                        <p className="font-medium whitespace-pre-wrap">{order.order_details}</p>
                        <div className="mt-3 pt-3 border-t flex justify-between font-bold"><span>Total:</span><span>{formatPrice(order.total_price)}</span></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        {order.status === 'Pending' && <Button onClick={() => updateStatus(order.id, 'Preparing')} className="col-span-2 bg-blue-500"><ChefHat className="mr-2 w-4 h-4" /> Start</Button>}
                        {order.status === 'Preparing' && <Button onClick={() => updateStatus(order.id, 'Out for Delivery')} className="col-span-2 bg-purple-500"><Bike className="mr-2 w-4 h-4" /> Send</Button>}
                        {order.status === 'Out for Delivery' && <Button onClick={() => updateStatus(order.id, 'Delivered')} className="col-span-2 bg-green-500"><CheckCircle className="mr-2 w-4 h-4" /> Done</Button>}
                        <Button variant="outline" className="col-span-2 p-0 overflow-hidden text-[#25D366] border-[#25D366]/50 hover:bg-[#25D366]/10">
                          <a href={getWhatsAppLink(order)} target="_blank" rel="noreferrer" className="w-full h-full flex items-center justify-center"><MessageCircle className="mr-2 w-4 h-4" /> WhatsApp</a>
                        </Button>
                        <Button onClick={() => printReceipt(order)} variant="outline"><Printer className="mr-2 w-4 h-4" /> Print</Button>
                        <Button onClick={() => archiveOrder(order.id)} variant="outline"><Archive className="mr-2 w-4 h-4" /> Archive</Button>
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
              <div><h1 className="text-3xl font-bold">Archived Orders</h1><p className="text-muted-foreground mt-1">Past completed orders grouped by date.</p></div>
              <div className="bg-slate-800 text-slate-200 px-4 py-2 rounded-lg font-bold">{archivedOrders.length} Total</div>
            </div>
            {archivedOrders.length === 0 ? (
              <div className="text-center py-20 bg-background rounded-xl border"><Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50"/><h2 className="text-xl font-semibold text-muted-foreground">No archived orders yet.</h2></div>
            ) : (
              <div className="space-y-10">
                {Object.entries(groupedArchivedOrders).map(([dateLabel, dateOrders]) => (
                  <div key={dateLabel} className="space-y-4">
                    <div className="flex items-center gap-3 border-b pb-2"><CalendarDays className="h-5 w-5 text-primary" /><h2 className="text-xl font-bold">{dateLabel}</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dateOrders.map((order) => (
                        <Card key={order.id} className="border-border/60 shadow-sm overflow-hidden flex flex-col bg-background/60">
                          <div className="p-4 border-b bg-slate-700 text-white flex justify-between items-center"><span className="font-bold">#{order.order_ref}</span><span className="font-bold bg-white/20 px-2 py-1 rounded text-xs">ARCHIVED</span></div>
                          <CardContent className="p-5 flex-1 flex flex-col">
                            <div className="mb-4">
                              <h3 className="font-bold text-lg">{order.customer_name}</h3>
                              <p className="text-sm font-medium text-primary mt-1">{order.customer_phone}</p>
                              <p className="text-sm text-muted-foreground mt-1 bg-secondary/50 p-2 rounded-md">{order.customer_address}</p>
                            </div>
                            <div className="mb-6 flex-1">
                              <p className="font-medium whitespace-pre-wrap">{order.order_details}</p>
                              <div className="mt-3 pt-3 border-t flex justify-between font-bold"><span>Total:</span><span>{formatPrice(order.total_price)}</span></div>
                              {order.rating && (
                                <div className="mt-3 pt-3 border-t flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Rating:</span>
                                  <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= order.rating! ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />)}</div>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                              <Button onClick={() => printReceipt(order)} variant="outline"><Printer className="mr-2 w-4 h-4" /> Print</Button>
                              <Button onClick={() => restoreOrder(order.id)} variant="outline" className="text-blue-600"><RotateCcw className="mr-2 w-4 h-4" /> Restore</Button>
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
            <div><h1 className="text-3xl font-bold">Revenue Analytics</h1><p className="text-muted-foreground mt-1">Real-time performance metrics.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <Card className="border-border/60 bg-background"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Store Rating</p><h3 className="text-2xl font-bold mt-1">{averageRating} / 5.0</h3><p className="text-xs text-amber-500 font-bold mt-1">{totalRatingsCount} reviews</p></CardContent></Card>
              <Card className="border-border/60 bg-background"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Revenue ({monthName})</p><h3 className="text-2xl font-bold mt-1">{formatPrice(monthlyRevenue)}</h3></CardContent></Card>
              <Card className="border-border/60 bg-background"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Lifetime Revenue</p><h3 className="text-2xl font-bold mt-1">{formatPrice(totalRevenue)}</h3></CardContent></Card>
              <Card className="border-border/60 bg-background"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Top Selling Item</p><h3 className="text-lg font-bold truncate mt-1">{bestSeller.name}</h3><p className="text-xs text-primary font-bold mt-1">{bestSeller.qty} units</p></CardContent></Card>
              <Card className="border-border/60 bg-background"><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Orders</p><h3 className="text-2xl font-bold mt-1">{totalOrdersCount}</h3></CardContent></Card>
            </div>
            <h2 className="text-xl font-bold mt-8 mb-4">Workflow Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center"><span className="block text-3xl font-bold text-orange-600">{pendingCount}</span><span className="text-sm text-orange-800">Pending</span></div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-center"><span className="block text-3xl font-bold text-blue-600">{preparingCount}</span><span className="text-sm text-blue-800">Preparing</span></div>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-center"><span className="block text-3xl font-bold text-purple-600">{deliveringCount}</span><span className="text-sm text-purple-800">Out for Delivery</span></div>
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center"><span className="block text-3xl font-bold text-green-600">{deliveredCount}</span><span className="text-sm text-green-800">Delivered</span></div>
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div><h1 className="text-3xl font-bold">Promo Codes</h1><p className="text-muted-foreground mt-1">Create and manage discounts.</p></div>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <Card className="lg:col-span-1 shadow-sm border-border/60">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4"><PlusCircle className="text-primary w-5 h-5"/> Create Promo</h3>
                  <form onSubmit={handleAddPromo} className="space-y-4">
                    <div><label className="text-sm font-semibold">Code Name</label><Input placeholder="e.g. FREEDRINK" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())} className="mt-1 uppercase" required /></div>
                    <div>
                      <label className="text-sm font-semibold">Discount Type</label>
                      <select className="w-full mt-1 h-10 px-3 rounded-md border border-input bg-background text-sm" value={newPromoType} onChange={(e) => setNewPromoType(e.target.value)}>
                        <option value="percentage">Percentage Off (%)</option>
                        <option value="fixed">Fixed Cash Off (Rs.)</option>
                      </select>
                    </div>
                    <div><label className="text-sm font-semibold">Value</label><Input type="number" placeholder="Value" value={newPromoValue} onChange={(e) => setNewPromoValue(e.target.value)} className="mt-1" required min="1" /></div>
                    <Button type="submit" className="w-full bg-primary font-bold">Add Promo Code</Button>
                  </form>
                </CardContent>
              </Card>
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {promos.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-background border rounded-xl"><Tag className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3"/><p className="font-medium text-muted-foreground">No promo codes active.</p></div>
                ) : (
                  promos.map((promo) => (
                    <Card key={promo.id} className="border-border/60 shadow-sm bg-background">
                      <CardContent className="p-5 flex justify-between items-center">
                        <div>
                          <h4 className="font-black text-xl text-primary uppercase tracking-wider">{promo.code}</h4>
                          <p className="text-sm font-medium text-muted-foreground mt-1">{promo.type === 'percentage' ? `${promo.value}% OFF` : `Rs. ${promo.value} OFF`}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeletePromo(promo.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-5 h-5" /></Button>
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