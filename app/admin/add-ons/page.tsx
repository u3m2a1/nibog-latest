"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye, Edit, Trash, Plus, Package, AlertTriangle, BarChart, Loader2, RefreshCw } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { ExportColumn } from "@/lib/export-utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { getAllAddOns, deleteAddOn, AddOn } from "@/services/addOnService"
import { formatPrice } from "@/lib/utils"

export default function AddOnsPage() {
  const { toast } = useToast()
  const [addOnsList, setAddOnsList] = useState<AddOn[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // Fetch add-ons from API
  useEffect(() => {
    const fetchAddOns = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getAllAddOns()
        setAddOnsList(data)
      } catch (error: any) {
        setError(error.message || "Failed to load add-ons. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load add-ons. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAddOns()
  }, [])

  // Handle refresh add-ons
  const handleRefreshAddOns = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await getAllAddOns()
      setAddOnsList(data)

      toast({
        title: "Success",
        description: "Add-ons refreshed successfully",
      })
    } catch (error: any) {
      setError(error.message || "Failed to refresh add-ons. Please try again.")
      toast({
        title: "Error",
        description: "Failed to refresh add-ons. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAddOn = async (id: number) => {
    try {
      setIsDeleting(id)

      await deleteAddOn(id)

      // Update local state
      setAddOnsList(addOnsList.filter(addOn => addOn.id !== id))

      toast({
        title: "Success",
        description: "Add-on deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete add-on. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  // Filter add-ons based on search query and category
  const filteredAddOns = addOnsList.filter(addOn => {
    const matchesSearch = addOn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addOn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addOn.sku?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || addOn.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Calculate summary statistics
  const totalAddOns = addOnsList.length
  const activeAddOns = addOnsList.filter(a => a.is_active).length
  const inactiveAddOns = addOnsList.filter(a => !a.is_active).length
  const totalStock = addOnsList.reduce((sum, a) => {
    if (a.has_variants) {
      return sum + a.variants.reduce((variantSum, v) => variantSum + v.stock_quantity, 0)
    }
    return sum + a.stock_quantity
  }, 0)

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {value}
        </Badge>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value) => `₹${value}`
    },
    {
      key: 'stock_quantity',
      label: 'Stock',
      sortable: true,
      render: (value, row) => {
        if (row.has_variants) {
          const totalStock = row.variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0
          return `${totalStock} (variants)`
        }
        return value?.toString() || '0'
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      )
    }
  ]

  // Define table actions
  const actions: TableAction<any>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (addOn) => {
        window.location.href = `/admin/add-ons/${addOn.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (addOn) => {
        window.location.href = `/admin/add-ons/${addOn.id}/edit`
      }
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (addOn) => handleDeleteAddOn(addOn.id),
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<any>[] = []

  // Define export columns
  const exportColumns: ExportColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    { key: 'stock_quantity', label: 'Stock Quantity' },
    { key: 'is_active', label: 'Status', format: (value) => value ? 'Active' : 'Inactive' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add-ons</h1>
          <p className="text-muted-foreground">Manage add-ons for NIBOG events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefreshAddOns} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/add-ons/analytics">
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/add-ons/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Add-on
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalAddOns}</div>
            <p className="text-xs text-muted-foreground">Total Add-ons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeAddOns}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{inactiveAddOns}</div>
            <p className="text-xs text-muted-foreground">Inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">Total Stock</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search add-ons..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="meal">Meal</SelectItem>
              <SelectItem value="merchandise">Merchandise</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <EnhancedDataTable
        data={filteredAddOns}
        columns={columns}
        actions={actions}
        bulkActions={bulkActions}
        loading={isLoading}
        searchable={false} // We have custom search above
        filterable={false} // We have custom filters above
        exportable={true}
        selectable={true}
        pagination={true}
        pageSize={25}
        exportColumns={exportColumns}
        exportTitle="NIBOG Add-ons Report"
        exportFilename="nibog-add-ons"
        emptyMessage="No add-ons found"
        className="min-h-[400px]"
      />
    </div>
  )
}
