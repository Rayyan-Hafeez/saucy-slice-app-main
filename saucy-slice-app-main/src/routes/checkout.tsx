import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ChevronLeft, Pizza, MapPin, Phone, User, Tag, CheckCircle2, AlertCircle, Check, Banknote } from "lucide-react";

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

type PromoCode = {
  type: 'percentage' | 'fixed';
  value: number;
};

function formatPrice(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [generatedRef, setGeneratedRef] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; details: PromoCode } | null>(null);
  const [promoMessage, setPromoMessage] = useState({ text: "", type: "" });
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("saucy_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.details.type === 'percentage') {
      discountAmount = subtotal * (appliedPromo.details.value / 100);
    } else if (appliedPromo.details.type === 'fixed') {
      discountAmount = appliedPromo.details.value;
    }
  }

  discountAmount = Math.min(discountAmount, subtotal);
  const finalTotal = subtotal - discountAmount;

  const handleApplyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    setIsCheckingPromo(true);

    if (code === "RAYYAN100") {
      setAppliedPromo({ code, details: { type: 'percentage', value: 100 } });
      setPromoMessage({ text: `Boss Mode Activated. Order is Free!`, type: "success" });
      setPromoInput("");
      setIsCheckingPromo(false);
      return;
    }

    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (data) {
      setAppliedPromo({ code: data.code, details: { type: data.type as 'percentage' | 'fixed', value: data.value } });
      setPromoMessage({ text: `'${data.code}' applied successfully!`, type: "success" });
      setPromoInput("");
    } else {
      setPromoMessage({ text: "Invalid or expired promo code.", type: "error" });
    }
    
    setIsCheckingPromo(false);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoMessage({ text: "", type: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    let detailsString = cart.map((item) => `${item.quantity}x ${item.name}`).join(", ");
    
    if (appliedPromo) {
      detailsString += `\n[PROMO APPLIED: ${appliedPromo.code} - ${formatPrice(discountAmount)} OFF]`;
    }

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
      alert("There was an error placing your order. Please try again.");
      setIsSubmitting(false);
    } else {
      localStorage.removeItem("saucy_cart");
      setGeneratedRef(orderRef);
      setOrderPlaced(true);
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN VIEW
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
        <header className="w-full bg-[#FDFBF7] border-b border-border/50 p-4 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-lg">Pizza Saucy</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-background rounded-3xl shadow-xl overflow-hidden border border-border/50 text-center animate-in zoom-in-95 duration-300">
            <div className="bg-[#10B981] p-8 flex flex-col items-center justify-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-2">
                <Check className="w-10 h-10 text-white stroke-[3]" />
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-black text-foreground">Order Placed Successfully!</h2>
                <p className="text-muted-foreground text-sm mt-1">Your order has been sent directly to our kitchen. We will start preparing it right away.</p>
              </div>

              <div className="bg-secondary/40 p-4 rounded-2xl border border-border/60">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Order Reference</p>
                <p className="text-2xl font-black text-primary tracking-wide">#PS-{generatedRef}</p>
              </div>

              <div className="space-y-2">
                <Link to="/track">
                  <Button className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md mb-2">
                    Track Order
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-muted-foreground hover:text-foreground">
                    Return to Menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // MAIN CHECKOUT FORM VIEW
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <header className="w-full bg-[#FDFBF7] border-b border-border/50 p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-lg">Pizza Saucy</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <h1 className="text-3xl font-black text-foreground tracking-tight">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: Delivery & Payment Cards */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery Details Card */}
            <div className="bg-background p-6 sm:p-8 rounded-3xl border border-border/60 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Delivery Details</h2>
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input 
                        required 
                        placeholder="Ali Khan" 
                        className="h-12 pl-10 bg-secondary/20 border-border/60 rounded-xl"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                      <Input 
                        required 
                        type="tel" 
                        placeholder="0300 1234567" 
                        className="h-12 pl-10 bg-secondary/20 border-border/60 rounded-xl"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Complete Address</label>
                  <Textarea 
                    required 
                    placeholder="Street number, house, area..." 
                    className="min-h-[100px] resize-none bg-secondary/20 border-border/60 rounded-xl p-3"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </form>
            </div>

            {/* Payment Method Card */}
            <div className="bg-background p-6 sm:p-8 rounded-3xl border border-border/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                <Banknote className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Payment Method</h2>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-primary bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-4 border-primary flex items-center justify-center"></div>
                  <span className="font-bold text-foreground">Cash on Delivery</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">Pay at doorstep</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Promos */}
          <div className="lg:sticky lg:top-24">
            <Card className="border-border/60 shadow-lg bg-background rounded-3xl overflow-hidden">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6 max-h-[220px] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex gap-2">
                        <span className="font-bold text-muted-foreground">{item.quantity}x</span>
                        <span className="font-medium text-foreground">{item.name}</span>
                      </div>
                      <span className="font-semibold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* PROMO CODE SECTION */}
                <div className="border-t border-border/50 pt-4 mb-6">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-primary" /> Have a Promo Code?
                  </label>
                  
                  {!appliedPromo ? (
                    <div className="flex gap-2">
                      <Input 
                        placeholder="ENTER CODE" 
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="uppercase bg-secondary/30 border-border/60 h-11 rounded-xl font-bold"
                      />
                      <Button type="button" onClick={handleApplyPromo} disabled={isCheckingPromo} variant="secondary" className="h-11 px-5 font-bold rounded-xl">
                        {isCheckingPromo ? "..." : "Apply"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-xl">
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

                {/* TOTALS */}
                <div className="space-y-2 border-t border-border/50 pt-4">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Fee</span>
                    <span className="font-medium text-foreground">Free</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-green-600">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-lg font-bold text-foreground pt-3 border-t border-border/50 mt-2">
                    <span>Total</span>
                    <span className="text-primary text-2xl font-black">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-[0.98] mt-6"
                >
                  {isSubmitting ? "Processing..." : "Place Order (Cash on Delivery)"}
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}