export class AudioService {
  private mediaRecorder: MediaRecorder | null = null
  private audioStream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private isRecording = false
  private onDataAvailableCallback?: (data: Blob) => void
  private onVisualizationCallback?: (frequencyData: Uint8Array) => void

  constructor() {
    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('MediaDevices API not supported in this browser')
    }
  }

  async initialize(): Promise<void> {
    try {
      // Get user media
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      })

      // Set up audio context for visualization
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.microphone = this.audioContext.createMediaStreamSource(this.audioStream)
      
      this.analyser.fftSize = 256
      this.analyser.smoothingTimeConstant = 0.8
      this.microphone.connect(this.analyser)
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)

      // Set up MediaRecorder
      const options: MediaRecorderOptions = {
        mimeType: this.getSupportedMimeType(),
        audioBitsPerSecond: 16000
      }

      this.mediaRecorder = new MediaRecorder(this.audioStream, options)
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.onDataAvailableCallback?.(event.data)
        }
      }

      this.mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error)
      }

    } catch (error) {
      console.error('Error initializing audio service:', error)
      throw error
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
      'audio/mp4'
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    return '' // Browser will use default
  }

  async startRecording(timeslice: number = 1000): Promise<void> {
    if (!this.mediaRecorder) {
      throw new Error('Audio service not initialized')
    }

    if (this.isRecording) {
      return
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext?.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.mediaRecorder.start(timeslice)
      this.isRecording = true
      
      // Start visualization
      this.startVisualization()
      
      console.log('Recording started')
    } catch (error) {
      console.error('Error starting recording:', error)
      throw error
    }
  }

  stopRecording(): void {
    if (!this.mediaRecorder || !this.isRecording) {
      return
    }

    this.mediaRecorder.stop()
    this.isRecording = false
    
    console.log('Recording stopped')
  }

  pauseRecording(): void {
    if (!this.mediaRecorder || !this.isRecording) {
      return
    }

    this.mediaRecorder.pause()
    console.log('Recording paused')
  }

  resumeRecording(): void {
    if (!this.mediaRecorder) {
      return
    }

    this.mediaRecorder.resume()
    console.log('Recording resumed')
  }

  private startVisualization(): void {
    if (!this.analyser || !this.dataArray) {
      return
    }

    const visualize = () => {
      if (!this.isRecording || !this.analyser || !this.dataArray) {
        return
      }

      this.analyser.getByteFrequencyData(this.dataArray)
      this.onVisualizationCallback?.(this.dataArray)
      
      requestAnimationFrame(visualize)
    }

    visualize()
  }

  getAudioLevel(): number {
    if (!this.analyser || !this.dataArray) {
      return 0
    }

    this.analyser.getByteFrequencyData(this.dataArray)
    
    // Calculate average volume
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i]
    }
    
    return sum / this.dataArray.length / 255 // Normalize to 0-1
  }

  async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.filter(device => device.kind === 'audioinput')
    } catch (error) {
      console.error('Error getting audio devices:', error)
      return []
    }
  }

  async switchDevice(deviceId: string): Promise<void> {
    // Stop current recording and stream
    this.stopRecording()
    this.cleanup()

    // Start with new device
    this.audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: { exact: deviceId },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1
      }
    })

    // Reinitialize with new stream
    await this.initialize()
  }

  cleanup(): void {
    this.stopRecording()
    
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop())
      this.audioStream = null
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.mediaRecorder = null
    this.analyser = null
    this.microphone = null
    this.dataArray = null
  }

  onDataAvailable(callback: (data: Blob) => void): void {
    this.onDataAvailableCallback = callback
  }

  onVisualization(callback: (frequencyData: Uint8Array) => void): void {
    this.onVisualizationCallback = callback
  }

  get recordingState(): string {
    return this.mediaRecorder?.state || 'inactive'
  }

  get hasPermission(): boolean {
    return this.audioStream !== null
  }
}

// Utility functions for audio processing
export class AudioUtils {
  static async blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(blob)
    })
  }

  static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1]) // Remove data URL prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  static generateWaveformData(audioBuffer: AudioBuffer, samples: number = 100): number[] {
    const channelData = audioBuffer.getChannelData(0)
    const samplesPerPixel = Math.floor(channelData.length / samples)
    const waveformData: number[] = []

    for (let i = 0; i < samples; i++) {
      const start = i * samplesPerPixel
      const end = start + samplesPerPixel
      let sum = 0

      for (let j = start; j < end; j++) {
        sum += Math.abs(channelData[j])
      }

      waveformData.push(sum / samplesPerPixel)
    }

    return waveformData
  }
}

// Audio file processing
export class AudioFileProcessor {
  private audioContext: AudioContext

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }

  async processFile(file: File): Promise<{
    duration: number
    waveform: number[]
    audioBuffer: AudioBuffer
  }> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      
      const duration = audioBuffer.duration
      const waveform = AudioUtils.generateWaveformData(audioBuffer)

      return { duration, waveform, audioBuffer }
    } catch (error) {
      console.error('Error processing audio file:', error)
      throw error
    }
  }

  async convertToFormat(audioBuffer: AudioBuffer, format: 'wav' | 'mp3'): Promise<Blob> {
    // For now, we'll return WAV format
    // In a real implementation, you might use a library like lamejs for MP3 encoding
    
    const length = audioBuffer.length
    const channels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    
    const arrayBuffer = new ArrayBuffer(44 + length * channels * 2)
    const view = new DataView(arrayBuffer)
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }
    
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * channels * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, channels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * channels * 2, true)
    view.setUint16(32, channels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * channels * 2, true)
    
    // Convert float32 to int16
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < channels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true)
        offset += 2
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }
}
