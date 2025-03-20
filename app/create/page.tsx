'use client'

import { Navbar } from "../../components/navbar";
import { AudioFileUpload } from "../../components/audio-file-upload";

export default function Page() {
    return (
      <main className="min-h-screen bg-black">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2 pt-6">
            <p className="text-muted-foreground">
              Drag and drop audio files or click to browse. Only audio files (MP3, WAV, OGG, etc.) are accepted.
            </p>
          </div>
          <AudioFileUpload />
        </div>
      </main>
    );
}
