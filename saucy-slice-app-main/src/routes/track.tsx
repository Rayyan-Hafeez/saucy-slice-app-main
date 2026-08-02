import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Clock, ChefHat, Bike, CheckCircle, Store, MapPin, Phone, User, Star } from "lucide-react";

export const Route = createFileRoute("/track")({
  component: TrackOrder,
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

function formatPrice(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

function TrackOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [ratedSubmitted, setRatedSubmitted] = useState(false);

  // Real-time listener for the active tracked order
  useEffect(() => {
    if (!order) return;

    const channel = supabase
      .channel(`order-track-${order.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => {
          setOrder(payload.new as Order);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setLoading(true);
    setSearched(true);

    const { data } = await supabase
      .from("orders")
      .select("*")
      .or(`order_ref.eq.${query},customer_phone.eq.${query}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setOrder(data[0]);
      if (data[0].rating) {
        setRating(data[0].rating);
        setRatedSubmitted(true);
      }
    } else {
      setOrder(null);
    }
    setLoading(false);
  };

  const submitRating = async (stars: number) => {
    if (!order) return;
    setRating(stars);
    setRatedSubmitted(true);

    await supabase
      .from("orders")
      .update({ rating: stars })
      .eq("id", order.id);
  };

  const steps = [
    { name: "Pending", label: "Order Received", icon: Clock },
    { name: "Preparing", label: "Kitchen Preparing", icon: ChefHat },
    { name: "Out for Delivery", label: "Out for Delivery", icon: Bike },
    { name: "Delivered", label: "Delivered", icon: CheckCircle },
  ];

  const getCurrentStepIndex = (status: string) => {
    switch (status) {
      case "Pending": return 0;
      case "Preparing": return 1;
      case "Out for Delivery": return 2;
      case "Delivered": return 3;
      case "Archived": return 3;
      default: return 0;
    }
  };

  const currentStepIdx = order ? getCurrentStepIndex(order.status) : 0;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <header className="w-full bg-[#FDFBF7] border-b border-border/50 p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground text-lg">Track Order</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        <Card className="border-border/60 shadow-lg bg-background rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center max-w-md mx-auto mb-6">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">Track Your Pizza Live</h1>
              <p className="text-muted-foreground text-sm mt-1">Enter your 4-digit Order Reference or Phone Number.</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                <Input 
                  required
                  placeholder="e.g. 4873 or 03001234567"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10 bg-secondary/20 border-border/60 rounded-xl"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-12 px-6 font-bold rounded-xl bg-primary hover:bg-primary/90 text-white">
                {loading ? "Searching..." : "Track"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searched && !order && !loading && (
          <div className="text-center py-12 bg-background rounded-3xl border border-border/50 shadow-sm">
            <Store className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-bold text-foreground">No order found</h3>
            <p className="text-sm text-muted-foreground mt-1">Please check your reference number or phone number and try again.</p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="border-border/60 shadow-lg bg-background rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-8 space-y-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-6">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Reference</span>
                    <h2 className="text-3xl font-black text-primary">#{order.order_ref || order.id.split('-')[0].toUpperCase()}</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                    Status: {order.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    const StepIcon = step.icon;

                    return (
                      <div key={step.name} className={`flex flex-col items-center text-center p-4 rounded-2xl border transition-all duration-300 ${isCurrent ? 'bg-primary/5 border-primary shadow-sm' : isCompleted ? 'bg-secondary/30 border-border/50' : 'bg-background border-border/30 opacity-40'}`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${isCompleted ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground'}`}>
                          <StepIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Step {idx + 1}</span>
                        <h4 className="text-sm font-bold text-foreground mt-0.5">{step.label}</h4>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                  <div className="space-y-3">
                    <h3 className="font-bold text-foreground text-base">Customer Information</h3>
                    <div className="text-sm space-y-1 text-muted-foreground bg-secondary/30 p-4 rounded-2xl">
                      <p className="flex items-center gap-2"><User className="w-4 h-4 text-primary" /> <strong className="text-foreground">{order.customer_name}</strong></p>
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> <span className="text-foreground">{order.customer_phone}</span></p>
                      <p className="flex items-start gap-2 pt-1"><MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" /> <span className="text-foreground">{order.customer_address}</span></p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-foreground text-base">Order Breakdown</h3>
                    <div className="bg-secondary/30 p-4 rounded-2xl space-y-3 text-sm">
                      <p className="font-medium text-foreground whitespace-pre-wrap">{order.order_details}</p>
                      <div className="pt-3 border-t border-border/50 flex justify-between font-black text-base">
                        <span>Total Paid:</span>
                        <span className="text-primary">{formatPrice(order.total_price)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {(order.status === 'Delivered' || order.status === 'Archived') && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-3xl text-center space-y-3 animate-in fade-in">
                    <h3 className="font-bold text-lg text-foreground">How was your Pizza Saucy experience?</h3>
                    <p className="text-sm text-muted-foreground">Tap a star to rate your order!</p>
                    
                    <div className="flex justify-center gap-2 pt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => submitRating(star)}
                          className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                        >
                          <Star 
                            className={`w-8 h-8 ${star <= rating ? "fill-amber-400 text-amber-400 drop-shadow" : "text-slate-300"}`} 
                          />
                        </button>
                      ))}
                    </div>
                    {ratedSubmitted && (
                      <p className="text-xs font-bold text-green-600 pt-1">Thank you for your feedback!</p>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}