import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { ChevronLeft, Search, Pizza, ChefHat, Bike, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/track")({
  component: TrackOrder,
});

function TrackOrder() {
  const [phone, setPhone] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setSearched(true);
    
    // Fetch the most recent order for this phone number
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (data) {
      setOrder(data);
    } else {
      setOrder(null);
    }
    
    if (error) console.error(error);
    setLoading(false);
  };

  // Helper function to figure out how far along the progress bar should be
  const getStep = (status: string) => {
    if (status === 'Pending') return 1;
    if (status === 'Preparing') return 2;
    if (status === 'Out for Delivery') return 3;
    if (status === 'Delivered') return 4;
    return 0;
  };

  const step = order ? getStep(order.status) : 0;

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span className="font-medium">Back to Menu</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Pizza className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Pizza Saucy</span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 sm:px-6 flex flex-col items-center">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">Track Your Order</h1>
            <p className="text-muted-foreground mt-2">Enter your phone number to see live updates.</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="flex gap-2">
            <input 
              type="tel"
              placeholder="e.g., 0300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              required
            />
            <Button type="submit" disabled={loading} className="rounded-xl px-6 bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </Button>
          </form>

          {/* No Order Found Message */}
          {searched && !loading && !order && (
            <div className="text-center p-6 bg-background rounded-xl border border-border/50 text-muted-foreground">
              We couldn't find an active order for this phone number.
            </div>
          )}

          {/* Order Status Card */}
          {order && (
            <Card className="border-border/60 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/10 p-4 border-b border-border/50 flex justify-between items-center">
                <span className="font-bold text-foreground">Current Status</span>
                <span className="text-xs font-bold bg-primary text-primary-foreground px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {order.status}
                </span>
              </div>
              
              <CardContent className="p-6 space-y-8 bg-background">
                
                {/* Visual Progress Stepper */}
                <div className="relative flex justify-between px-2">
                  {/* Gray background track line */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -z-10 -translate-y-1/2 rounded-full"></div>
                  
                  {/* Colored progress line */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${((step - 1) / 3) * 100}%` }}
                  ></div>

                  {/* Icon 1: Pending */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${step >= 1 ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-background border-secondary text-muted-foreground'}`}>
                      <Pizza className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {/* Icon 2: Preparing */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${step >= 2 ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-background border-secondary text-muted-foreground'}`}>
                      <ChefHat className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Icon 3: Delivering */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${step >= 3 ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-background border-secondary text-muted-foreground'}`}>
                      <Bike className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Icon 4: Done */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${step >= 4 ? 'bg-primary border-primary text-primary-foreground shadow-md' : 'bg-background border-secondary text-muted-foreground'}`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between px-1 text-xs font-medium text-muted-foreground">
                  <span>Pending</span>
                  <span>Preparing</span>
                  <span>Delivering</span>
                  <span>Done</span>
                </div>

                {/* Order Summary */}
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Your Items</p>
                  <p className="font-medium text-foreground text-sm">{order.order_details}</p>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}