"use client"

import { useEffect } from "react"
import { registerServiceWorker } from "@/lib/register-sw"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker()
  }, [])
  
  return null
}
