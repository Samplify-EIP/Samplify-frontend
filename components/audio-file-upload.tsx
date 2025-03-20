"use client"

import { useState, useRef, type DragEvent, type ChangeEvent, useEffect } from "react"
import { Music, X, Play, Pause, AlertCircle, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

type AudioFile = {
  file: File
  id: string
  progress: number
  url?: string
  status: "idle" | "uploading" | "uploaded" | "error"
}

export function AudioFileUpload() {
  const [files, setFiles] = useState<AudioFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = []
    const audioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/aac", "audio/flac"]

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      if (audioTypes.includes(file.type)) {
        validFiles.push(file)
      }
    }

    if (validFiles.length < fileList.length) {
      setError("Certains fichiers ont été rejetés. Seuls les fichiers audio sont autorisés.")
    } else if (fileList.length > 0 && validFiles.length === 0) {
      setError("Aucun fichier audio valide trouvé. Veuillez télécharger des fichiers MP3, WAV, OGG, AAC ou FLAC.")
    } else {
      setError(null)
    }

    return validFiles
  }

  const addFiles = async (fileList: FileList) => {
    const validFiles = validateFiles(fileList)

    if (validFiles.length > 0) {
      const file = validFiles[0]
      const id = Math.random().toString(36).substring(2, 9)
      const url = URL.createObjectURL(file)

      setFiles((prev) => {
        prev.forEach((f) => {
          if (f.url) {
            URL.revokeObjectURL(f.url)
          }
        })
        return []
      })

      setFiles([
        {
          file,
          id,
          progress: 0,
          url,
          status: "idle",
        },
      ])

      uploadFile(file, id)
    }
  }

  const uploadFile = async (file: File, id: string) => {
    try {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "uploading" } : f)))

      const formData = new FormData()
      formData.append("audio_file", file)

      const response = await fetch("https://f385-91-173-101-151.ngrok-free.app/api/demucs/separate", {
        method: "POST",
        body: formData,
      })

      if (response.status === 200) {
        const data = await response.json()
        const taskId = data["task_id"]
        extractDrums(taskId)
        extractVocals(taskId)
        extractBass(taskId)
        extractOther(taskId)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "error" } : f)))
    }
  }

  const extractDrums = async (taskId: string) => {
    const responseDrums = await fetch(
      `https://f385-91-173-101-151.ngrok-free.app/api/demucs/download/${taskId}/drums.wav`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      },
    )
    if (responseDrums.status == 200) {
      const drumsBlob = await responseDrums.blob()
      const drumsUrl = URL.createObjectURL(drumsBlob)
      const drumsId = Math.random().toString(36).substring(2, 9)
      setFiles((prev) => [
        ...prev,
        {
          file: new File([drumsBlob], "drums.wav", { type: "audio/wav" }),
          id: drumsId,
          progress: 100,
          url: drumsUrl,
          status: "uploaded",
        },
      ])
    }
  }

  const extractVocals = async (taskId: string) =>  {
    const responseVocals = await fetch(
      `https://f385-91-173-101-151.ngrok-free.app/api/demucs/download/${taskId}/vocals.wav`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      },
    )
    if (responseVocals.status == 200) {
      const vocalsBlob = await responseVocals.blob()
      const vocalsUrl = URL.createObjectURL(vocalsBlob)
      const vocalsId = Math.random().toString(36).substring(2, 9)
      setFiles((prev) => [
        ...prev,
        {
          file: new File([vocalsBlob], "vocals.wav", { type: "audio/wav" }),
          id: vocalsId,
          progress: 100,
          url: vocalsUrl,
          status: "uploaded",
        },
      ])
    }
  }

  const extractBass = async (taskId: string) =>  {
    const responseBass = await fetch(
      `https://f385-91-173-101-151.ngrok-free.app/api/demucs/download/${taskId}/bass.wav`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      },
    )
    if (responseBass.status == 200) {
      const bassBlob = await responseBass.blob()
      const bassUrl = URL.createObjectURL(bassBlob)
      const bassId = Math.random().toString(36).substring(2, 9)
      setFiles((prev) => [
        ...prev,
        {
          file: new File([bassBlob], "bass.wav", { type: "audio/wav" }),
          id: bassId,
          progress: 100,
          url: bassUrl,
          status: "uploaded",
        },
      ])
    }
  }

  const extractOther = async (taskId: string) =>  {
    const responseOther = await fetch(
      `https://f385-91-173-101-151.ngrok-free.app/api/demucs/download/${taskId}/other.wav`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      },
    )
    if (responseOther.status == 200) {
      const otherBlob = await responseOther.blob()
      const otherUrl = URL.createObjectURL(otherBlob)
      const otherId = Math.random().toString(36).substring(2, 9)
      setFiles((prev) => [
        ...prev,
        {
          file: new File([otherBlob], "bass.wav", { type: "audio/wav" }),
          id: otherId,
          progress: 100,
          url: otherUrl,
          status: "uploaded",
        },
      ])
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    const fileToRemove = files.find((file) => file.id === id)
    if (fileToRemove?.url) {
      URL.revokeObjectURL(fileToRemove.url)
    }

    if (currentlyPlaying === id) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
      setIsPlaying(false)
    }

    setFiles(files.filter((file) => file.id !== id))
  }

  const togglePlayPause = (id: string) => {
    if (!audioRef.current) return

    if (currentlyPlaying === id) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    } else {
      const fileToPlay = files.find((file) => file.id === id)
      if (fileToPlay?.url) {
        if (isPlaying && audioRef.current) {
          audioRef.current.pause()
        }

        setCurrentlyPlaying(id)
        audioRef.current.src = fileToPlay.url
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = volume
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return

    const newVolume = value[0]
    setVolume(newVolume)
    audioRef.current.volume = newVolume

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return

    setCurrentTime(audioRef.current.currentTime)
    setDuration(audioRef.current.duration || 0)
  }

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return

    const seekTime = value[0]
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false)
      })

      audioRef.current.addEventListener("timeupdate", handleTimeUpdate)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate)
      }

      files.forEach((file) => {
        if (file.url) {
          URL.revokeObjectURL(file.url)
        }
      })
    }
  }, [])

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragging ? "border-blue-500 bg-blue-500/10" : "border-gray-600 hover:border-blue-500/50",
          "bg-gray-900 text-white",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept="audio/*"
          multiple
        />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="p-3 rounded-full bg-blue-500/20">
            <Music className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-medium">Glissez vos fichiers audio ici</h3>
          <p className="text-sm text-gray-400">Déposez vos fichiers audio ici ou cliquez pour parcourir</p>
          <p className="text-xs text-gray-500">Formats supportés: MP3, WAV, OGG, AAC, et FLAC</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-md">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <audio ref={audioRef} className="hidden" onEnded={() => setIsPlaying(false)} />

      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-white">Fichiers sélectionnés ({files.length})</h3>
          <ul className="space-y-4">
            {files.map((file) => (
              <li
                key={file.id}
                className={cn(
                  "p-4 rounded-md",
                  currentlyPlaying === file.id ? "bg-gray-800 border border-blue-500/50" : "bg-gray-800",
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full",
                      currentlyPlaying === file.id && isPlaying ? "bg-blue-500 text-white" : "text-white",
                    )}
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlayPause(file.id)
                    }}
                  >
                    {currentlyPlaying === file.id && isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span className="sr-only">{currentlyPlaying === file.id && isPlaying ? "Pause" : "Play"}</span>
                  </Button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-white">{file.file.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(file.file.size)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.status === "uploading" ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Progress value={file.progress} className="h-2" />
                        </div>
                        <span className="text-xs text-gray-400">{file.progress}%</span>
                      </div>
                    ) : file.status === "uploaded" ? (
                      <span className="text-xs text-green-500">Téléchargé</span>
                    ) : file.status === "error" ? (
                      <span className="text-xs text-red-500">Erreur</span>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (file.url) {
                          const a = document.createElement("a")
                          a.href = file.url
                          a.download = file.file.name
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                        }
                      }}
                      className="h-8 text-xs text-gray-400 hover:text-white"
                    >
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(file.id)
                      }}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </div>

                {currentlyPlaying === file.id && (
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-10">{formatTime(currentTime)}</span>
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleSeek}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="h-8 w-8 text-gray-400 hover:text-white"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-24"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
