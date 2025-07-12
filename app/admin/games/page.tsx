"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Eye, Plus, Trash, AlertTriangle, Loader2 } from "lucide-react"
import EnhancedDataTable, { Column, TableAction, BulkAction } from "@/components/admin/enhanced-data-table"
import { createGameExportColumns } from "@/lib/export-utils"
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
import { useToast } from "@/components/ui/use-toast"
import { getAllBabyGames, deleteBabyGame } from "@/services/babyGameService"
import { BabyGame } from "@/types"

export default function GameTemplatesPage() {
  const [games, setGames] = useState<BabyGame[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const data = await getAllBabyGames()

        setGames(data)
      } catch (err: any) {
        const errorMsg = err.message || "Failed to fetch games"
        setError(errorMsg)
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchGames()
  }, []) // Removed toast from dependency array to prevent infinite loop

  const handleDeleteGame = async (id: number) => {
    try {
      await deleteBabyGame(id)
      setGames(games.filter(game => game.id !== id))
      toast({
        title: "Game Deleted",
        description: "The game has been deleted successfully.",
        variant: "default",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete game",
        variant: "destructive",
      })
    }
  }

  // Define table columns for EnhancedDataTable
  const columns: Column<any>[] = [
    {
      key: 'game_name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
    },
    {
      key: 'min_age',
      label: 'Age Range',
      sortable: true,
      render: (value, row) => {
        const minAge = row.min_age;
        const maxAge = row.max_age;

        if (minAge && maxAge) {
          // Convert to years if age is in months and > 12
          if (minAge >= 12 && maxAge >= 12) {
            const minYears = Math.floor(minAge / 12);
            const maxYears = Math.floor(maxAge / 12);
            const minMonths = minAge % 12;
            const maxMonths = maxAge % 12;

            if (minMonths === 0 && maxMonths === 0) {
              return `${minYears}-${maxYears} years`;
            } else {
              return `${minAge}-${maxAge} months`;
            }
          } else {
            return `${minAge}-${maxAge} months`;
          }
        } else if (minAge) {
          return `${minAge}+ months`;
        } else if (maxAge) {
          return `Up to ${maxAge} months`;
        } else {
          return 'Not specified';
        }
      }
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      sortable: true,
      render: (value) => `${value} min`
    },
    {
      key: 'categories',
      label: 'Categories',
      render: (value) => {
        // Handle different data types for categories
        let categories: string[] = [];

        if (Array.isArray(value)) {
          categories = value;
        } else if (typeof value === 'string' && value) {
          categories = value.split(',');
        } else if (value) {
          categories = [String(value)];
        }

        return (
          <div className="flex flex-wrap gap-1">
            {categories.map((category: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {String(category).trim()}
              </Badge>
            ))}
          </div>
        );
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
      onClick: (game) => {
        window.location.href = `/admin/games/${game.id}`
      }
    },
    {
      label: "Edit",
      icon: <Edit className="h-4 w-4" />,
      onClick: (game) => {
        window.location.href = `/admin/games/${game.id}/edit`
      }
    },
    {
      label: "Delete",
      icon: <Trash className="h-4 w-4" />,
      onClick: (game) => handleDeleteGame(game.id),
      variant: 'destructive'
    }
  ]

  // Define bulk actions
  const bulkActions: BulkAction<any>[] = [
    {
      label: "Delete Selected",
      icon: <Trash className="h-4 w-4" />,
      onClick: (selectedGames) => {
        // Handle bulk delete - would need confirmation dialog
        console.log("Bulk delete:", selectedGames)
      },
      variant: 'destructive'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">NIBOG Baby Games</h1>
          <p className="text-muted-foreground">Manage baby games for NIBOG Olympic events</p>
        </div>
        <Button asChild>
          <Link href="/admin/games/new">
            <Plus className="mr-2 h-4 w-4" />
            Add New Baby Game
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading games...</span>
        </div>
      ) : error ? (
        <div className="rounded-md bg-destructive/15 p-4 text-center text-destructive">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <EnhancedDataTable
          data={games}
          columns={columns}
          actions={actions}
          bulkActions={bulkActions}
          loading={isLoading}
          searchable={true}
          filterable={true}
          exportable={true}
          selectable={true}
          pagination={true}
          pageSize={25}
          exportColumns={createGameExportColumns()}
          exportTitle="NIBOG Baby Games Report"
          exportFilename="nibog-baby-games"
          emptyMessage="No games found"
          className="min-h-[400px]"
        />
      )}
    </div>
  )
}
