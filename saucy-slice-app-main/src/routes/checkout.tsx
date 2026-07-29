import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Pizza, ChevronLeft, MapPin, Phone, User, Banknote, CheckCircle, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    // Simulate a network request taking 1.5 seconds to make it feel real
    setTimeout(() => {
      setIsPlacingOrder(false);
      setOrderSuccess(true);
    }, 1500);
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
            // SUCCESS SCREEN
            <Card className="border-border/60 shadow-lg max-w-lg mx-auto text-center overflow-hidden">
              <div className="bg-green-500 p-8 flex justify-center">
                <CheckCircle className="h-20 w-20 text-white animate-in zoom-in duration-500" />
              </div>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Order Confirmed!</h2>
                  <p className="text-muted-foreground">Your delicious Pizza Saucy order has been received and is being prepared.</p>
                </div>
                
                <div className="bg-secondary/30 rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Order Number</p>
                  <p className="text-xl font-bold tracking-widest text-primary">
                    #PS-{Math.floor(1000 + Math.random() * 9000)}
                  </p>
                </div>

                <Link to="/" className="block">
                  <Button size="lg" className="w-full gap-2 text-base font-bold rounded-xl shadow-md">
                    <Home className="h-5 w-5" /> Return to Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            // NORMAL CHECKOUT SCREEN
            <>
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
                            <input type="text" placeholder="Ali Raza" className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Phone Number</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <input type="tel" placeholder="0300 1234567" className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" />
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium text-foreground">Complete Address</label>
                          <textarea placeholder="House Number, Street, Sector / Block..." rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"></textarea>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Banknote className="h-5 w-5 text-primary" /> Payment Method
                      </h2>
                      <div className="border-2 border-primary bg-primary/5 rounded-xl p-4 flex items-center justify-between cursor-pointer">
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
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">1x Extreme Double Layer</span>
                          <span className="font-medium">Rs. 1,650</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">2x Loaded Fries</span>
                          <span className="font-medium">Rs. 1,400</span>
                        </div>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Subtotal</span>
                          <span>Rs. 3,050</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Delivery Fee</span>
                          <span>Free</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border/50">
                          <span>Total</span>
                          <span className="text-primary">Rs. 3,050</span>
                        </div>
                      </div>

                      <Button 
                        size="lg" 
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder}
                        className="w-full text-base font-bold rounded-xl shadow-md transition-transform active:scale-95"
                      >
                        {isPlacingOrder ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
          
        </div>
      </main>
    </div>
  );
}