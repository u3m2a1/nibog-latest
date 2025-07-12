"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Download, Mail, FileText, Loader2, Filter, ArrowDown, ArrowUp, Calendar, Search, CheckSquare, Square, MoreHorizontal, Send, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/hooks/use-toast"
import { CertificateListItem } from "@/types/certificate"
import { getAllCertificates } from "@/services/certificateGenerationService"
import { generateCertificatePDF, generateCertificatePDFFrontend, generateBulkPDFs, generateBulkPDFsFrontend } from "@/services/certificatePdfService"
import { sendCertificateEmail } from "@/services/certificateEmailService"
import { EmailCertificateModal } from "@/components/email-certificate-modal"
import { CertificatePreviewModal } from "@/components/certificate-preview-modal"

export default function CertificatesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // State
  const [certificates, setCertificates] = useState<CertificateListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [eventFilter, setEventFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>("generated_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCertificates, setSelectedCertificates] = useState<Set<number>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<{current: number, total: number} | null>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailTarget, setEmailTarget] = useState<CertificateListItem[]>([])
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [previewTarget, setPreviewTarget] = useState<CertificateListItem | null>(null)
  const [emailingCertificates, setEmailingCertificates] = useState<Set<number>>(new Set())
  const itemsPerPage = 10

  // Load certificates
  useEffect(() => {
    loadCertificates()
  }, [eventFilter, statusFilter, page])

  const loadCertificates = async () => {
    try {
      setLoading(true)
      
      const filters: Record<string, any> = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      }
      
      if (eventFilter) {
        filters.eventId = parseInt(eventFilter)
      }
      
      if (statusFilter) {
        filters.status = statusFilter
      }
      
      console.log('Loading certificates with filters:', filters);

      const data = await getAllCertificates(filters)

      // Validate data
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      console.log(`Successfully loaded ${data.length} certificates`);

      // Sort certificates
      const sortedData = [...data].sort((a, b) => {
        const aValue = a[sortField as keyof CertificateListItem]
        const bValue = b[sortField as keyof CertificateListItem]
        
        if (!aValue && !bValue) return 0
        if (!aValue) return 1
        if (!bValue) return -1
        
        const comparison = aValue > bValue ? 1 : -1
        return sortDirection === 'asc' ? comparison : -comparison
      })
      
      setCertificates(sortedData)
      
      // Calculate total pages (assuming we get a count from the API)
      // This is a placeholder - we would need the total count from the API
      setTotalPages(Math.ceil(data.length / itemsPerPage))
    } catch (error) {
      console.error('Error loading certificates:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: "Error Loading Certificates",
        description: errorMessage.includes('Failed to fetch')
          ? "Network error. Please check your connection and try again."
          : errorMessage,
        variant: "destructive"
      })

      // Set empty state on error
      setCertificates([]);
      setTotalPages(1);
    } finally {
      setLoading(false)
    }
  }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Filter certificates by search term
  const filteredCertificates = certificates.filter(cert => {
    const searchTermLower = searchTerm.toLowerCase()
    
    const userName = cert.user_name?.toLowerCase() || ''
    const userEmail = cert.user_email?.toLowerCase() || ''
    const eventTitle = cert.event_title?.toLowerCase() || ''
    const venueName = cert.venue_name?.toLowerCase() || ''
    
    return userName.includes(searchTermLower) || 
           userEmail.includes(searchTermLower) || 
           eventTitle.includes(searchTermLower) || 
           venueName.includes(searchTermLower)
  })

  // Download individual certificate (Frontend-only)
  const handleDownload = async (certificate: CertificateListItem) => {
    try {
      // Generate filename based on participant name and certificate ID
      const participantName = certificate.child_name || certificate.user_name || certificate.parent_name || 'Participant';
      const filename = `${participantName.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate_${certificate.id}.pdf`;

      await generateCertificatePDFFrontend(certificate, filename)
      toast({
        title: "Success",
        description: "Certificate downloaded successfully",
      })
    } catch (error) {
      console.error('Error downloading certificate:', error)
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Email individual certificate
  const handleEmailCertificate = async (certificate: CertificateListItem) => {
    const recipientEmail = certificate.parent_email || certificate.user_email
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "No email address found for this certificate",
        variant: "destructive"
      })
      return
    }

    setEmailingCertificates(prev => new Set(prev).add(certificate.id))

    try {
      const result = await sendCertificateEmail(certificate)

      if (result.success) {
        toast({
          title: "Success",
          description: `Certificate sent successfully to ${recipientEmail}`
        })
      } else {
        toast({
          title: "Error",
          description: `Failed to send certificate: ${result.message}`,
          variant: "destructive"
        })
      }
    } catch (error: any) {
      console.error("Error sending certificate email:", error)
      toast({
        title: "Error",
        description: `Failed to send certificate: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setEmailingCertificates(prev => {
        const newSet = new Set(prev)
        newSet.delete(certificate.id)
        return newSet
      })
    }
  }

  // Download selected certificates as ZIP (Frontend-only)
  const handleBulkDownload = async () => {
    if (selectedCertificates.size === 0) {
      toast({
        title: "No certificates selected",
        description: "Please select at least one certificate to download",
        variant: "destructive"
      })
      return
    }

    try {
      setDownloadProgress({ current: 0, total: selectedCertificates.size })

      // Generate ZIP filename based on date
      const date = new Date().toISOString().split('T')[0]
      const zipFilename = `certificates_${date}.zip`

      // Get the selected certificate objects
      const selectedCerts = filteredCertificates.filter(cert =>
        selectedCertificates.has(cert.id)
      );

      await generateBulkPDFsFrontend(
        selectedCerts,
        zipFilename,
        (current, total) => setDownloadProgress({ current, total })
      )

      toast({
        title: "Success",
        description: `${selectedCerts.length} certificates downloaded as ZIP`,
      })
    } catch (error) {
      console.error('Error downloading certificates as ZIP:', error)
      toast({
        title: "Error",
        description: "Failed to download certificates as ZIP. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDownloadProgress(null)
    }
  }

  // Toggle individual certificate selection
  const toggleCertificateSelection = (id: number) => {
    const newSelected = new Set(selectedCertificates)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedCertificates(newSelected)
    
    // Update selectAll state
    if (newSelected.size === filteredCertificates.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }

  // Toggle select all certificates
  const toggleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedCertificates(new Set())
    } else {
      // Select all filtered certificates
      const allIds = filteredCertificates.map(cert => cert.id)
      setSelectedCertificates(new Set(allIds))
    }
    setSelectAll(!selectAll)
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'downloaded': return 'bg-purple-100 text-purple-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            View and manage all generated certificates
          </p>
        </div>
        
        {/* Bulk Actions */}
        {selectedCertificates.size > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {selectedCertificates.size} selected
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <span>Bulk Actions</span>
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download as ZIP</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Get the selected certificates
                    const selectedCerts = filteredCertificates.filter(cert => 
                      selectedCertificates.has(cert.id)
                    );
                    setEmailTarget(selectedCerts);
                    setIsEmailModalOpen(true);
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Email certificates</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search by name, email, event..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select
                value={eventFilter || "all"}
                onValueChange={(value) => setEventFilter(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {/* This would ideally be populated from an API call to get all events */}
                  <SelectItem value="1">Baby Crawling Championship</SelectItem>
                  <SelectItem value="2">Toddler Race</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="generated">Generated</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="downloaded">Downloaded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex">
              <Button onClick={loadCertificates} className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Certificates</CardTitle>
          <CardDescription>
            Total certificates: {filteredCertificates.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Progress Overlay for Bulk Downloads */}
          {downloadProgress && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-[400px]">
                <CardHeader>
                  <CardTitle>Downloading Certificates</CardTitle>
                  <CardDescription>
                    Preparing {downloadProgress.total} certificates for download
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300" 
                        style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span>{downloadProgress.current} of {downloadProgress.total}</span>
                      <span>{Math.round((downloadProgress.current / downloadProgress.total) * 100)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading certificates...</span>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No certificates found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <div className="flex items-center justify-center">
                          <div 
                            className="cursor-pointer h-5 w-5" 
                            onClick={toggleSelectAll}
                          >
                            {selectAll ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </div>
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('event_title')}
                      >
                        Event
                        {sortField === 'event_title' && (
                          sortDirection === 'asc' ? 
                            <ArrowUp className="ml-1 h-3 w-3 inline" /> : 
                            <ArrowDown className="ml-1 h-3 w-3 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('user_name')}
                      >
                        Recipient
                        {sortField === 'user_name' && (
                          sortDirection === 'asc' ? 
                            <ArrowUp className="ml-1 h-3 w-3 inline" /> : 
                            <ArrowDown className="ml-1 h-3 w-3 inline" />
                        )}
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort('generated_at')}
                      >
                        Generated Date
                        {sortField === 'generated_at' && (
                          sortDirection === 'asc' ? 
                            <ArrowUp className="ml-1 h-3 w-3 inline" /> : 
                            <ArrowDown className="ml-1 h-3 w-3 inline" />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell>
                          <div 
                            className="flex items-center justify-center cursor-pointer" 
                            onClick={() => toggleCertificateSelection(certificate.id)}
                          >
                            {selectedCertificates.has(certificate.id) ? (
                              <CheckSquare className="h-5 w-5 text-primary" />
                            ) : (
                              <Square className="h-5 w-5" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{certificate.event_title || 'Event Name Not Available'}</div>
                          <div className="text-xs text-muted-foreground">{certificate.event_date || ''}</div>
                          <div className="text-xs text-muted-foreground">
                            {certificate.venue_name || ''}
                            {certificate.city_name && certificate.venue_name ? `, ${certificate.city_name}` : certificate.city_name || ''}
                          </div>
                          {certificate.certificate_number && (
                            <div className="text-xs text-muted-foreground">{certificate.certificate_number}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{certificate.child_name || 'Participant Name Not Available'}</div>
                          {certificate.game_name && (
                            <div className="text-xs text-muted-foreground">{certificate.game_name}</div>
                          )}
                          <div className="text-xs text-muted-foreground">{certificate.user_name || 'Parent Name Not Available'}</div>
                          <div className="text-xs text-muted-foreground">{certificate.user_email || 'Email Not Available'}</div>
                        </TableCell>
                        <TableCell>
                          {new Date(certificate.generated_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(certificate.status)}>
                            {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownload(certificate)}
                              title="Download Certificate"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEmailCertificate(certificate)}
                              disabled={emailingCertificates.has(certificate.id)}
                              title="Email Certificate"
                            >
                              {emailingCertificates.has(certificate.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setPreviewTarget(certificate);
                                setIsPreviewModalOpen(true);
                              }}
                              title="Preview Certificate Template"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                              title="View Certificate Details"
                            >
                              <Link href={`/admin/certificates/${certificate.id}`}>
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) setPage(page - 1)
                        }}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNumber = i + 1
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setPage(pageNumber)
                            }}
                            isActive={pageNumber === page}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages) setPage(page + 1)
                        }}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Certificate Modal */}
      <EmailCertificateModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        certificates={emailTarget}
        onSuccess={() => {
          // Refresh certificates list to update status
          loadCertificates();
        }}
      />

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        certificate={previewTarget}
      />
    </div>
  )
}
