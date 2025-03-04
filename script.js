// Constants
const SONG_CONFIG = {
  title: "El Carnaval",
  artist: "SntgRM",
  src: "mp3/song.mp3",
  cover: "images/cover-art.webp",
}

class AudioPlayer {
  constructor() {
    this.initializeElements()
    this.isDragging = false
    this.isVolumeDragging = false
    this.volume = 0.5
    this.setupEventListeners()
    this.loadSong()
  }

  initializeElements() {
    this.audio = document.getElementById("audio")
    this.playPauseBtn = document.getElementById("play-pause-btn")
    this.prevBtn = document.getElementById("prev-btn")
    this.nextBtn = document.getElementById("next-btn")
    this.replayBtn = document.getElementById("replay-btn")
    this.progressBar = document.getElementById("progress-bar")
    this.progressHandle = document.getElementById("progress-handle")
    this.progressContainer = document.getElementById("progress-container")
    this.currentTimeEl = document.querySelector(".current-time")
    this.totalTimeEl = document.querySelector(".total-time")
    this.volumeIcon = document.getElementById("volume-icon")
    this.volumeSlider = document.getElementById("volume-slider")
    this.volumeProgress = document.getElementById("volume-progress")
    this.volumeHandle = document.getElementById("volume-handle")

    // Bind methods to preserve 'this' context
    this.handleVolumeDrag = this.handleVolumeDrag.bind(this)
    this.stopVolumeDrag = this.stopVolumeDrag.bind(this)
  }

  setupEventListeners() {
    // Playback controls
    this.playPauseBtn.addEventListener("click", () => this.togglePlayPause())
    this.prevBtn.addEventListener("click", () => this.prevSong())
    this.nextBtn.addEventListener("click", () => this.nextSong())
    this.replayBtn.addEventListener("click", () => this.replaySong())
    this.audio.addEventListener("timeupdate", () => this.updateProgress())
    this.audio.addEventListener("loadedmetadata", () => {
      this.totalTimeEl.textContent = this.formatTime(this.audio.duration)
    })
    this.audio.addEventListener("ended", () => this.songEnded())

    // Progress bar interactions
    this.progressContainer.addEventListener("mousedown", (e) => this.startDragging(e))
    document.addEventListener("mousemove", (e) => this.handleDragging(e))
    document.addEventListener("mouseup", () => this.stopDragging())
    this.progressContainer.addEventListener("mouseover", () => this.showProgressHandle())
    this.progressContainer.addEventListener("mouseout", () => this.hideProgressHandle())

    // Volume controls - simplified approach
    this.volumeIcon.addEventListener("click", () => this.toggleMute())
    this.volumeSlider.addEventListener("click", (e) => this.setVolumeFromClick(e))
    this.volumeSlider.addEventListener("mousedown", (e) => this.startVolumeDrag(e))
  }

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  loadSong() {
    this.audio.src = SONG_CONFIG.src
    this.currentTimeEl.textContent = "0:00"
    this.audio.volume = this.volume
    this.updateVolumeUI()
  }

  togglePlayPause() {
    const isPlaying = this.playPauseBtn.innerHTML.includes("pause")
    isPlaying ? this.pauseSong() : this.playSong()
  }

  playSong() {
    this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'
    this.audio.play()
  }

  pauseSong() {
    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'
    this.audio.pause()
  }

  prevSong() {
    // For demo purposes, just restart the song
    this.audio.currentTime = 0
    this.updateProgress()
    if (this.playPauseBtn.innerHTML.includes("pause")) {
      this.playSong()
    }
  }

  nextSong() {
    // For demo purposes, just restart the song
    this.audio.currentTime = 0
    this.updateProgress()
    if (this.playPauseBtn.innerHTML.includes("pause")) {
      this.playSong()
    }
  }

  replaySong() {
    this.audio.currentTime = 0
    this.updateProgress()
    if (this.playPauseBtn.innerHTML.includes("pause")) {
      this.playSong()
    }
  }

  songEnded() {
    this.pauseSong()
    this.audio.currentTime = 0
    this.updateProgress()
  }

  updateProgress() {
    if (!this.isDragging) {
      const progress = (this.audio.currentTime / this.audio.duration) * 100
      this.updateProgressUI(progress)
      this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime)
    }
  }

  updateProgressUI(percent) {
    this.progressBar.style.width = `${percent}%`
    this.progressHandle.style.left = `${percent}%`
  }

  startDragging(e) {
    this.isDragging = true
    this.updateProgressFromEvent(e)
  }

  handleDragging(e) {
    if (this.isDragging) {
      this.updateProgressFromEvent(e)
    }
  }

  stopDragging() {
    if (this.isDragging) {
      this.isDragging = false
      const width = this.progressContainer.clientWidth
      const clickX = (Number.parseFloat(this.progressHandle.style.left) / 100) * width
      this.audio.currentTime = (clickX / width) * this.audio.duration
    }
  }

  updateProgressFromEvent(e) {
    const rect = this.progressContainer.getBoundingClientRect()
    const width = this.progressContainer.clientWidth
    let x = e.clientX - rect.left
    x = Math.max(0, Math.min(x, width))
    const percent = (x / width) * 100
    this.updateProgressUI(percent)
  }

  showProgressHandle() {
    this.progressHandle.style.display = "block"
  }

  hideProgressHandle() {
    if (!this.isDragging) {
      this.progressHandle.style.display = "none"
    }
  }

  // Completely rewritten volume control methods
  toggleMute() {
    if (this.audio.volume > 0) {
      this.lastVolume = this.audio.volume
      this.audio.volume = 0
    } else {
      this.audio.volume = this.lastVolume || 0.7
    }
    this.volume = this.audio.volume
    this.updateVolumeUI()
  }

  setVolumeFromClick(e) {
    if (this.isVolumeDragging) return

    const rect = this.volumeSlider.getBoundingClientRect()
    const width = this.volumeSlider.clientWidth
    const x = Math.max(0, Math.min(e.clientX - rect.left, width))
    const newVolume = x / width

    this.volume = newVolume
    this.audio.volume = newVolume
    this.updateVolumeUI()
  }

  startVolumeDrag(e) {
    e.preventDefault()
    this.isVolumeDragging = true

    // Set volume based on initial click
    this.setVolumeFromClick(e)

    // Add event listeners for dragging
    document.addEventListener("mousemove", this.handleVolumeDrag)
    document.addEventListener("mouseup", this.stopVolumeDrag)
  }

  handleVolumeDrag(e) {
    if (!this.isVolumeDragging) return

    const rect = this.volumeSlider.getBoundingClientRect()
    const width = this.volumeSlider.clientWidth
    const x = Math.max(0, Math.min(e.clientX - rect.left, width))
    const newVolume = x / width

    this.volume = newVolume
    this.audio.volume = newVolume
    this.updateVolumeUI()
  }

  stopVolumeDrag() {
    this.isVolumeDragging = false

    // Remove event listeners
    document.removeEventListener("mousemove", this.handleVolumeDrag)
    document.removeEventListener("mouseup", this.stopVolumeDrag)
  }

  updateVolumeUI() {
    // Update volume bar
    const volumePercent = this.audio.volume * 100
    this.volumeProgress.style.width = `${volumePercent}%`
    this.volumeHandle.style.left = `${volumePercent}%`
  
    // Update volume icon - usando className en lugar de innerHTML
    if (this.audio.volume === 0) {
      this.volumeIcon.className = 'fas fa-volume-mute'
    } else if (this.audio.volume < 0.5) { 
      this.volumeIcon.className = 'fas fa-volume-down'
    } else {
      this.volumeIcon.className = 'fas fa-volume-up'
    }
  }
}

class Navigation {
  constructor() {
    this.setupNavbar()
    this.setupSmoothScroll()
  }

  setupNavbar() {
    const navbar = document.querySelector(".navbar")
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50)
    })
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault()
        document.querySelector(anchor.getAttribute("href")).scrollIntoView({
          behavior: "smooth",
        })
      })
    })
  }
}

class ContactForm {
  constructor() {
    this.form = document.getElementById("contactForm")
    this.notification = document.getElementById("notification")
    if (this.form) {
      this.setupFormHandler()
    }
  }

  setupFormHandler() {
    this.form.addEventListener("submit", (e) => {
      e.preventDefault()
      this.showNotification()
      this.form.reset()
    })
  }

  showNotification() {
    this.notification.classList.add("show")
    setTimeout(() => {
      this.notification.classList.remove("show")
    }, 3000)
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new AudioPlayer()
  new Navigation()
  new ContactForm()
})

