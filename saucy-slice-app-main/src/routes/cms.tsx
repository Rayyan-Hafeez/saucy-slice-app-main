import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ChevronLeft, Pizza, Plus, Trash2, Tag, Edit3, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/cms")({
  component: MenuCMS,
});

type MenuItem = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  badge: string;
  is_active: boolean;
};

const CATEGORIES = [
  "Value Deals",
  "Signature Pizzas",
  "Special Pizzas",
  "Regular Pizzas",
  "Premium Burgers",
  "Wraps & Sides",
];

function formatPrice(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-PK")}`;
}

function MenuCMS() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [badge, setBadge] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !price) return;
    setIsSubmitting(true);

    const newItem = {
      category,
      name,
      description,
      price: parseFloat(price),
      badge: badge.trim() || null,
      is_active: true,
    };

    const { error } = await supabase.from("menu_items").insert([newItem]);

    if (error) {
      alert("Error adding item: " + error.message);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setBadge("");
      fetchItems(); // Refresh list
    }
    setIsSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (!error) {
      setItems(items.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <header className="w-full bg-[#1e293b] border-b border-border/50 p-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center text-white">
          <Link to="/" className="flex items-center text-slate-300 hover:text-white transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Store
          </Link>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg tracking-wide">Menu CMS Portal</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ADD NEW ITEM FORM */}
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <Card className="border-border/60 shadow-lg bg-background rounded-3xl overflow-hidden">
            <CardHeader className="bg-secondary/40 border-b border-border/50 pb-4">
              <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Add Menu Item
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-11 bg-secondary/20 border-border/60 rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Item Name</label>
                  <Input 
                    required 
                    placeholder="e.g. Extreme Double Layer" 
                    className="h-11 bg-secondary/20 border-border/60 rounded-xl font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                  <Input 
                    placeholder="e.g. Medium: 1650 | Large: 2400" 
                    className="h-11 bg-secondary/20 border-border/60 rounded-xl text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (Rs.)</label>
                    <Input 
                      required 
                      type="number"
                      placeholder="1650" 
                      className="h-11 bg-secondary/20 border-border/60 rounded-xl font-bold text-primary"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Badge (Optional)</label>
                    <Input 
                      placeholder="e.g. NEW" 
                      className="h-11 bg-secondary/20 border-border/60 rounded-xl"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 mt-2 font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md"
                >
                  {isSubmitting ? "Saving..." : "Save to Menu"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* MENU ITEMS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Pizza className="w-6 h-6 text-primary" /> Live Menu Database
            </h2>
            <Badge variant="outline" className="text-muted-foreground bg-white font-bold">
              {items.length} Items
            </Badge>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading menu items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-border/50 shadow-sm">
              <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <h3 className="text-lg font-bold text-foreground">Menu is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">Start adding items from the panel to build your menu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {CATEGORIES.map((cat) => {
                const categoryItems = items.filter(item => item.category === cat);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={cat} className="mb-6 space-y-3">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-border/60 pb-2">{cat}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoryItems.map((item) => (
                        <Card key={item.id} className="relative overflow-hidden border-border/60 shadow-sm bg-white rounded-2xl group">
                          {item.badge && (
                            <Badge className="absolute top-0 right-0 rounded-bl-lg rounded-tr-none bg-primary text-white z-10 text-[10px]">
                              {item.badge}
                            </Badge>
                          )}
                          <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div>
                              <div className="flex justify-between items-start gap-2 pr-8">
                                <h4 className="font-bold text-foreground leading-tight">{item.name}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                              <span className="font-black text-primary">{formatPrice(item.price)}</span>
                              
                              <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}