"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function EmailSendingPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Email state
  const [emailData, setEmailData] = useState({
    subject: "",
    content: "",
    recipients: "all-users", // all-users, all-parents, event-parents, event-users, event-all-users
    attachments: [],
    template: "default",
    eventId: "",
  })
  
  // Template state
  const [templateData, setTemplateData] = useState({
    name: "",
    subject: "",
    content: "",
  })

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Success!",
        description: "Email sent successfully.",
      })
      
      // Reset form after successful send
      setEmailData({
        subject: "",
        content: "",
        recipients: "all-users",
        attachments: [],
        template: "default",
        eventId: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send email.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success!",
        description: "Email template saved successfully.",
      })
      
      // Reset form after successful save
      setTemplateData({
        name: "",
        subject: "",
        content: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save template.",
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
          <h1 className="text-3xl font-bold text-blue-900 mb-2 w-full text-center flex items-center justify-center gap-2">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#e0e7ef"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
            Email Management
          </h1>
        </div>
        <Tabs defaultValue="send">
          <TabsList className="mb-4 w-full flex flex-wrap gap-2">
            <TabsTrigger value="send" className="flex-1">Send Email</TabsTrigger>
            <TabsTrigger value="templates" className="flex-1">Email Templates</TabsTrigger>
          </TabsList>
          <TabsContent value="send">
            <Card className="w-full shadow border-blue-100">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 w-full">
                <CardTitle className="text-xl font-semibold text-blue-800">Send Email</CardTitle>
                <CardDescription>Compose and send emails to users</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-6 w-full">
                  <div className="space-y-2">
                    <Label>Recipients</Label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipients-all-users"
                          checked={emailData.recipients === "all-users"}
                          onCheckedChange={() => setEmailData({...emailData, recipients: "all-users"})}
                        />
                        <Label htmlFor="recipients-all-users">All Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipients-all-parents"
                          checked={emailData.recipients === "all-parents"}
                          onCheckedChange={() => setEmailData({...emailData, recipients: "all-parents"})}
                        />
                        <Label htmlFor="recipients-all-parents">All Parents</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipients-event-parents"
                          checked={emailData.recipients === "event-parents"}
                          onCheckedChange={() => setEmailData({...emailData, recipients: "event-parents"})}
                        />
                        <Label htmlFor="recipients-event-parents">Event Parents</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipients-event-users"
                          checked={emailData.recipients === "event-users"}
                          onCheckedChange={() => setEmailData({...emailData, recipients: "event-users"})}
                        />
                        <Label htmlFor="recipients-event-users">Event Users</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recipients-event-all-users"
                          checked={emailData.recipients === "event-all-users"}
                          onCheckedChange={() => setEmailData({...emailData, recipients: "event-all-users"})}
                        />
                        <Label htmlFor="recipients-event-all-users">Event All Users</Label>
                      </div>
                    </div>
                    {(emailData.recipients === "event-parents" ||
                      emailData.recipients === "event-users" ||
                      emailData.recipients === "event-all-users") && (
                      <div className="mt-4">
                        <Label htmlFor="event-select">Select Event</Label>
                        <Select
                          value={emailData.eventId}
                          onValueChange={(value) => setEmailData({...emailData, eventId: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* TODO: Replace with dynamic event list */}
                            <SelectItem value="1">Event 1</SelectItem>
                            <SelectItem value="2">Event 2</SelectItem>
                            <SelectItem value="3">Event 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-template">Email Template</Label>
                    <Select
                      value={emailData.template}
                      onValueChange={(value) => setEmailData({...emailData, template: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Template</SelectItem>
                        <SelectItem value="newsletter">Newsletter Template</SelectItem>
                        <SelectItem value="event-reminder">Event Reminder</SelectItem>
                        <SelectItem value="custom">Custom (No Template)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto mt-4">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/></svg>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" opacity="0.1"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
                        Send Email
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="templates">
            <Card className="w-full shadow border-blue-100">
              <CardHeader className="bg-blue-50 rounded-t-lg border-b border-blue-100 w-full">
                <CardTitle className="text-xl font-semibold text-blue-800">Email Templates</CardTitle>
                <CardDescription>Create and manage email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveTemplate} className="space-y-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={templateData.name}
                        onChange={(e) => setTemplateData({...templateData, name: e.target.value})}
                        placeholder="Template name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-subject">Default Subject</Label>
                      <Input
                        id="template-subject"
                        value={templateData.subject}
                        onChange={(e) => setTemplateData({...templateData, subject: e.target.value})}
                        placeholder="Default subject"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-content">Template Content</Label>
                    <Textarea
                      id="template-content"
                      value={templateData.content}
                      onChange={(e) => setTemplateData({...templateData, content: e.target.value})}
                      placeholder="Create your template with placeholders like {{name}}, {{event}}, etc."
                      rows={8}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">Available placeholders:</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{name}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{email}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{event_name}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{event_date}}"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{"{{venue}}"}</span>
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4" opacity="0.2"/><path d="M22 12a10 10 0 0 1-10 10" stroke="#2563eb" strokeWidth="4" strokeLinecap="round"/></svg>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2563eb" opacity="0.1"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
                        Save Template
                      </span>
                    )}
                  </Button>
                </form>
                    {/* List of created templates */}
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#e0e7ef"/><path d="M4 8l8 6 8-6" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="8" width="16" height="8" rx="2" fill="#fff" stroke="#2563eb" strokeWidth="2"/></svg>
                        Created Email Templates
                      </h3>
                      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white w-full">
                        <table className="min-w-full w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-blue-50">
                            <tr>
                              <th className="px-4 py-3 font-semibold text-left text-blue-900">Name</th>
                              <th className="px-4 py-3 font-semibold text-left text-blue-900">Subject</th>
                              <th className="px-4 py-3 font-semibold text-left text-blue-900">Preview</th>
                              <th className="px-4 py-3 font-semibold text-center text-blue-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Example static templates, replace with dynamic data as needed */}
                            <tr>
                              <td className="px-4 py-2">Default Template</td>
                              <td className="px-4 py-2">Welcome to NIBOG</td>
                              <td className="px-4 py-2">Hello {'{{name}}'}, welcome to NIBOG!</td>
                              <td className="px-4 py-2 text-center">
                                <button className="text-blue-600 hover:underline">Edit</button>
                                <span className="mx-2 text-gray-300">|</span>
                                <button className="text-red-600 hover:underline">Delete</button>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Newsletter</td>
                              <td className="px-4 py-2">Monthly Updates</td>
                              <td className="px-4 py-2">Dear {'{{name}}'}, here are our latest updates...</td>
                              <td className="px-4 py-2 text-center">
                                <button className="text-blue-600 hover:underline">Edit</button>
                                <span className="mx-2 text-gray-300">|</span>
                                <button className="text-red-600 hover:underline">Delete</button>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2">Event Reminder</td>
                              <td className="px-4 py-2">Don't Miss Your Event!</td>
                              <td className="px-4 py-2">Hi {'{{name}}'}, your event {'{{event_name}}'} is coming up soon.</td>
                              <td className="px-4 py-2 text-center">
                                <button className="text-blue-600 hover:underline">Edit</button>
                                <span className="mx-2 text-gray-300">|</span>
                                <button className="text-red-600 hover:underline">Delete</button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
