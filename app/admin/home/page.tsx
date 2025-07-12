"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react"

export default function HomeSection() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageMeta, setImageMeta] = useState<any[]>([])
  
  
  useEffect(() => {
    // Fetch all uploaded images from external API, limit to 50 for safety
    fetch("https://ai.alviongs.com/webhook/v1/nibog/homesection/get")
      .then(res => res.json())
      .then((data) => {
        const safeData = Array.isArray(data) ? data.slice(0, 50) : []
        setImageMeta(safeData)
        setImageUrls(
          safeData.map((img: any) => {
            if (!img?.image_path) return ""
            // Convert "public/images/blog/home/filename" to "/images/blog/home/filename"
            const rel = img.image_path.replace(/^public/, "")
            return rel.startsWith("/") ? rel : "/" + rel
          }).filter(Boolean)
        )
      })
      .catch(() => {
        setImageMeta([])
        setImageUrls([])
      })
  }, [])
  
    // Handle file input change
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files) return
      const fileArr = Array.from(files)
      setSelectedFiles((prev) => [...prev, ...fileArr])
    }
  
    // Remove image by index (removes from preview list, not server)
    const handleDelete = async (idx: number) => {
      const meta = imageMeta[idx]
      if (!meta?.id) return
      if (!window.confirm("Delete this image from the slider?")) return
      try {
        const resp = await fetch("https://ai.alviongs.com/webhook/v1/nibog/homesection/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: meta.id })
        })
        const result = await resp.json()
        if (Array.isArray(result) && result[0]?.success) {
          setImageMeta((prev) => prev.filter((_, i) => i !== idx))
          setImageUrls((prev) => prev.filter((_, i) => i !== idx))
          toast({
            title: "Deleted",
            description: "Image deleted successfully.",
          })
        } else {
          throw new Error("Delete failed")
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete image.",
          variant: "destructive",
        })
      }
    }

  // Drag and drop reordering
  const handleDragStart = (idx: number) => {
    setDraggingIdx(idx)
  }
  const handleDragOver = (idx: number) => {
    if (draggingIdx === null || draggingIdx === idx) return
    const newUrls = [...imageUrls]
    const [draggedUrl] = newUrls.splice(draggingIdx, 1)
    newUrls.splice(idx, 0, draggedUrl)
    setImageUrls(newUrls)
    setDraggingIdx(idx)
  }
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null)
  const handleDragEnd = () => setDraggingIdx(null)

  // Upload images to server and update preview list
  const handleSave = async () => {
    if (selectedFiles.length === 0) return
    setIsLoading(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append("files", file))
      const res = await fetch("/api/home-hero/upload-images", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success && data.files) {
        setImageUrls((prev) => [...prev, ...data.files.map((f: any) => f.url)])
        setSelectedFiles([])

        // Send each uploaded image to external API
        await Promise.all(
          data.files.map(async (f: any) => {
            // Extract filename and build correct API path
            // Use absolute image URL for payload
            const filename = f.url.split("/").pop();
            const rel_path = `public/images/blog/home/${filename}`;
            try {
              const resp = await fetch("https://ai.alviongs.com/webhook/v1/nibog/homesection/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  image_path: rel_path,
                  status: "active"
                })
              });
              if (!resp.ok) throw new Error("Webhook API error");
            } catch (err) {
              toast({
                title: "Warning",
                description: `Failed to notify external API for ${rel_path}`,
                variant: "destructive",
              });
            }
          })
        );

        toast({
          title: "Success!",
          description: "Images uploaded and synced successfully.",
        })
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload images.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-0">
      <div className="w-full">
        <div className="mb-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-2 w-full text-center">Home Hero Image Slider Manager</h1>
          <p className="text-base text-gray-600 w-full text-center">Upload, preview, reorder, and manage your homepage hero images.</p>
        </div>
        <Card className="shadow border-blue-100 w-full">
          <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 w-full">
            <CardTitle className="text-xl font-semibold text-blue-800">Image Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 w-full">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="md:w-1/2 w-full"
              />
              <Button
                onClick={handleSave}
                disabled={isLoading || selectedFiles.length === 0}
                className="w-full md:w-auto"
              >
                {isLoading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white w-full">
              <table className="min-w-full w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-left text-blue-900">Preview</th>
                    <th className="px-4 py-3 font-semibold text-left text-blue-900">Filename</th>
                    <th className="px-4 py-3 font-semibold text-left text-blue-900">Size</th>
                    <th className="px-4 py-3 font-semibold text-center text-blue-900">Order</th>
                    <th className="px-4 py-3 font-semibold text-center text-blue-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {imageUrls.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        No images uploaded yet.
                      </td>
                    </tr>
                  ) : (
                    imageUrls.map((src, idx) => {
                      // Extract filename and fake size (since we don't store it, show N/A)
                      const filename = src.split("/").pop() || "N/A"
                      return (
                        <tr
                          key={idx}
                          className={`transition ${draggingIdx === idx ? "bg-blue-50" : ""}`}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => {
                            e.preventDefault()
                            handleDragOver(idx)
                          }}
                          onDragEnd={handleDragEnd}
                        >
                          <td className="px-4 py-2">
                            <img
                              src={src}
                              alt={`Hero ${idx + 1}`}
                              className="w-28 h-16 object-cover rounded border"
                            />
                          </td>
                          <td className="px-4 py-2">{filename}</td>
                          <td className="px-4 py-2">N/A</td>
                          <td className="px-4 py-2 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="p-1"
                                disabled={idx === 0}
                                onClick={() => {
                                  if (idx > 0) {
                                    const newUrls = [...imageUrls]
                                    const temp = newUrls[idx - 1]
                                    newUrls[idx - 1] = newUrls[idx]
                                    newUrls[idx] = temp
                                    setImageUrls(newUrls)
                                  }
                                }}
                                title="Move Up"
                              >
                                <ArrowUp className="h-5 w-5 text-blue-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="p-1"
                                disabled={idx === imageUrls.length - 1}
                                onClick={() => {
                                  if (idx < imageUrls.length - 1) {
                                    const newUrls = [...imageUrls]
                                    const temp = newUrls[idx + 1]
                                    newUrls[idx + 1] = newUrls[idx]
                                    newUrls[idx] = temp
                                    setImageUrls(newUrls)
                                  }
                                }}
                                title="Move Down"
                              >
                                <ArrowDown className="h-5 w-5 text-blue-600" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Button
                              size="icon"
                              variant="destructive"
                              className="p-1"
                              onClick={() => {
                                if (window.confirm("Delete this image from the slider?")) handleDelete(idx)
                              }}
                              title="Delete"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}





