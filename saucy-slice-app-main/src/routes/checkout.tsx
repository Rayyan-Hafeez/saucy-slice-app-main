import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ChevronLeft, Pizza, MapPin, Phone, User, Tag, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

// ----------------------------------------------------------------
// PROMO CODE CONFIGURATION
// ----------------------------------------------------------------
type PromoCode = {
  type: 'percentage' | 'fixed';
  value: number;
};

const ACTIVE_PROMOS: Record<string, PromoCode> = {
  "SAUCY10": { type: 'percentage', value: 10 }, // 10% off
  "SAUCY200": { type: 'fixed', value: 200 },    // Rs. 200 off
};

function formatPrice(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; details: PromoCode } | null>(null);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" }); // type: 'success' | 'error'

  useEffect(() => {
    const savedCart = localStorage.getItem("saucy_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      // If cart is empty, send them back to the menu
      navigate({ to: "/" });
    }
  }, [navigate]);

  // ----------------------------------------------------------------
  // DISCOUNT CALCULATIONS
  // ----------------------------------------------------------------
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.details.type === 'percentage') {
      discountAmount = subtotal * (appliedPromo.details.value / 100);
    } else if (appliedPromo.details.type === 'fixed') {
      discountAmount = appliedPromo.details.value;
    }
  }

  // Ensure discount doesn't accidentally exceed the total price
  discountAmount = Math.min(discountAmount, subtotal);
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (ACTIVE_PROMOS[code]) {
      setAppliedPromo({ code, details: ACTIVE_PROMOS[code] });
      setPromoMessage({ text: `'${code}' applied successfully!`, type: "success" });
      setPromoInput("");
    } else {
      setPromoMessage({ text: "Invalid or expired promo code.", type: "error" });
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    // Format the items list
    let detailsString = cart.map((item) => `${item.quantity}x ${item.name}`).join(", ");
    
    // If a promo was used, append it to the order details so the kitchen sees it
    if (appliedPromo) {
      detailsString += `\n[PROMO APPLIED: ${appliedPromo.code} - ${formatPrice(discountAmount)} OFF]`;
    }

    // Generate a random 4-digit order reference
    const orderRef = Math.floor(1000 + Math.random() * 9000).toString();

    const { error } = await supabase.from("orders").insert({
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_address: formData.address,
      order_details: detailsString,
      total_price: finalTotal,
      status: "Pending",
      order_ref: orderRef,
    });

    if (error) {
      alert("Something went wrong. Please try again.");
      setIsSubmitting(false);
    } else {
      // Clear cart and redirect to tracking page
      localStorage.removeItem("saucy_cart");
      navigate({ to: "/track" });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col">
      <header className="w-full bg-background border-b border-border/50 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Link>
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Pizza className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground text-lg">Checkout</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: Customer Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Delivery Details</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter your information to complete the order.</p>
          </div>

          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Full Name
              </label>
              <Input 
                required 
                placeholder="Ali Raza" 
                className="h-12 bg-background border-border/60"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" /> Phone Number
              </label>
              <Input 
                required 
                type="tel" 
                placeholder="0300 1234567" 
                className="h-12 bg-background border-border/60"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Delivery Address
              </label>
              <Textarea 
                required 
                placeholder="Street number, house, area..." 
                className="min-h-[100px] resize-none bg-background border-border/60"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary & Promos */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card className="border-border/60 shadow-lg bg-background">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex gap-2">
                      <span className="font-bold text-muted-foreground">{item.quantity}x</span>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* PROMO CODE SECTION */}
              <div className="border-t border-border/50 pt-6 mb-6">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-primary" /> Have a Promo Code?
                </label>
                
                {!appliedPromo ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter code (e.g. SAUCY10)" 
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="uppercase bg-secondary/30 border-border/60"
                    />
                    <Button type="button" onClick={handleApplyPromo} variant="secondary" className="font-bold">
                      Apply
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="font-bold text-sm">{appliedPromo.code} Applied</span>
                    </div>
                    <button type="button" onClick={removePromo} className="text-xs font-bold text-red-500 hover:underline">
                      Remove
                    </button>
                  </div>
                )}
                
                {promoMessage.text && !appliedPromo && (
                  <p className={`text-xs mt-2 flex items-center gap-1 ${promoMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {promoMessage.type === 'error' && <AlertCircle className="w-3 h-3" />}
                    {promoMessage.text}
                  </p>
                )}
              </div>

              {/* TOTALS CALCULATION */}
              <div className="space-y-2 border-t border-border/50 pt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-bold text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-lg font-bold text-foreground pt-2">
                  <span>Total</span>
                  <span className="text-primary text-2xl">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-[0.98] mt-6"
              >
                {isSubmitting ? "Processing..." : "Place Order (Cash on Delivery)"}
              </Button>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}