"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import CreateProductModal from "@/components/products/CreateProductModal";

interface Product {
  _id: string;
  name: string;
  nameHe?: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  categoryHe?: string;
  available: boolean;
  images: { url: string; isPrimary: boolean }[];
  hasVariants: boolean;
  variants?: any[];
}

export default function MenuTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory !== "all") params.append("category", selectedCategory);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleToggleAvailability = async (productId: string, currentAvailable: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !currentAvailable }),
      });

      if (!response.ok) {
        throw new Error("Failed to update product");
      }

      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product availability");
    }
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">תפריט</h1>
          <p className="text-muted-foreground">
            סה״כ: {products.length} מוצרים
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          מוצר חדש
        </Button>
      </div>

      <CreateProductModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchProducts}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש מוצרים..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
            </div>
            <Button onClick={fetchProducts} variant="outline">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {categories.length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                size="sm"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
              >
                הכל
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product._id} className="overflow-hidden">
            {product.images && product.images.length > 0 && (
              <div className="h-48 bg-muted relative">
                <img
                  src={product.images.find(img => img.isPrimary)?.url || product.images[0].url}
                  alt={product.nameHe || product.name}
                  className="w-full h-full object-cover"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    product.available
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {product.available ? "זמין" : "לא זמין"}
                </Badge>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {product.nameHe || product.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.categoryHe || product.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    ₪{product.price.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}

              {product.hasVariants && product.variants && (
                <Badge variant="outline">
                  {product.variants.length} אפשרויות
                </Badge>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleAvailability(product._id, product.available)}
                  className="flex-1"
                >
                  {product.available ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      הסתר
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      הצג
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">אין מוצרים בתפריט</p>
          <p className="text-sm text-muted-foreground mt-2">
            התחל בהוספת מוצרים לתפריט שלך
          </p>
        </div>
      )}
    </div>
  );
}
