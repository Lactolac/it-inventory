<template>
  <n-modal
    v-model:show="show"
    preset="card"
    title="Cámara"
    style="width: 600px; max-width: 95vw;"
    :mask-closable="false"
    @after-leave="handleClose"
  >
    <div class="camera-container">
      <div v-show="!previewImage" class="video-wrap">
        <video ref="videoRef" autoplay playsinline class="video-element"></video>
        <div class="video-overlay" v-if="loading">
          <n-spin size="large" />
        </div>
      </div>
      
      <div v-if="previewImage" class="preview-wrap">
        <img :src="previewImage" class="preview-element" />
      </div>

      <div class="controls">
        <n-space justify="center" align="center">
          <template v-if="!previewImage">
            <n-button circle size="large" @click="toggleFacingMode" v-if="hasMultipleCameras">
              <template #icon><n-icon><SyncOutline /></n-icon></template>
            </n-button>
            <n-button type="primary" circle size="large" @click="takePhoto" :disabled="loading">
              <template #icon><n-icon><CameraOutline /></n-icon></template>
            </n-button>
            <n-button circle size="large" @click="close">
              <template #icon><n-icon><CloseOutline /></n-icon></template>
            </n-button>
          </template>
          
          <template v-else>
            <n-button type="error" quaternary @click="discardPhoto">Descartar</n-button>
            <n-button type="info" secondary @click="saveAndAnother">Agregar y otra</n-button>
            <n-button type="primary" @click="saveAndClose">Agregar y cerrar</n-button>
          </template>
        </n-space>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { ref, watch, onUnmounted, computed } from 'vue'
import { CameraOutline, SyncOutline, CloseOutline, CheckmarkOutline } from '@vicons/ionicons5'

const props = defineProps({
  show: Boolean
})

const emit = defineEmits(['update:show', 'capture'])

const videoRef = ref(null)
const stream = ref(null)
const loading = ref(false)
const previewImage = ref(null)
const facingMode = ref('environment')
const hasMultipleCameras = ref(false)

const show = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

watch(() => props.show, (newVal) => {
  if (newVal) {
    startCamera()
    checkCameras()
  } else {
    stopCamera()
  }
})

async function checkCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const cameras = devices.filter(device => device.kind === 'videoinput')
    hasMultipleCameras.value = cameras.length > 1
  } catch (err) {
    console.error('Error checking cameras:', err)
  }
}

async function startCamera() {
  loading.value = true
  stopCamera()
  
  try {
    const constraints = {
      video: {
        facingMode: facingMode.value,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    }
    
    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (err) {
    console.error('Error accessing camera:', err)
    // Fallback if environment failed (maybe desktop)
    if (facingMode.value === 'environment') {
      facingMode.value = 'user'
      startCamera()
    }
  } finally {
    loading.value = false
  }
}

function stopCamera() {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }
}

function toggleFacingMode() {
  facingMode.value = facingMode.value === 'environment' ? 'user' : 'environment'
  startCamera()
}

function takePhoto() {
  if (!videoRef.value) return
  
  const canvas = document.createElement('canvas')
  canvas.width = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoRef.value, 0, 0)
  
  previewImage.value = canvas.toDataURL('image/jpeg', 0.8)
}

function discardPhoto() {
  previewImage.value = null
}

function saveAndAnother() {
  emitCapture()
  previewImage.value = null
}

function saveAndClose() {
  emitCapture()
  close()
}

function emitCapture() {
  if (!previewImage.value) return
  
  // Convert base64 to File object
  const byteString = atob(previewImage.value.split(',')[1])
  const mimeString = previewImage.value.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([ab], { type: mimeString })
  const file = new File([blob], `camera_${Date.now()}.jpg`, { type: 'image/jpeg' })
  
  emit('capture', {
    file,
    preview: previewImage.value
  })
}

function close() {
  show.value = false
}

function handleClose() {
  stopCamera()
  previewImage.value = null
}

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.camera-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  padding: 10px;
}

.video-wrap, .preview-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a1a1a;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.video-element, .preview-element {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
}

.controls {
  padding: 10px 0;
}
</style>
