import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Pizza, ChevronLeft, MapPin, Phone, User, Banknote, CheckCircle, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "../lib/supabase";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

function Checkout() {
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Real cart state
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);

  // Load the real cart from localStorage when the page opens
  useEffect(() => {
    const savedCart = localStorage.getItem("saucy_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert("Please fill in all delivery details before placing your order.");
      return;
    }

    setIsPlacingOrder(true);

    // Build a clean text version of the order for the database
    const orderDetailsText = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

    try {
      // Push the data directly into your Supabase database!
      const { error } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: name,
            customer_phone: phone,
            customer_address: address,
            order_details: orderDetailsText,
            total_price: cartTotal
          }
        ]);

      if (error) throw error;

      // If successful, show the success screen and empty the cart
      setIsPlacingOrder(false);
      setOrderSuccess(true);
      localStorage.removeItem("saucy_cart");
      
    } catch (error) {
      console.error("Error saving order:", error);
      alert("There was an error placing your order. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
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

      <main className="flex-1 py-10 px-4 sm:px-6 flex flex-col justify-center">
        <div className="mx-auto max-w-5xl w-full">
          
          {orderSuccess ? (
            <Card className="border-border/60 shadow-lg max-w-lg mx-auto text-center overflow-hidden">
              <div className="bg-green-500 p-8 flex justify-center">
                <CheckCircle className="h-20 w-20 text-white animate-in zoom-in duration-500" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Order Placed Successfully!</h2>
                  <p className="text-muted-foreground">Your order has been sent directly to our kitchen. We will start preparing it right away.</p>
                </div>
                
                <div className="bg-secondary/30 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Order Reference</p>
                  <p className="text-xl font-bold tracking-widest text-primary">
                    #PS-{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                </div>

                <Link to="/" className="block">
                  <Button size="lg" className="w-full gap-2 text-base font-bold rounded-xl shadow-md">
                    Return to Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Secure Checkout</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" /> Delivery Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input 
                              type="text" 
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Ali Raza" 
                              className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input 
                              type="tel" 
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="0300 1234567" 
                              className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                            />
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-foreground">Complete Address</label>
                          <textarea 
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="House Number, Street, Sector / Block..." 
                            rows={3} 
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                          ></textarea>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary" /> Payment Method
                      </h2>
                      <div className="border-2 border-primary bg-primary/5 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 rounded-full border-4 border-primary bg-background"></div>
                          <span className="font-bold text-foreground">Cash on Delivery</span>
                        </div>
                        <span className="text-sm font-medium text-primary">Pay at doorstep</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="border-border/60 shadow-md sticky top-24">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                      
                      <div className="space-y-3 mb-6 pb-6 border-b border-border/50">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                            <span className="font-medium text-foreground">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Delivery Fee</span>
                          <span>Free</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border/50">
                          <span>Total</span>
                          <span className="text-primary">{formatPrice(cartTotal)}</span>
                        </div>
                      </div>

                      <Button 
                        type="submit"
                        size="lg" 
                        disabled={isPlacingOrder || cart.length === 0}
                        className="w-full text-base font-bold rounded-xl shadow-md transition-transform active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isPlacingOrder ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-5 w-5" />
                            Confirm Order
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          )}
          
        </div>
      </main>
    </div>
  );
}