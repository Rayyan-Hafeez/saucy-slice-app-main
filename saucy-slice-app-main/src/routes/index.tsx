import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MapPin, Pizza, ShoppingBag, ChevronRight, X, Plus, Minus, Trash2, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import familyFeastImg from "@/assets/deal-family-feast.jpg";
import soloBiteImg from "@/assets/deal-solo-bite.jpg";
import midnightCravingImg from "@/assets/deal-midnight-craving.jpg";
import heroPizza from "@/assets/hero-pizza.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ title: "Pizza Saucy | Hot, Fresh & Delivered Fast" }],
  }),
  component: Index,
});

const BRANCHES = [
  { value: "ali-view-garden", label: "Ali View Garden" },
  { value: "askari-xi", label: "Askari-XI" },
  { value: "kot-abdul-malik", label: "Kot Abdul Malik (Branch 1)" },
  { value: "new-kahna", label: "New Kahna (Branch 2)" },
  { value: "ghaziabad", label: "Ghaziabad (Branch 3)" },
];

const REAL_DEALS = [
  { id: "deal-1", title: "Deal No. 1", description: "2 Small Pizzas, 1 Half Liter Drink", price: 1350, image: familyFeastImg },
  { id: "deal-2", title: "Deal No. 2", description: "2 Medium Pizzas, 1.5 Liter Drink", price: 2300, image: soloBiteImg },
  { id: "deal-3", title: "Deal No. 3", description: "2 Large Pizzas, 1.5 Liter Drink", price: 3300, image: midnightCravingImg },
  { id: "deal-4", title: "Deal No. 4", description: "2 Family Pizzas, 1.5 Liter Drink", price: 4400 },
  { id: "family-deal-5", title: "Family Deal No 5", description: "1 Large Pizza, 10 Pcs Nuggets, 2 Zinger Burgers, 1.5L Drink", price: 3000 },
  { id: "deal-6", title: "Deal No. 6", description: "1 Family Pizza, 2 Zinger Burgers, 1 Large Fries, 1.5L Drink", price: 3300 },
  { id: "single-deal", title: "Single Deal", description: "King Zinger, Small Fries, 1 Regular Drink", price: 530 },
  { id: "deal-7", title: "Deal No. 7", description: "2 Chicken Burgers, 1 Half Liter Drink", price: 700 },
  { id: "deal-8", title: "Deal No. 8", description: "3 Zinger Burgers, 1 Liter Drink", price: 1200 },
  { id: "deal-9", title: "Deal No. 9", description: "4 Zinger Burgers, 1.5 Liter Drink", price: 1600 },
  { id: "deal-10", title: "Deal No. 10", description: "6 Zinger Burgers, 1.5 Liter Drink", price: 2300 },
  { id: "deal-11", title: "Deal No. 11", description: "8 Zinger Burgers, 1.5 Liter Drink", price: 3000 },
];

type MenuItem = { name: string; price: number; desc: string; badge?: string };

const PIZZAS_SIGNATURE: MenuItem[] = [
  { name: "Extreme Double Layer", price: 1650, desc: "Medium: 1650 | Large: 2400 | Full: 3200" },
  { name: "Turkish Pizza", price: 1550, desc: "Medium: 1550 | Large: 2100 | Full: 2700" },
  { name: "Kabab Crust", price: 1550, desc: "Medium: 1550 | Large: 2100 | Full: 2700" },
  { name: "Crown Crust", price: 1550, desc: "Medium: 1550 | Large: 2100 | Full: 2700" },
  { name: "Kabab Pizza", price: 800, desc: "Small: 800 | Medium: 1500 | Large: 2000" },
];

const PIZZAS_SPECIAL: MenuItem[] = [
  { name: "Malai Boti Pizza", price: 750, desc: "Small: 750 | Medium: 1300 | Large: 1900" },
  { name: "Pizza Saucy Special", price: 750, desc: "Small: 750 | Medium: 1350 | Large: 1900" },
  { name: "Executive Pizza", price: 750, desc: "Small: 750 | Medium: 1400 | Large: 2000" },
  { name: "Chicken Tikka Creamy", price: 750, desc: "Small: 750 | Medium: 1300 | Large: 1800" },
  { name: "Chicken Chilli Pizza", price: 750, desc: "Small: 750 | Medium: 1350 | Large: 1900" },
];

const PIZZAS_REGULAR: MenuItem[] = [
  { name: "Chicken Tikka", price: 690, desc: "Small: 690 | Medium: 1200 | Large: 1700" },
  { name: "Chicken Fajita", price: 690, desc: "Small: 690 | Medium: 1200 | Large: 1700" },
  { name: "Chicken Supreme", price: 690, desc: "Small: 690 | Medium: 1200 | Large: 1700" },
  { name: "Mughlai Pizza", price: 690, desc: "Small: 690 | Medium: 1200 | Large: 1700" },
  { name: "Desi Chaska", price: 750, desc: "Small: 750 | Medium: 1300 | Large: 1900" },
];

const BURGERS: MenuItem[] = [
  { name: "Wehshi Burger", price: 680, desc: "Our massive signature sandwich" },
  { name: "Molten Lawa", price: 700, desc: "New Arrival", badge: "NEW" },
  { name: "Fish Burger", price: 500, desc: "Single: 500 | Double: 750", badge: "NEW" },
  { name: "Pizza Burger", price: 630, desc: "Best of both worlds" },
  { name: "Grill Burger", price: 630, desc: "Freshly grilled patty" },
  { name: "Special Zinger", price: 630, desc: "Crispy signature zinger" },
  { name: "Chicken Fillet", price: 390, desc: "Classic fillet" },
  { name: "Hot & Spicy", price: 390, desc: "For the spice lovers" },
  { name: "Zinger Burger", price: 390, desc: "Classic crunch" },
  { name: "Chicken Burger", price: 360, desc: "Simple and delicious" },
];

const WRAPS_AND_SIDES: MenuItem[] = [
  { name: "8 Pcs Injected Broast", price: 2400, desc: "4 Buns + Fries + Dip", badge: "NEW" },
  { name: "Injected Wrap", price: 700, desc: "Flavor packed wrap", badge: "NEW" },
  { name: "Loaded Fries", price: 700, desc: "Crispy fillet & grill fries" },
  { name: "Chicken Cheese Sticks", price: 680, desc: "Cheesy goodness" },
  { name: "Grilled Wings", price: 650, desc: "10 Pieces" },
  { name: "Salsa Wings", price: 650, desc: "10 Pieces", badge: "NEW" },
  { name: "Special Pizza Paratha", price: 650, desc: "Stuffed to perfection" },
  { name: "Macroni Pasta", price: 600, desc: "Creamy baked pasta" },
  { name: "Tortilla Wrap", price: 600, desc: "Classic wrap" },
  { name: "Saucy Sandwich", price: 600, desc: "New Arrival", badge: "NEW" },
  { name: "Hot Shots", price: 600, desc: "Bite sized crunch" },
  { name: "Nuggets", price: 600, desc: "10 Pieces" },
  { name: "Zingratha", price: 390, desc: "Zinger + Paratha" },
  { name: "Fries Large", price: 320, desc: "Medium: 200 | Large: 320" },
];

function formatPrice(value: number) {
  return `Rs. ${value.toLocaleString("en-PK")}`;
}

function Index() {
  const [branch, setBranch] = useState(BRANCHES[0].value);
  
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number }[]>(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("saucy_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // NEW STATE FOR MOBILE MENU

  useEffect(() => {
    localStorage.setItem("saucy_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.name === item.name);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prev, { id: item.name, name: item.name, price: item.price, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (name: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.name === name) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const scrollToMenu = () => {
    document.getElementById("menu-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col relative overflow-hidden">
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Pizza className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Pizza Saucy</span>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Links (Hidden on Mobile) */}
            <a href="#deals" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">Deals</a>
            <a href="#menu-section" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">Menu</a>
            <Link to="/track" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">Track Order</Link>
            
            {/* Cart Button */}
            <Button variant="ghost" size="icon" className="shrink-0 relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartItemCount}
                </span>
              )}
            </Button>

            {/* NEW: Mobile Hamburger Menu Button */}
            <Button variant="ghost" size="icon" className="shrink-0 sm:hidden" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-primary px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="relative z-10 flex flex-col items-center text-center lg:items-start lg:text-left">
              <Badge variant="secondary" className="mb-4 w-fit border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20">
                <FlameBadge /> Pride of Pakistan
              </Badge>
              <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                Hot, Fresh & Saucy
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-primary-foreground/90 sm:text-lg">
                Premium pizzas made with hand-stretched dough, bold sauces, and the cheesiest pulls. Order from your nearest branch in seconds.
              </p>
              <div className="mt-8 w-full max-w-md">
                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-card/95 p-2 shadow-xl backdrop-blur sm:grid-cols-[1fr_auto]">
                  <div className="flex items-center gap-2 px-2">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" />
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger className="h-11 w-full border-none bg-transparent text-sm font-medium text-card-foreground shadow-none focus:ring-0">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((b) => (
                          <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="lg" onClick={scrollToMenu} className="h-11 gap-2 rounded-xl bg-primary-foreground px-6 text-base font-bold text-primary shadow-md transition-transform hover:scale-[1.02] hover:bg-primary-foreground/90 active:scale-[0.98]">
                    Order Now <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-4 border-primary-foreground/10 shadow-2xl lg:aspect-[16/10]">
                <img src={heroPizza} alt="Pizza" width={1280} height={720} className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        <section id="deals" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Value Deals</h2>
              <p className="mt-3 text-base text-muted-foreground">Any time, Any day. The best combos in town.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {REAL_DEALS.map((deal) => (
                <Card key={deal.id} className="group overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
                  {deal.image && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={deal.image} alt={deal.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <CardContent className="flex flex-col flex-grow gap-3 p-5">
                    <h3 className="text-xl font-bold tracking-tight text-card-foreground">{deal.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground flex-grow">{deal.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{formatPrice(deal.price)}</span>
                      <Button size="sm" onClick={() => addToCart({ name: deal.title, price: deal.price })} className="rounded-full px-5 font-semibold shadow-sm">Add</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="menu-section" className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8 bg-secondary/30">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <Badge variant="outline" className="mb-4 w-fit border-primary text-primary uppercase tracking-wider">Full Menu</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Explore Our Menu</h2>
            </div>
            
            {[
              { title: "Signature Pizzas", items: PIZZAS_SIGNATURE },
              { title: "Special Pizzas", items: PIZZAS_SPECIAL },
              { title: "Regular Pizzas", items: PIZZAS_REGULAR },
              { title: "Premium Burgers", items: BURGERS },
              { title: "Wraps, Broast & Sides", items: WRAPS_AND_SIDES },
            ].map((category, idx) => (
              <div key={idx} className="mb-12">
                <h3 className="text-2xl font-bold text-foreground mb-6 border-b-2 border-primary pb-2 inline-block">{category.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item, itemIdx) => (
                    <Card key={itemIdx} className="flex gap-4 items-center p-4 transition-all duration-300 hover:shadow-md relative overflow-hidden border-border/60">
                      {item.badge && <Badge className="absolute top-0 right-0 rounded-bl-lg rounded-tr-none bg-primary text-primary-foreground z-10">{item.badge}</Badge>}
                      <div className="flex-grow">
                        <h4 className="text-lg font-bold text-card-foreground">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-primary">Rs. {item.price}</span>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => addToCart({ name: item.name, price: item.price })}
                            className="rounded-full px-3 hover:bg-primary hover:text-primary-foreground"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CAR T SIDEBAR */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsCartOpen(false)}
      />
      
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isCartOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Your Order</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="hover:bg-secondary rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
              <Pizza className="h-12 w-12 opacity-20" />
              <p>Your cart is empty. Let's add some saucy items!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-3 bg-secondary/30 rounded-xl border border-border/50">
                <div className="flex justify-between font-semibold">
                  <span>{item.name}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">{formatPrice(item.price)} each</span>
                  <div className="flex items-center gap-3 bg-background rounded-full border border-border/50 p-1">
                    <button onClick={() => updateQuantity(item.name, -1)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                      {item.quantity === 1 ? <Trash2 className="h-4 w-4 text-destructive" /> : <Minus className="h-4 w-4" />}
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.name, 1)} className="p-1 hover:bg-secondary rounded-full transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border/50 bg-card">
          <div className="flex justify-between items-center mb-4 text-lg font-bold">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <Link to="/checkout" className="w-full block" onClick={() => setIsCartOpen(false)}>
            <Button className="w-full h-12 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-[0.98]" disabled={cart.length === 0}>
              Checkout
            </Button>
          </Link>
        </div>
      </div>

      {/* NEW: MOBILE NAVIGATION MENU SIDEBAR */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 sm:hidden ${isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <div className={`fixed top-0 right-0 h-full w-[250px] bg-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col sm:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <Pizza className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Menu</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="hover:bg-secondary rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col p-4 gap-6">
          <a href="#deals" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Value Deals</a>
          <a href="#menu-section" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Full Menu</a>
          <Link to="/track" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">Track Order</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function FlameBadge() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-1 h-3.5 w-3.5">
      <path fillRule="evenodd" d="M12 2.25c-1.43 2.64-2.25 5.68-2.25 8.93 0 2.43.64 4.69 1.75 6.66-2.16-1.1-3.75-3.28-3.75-5.91 0-2.84 1.68-5.29 4.09-6.45-.3 1.13-.47 2.32-.47 3.55 0 3.04 1.23 5.79 3.22 7.78A8.955 8.955 0 0 1 12 21.75c-4.97 0-9-4.03-9-9 0-4.42 3.2-8.09 7.4-8.84.34-.06.68.15.78.48.1.33-.05.68-.35.86C8.4 6.54 7.5 8.65 7.5 11.03c0 2.04.87 3.87 2.25 5.16-.6-1.5-.94-3.13-.94-4.84 0-2.92 1.04-5.6 2.78-7.69.22-.27.62-.27.84 0 1.74 2.09 2.78 4.77 2.78 7.69 0 1.71-.34 3.34-.94 4.84 1.38-1.29 2.25-3.12 2.25-5.16 0-2.38-.9-4.49-2.33-6.04-.3-.18-.45-.53-.35-.86.1-.33.44-.54.78-.48 4.2.75 7.4 4.42 7.4 8.84 0 4.97-4.03 9-9 9Z" clipRule="evenodd" />
    </svg>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Pizza className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-foreground">Pizza Saucy</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Pizza Saucy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}