import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Search, ChevronLeft, Pizza, ChefHat, Bike, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/track")({
  component: TrackOrder,
});

type Order = {
  id: string;
  order_ref: string;
  status: string;
  order_details: string;
  total_price: number;
};

function TrackOrder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    const rawSearch = searchQuery.trim();
    const upperSearch = rawSearch.toUpperCase();
    
    // Create both variations so it matches no matter how the customer types it
    const numberOnly = upperSearch.replace(/^PS-/, "");
    const withPrefix = `PS-${numberOnly}`;

    // Search database for the exact number, prefixed number, or phone number
    const { data, error: searchError } = await supabase
      .from("orders")
      .select("*")
      .or(`order_ref.eq.${numberOnly},order_ref.eq.${withPrefix},customer_phone.eq.${rawSearch}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (searchError || !data) {
      setError("Order not found. Please check your reference number or phone number.");
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  // If the database says "Archived", we tell the UI it is "Delivered"
  const displayStatus = order?.status === "Archived" ? "Delivered" : order?.status;

  // Determine which steps are active based on the displayStatus
  const getStepStatus = (stepName: string) => {
    const statuses = ["Pending", "Preparing", "Out for Delivery", "Delivered"];
    const currentIndex = statuses.indexOf(displayStatus || "Pending");
    const stepIndex = statuses.indexOf(stepName);

    if (currentIndex >= stepIndex) return "active";
    return "inactive";
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <header className="w-full bg-background border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Pizza className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground text-lg">Pizza Saucy</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center pt-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Enter your phone number or Order Reference.</p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-md flex gap-2 mb-8">
          <Input
            type="text"
            placeholder="PS-2420 or Phone Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-background h-12 rounded-xl"
          />
          <Button type="submit" className="bg-primary hover:bg-primary/90 h-12 w-12 rounded-xl shrink-0" disabled={loading}>
            <Search className="w-5 h-5" />
          </Button>
        </form>

        {error && <p className="text-destructive mb-4 font-medium">{error}</p>}

        {order && (
          <Card className="w-full max-w-md border-border/60 shadow-lg bg-background overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-4 border-b border-border/50 flex justify-between items-center bg-primary/5">
              <h3 className="font-bold text-lg text-foreground">
                Order {order.order_ref?.startsWith('PS-') ? '' : '#'}{order.order_ref || order.id.split('-')[0].toUpperCase()}
              </h3>
              <Badge className="bg-primary text-primary-foreground uppercase tracking-wider font-bold">
                {displayStatus}
              </Badge>
            </div>

            <CardContent className="p-6">
              <div className="flex justify-between mb-10 relative px-2">
                {/* Progress Bar Line Background */}
                <div className="absolute top-5 left-6 right-6 h-0.5 bg-secondary -z-10" />

                {/* Step 1: Pending */}
                <div className="flex flex-col items-center bg-background px-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${getStepStatus("Pending") === "active" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-muted-foreground"}`}>
                    <Pizza className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Pending</span>
                </div>

                {/* Step 2: Preparing */}
                <div className="flex flex-col items-center bg-background px-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${getStepStatus("Preparing") === "active" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-muted-foreground"}`}>
                    <ChefHat className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Preparing</span>
                </div>

                {/* Step 3: Delivering */}
                <div className="flex flex-col items-center bg-background px-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${getStepStatus("Out for Delivery") === "active" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-muted-foreground"}`}>
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Delivering</span>
                </div>

                {/* Step 4: Done */}
                <div className="flex flex-col items-center bg-background px-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${getStepStatus("Delivered") === "active" ? "bg-primary text-primary-foreground shadow-md" : "bg-secondary text-muted-foreground"}`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">Done</span>
                </div>
              </div>

              <div className="bg-secondary/30 p-4 rounded-xl border border-border/50">
                <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Your Items</p>
                <p className="font-medium text-foreground whitespace-pre-wrap">{order.order_details}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}