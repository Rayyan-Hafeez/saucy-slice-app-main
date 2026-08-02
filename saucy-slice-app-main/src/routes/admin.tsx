import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Bike, CheckCircle, Store, Trash2, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

// Define what an order looks like
type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  order_details: string;
  total_price: number;
  status: string;
};

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // 1. Fetch all orders when the page loads
    fetchOrders();

    // 2. The Magic: Listen for live changes in the database!
    const channel = supabase
      .channel('live-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log("Database changed!", payload);
          fetchOrders(); // Re-fetch to update the UI instantly
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false }); // Newest orders first
    
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

  return (
    <div className="min-h-screen bg-secondary/20 pb-10">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-green-400" />
            <span className="text-lg font-bold tracking-tight">Pizza Saucy | Live Kitchen POS</span>
          </div>
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft className="h-4 w-4" /> Back to Storefront
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order Queue</h1>
            <p className="text-muted-foreground mt-1">Manage incoming orders in real-time.</p>
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
              <Card key={order.id} className="border-border/60 shadow-sm overflow-hidden flex flex-col">
                
                {/* Order Header (Changes color based on status) */}
                <div className={`p-4 border-b flex justify-between items-center text-white
                  ${order.status === 'Pending' ? 'bg-orange-500' : ''}
                  ${order.status === 'Preparing' ? 'bg-blue-500' : ''}
                  ${order.status === 'Out for Delivery' ? 'bg-purple-500' : ''}
                  ${order.status === 'Delivered' ? 'bg-green-500' : ''}
                `}>
                  <span className="font-bold text-sm tracking-wider">
                    #{order.id.split('-')[0].toUpperCase()}
                  </span>
                  <span className="font-bold bg-white/20 px-2 py-1 rounded text-xs backdrop-blur-sm">
                    {order.status.toUpperCase()}
                  </span>
                </div>

                <CardContent className="p-5 flex-1 flex flex-col">
                  {/* Customer Info */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-foreground">{order.customer_name}</h3>
                    <p className="text-sm font-medium text-primary">{order.customer_phone}</p>
                    <p className="text-sm text-muted-foreground mt-1 bg-secondary/50 p-2 rounded-md">
                      {order.customer_address}
                    </p>
                  </div>

                  {/* Order Details */}
                  <div className="mb-6 flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Items:</p>
                    <p className="font-medium text-foreground">{order.order_details}</p>
                    <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total to Collect:</span>
                      <span className="text-lg font-bold text-foreground">{formatPrice(order.total_price)}</span>
                    </div>
                  </div>

                  {/* Status Control Buttons */}
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
                    
                    {/* Delete button (Only show if delivered or for cleanup) */}
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