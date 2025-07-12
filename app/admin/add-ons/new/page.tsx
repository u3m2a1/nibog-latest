"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash, X, Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createAddOn, CreateAddOnRequest, uploadAddOnImages } from "@/services/addOnService"

interface AddOnVariant {
  id: string;
  name: string;
  price_modifier: number;
  sku: string;
  stock_quantity: number;
}

export default function NewAddOnPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState<"meal" | "merchandise" | "service" | "other">("other")
  const [isActive, setIsActive] = useState(true)
  const [sku, setSku] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<AddOnVariant[]>([])
  const [images, setImages] = useState<string[]>([])
  const [hasBundleDiscount, setHasBundleDiscount] = useState(false)
  const [minQuantity, setMinQuantity] = useState(2)
  const [discountPercentage, setDiscountPercentage] = useState(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  // New variant form state
  const [newVariantName, setNewVariantName] = useState("")
  const [newVariantPriceModifier, setNewVariantPriceModifier] = useState(0)
  const [newVariantSku, setNewVariantSku] = useState("")
  const [newVariantStock, setNewVariantStock] = useState(0)

  const handleAddVariant = () => {
    if (newVariantName.trim() && newVariantSku.trim()) {
      const newVariant: AddOnVariant = {
        id: `variant-${Date.now()}`,
        name: newVariantName.trim(),
        price_modifier: newVariantPriceModifier,
        sku: newVariantSku.trim(),
        stock_quantity: newVariantStock
      }

      setVariants([...variants, newVariant])

      // Reset form
      setNewVariantName("")
      setNewVariantPriceModifier(0)
      setNewVariantSku("")
      setNewVariantStock(0)
    }
  }

  const handleRemoveVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id))
  }

  const handleAddImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        try {
          // Show loading state
          const fileArray = Array.from(files)

          // Upload files to server
          const uploadedUrls = await uploadAddOnImages(fileArray)

          // Add the URLs to the images state
          setImages(prev => [...prev, ...uploadedUrls])

          toast({
            title: "Success",
            description: `${fileArray.length} image(s) uploaded successfully`,
          })
        } catch (error: any) {
          console.error('Error uploading images:', error)
          toast({
            title: "Upload Error",
            description: error.message || "Failed to upload images. Please try again.",
            variant: "destructive",
          })
        }
      }
    }

    input.click()
  }

  // Auto-navigate to next tab when hasVariants changes
  const handleHasVariantsChange = (checked: boolean) => {
    setHasVariants(checked)
    if (checked) {
      // Auto-navigate to images tab when variants is enabled
      setActiveTab("images")
    }
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    setImages(updatedImages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Add-on name is required",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    if (!description.trim()) {
      toast({
        title: "Validation Error",
        description: "Add-on description is required",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    if (price <= 0) {
      toast({
        title: "Validation Error",
        description: "Add-on price must be greater than 0",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    if (hasVariants && variants.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one variant or disable 'Has Variants'",
        variant: "destructive",
      })
      setActiveTab("variants")
      return
    }

    if (!hasVariants && !sku.trim()) {
      toast({
        title: "Validation Error",
        description: "SKU is required when not using variants",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    if (!hasVariants && (Number(stockQuantity) <= 0 || stockQuantity === "")) {
      toast({
        title: "Validation Error",
        description: "Stock quantity must be greater than 0 when not using variants",
        variant: "destructive",
      })
      setActiveTab("details")
      return
    }

    try {
      setIsSubmitting(true)

      // Prepare the request data - EXACT format matching your n8n workflow
      const requestData: any = {
        name,
        description,
        price,
        category,
        images,
        isActive,
        hasVariants,
        variants: hasVariants && variants.length > 0 ? variants.map(v => ({
          name: v.name,
          price_modifier: v.price_modifier,
          sku: v.sku,
          stock_quantity: v.stock_quantity
        })) : [],
        stock_quantity: Number(stockQuantity) || 0, // Convert string to number
        sku: hasVariants ? `${name.replace(/\s+/g, '-').toUpperCase()}-BASE`.substring(0, 50) : sku,
        bundleDiscount: hasBundleDiscount ? {
          minQuantity,
          discountPercentage
        } : {
          minQuantity: 0,
          discountPercentage: 0
        }
      }

      await createAddOn(requestData)

      toast({
        title: "Success",
        description: "Add-on created successfully",
      })

      // Redirect to the add-ons list
      router.push("/admin/add-ons")
    } catch (error: any) {

      let errorMessage = "Failed to create add-on. Please try again.";

      if (error.message.includes('400')) {
        errorMessage = "Invalid data provided. Please check all required fields.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes('503') || error.message.includes('504')) {
        errorMessage = "Service temporarily unavailable. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/add-ons">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Add-on</h1>
          <p className="text-muted-foreground">Create a new add-on for NIBOG events</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Basic Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="variants" disabled={!hasVariants}>Variants</TabsTrigger>
            <TabsTrigger value="pricing">Pricing & Discounts</TabsTrigger>
          </TabsList>
          
          {/* Basic Details Tab */}
          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Add-on Details</CardTitle>
                <CardDescription>Enter the basic information for the new add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter add-on name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter add-on description"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as any)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meal">Meal</SelectItem>
                        <SelectItem value="merchandise">Merchandise</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price || ""}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-variants">Has Variants</Label>
                    <Switch
                      id="has-variants"
                      checked={hasVariants}
                      onCheckedChange={handleHasVariantsChange}
                    />
                  </div>
                  
                  {!hasVariants && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                          id="sku"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          placeholder="Enter SKU"
                          required={!hasVariants}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          required={!hasVariants}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div></div>
                <Button
                  type="button"
                  onClick={() => setActiveTab("images")}
                  variant="outline"
                >
                  Next: Images →
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Images Tab */}
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Add-on Images</CardTitle>
                <CardDescription>Add images for the new add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image
                        src={image}
                        alt={`${name || "Add-on"} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 rounded-full"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="flex aspect-square h-full w-full flex-col items-center justify-center rounded-md border border-dashed"
                    onClick={handleAddImage}
                    type="button"
                  >
                    <Upload className="mb-2 h-6 w-6" />
                    <span>Add Image</span>
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  variant="outline"
                >
                  ← Back: Details
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab(hasVariants ? "variants" : "pricing")}
                  variant="outline"
                >
                  {hasVariants ? "Next: Variants →" : "Next: Pricing →"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Variants Tab */}
          <TabsContent value="variants">
            <Card>
              <CardHeader>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>Add variants for this add-on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price Modifier</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Final Price</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">{variant.name}</TableCell>
                          <TableCell>{variant.sku}</TableCell>
                          <TableCell>
                            {variant.price_modifier === 0 ? (
                              <span className="text-muted-foreground">Base price</span>
                            ) : (
                              <span className={variant.price_modifier > 0 ? "text-green-600" : "text-red-600"}>
                                {variant.price_modifier > 0 ? "+" : ""}₹{variant.price_modifier}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{variant.stock_quantity}</TableCell>
                          <TableCell>
                            ₹{(price + variant.price_modifier).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveVariant(variant.id)}
                              type="button"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {variants.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            <p className="text-muted-foreground">No variants added yet</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Add New Variant</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="variant-name">Variant Name</Label>
                        <Input
                          id="variant-name"
                          value={newVariantName}
                          onChange={(e) => setNewVariantName(e.target.value)}
                          placeholder="e.g., Small - Red"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-sku">SKU</Label>
                        <Input
                          id="variant-sku"
                          value={newVariantSku}
                          onChange={(e) => setNewVariantSku(e.target.value)}
                          placeholder="e.g., TS-S-RED"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-price-modifier">Price Modifier (₹)</Label>
                        <Input
                          id="variant-price-modifier"
                          type="number"
                          step="0.01"
                          value={newVariantPriceModifier || ""}
                          onChange={(e) => setNewVariantPriceModifier(parseFloat(e.target.value) || 0)}
                          placeholder="0 for base price"
                        />
                        <p className="text-xs text-muted-foreground">
                          Amount to add/subtract from base price (use negative for discount)
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="variant-stock">Stock Quantity</Label>
                        <Input
                          id="variant-stock"
                          type="number"
                          min="0"
                          value={newVariantStock || ""}
                          onChange={(e) => setNewVariantStock(parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>


                  </CardContent>
                  <CardFooter>
                    <Button
                      type="button"
                      onClick={handleAddVariant}
                      disabled={!newVariantName.trim() || !newVariantSku.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Variant
                    </Button>
                  </CardFooter>
                </Card>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => setActiveTab("images")}
                  variant="outline"
                >
                  ← Back: Images
                </Button>
                <Button
                  type="button"
                  onClick={() => setActiveTab("pricing")}
                  variant="outline"
                >
                  Next: Pricing →
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Pricing & Discounts Tab */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Discounts</CardTitle>
                <CardDescription>Set up pricing and discount options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="has-bundle-discount">Bundle Discount</Label>
                    <Switch
                      id="has-bundle-discount"
                      checked={hasBundleDiscount}
                      onCheckedChange={setHasBundleDiscount}
                    />
                  </div>
                  
                  {hasBundleDiscount && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="min-quantity">Minimum Quantity</Label>
                        <Input
                          id="min-quantity"
                          type="number"
                          min="2"
                          value={minQuantity}
                          onChange={(e) => setMinQuantity(parseInt(e.target.value) || 2)}
                          required={hasBundleDiscount}
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum quantity required to apply the discount
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount-percentage">Discount Percentage (%)</Label>
                        <Input
                          id="discount-percentage"
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(parseInt(e.target.value) || 0)}
                          required={hasBundleDiscount}
                        />
                        <p className="text-xs text-muted-foreground">
                          Percentage discount to apply when minimum quantity is reached
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => setActiveTab(hasVariants ? "variants" : "images")}
                  variant="outline"
                >
                  {hasVariants ? "← Back: Variants" : "← Back: Images"}
                </Button>
                <div className="text-sm text-muted-foreground">
                  Ready to create add-on
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/add-ons")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Add-on"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
