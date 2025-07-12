"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Edit, Trash2, Baby } from "lucide-react"
import { format, differenceInMonths } from "date-fns"
import { cn } from "@/lib/utils"
import { formatAge } from "@/lib/age-calculation"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Mock data - in a real app, this would come from an API
const children = [
  {
    id: "1",
    name: "Aryan",
    dob: "2023-02-15",
    notes: "Loves music and bright colors. Allergic to peanuts.",
    createdAt: "2023-03-01",
  },
  {
    id: "2",
    name: "Zara",
    dob: "2023-06-10",
    notes: "Very active, enjoys physical activities.",
    createdAt: "2023-07-01",
  },
]

export default function ChildrenPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedChild, setSelectedChild] = useState<any>(null)
  
  const [newChildName, setNewChildName] = useState("")
  const [newChildDob, setNewChildDob] = useState<Date>()
  const [newChildNotes, setNewChildNotes] = useState("")
  
  const [editChildName, setEditChildName] = useState("")
  const [editChildDob, setEditChildDob] = useState<Date>()
  const [editChildNotes, setEditChildNotes] = useState("")

  // Calculate age in months
  const getAgeInMonths = (dobString: string) => {
    const dob = new Date(dobString)
    const now = new Date()
    return differenceInMonths(now, dob)
  }

  // Handle add child form submission
  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!newChildName || !newChildDob) {
      alert("Please fill in all required fields.")
      return
    }
    
    // In a real app, this would be an API call to add the child
    console.log({
      name: newChildName,
      dob: newChildDob ? format(newChildDob, "yyyy-MM-dd") : "",
      notes: newChildNotes,
    })
    
    // Reset form and close dialog
    setNewChildName("")
    setNewChildDob(undefined)
    setNewChildNotes("")
    setIsAddDialogOpen(false)
  }

  // Handle edit child form submission
  const handleEditChild = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!editChildName || !editChildDob) {
      alert("Please fill in all required fields.")
      return
    }
    
    // In a real app, this would be an API call to update the child
    console.log({
      id: selectedChild?.id,
      name: editChildName,
      dob: editChildDob ? format(editChildDob, "yyyy-MM-dd") : "",
      notes: editChildNotes,
    })
    
    // Reset form and close dialog
    setSelectedChild(null)
    setEditChildName("")
    setEditChildDob(undefined)
    setEditChildNotes("")
    setIsEditDialogOpen(false)
  }

  // Handle delete child
  const handleDeleteChild = (childId: string) => {
    // In a real app, this would be an API call to delete the child
    console.log("Delete child:", childId)
  }

  // Open edit dialog with child data
  const openEditDialog = (child: any) => {
    setSelectedChild(child)
    setEditChildName(child.name)
    setEditChildDob(new Date(child.dob))
    setEditChildNotes(child.notes || "")
    setIsEditDialogOpen(true)
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Children</h1>
          <p className="text-muted-foreground">Manage your children's profiles</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Child
        </Button>
      </div>

      {children.length === 0 ? (
        <div className="flex h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Baby className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No Children Added Yet</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Add your child's profile to book age-appropriate events.
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Child
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => {
            const ageInMonths = getAgeInMonths(child.dob)
            
            return (
              <Card key={child.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardTitle>{child.name}</CardTitle>
                  <CardDescription>
                    {format(new Date(child.dob), "PPP")} ({formatAge(ageInMonths)})
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {child.notes && (
                    <p className="text-sm text-muted-foreground">{child.notes}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-4">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(child)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Child Profile</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {child.name}'s profile? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={() => handleDeleteChild(child.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Child Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Child</DialogTitle>
            <DialogDescription>
              Add your child's details to book age-appropriate events.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddChild}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child's Name</Label>
                <Input
                  id="childName"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  placeholder="Enter your child's name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newChildDob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newChildDob ? format(newChildDob, "PPP") : "Select date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newChildDob}
                      onSelect={setNewChildDob}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="childNotes">Notes (Optional)</Label>
                <Textarea
                  id="childNotes"
                  value={newChildNotes}
                  onChange={(e) => setNewChildNotes(e.target.value)}
                  placeholder="Any allergies, preferences, or special needs"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Child</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Child Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Child</DialogTitle>
            <DialogDescription>
              Update your child's details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditChild}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editChildName">Child's Name</Label>
                <Input
                  id="editChildName"
                  value={editChildName}
                  onChange={(e) => setEditChildName(e.target.value)}
                  placeholder="Enter your child's name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editChildDob && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editChildDob ? format(editChildDob, "PPP") : "Select date of birth"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editChildDob}
                      onSelect={setEditChildDob}
                      initialFocus
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editChildNotes">Notes (Optional)</Label>
                <Textarea
                  id="editChildNotes"
                  value={editChildNotes}
                  onChange={(e) => setEditChildNotes(e.target.value)}
                  placeholder="Any allergies, preferences, or special needs"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
