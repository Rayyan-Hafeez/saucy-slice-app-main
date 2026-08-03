import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, Clock, ChefHat, Bike, CheckCircle2, MapPin, Phone, User, ChevronLeft, Pizza } from "lucide-react";
import { supabase } from "../lib/supabase";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [{ title: "Track Order | Pizza Saucy" }],
  }),
  component: TrackOrder,
});

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_price: number;
  order_details: string;
  status: string;
  order_ref: string;
  created_at: string;
};

function formatPrice(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

function TrackOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    const cleanQuery = searchQuery.trim().replace("#", "");

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .or(`order_ref.eq.${cleanQuery},customer_phone.ilike.%${cleanQuery}%`)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      setOrder(data[0]);
    } else {
      setOrder(null);
    }
    setLoading(false);
  }

  // If order status is Archived, treat it as Delivered for customer tracking
  const currentOrderStatus = order?.status === 'Archived' ? 'Delivered' : (order?.status || "Pending");

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Pizza className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Pizza Saucy</span>
          </Link>
          <Link to="/" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to Menu
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-sm">
            <ChefHat className="w-4 h-4" /> Live Order Tracking
          </div>
          <h1 className="text-3xl font-black text-foreground">Track Your Order</h1>
          <p className="text-muted-foreground text-sm">Enter your order ID or phone number below to check real-time kitchen progress.</p>
          
          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="e.g. 6278 or 0321..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white border-border/60 rounded-xl font-medium shadow-sm"
              />
            </div>
            <Button type="submit" disabled={loading} className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track"}
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Searching live database...</p>
          </div>
        ) : searched && !order ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border/60 shadow-sm max-w-lg mx-auto p-8">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 grid place-items-center mx-auto mb-3 font-bold">!</div>
            <h3 className="text-lg font-bold text-foreground">Order Not Found</h3>
            <p className="text-muted-foreground text-sm mt-1">We couldn't find any order matching "{searchQuery}". Please check your number and try again.</p>
          </div>
        ) : order ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="border-border/60 shadow-xl bg-white rounded-3xl overflow-hidden p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-border/50 gap-4">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Reference</span>
                  <h2 className="text-3xl font-black text-primary">#{order.order_ref || order.id.split('-')[0].toUpperCase()}</h2>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 font-bold px-4 py-1.5 text-sm rounded-full">
                  Status: {currentOrderStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
                <div className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                  ["Pending", "Preparing", "Out for Delivery", "Delivered"].includes(currentOrderStatus) 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-border/40 text-muted-foreground bg-secondary/20"
                }`}>
                  <div className="w-10 h-10 rounded-full bg-primary text-white grid place-items-center mb-2 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Step 1</span>
                  <h4 className="font-bold text-sm text-foreground">Order Received</h4>
                </div>

                <div className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                  ["Preparing", "Out for Delivery", "Delivered"].includes(currentOrderStatus) 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-border/40 text-muted-foreground bg-secondary/20"
                }`}>
                  <div className={`w-10 h-10 rounded-full grid place-items-center mb-2 shadow-sm ${["Preparing", "Out for Delivery", "Delivered"].includes(currentOrderStatus) ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Step 2</span>
                  <h4 className="font-bold text-sm text-foreground">Kitchen Preparing</h4>
                </div>

                <div className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                  ["Out for Delivery", "Delivered"].includes(currentOrderStatus) 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-border/40 text-muted-foreground bg-secondary/20"
                }`}>
                  <div className={`w-10 h-10 rounded-full grid place-items-center mb-2 shadow-sm ${["Out for Delivery", "Delivered"].includes(currentOrderStatus) ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Step 3</span>
                  <h4 className="font-bold text-sm text-foreground">Out for Delivery</h4>
                </div>

                <div className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all ${
                  currentOrderStatus === "Delivered" 
                    ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/30" 
                    : "border-border/40 text-muted-foreground bg-secondary/20"
                }`}>
                  <div className={`w-10 h-10 rounded-full grid place-items-center mb-2 shadow-sm ${currentOrderStatus === "Delivered" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Step 4</span>
                  <h4 className="font-bold text-sm text-foreground">Delivered</h4>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl">
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Customer Information</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium text-foreground">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span>{order.customer_address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl flex flex-col justify-between">
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-wider">Order Breakdown</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{order.order_details}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border/50 font-black text-foreground">
                    <span>Total Paid:</span>
                    <span className="text-primary text-lg">{formatPrice(order.total_price)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}