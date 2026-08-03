import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { ChevronLeft, Plus, Trash2, Tag, Edit3, Settings, X, Save, LayoutList } from "lucide-react";

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
  badge: string | null;
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
  const [activeTab, setActiveTab] = useState<"edit" | "add">("edit");
  
  // State for Add Form
  const [isAdding, setIsAdding] = useState(false);
  const [addCategory, setAddCategory] = useState(CATEGORIES[0]);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addBadge, setAddBadge] = useState("");

  // State for Inline Editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ category: "", name: "", description: "", price: "", badge: "" });
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Add Item Logic
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!addName || !addPrice) return;
    setIsAdding(true);

    const newItem = {
      category: addCategory,
      name: addName,
      description: addDescription,
      price: parseFloat(addPrice),
      badge: addBadge.trim() || null,
      is_active: true,
    };

    const { error } = await supabase.from("menu_items").insert([newItem]);

    if (error) {
      alert("Error adding item: " + error.message);
    } else {
      setAddName("");
      setAddDescription("");
      setAddPrice("");
      setAddBadge("");
      fetchItems();
      setActiveTab("edit"); // Auto-switch back to view the new item
    }
    setIsAdding(false);
  }

  // Setup Inline Edit Mode
  function startEditing(item: MenuItem) {
    setEditingId(item.id);
    setEditForm({
      category: item.category,
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      badge: item.badge || ""
    });
  }

  // Update Item Logic
  async function handleUpdateItem(id: string) {
    if (!editForm.name || !editForm.price) return;
    setIsUpdating(true);

    const updatedData = {
      category: editForm.category,
      name: editForm.name,
      description: editForm.description,
      price: parseFloat(editForm.price),
      badge: editForm.badge.trim() || null,
    };

    const { error } = await supabase
      .from("menu_items")
      .update(updatedData)
      .eq("id", id);

    if (error) {
      alert("Error updating item: " + error.message);
    } else {
      setEditingId(null);
      fetchItems();
    }
    setIsUpdating(false);
  }

  // Delete Item Logic
  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (!error) {
      setItems(items.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* HEADER SECTION - EXACTLY LIKE ADMIN PANEL */}
      <header className="w-full bg-[#111827] border-b border-border/10 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-red-500" />
            <span className="font-bold text-lg tracking-wide">Menu CMS Portal</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium bg-slate-900/50 p-1 rounded-full border border-slate-700">
            <button
              onClick={() => { setActiveTab("edit"); setEditingId(null); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${
                activeTab === "edit" ? "bg-red-500 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <LayoutList className="w-4 h-4" /> Manage & Edit
            </button>
            <button
              onClick={() => { setActiveTab("add"); setEditingId(null); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors ${
                activeTab === "add" ? "bg-red-500 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Plus className="w-4 h-4" /> Add New Item
            </button>
            <div className="w-px h-5 bg-slate-700 mx-1"></div>
            <Link to="/" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Store
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* ADD NEW ITEM SECTION */}
        {activeTab === "add" && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="border-border/60 shadow-xl bg-background rounded-3xl overflow-hidden">
              <CardHeader className="bg-secondary/40 border-b border-border/50 pb-4">
                <CardTitle className="text-xl font-black text-foreground flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" /> Add New Menu Item
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddItem} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                    <Select value={addCategory} onValueChange={setAddCategory}>
                      <SelectTrigger className="h-12 bg-secondary/20 border-border/60 rounded-xl">
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
                      className="h-12 bg-secondary/20 border-border/60 rounded-xl font-medium"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                    <Input 
                      placeholder="e.g. Medium: 1650 | Large: 2400" 
                      className="h-12 bg-secondary/20 border-border/60 rounded-xl text-sm"
                      value={addDescription}
                      onChange={(e) => setAddDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price (Rs.)</label>
                      <Input 
                        required 
                        type="number"
                        placeholder="1650" 
                        className="h-12 bg-secondary/20 border-border/60 rounded-xl font-bold text-primary"
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Badge (Optional)</label>
                      <Input 
                        placeholder="e.g. NEW" 
                        className="h-12 bg-secondary/20 border-border/60 rounded-xl"
                        value={addBadge}
                        onChange={(e) => setAddBadge(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isAdding}
                    className="w-full h-14 mt-4 text-lg font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg transition-transform active:scale-[0.98]"
                  >
                    {isAdding ? "Adding Item..." : "Publish to Menu"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MANAGE & EDIT SECTION */}
        {activeTab === "edit" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground font-medium">Loading menu database...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-border/50 shadow-sm">
                <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-bold text-foreground">Your Menu is Empty</h3>
                <p className="text-muted-foreground mt-2">Switch to the "Add New Item" tab to start building your menu.</p>
              </div>
            ) : (
              CATEGORIES.map((cat) => {
                const categoryItems = items.filter(item => item.category === cat);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-4">
                    <h3 className="text-xl font-black text-slate-800 border-b-2 border-primary/20 pb-2 inline-block">{cat}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryItems.map((item) => {
                        
                        // IF ITEM IS IN EDIT MODE
                        if (editingId === item.id) {
                          return (
                            <Card key={item.id} className="relative overflow-hidden border-primary ring-2 ring-primary/40 shadow-lg bg-secondary/10 rounded-2xl">
                              <CardContent className="p-4 flex flex-col gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Name</label>
                                  <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="h-8 text-sm font-bold bg-white" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                                  <Input value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} className="h-8 text-xs bg-white" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Price</label>
                                    <Input type="number" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} className="h-8 text-sm font-bold text-primary bg-white" />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Badge</label>
                                    <Input placeholder="e.g. NEW" value={editForm.badge} onChange={(e) => setEditForm({...editForm, badge: e.target.value})} className="h-8 text-xs bg-white" />
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <Button onClick={() => handleUpdateItem(item.id)} disabled={isUpdating} className="flex-1 h-9 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-sm">
                                    <Save className="w-4 h-4 mr-1.5" /> Save
                                  </Button>
                                  <Button onClick={() => setEditingId(null)} variant="outline" className="flex-1 h-9 rounded-lg border-slate-300">
                                    Cancel
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        }

                        // STANDARD VIEW MODE
                        return (
                          <Card key={item.id} className="relative overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-all bg-white rounded-2xl group flex flex-col justify-between">
                            {item.badge && (
                              <Badge className="absolute top-0 right-0 rounded-bl-lg rounded-tr-none bg-primary text-white z-10 text-[10px] uppercase font-black tracking-wider">
                                {item.badge}
                              </Badge>
                            )}
                            <CardContent className="p-5 flex flex-col flex-grow justify-between gap-4">
                              <div>
                                <h4 className="font-bold text-foreground text-lg leading-tight pr-8">{item.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                              </div>
                              
                              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <span className="text-xl font-black text-primary">{formatPrice(item.price)}</span>
                                
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => startEditing(item)}
                                    className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                                    title="Edit Price & Details"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                    title="Delete Item"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </main>
    </div>
  );
}