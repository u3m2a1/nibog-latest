"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, Plus, Trash2, Move, Loader2, Eye, ChevronLeft, ChevronRight, Zap, Palette, Image } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ColorPicker } from "@/components/ui/color-picker"
import { useToast } from "@/hooks/use-toast"
import { CertificateField, CreateCertificateTemplateRequest, BackgroundStyle, AppreciationTextStyle } from "@/types/certificate"
import { uploadCertificateBackground, createCertificateTemplate } from "@/services/certificateTemplateService"

export default function NewCertificateTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [templateType, setTemplateType] = useState<"participation" | "winner">("participation")
  const [certificateTitle, setCertificateTitle] = useState<string>("")
  const [appreciationText, setAppreciationText] = useState<string>("")

  // New appreciation text positioning
  const [appreciationTextStyle, setAppreciationTextStyle] = useState<AppreciationTextStyle>({
    text: "",
    x: 50,
    y: 55,
    font_size: 16,
    font_family: "Arial",
    color: "#000000",
    alignment: "center",
    line_height: 1.5,
    max_width: 80
  })

  // Background style options
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>({
    type: "image",
    border_enabled: false,
    border_color: "#000000",
    border_width: 2,
    border_style: "solid"
  })

  const [signatureImage, setSignatureImage] = useState<File | null>(null)
  const [signatureImageUrl, setSignatureImageUrl] = useState("")
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("")
  const [paperSize, setPaperSize] = useState<"a4" | "letter" | "a3">("a4")
  const [orientation, setOrientation] = useState<"landscape" | "portrait">("landscape")
  const [fields, setFields] = useState<CertificateField[]>([])
  const [defaultFontFamily, setDefaultFontFamily] = useState<string>("Arial")
  const [defaultFontColor, setDefaultFontColor] = useState<string>("#000000")

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingBackground(true)
      const imageUrl = await uploadCertificateBackground(file)
      setBackgroundImage(file)
      setBackgroundImageUrl(imageUrl)
      setBackgroundStyle(prev => ({ ...prev, image_url: imageUrl }))

      toast({
        title: "Success",
        description: "Background image uploaded successfully"
      })
    } catch (error) {
      console.error('Error uploading background:', error)
      toast({
        title: "Error",
        description: `Failed to upload background image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsUploadingBackground(false)
    }
  }

  // Smart positioning for certificate fields
  const getSmartPosition = (fieldCount: number, fieldName: string = "New Field") => {
    const name = fieldName.toLowerCase();

    // Define positions based on paper size and orientation
    const getPositionsForSize = () => {
      const basePositions = {
        a4: {
          landscape: {
            title: { x: 50, y: 15, font_size: 32 },
            subtitle: { x: 50, y: 25, font_size: 20 },
            participant_name: { x: 50, y: 35, font_size: 28 },
            event_name: { x: 50, y: 45, font_size: 18 },
            achievement: { x: 50, y: 55, font_size: 20 },
            position: { x: 50, y: 60, font_size: 18 },
            venue: { x: 25, y: 75, font_size: 16 },
            city: { x: 75, y: 75, font_size: 16 },
            score: { x: 50, y: 70, font_size: 16 },
            organization: { x: 50, y: 80, font_size: 16 },
            instructor: { x: 25, y: 90, font_size: 14 },
            date: { x: 25, y: 85, font_size: 16 },
            signature: { x: 75, y: 85, font_size: 16 },
            certificate_number: { x: 50, y: 92, font_size: 14 }
          },
          portrait: {
            title: { x: 50, y: 12, font_size: 32 },
            subtitle: { x: 50, y: 20, font_size: 20 },
            participant_name: { x: 50, y: 25, font_size: 28 },
            event_name: { x: 50, y: 32, font_size: 18 },
            achievement: { x: 50, y: 38, font_size: 20 },
            position: { x: 50, y: 43, font_size: 18 },
            venue: { x: 25, y: 65, font_size: 16 },
            city: { x: 75, y: 65, font_size: 16 },
            score: { x: 50, y: 48, font_size: 16 },
            organization: { x: 50, y: 70, font_size: 16 },
            instructor: { x: 25, y: 88, font_size: 14 },
            date: { x: 25, y: 85, font_size: 16 },
            signature: { x: 75, y: 85, font_size: 16 },
            certificate_number: { x: 50, y: 90, font_size: 14 }
          }
        },
        a3: {
          landscape: {
            title: { x: 50, y: 18, font_size: 36 },
            subtitle: { x: 50, y: 28, font_size: 24 },
            participant_name: { x: 50, y: 38, font_size: 32 },
            event_name: { x: 50, y: 48, font_size: 22 },
            achievement: { x: 50, y: 58, font_size: 24 },
            position: { x: 50, y: 63, font_size: 22 },
            venue: { x: 20, y: 78, font_size: 18 },
            city: { x: 80, y: 78, font_size: 18 },
            score: { x: 50, y: 68, font_size: 18 },
            organization: { x: 50, y: 83, font_size: 18 },
            instructor: { x: 20, y: 92, font_size: 16 },
            date: { x: 20, y: 88, font_size: 18 },
            signature: { x: 80, y: 88, font_size: 18 },
            certificate_number: { x: 50, y: 94, font_size: 16 }
          },
          portrait: {
            title: { x: 50, y: 10, font_size: 36 },
            subtitle: { x: 50, y: 18, font_size: 24 },
            participant_name: { x: 50, y: 22, font_size: 32 },
            event_name: { x: 50, y: 28, font_size: 22 },
            achievement: { x: 50, y: 34, font_size: 24 },
            position: { x: 50, y: 38, font_size: 22 },
            venue: { x: 25, y: 60, font_size: 18 },
            city: { x: 75, y: 60, font_size: 18 },
            score: { x: 50, y: 42, font_size: 18 },
            organization: { x: 50, y: 65, font_size: 18 },
            instructor: { x: 25, y: 90, font_size: 16 },
            date: { x: 25, y: 88, font_size: 18 },
            signature: { x: 75, y: 88, font_size: 18 },
            certificate_number: { x: 50, y: 92, font_size: 16 }
          }
        },
        letter: {
          landscape: {
            title: { x: 50, y: 16, font_size: 32 },
            subtitle: { x: 50, y: 26, font_size: 20 },
            participant_name: { x: 50, y: 36, font_size: 28 },
            event_name: { x: 50, y: 46, font_size: 18 },
            achievement: { x: 50, y: 56, font_size: 20 },
            position: { x: 50, y: 61, font_size: 18 },
            venue: { x: 22, y: 76, font_size: 16 },
            city: { x: 78, y: 76, font_size: 16 },
            score: { x: 50, y: 66, font_size: 16 },
            organization: { x: 50, y: 81, font_size: 16 },
            instructor: { x: 22, y: 91, font_size: 14 },
            date: { x: 22, y: 86, font_size: 16 },
            signature: { x: 78, y: 86, font_size: 16 },
            certificate_number: { x: 50, y: 92, font_size: 14 }
          },
          portrait: {
            title: { x: 50, y: 13, font_size: 32 },
            subtitle: { x: 50, y: 21, font_size: 20 },
            participant_name: { x: 50, y: 26, font_size: 28 },
            event_name: { x: 50, y: 33, font_size: 18 },
            achievement: { x: 50, y: 39, font_size: 20 },
            position: { x: 50, y: 44, font_size: 18 },
            venue: { x: 25, y: 66, font_size: 16 },
            city: { x: 75, y: 66, font_size: 16 },
            score: { x: 50, y: 49, font_size: 16 },
            organization: { x: 50, y: 71, font_size: 16 },
            instructor: { x: 25, y: 89, font_size: 14 },
            date: { x: 25, y: 86, font_size: 16 },
            signature: { x: 75, y: 86, font_size: 16 },
            certificate_number: { x: 50, y: 91, font_size: 14 }
          }
        }
      };

      // Get current paper size and orientation from state
      const currentSize = paperSize as keyof typeof basePositions;
      const currentOrientation = orientation as keyof typeof basePositions.a4;

      return basePositions[currentSize]?.[currentOrientation] || basePositions.a4.landscape;
    };

    const positions = getPositionsForSize();

    // Smart field name detection and positioning
    if (name.includes('participant') || (name.includes('name') && !name.includes('event'))) {
      return positions.participant_name;
    } else if ((name.includes('certificate') && name.includes('title')) || name.toLowerCase() === 'certificate title') {
      return positions.title;
    } else if ((name.includes('certificate') && name.includes('number')) || name.toLowerCase() === 'certificate number') {
      return positions.certificate_number;
    } else if (name.includes('event') && !name.includes('date')) {
      return positions.event_name;
    } else if (name.includes('date')) {
      return positions.date;
    } else if (name.includes('signature')) {
      return positions.signature;
    } else if (name.includes('venue')) {
      return positions.venue;
    } else if (name.includes('city')) {
      return positions.city;
    } else if (name.includes('position') || name.includes('rank')) {
      return positions.position;
    } else if (name.includes('score')) {
      return positions.score;
    } else if (name.includes('achievement')) {
      return positions.achievement;
    } else if (name.includes('organization') || name.includes('company')) {
      return positions.organization;
    } else if (name.includes('instructor') || name.includes('teacher')) {
      return positions.instructor;
    } else if (name.includes('title')) {
      return positions.title;
    }

    // Default positioning for unknown fields (stagger them)
    const defaultPositions = [
      { x: 50, y: 30 },
      { x: 50, y: 40 },
      { x: 50, y: 50 },
      { x: 50, y: 60 },
      { x: 50, y: 70 },
      { x: 30, y: 80 },
      { x: 70, y: 80 }
    ];

    const pos = defaultPositions[fieldCount % defaultPositions.length];
    return { ...pos, font_size: 18 };
  };

  const addField = (fieldName = "New Field") => {
    const position = getSmartPosition(fields.length, fieldName);

    const newField: CertificateField = {
      id: `field-${Date.now()}`,
      name: fieldName,
      type: 'text' as 'text' | 'date' | 'image',
      required: true,
      x: position.x,
      y: position.y,
      font_size: position.font_size || 16,
      font_family: defaultFontFamily,
      color: defaultFontColor,
      width: 200,
      height: 30,
      alignment: "center" as 'left' | 'center' | 'right'
    }
    setFields([...fields, newField])
    return newField
  }

  const addCommonFields = () => {
    // Save current fields
    const currentFields = [...fields]

    // Define common fields with their specific configurations
    const commonFieldsConfig = [
      {
        name: "Certificate Title",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        underline: true, // Certificate title should have underline by default
        font_size: 32,
        y: 20
      },
      {
        name: "Participant Name",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        font_size: 28,
        y: 40
      },
      {
        name: "Date",
        type: 'date' as 'text' | 'date' | 'image' | 'signature',
        font_size: 16,
        y: 85
      },
      {
        name: "Signature",
        type: 'signature' as 'text' | 'date' | 'image' | 'signature',
        signature_type: 'text' as 'text' | 'image',
        font_size: 16,
        y: 85
      },
      {
        name: "Certificate Number",
        type: 'text' as 'text' | 'date' | 'image' | 'signature',
        font_size: 12,
        y: 90
      }
    ]

    // Add each common field with smart positioning
    const newFields: CertificateField[] = commonFieldsConfig.map((fieldConfig, index) => {
      // Use customized positioning based on field type
      const position = getSmartPosition(index, fieldConfig.name)

      const newField: CertificateField = {
        id: `field-${Date.now()}-${fieldConfig.name.replace(/\s+/g, '-').toLowerCase()}-${index}`,
        name: fieldConfig.name,
        type: fieldConfig.type,
        required: true,
        x: position.x,
        y: fieldConfig.y || position.y,
        font_size: fieldConfig.font_size || position.font_size || 16,
        font_family: defaultFontFamily,
        color: defaultFontColor,
        width: 200,
        height: 30,
        alignment: "center" as 'left' | 'center' | 'right',
        underline: fieldConfig.underline || false,
        signature_type: fieldConfig.signature_type
      }

      return newField
    })

    // Update fields state with new fields added to existing ones
    setFields([...currentFields, ...newFields])

    toast({
      title: "Success",
      description: `Added ${newFields.length} common certificate fields`
    })
  }

  const updateField = (id: string, updates: Partial<CertificateField>) => {
    setFields(fields.map(field => {
      if (field.id === id) {
        const updatedField = { ...field, ...updates };

        // If name is being updated, auto-position the field
        if (updates.name && updates.name !== field.name) {
          const position = getSmartPosition(0, updates.name);
          updatedField.x = position.x;
          updatedField.y = position.y;
          updatedField.font_size = position.font_size || field.font_size;
        }

        return updatedField;
      }
      return field;
    }))
  }

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(templateName && templateDescription && templateType)
      case 2:
        // Check if background is configured based on type
        if (backgroundStyle.type === "image") {
          return !!(backgroundImageUrl && paperSize && orientation)
        } else if (backgroundStyle.type === "solid") {
          return !!(backgroundStyle.solid_color && paperSize && orientation)
        } else if (backgroundStyle.type === "gradient") {
          return !!(backgroundStyle.gradient_colors?.length === 2 && paperSize && orientation)
        }
        return !!(paperSize && orientation)
      case 3:
        return fields.length > 0
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Include all new fields
      const templateData: CreateCertificateTemplateRequest = {
        name: templateName,
        description: templateDescription,
        type: templateType as 'participation' | 'winner' | 'event_specific',
        certificate_title: certificateTitle,
        appreciation_text: appreciationText, // Keep for backward compatibility
        appreciation_text_style: appreciationTextStyle, // New structured appreciation text
        signature_image: signatureImageUrl,
        background_image: backgroundImageUrl, // Keep for backward compatibility
        background_style: backgroundStyle, // New structured background options
        paper_size: paperSize as 'a4' | 'letter' | 'a3',
        orientation: orientation as 'landscape' | 'portrait',
        fields: fields
      }
      
      const result = await createCertificateTemplate(templateData)
      
      toast({
        title: "Success",
        description: "Certificate template created successfully"
      })
      
      router.push("/admin/certificate-templates")
    } catch (error) {
      console.error("Error creating template:", error)
      toast({
        title: "Error",
        description: "Failed to create certificate template",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Basic Details"
      case 2: return "Background & Layout"
      case 3: return "Field Configuration"
      default: return ""
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this certificate template"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Certificate Type *</Label>
              <Select
                value={templateType}
                onValueChange={(value: any) => {
                  setTemplateType(value);
                  // Update default certificate title and appreciation text based on type
                  if (value === "participation") {
                    setCertificateTitle("Certificate of Participation");
                    const participationText = "In recognition of enthusiastic participation in {event_name}.\nYour involvement, energy, and commitment at NIBOG are truly appreciated.\nThank you for being a valued part of the NIBOG community!";
                    setAppreciationText(participationText);
                    setAppreciationTextStyle(prev => ({ ...prev, text: participationText }));
                  } else if (value === "winner") {
                    setCertificateTitle("Certificate of Achievement");
                    const achievementText = "For outstanding performance in {event_name}.\nYour dedication, talent, and exceptional skills at NIBOG have distinguished you among the best.\nCongratulations on this remarkable achievement from the entire NIBOG team!";
                    setAppreciationText(achievementText);
                    setAppreciationTextStyle(prev => ({ ...prev, text: achievementText }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select certificate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participation">Participation</SelectItem>
                  <SelectItem value="winner">Winner</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-1">
                {templateType === "participation" ? "Includes appreciation text for participation." : "Includes achievement recognition text."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateTitle">Certificate Title</Label>
              <Input
                id="certificateTitle"
                value={certificateTitle}
                onChange={(e) => setCertificateTitle(e.target.value)}
                placeholder="e.g., Certificate of Participation, Certificate of Achievement"
              />
              <p className="text-sm text-gray-500 mt-1">
                This title will appear prominently at the top of the certificate. You can use variables like <code>{`{event_name}`}</code> here.
              </p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            {/* Background Style Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Background Style</CardTitle>
                <CardDescription>Choose how you want to style the certificate background</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Background Type Selection */}
                  <div className="space-y-2">
                    <Label>Background Type *</Label>
                    <Select
                      value={backgroundStyle.type}
                      onValueChange={(value: "image" | "solid" | "gradient") => {
                        setBackgroundStyle(prev => ({ ...prev, type: value }));
                        // Reset background image if switching away from image
                        if (value !== "image") {
                          setBackgroundImage(null);
                          setBackgroundImageUrl("");
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">
                          <div className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Background Image
                          </div>
                        </SelectItem>
                        <SelectItem value="solid">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Solid Color
                          </div>
                        </SelectItem>
                        <SelectItem value="gradient">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Gradient
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Background Image Upload */}
                  {backgroundStyle.type === "image" && (
                    <div className="space-y-2">
                      <Label>Background Image *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        {backgroundImageUrl ? (
                          <div className="space-y-4">
                            <div className="relative">
                              <img
                                src={backgroundImageUrl.startsWith('http') ? backgroundImageUrl : `${window.location.origin}${backgroundImageUrl.startsWith('/') ? '' : '/'}${backgroundImageUrl}`}
                                alt="Background preview"
                                className="max-w-full h-48 object-contain mx-auto rounded"
                                onError={(e) => {
                                  console.error('Image failed to load:', e.currentTarget.src);
                                }}
                              />
                            </div>
                            <div className="flex justify-center">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setBackgroundImage(null)
                                  setBackgroundImageUrl("")
                                  setBackgroundStyle(prev => ({ ...prev, image_url: undefined }))
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4">
                              <Label htmlFor="background-upload" className="cursor-pointer">
                                <span className="mt-2 block text-sm font-medium text-gray-900">
                                  Upload background image
                                </span>
                                <span className="mt-1 block text-sm text-gray-500">
                                  PNG, JPG, PDF up to 5MB
                                </span>
                              </Label>
                              <Input
                                id="background-upload"
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleBackgroundUpload}
                                disabled={isUploadingBackground}
                              />
                            </div>
                            {isUploadingBackground && (
                              <div className="mt-4">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Solid Color Background */}
                  {backgroundStyle.type === "solid" && (
                    <div className="space-y-2">
                      <ColorPicker
                        label="Background Color *"
                        value={backgroundStyle.solid_color || "#FFFFFF"}
                        onChange={(color) => setBackgroundStyle(prev => ({ ...prev, solid_color: color }))}
                      />
                    </div>
                  )}

                  {/* Gradient Background */}
                  {backgroundStyle.type === "gradient" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <ColorPicker
                          label="Start Color *"
                          value={backgroundStyle.gradient_colors?.[0] || "#FFFFFF"}
                          onChange={(color) => {
                            const colors = backgroundStyle.gradient_colors || ["#FFFFFF", "#F0F0F0"];
                            colors[0] = color;
                            setBackgroundStyle(prev => ({ ...prev, gradient_colors: colors }));
                          }}
                        />
                        <ColorPicker
                          label="End Color *"
                          value={backgroundStyle.gradient_colors?.[1] || "#F0F0F0"}
                          onChange={(color) => {
                            const colors = backgroundStyle.gradient_colors || ["#FFFFFF", "#F0F0F0"];
                            colors[1] = color;
                            setBackgroundStyle(prev => ({ ...prev, gradient_colors: colors }));
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Border Options */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="border-enabled"
                        checked={backgroundStyle.border_enabled || false}
                        onChange={(e) => setBackgroundStyle(prev => ({ ...prev, border_enabled: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="border-enabled">Add Border</Label>
                    </div>

                    {backgroundStyle.border_enabled && (
                      <div className="grid grid-cols-3 gap-4 pl-6">
                        <ColorPicker
                          label="Border Color"
                          value={backgroundStyle.border_color || "#000000"}
                          onChange={(color) => setBackgroundStyle(prev => ({ ...prev, border_color: color }))}
                        />
                        <div className="space-y-2">
                          <Label>Border Width (px)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={backgroundStyle.border_width || 2}
                            onChange={(e) => setBackgroundStyle(prev => ({ ...prev, border_width: parseInt(e.target.value) || 2 }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Border Style</Label>
                          <Select
                            value={backgroundStyle.border_style || "solid"}
                            onValueChange={(value: "solid" | "dashed" | "dotted") =>
                              setBackgroundStyle(prev => ({ ...prev, border_style: value }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solid">Solid</SelectItem>
                              <SelectItem value="dashed">Dashed</SelectItem>
                              <SelectItem value="dotted">Dotted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paper-size">Paper Size *</Label>
                <Select value={paperSize} onValueChange={(value: any) => setPaperSize(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="a3">A3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orientation">Orientation *</Label>
                <Select value={orientation} onValueChange={(value: any) => setOrientation(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Certificate Fields</h3>
                <p className="text-sm text-gray-500">Configure the fields that will appear on the certificate</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={(e) => addField()} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
                <Button onClick={(e) => addCommonFields()} variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Quick Add Common Fields
                </Button>
              </div>
            </div>
            
            {/* Certificate Title and Appreciation Text */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">Certificate Title & Appreciation Text</CardTitle>
                <CardDescription>Configure the title and appreciation message for your certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="certificateTitle">Certificate Title</Label>
                    <Input
                      id="certificateTitle"
                      value={certificateTitle}
                      onChange={(e) => setCertificateTitle(e.target.value)}
                      placeholder="e.g., Certificate of Participation, Certificate of Achievement"
                    />
                    <p className="text-sm text-gray-500">
                      This title appears at the top of the certificate. Variables: <code>{`{event_name}`}</code>, <code>{`{participant_name}`}</code>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label htmlFor="appreciationText">Appreciation Text</Label>
                    <Textarea
                      id="appreciationText"
                      value={appreciationText}
                      onChange={(e) => {
                        setAppreciationText(e.target.value);
                        setAppreciationTextStyle(prev => ({ ...prev, text: e.target.value }));
                      }}
                      placeholder="Enter appreciation text that will appear on the certificate"
                      rows={5}
                      required
                    />

                    {/* Appreciation Text Positioning */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <Label className="text-sm font-medium mb-3 block">Text Positioning & Styling</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>X Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={appreciationTextStyle.x}
                            onChange={(e) => setAppreciationTextStyle(prev => ({
                              ...prev,
                              x: parseInt(e.target.value) || 0
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Y Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={appreciationTextStyle.y}
                            onChange={(e) => setAppreciationTextStyle(prev => ({
                              ...prev,
                              y: parseInt(e.target.value) || 0
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            min="8"
                            max="72"
                            value={appreciationTextStyle.font_size}
                            onChange={(e) => setAppreciationTextStyle(prev => ({
                              ...prev,
                              font_size: parseInt(e.target.value) || 16
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Width (%)</Label>
                          <Input
                            type="number"
                            min="10"
                            max="100"
                            value={appreciationTextStyle.max_width}
                            onChange={(e) => setAppreciationTextStyle(prev => ({
                              ...prev,
                              max_width: parseInt(e.target.value) || 80
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={appreciationTextStyle.font_family}
                            onValueChange={(value: string) => setAppreciationTextStyle(prev => ({
                              ...prev,
                              font_family: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Helvetica">Helvetica</SelectItem>
                              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Verdana">Verdana</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Text Alignment</Label>
                          <Select
                            value={appreciationTextStyle.alignment}
                            onValueChange={(value: "left" | "center" | "right") => setAppreciationTextStyle(prev => ({
                              ...prev,
                              alignment: value
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <ColorPicker
                            label="Text Color"
                            value={appreciationTextStyle.color || "#000000"}
                            onChange={(color) => setAppreciationTextStyle(prev => ({
                              ...prev,
                              color
                            }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Available Variables:</span> <code>{`{participant_name}`}</code>, <code>{`{event_name}`}</code>, <code>{`{game_name}`}</code>, <code>{`{venue_name}`}</code>, <code>{`{city_name}`}</code>, <code>{`{date}`}</code>, <code>{`{organization}`}</code>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Tip:</span> Variables will be automatically replaced with actual data when certificates are generated.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>



            {/* E-Signature Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-md">E-Signature (Optional)</CardTitle>
                <CardDescription>Upload an e-signature image that can be used in signature fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {signatureImageUrl ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={signatureImageUrl.startsWith('http') ? signatureImageUrl : `http://localhost:3001${signatureImageUrl}`}
                          alt="E-signature preview"
                          className="max-w-full h-24 object-contain mx-auto border rounded"
                          onError={(e) => {
                            console.error('Signature image failed to load:', e.currentTarget.src);
                          }}
                        />
                      </div>
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSignatureImage(null);
                            setSignatureImageUrl("");
                          }}
                        >
                          Remove E-Signature
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <div className="space-y-2">
                        <Label htmlFor="signature-upload" className="cursor-pointer">
                          <span className="block text-sm font-medium text-gray-900">
                            Upload E-Signature
                          </span>
                          <span className="block text-sm text-gray-500">
                            PNG, JPG up to 2MB (transparent background recommended)
                          </span>
                        </Label>
                        <Input
                          id="signature-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSignatureImage(file);
                              // For now, create a local URL for preview
                              const url = URL.createObjectURL(file);
                              setSignatureImageUrl(url);
                            }
                          }}
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    This signature will be available for use in signature fields. You can add signature fields in the field configuration section.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Default Font Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-md">Default Font Settings</CardTitle>
                <CardDescription>These settings will be applied to new fields</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFont">Font Family</Label>
                    <Select value={defaultFontFamily} onValueChange={setDefaultFontFamily}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Standard Fonts */}
                        <SelectItem value="Arial"><span style={{fontFamily: 'Arial'}}>Arial</span></SelectItem>
                        <SelectItem value="Helvetica"><span style={{fontFamily: 'Helvetica'}}>Helvetica</span></SelectItem>
                        <SelectItem value="Times New Roman"><span style={{fontFamily: 'Times New Roman'}}>Times New Roman</span></SelectItem>
                        <SelectItem value="Georgia"><span style={{fontFamily: 'Georgia'}}>Georgia</span></SelectItem>
                        <SelectItem value="Verdana"><span style={{fontFamily: 'Verdana'}}>Verdana</span></SelectItem>
                        <SelectItem value="Courier New"><span style={{fontFamily: 'Courier New'}}>Courier New</span></SelectItem>
                        <SelectItem value="Tahoma"><span style={{fontFamily: 'Tahoma'}}>Tahoma</span></SelectItem>
                        <SelectItem value="Trebuchet MS"><span style={{fontFamily: 'Trebuchet MS'}}>Trebuchet MS</span></SelectItem>
                        <SelectItem value="Impact"><span style={{fontFamily: 'Impact'}}>Impact</span></SelectItem>
                        <SelectItem value="Comic Sans MS"><span style={{fontFamily: 'Comic Sans MS'}}>Comic Sans MS</span></SelectItem>
                        <SelectItem value="Palatino"><span style={{fontFamily: 'Palatino'}}>Palatino</span></SelectItem>
                        <SelectItem value="Garamond"><span style={{fontFamily: 'Garamond'}}>Garamond</span></SelectItem>
                        <SelectItem value="Bookman"><span style={{fontFamily: 'Bookman'}}>Bookman</span></SelectItem>
                        <SelectItem value="Calibri"><span style={{fontFamily: 'Calibri'}}>Calibri</span></SelectItem>
                        <SelectItem value="Century Gothic"><span style={{fontFamily: 'Century Gothic'}}>Century Gothic</span></SelectItem>
                        <SelectItem value="Cambria"><span style={{fontFamily: 'Cambria'}}>Cambria</span></SelectItem>
                        <SelectItem value="Candara"><span style={{fontFamily: 'Candara'}}>Candara</span></SelectItem>
                        <SelectItem value="Consolas"><span style={{fontFamily: 'Consolas'}}>Consolas</span></SelectItem>
                        <SelectItem value="Franklin Gothic"><span style={{fontFamily: 'Franklin Gothic'}}>Franklin Gothic</span></SelectItem>
                        <SelectItem value="Segoe UI"><span style={{fontFamily: 'Segoe UI'}}>Segoe UI</span></SelectItem>
                        
                        {/* Decorative Cursive Fonts */}
                        <SelectItem value="Great Vibes"><span style={{fontFamily: '"Great Vibes", cursive'}}>Great Vibes</span></SelectItem>
                        <SelectItem value="Pacifico"><span style={{fontFamily: '"Pacifico", cursive'}}>Pacifico</span></SelectItem>
                        <SelectItem value="Dancing Script"><span style={{fontFamily: '"Dancing Script", cursive'}}>Dancing Script</span></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ColorPicker
                    label="Default Text Color"
                    value={defaultFontColor || '#000000'}
                    onChange={setDefaultFontColor}
                  />
                </div>
              </CardContent>
            </Card>

            {fields.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No fields added yet. Click "Add Field" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Field Name</Label>
                          <Input
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            placeholder="Field name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field Type</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: any) => updateField(field.id, { type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="signature">Signature</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>X Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={field.x}
                            onChange={(e) => updateField(field.id, { x: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Y Position (%)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={field.y}
                            onChange={(e) => updateField(field.id, { y: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Size</Label>
                          <Input
                            type="number"
                            min="8"
                            max="72"
                            value={field.font_size}
                            onChange={(e) => updateField(field.id, { font_size: parseInt(e.target.value) || 16 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select
                            value={field.font_family}
                            onValueChange={(value: string) => updateField(field.id, { font_family: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {/* Standard Fonts */}
                              <SelectItem value="Arial"><span style={{fontFamily: 'Arial'}}>Arial</span></SelectItem>
                              <SelectItem value="Helvetica"><span style={{fontFamily: 'Helvetica'}}>Helvetica</span></SelectItem>
                              <SelectItem value="Times New Roman"><span style={{fontFamily: 'Times New Roman'}}>Times New Roman</span></SelectItem>
                              <SelectItem value="Georgia"><span style={{fontFamily: 'Georgia'}}>Georgia</span></SelectItem>
                              <SelectItem value="Verdana"><span style={{fontFamily: 'Verdana'}}>Verdana</span></SelectItem>
                              <SelectItem value="Courier New"><span style={{fontFamily: 'Courier New'}}>Courier New</span></SelectItem>
                              <SelectItem value="Tahoma"><span style={{fontFamily: 'Tahoma'}}>Tahoma</span></SelectItem>
                              <SelectItem value="Trebuchet MS"><span style={{fontFamily: 'Trebuchet MS'}}>Trebuchet MS</span></SelectItem>
                              <SelectItem value="Impact"><span style={{fontFamily: 'Impact'}}>Impact</span></SelectItem>
                              <SelectItem value="Comic Sans MS"><span style={{fontFamily: 'Comic Sans MS'}}>Comic Sans MS</span></SelectItem>
                              <SelectItem value="Palatino"><span style={{fontFamily: 'Palatino'}}>Palatino</span></SelectItem>
                              <SelectItem value="Garamond"><span style={{fontFamily: 'Garamond'}}>Garamond</span></SelectItem>
                              <SelectItem value="Bookman"><span style={{fontFamily: 'Bookman'}}>Bookman</span></SelectItem>
                              <SelectItem value="Calibri"><span style={{fontFamily: 'Calibri'}}>Calibri</span></SelectItem>
                              <SelectItem value="Century Gothic"><span style={{fontFamily: 'Century Gothic'}}>Century Gothic</span></SelectItem>
                              <SelectItem value="Cambria"><span style={{fontFamily: 'Cambria'}}>Cambria</span></SelectItem>
                              <SelectItem value="Candara"><span style={{fontFamily: 'Candara'}}>Candara</span></SelectItem>
                              <SelectItem value="Consolas"><span style={{fontFamily: 'Consolas'}}>Consolas</span></SelectItem>
                              <SelectItem value="Franklin Gothic"><span style={{fontFamily: 'Franklin Gothic'}}>Franklin Gothic</span></SelectItem>
                              <SelectItem value="Segoe UI"><span style={{fontFamily: 'Segoe UI'}}>Segoe UI</span></SelectItem>
                              
                              {/* Decorative Cursive Fonts */}
                              <SelectItem value="Great Vibes"><span style={{fontFamily: '"Great Vibes", cursive'}}>Great Vibes</span></SelectItem>
                              <SelectItem value="Pacifico"><span style={{fontFamily: '"Pacifico", cursive'}}>Pacifico</span></SelectItem>
                              <SelectItem value="Dancing Script"><span style={{fontFamily: '"Dancing Script", cursive'}}>Dancing Script</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <ColorPicker
                            label="Text Color"
                            value={field.color || '#000000'}
                            onChange={(color) => updateField(field.id, { color })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Alignment</Label>
                          <Select
                            value={field.alignment}
                            onValueChange={(value: any) => updateField(field.id, { alignment: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Underline option for text fields */}
                        {field.type === 'text' && (
                          <div className="space-y-2">
                            <Label>Text Style</Label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`underline-${field.id}`}
                                checked={field.underline || false}
                                onChange={(e) => updateField(field.id, { underline: e.target.checked })}
                                className="rounded"
                              />
                              <Label htmlFor={`underline-${field.id}`}>Underline</Label>
                            </div>
                          </div>
                        )}

                        {/* Signature type option for signature fields */}
                        {field.type === 'signature' && (
                          <div className="space-y-2">
                            <Label>Signature Type</Label>
                            <Select
                              value={field.signature_type || 'text'}
                              onValueChange={(value: any) => updateField(field.id, { signature_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text Signature</SelectItem>
                                <SelectItem value="image">E-Signature Image</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-sm text-gray-500">
                              {field.signature_type === 'image'
                                ? 'Will use the uploaded e-signature image'
                                : 'Will display signature as text (e.g., "Authorized Signature")'
                              }
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/certificate-templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Certificate Template</h1>
          <p className="text-muted-foreground">Design a new certificate template for NIBOG events</p>
        </div>
      </div>

      {/* Progress indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{getStepTitle(currentStep)}</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{getStepTitle(currentStep)}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Enter the basic information for your certificate template"}
            {currentStep === 2 && "Upload a background image and configure the layout settings"}
            {currentStep === 3 && "Add and position the fields that will appear on the certificate"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!validateStep(currentStep) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

