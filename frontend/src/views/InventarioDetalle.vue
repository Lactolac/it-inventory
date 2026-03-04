<template>
  <div>
    <n-page-header @back="router.back()" class="detail-header">
      <template #title>Detalle de Inventario</template>
    </n-page-header>

    <n-spin :show="loading">
      <n-space vertical size="large" style="margin-top: 20px">
        <!-- Información General -->
        <n-card title="Información General">
          <n-descriptions :column="isMobile ? 1 : 3" label-placement="left">
            <n-descriptions-item label="No. Serie">{{ item.nserie || 'N/A' }}</n-descriptions-item>
            <n-descriptions-item label="Marca">{{ item.marca || 'N/A' }}</n-descriptions-item>
            <n-descriptions-item label="Modelo">{{ item.modelo || 'N/A' }}</n-descriptions-item>
            <n-descriptions-item label="Activo Fijo">{{ item.nactivofijo || 'N/A' }}</n-descriptions-item>
            <n-descriptions-item label="Tipo">{{ item.tipo_dispositivo || 'N/A' }}</n-descriptions-item>
            <n-descriptions-item label="Cantidad">{{ item.cantidad || 1 }}</n-descriptions-item>
            <n-descriptions-item label="Fecha Ingreso">{{ formatDate(item.fechaingreso) }}</n-descriptions-item>
            <n-descriptions-item label="Fecha Entrega">{{ formatDate(item.fechaentrega) }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- Entrega / Asignación -->
        <n-card title="Entrega / Asignación">
          <n-descriptions :column="isMobile ? 1 : 2" label-placement="left">
            <n-descriptions-item label="Personal Asignado">
              <n-tag :type="item.usuario_asignado_nombre ? 'success' : 'default'">
                {{ item.usuario_asignado_nombre || 'Pendiente de Entregar' }}
              </n-tag>
            </n-descriptions-item>
            <n-descriptions-item label="Fecha de Entrega">
              {{ formatDate(item.fechaentrega) }}
            </n-descriptions-item>
            <n-descriptions-item label="Auditor de Entrega">
              {{ item.auditor_nombre || 'Sin asignar' }}
            </n-descriptions-item>
            <n-descriptions-item label="Registrado por">
              {{ item.usuario_registro_nombre || 'N/A' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- Fotos Entrega -->
        <n-card title="Fotos de Entrega">
          <div v-if="item.fotos_entrega?.length > 0" class="gallery-container">
            <n-image-group>
              <n-space>
                <n-image
                  v-for="(photo, index) in item.fotos_entrega"
                  :key="index"
                  :src="getPhotoUrl(photo)"
                  width="150"
                  class="gallery-img"
                  border-radius="8"
                />
              </n-space>
            </n-image-group>
          </div>
          <n-empty v-else description="Sin fotos de entrega" />
        </n-card>

        <!-- Fotos Recepción -->
        <n-card title="Fotos de Recepción">
          <div v-if="item.fotos_recepcion?.length > 0" class="gallery-container">
            <n-image-group>
              <n-space>
                <n-image
                  v-for="(photo, index) in item.fotos_recepcion"
                  :key="index"
                  :src="getPhotoUrl(photo)"
                  width="150"
                  class="gallery-img"
                  border-radius="8"
                />
              </n-space>
            </n-image-group>
          </div>
          <n-empty v-else description="Sin fotos de recepción" />
        </n-card>

        <!-- Acciones -->
        <n-card title="Acciones">
          <n-space :vertical="isMobile" :size="isMobile ? 'small' : 'medium'">
            <n-button type="primary" @click="showEditModal = true" :block="isMobile">
              <template #icon><n-icon><CreateOutline /></n-icon></template>
              Editar
            </n-button>
            <n-button type="info" @click="showAsignarModal = true" :block="isMobile">
              <template #icon><n-icon><PersonAddOutline /></n-icon></template>
              Entregar Equipo
            </n-button>
          </n-space>
        </n-card>
      </n-space>
    </n-spin>

    <!-- Modal Editar -->
    <n-modal v-model:show="showEditModal" preset="card" title="Editar Item" style="width: 600px; max-width: 95vw;">
      <n-form :model="editForm" label-placement="top">
        <n-grid :cols="isMobile ? 1 : 2" :x-gap="20">
          <n-gi>
            <n-form-item label="No. Serie">
              <n-input v-model:value="editForm.nserie" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Activo Fijo">
              <n-input v-model:value="editForm.nactivofijo" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Marca">
              <n-input v-model:value="editForm.marca" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Modelo">
              <n-input v-model:value="editForm.modelo" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Fecha Entrega">
              <n-date-picker v-model:value="editForm.fechaentrega" type="date" style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Tipo">
              <n-select v-model:value="editForm.tipo_dispositivo" :options="tipoOptions" />
            </n-form-item>
          </n-gi>
          <n-gi :span="isMobile ? 1 : 2">
            <n-form-item label="Agregar fotos">
              <n-space vertical style="width: 100%">
                <n-divider title-placement="left">Fotos de Entrega</n-divider>
                <n-upload
                  ref="uploadEntregaRef"
                  multiple
                  v-model:file-list="fileListEntrega"
                  :max="10"
                  accept="image/*"
                  :default-upload="false"
                  style="display: none"
                />
                <n-dropdown trigger="click" :options="photoOptions" @select="(key) => handlePhotoAction(key, 'entrega')">
                  <n-button type="info" secondary block>
                    <template #icon><n-icon><AddOutline /></n-icon></template>
                    Agregar Fotos de Entrega
                  </n-button>
                </n-dropdown>
                <n-upload
                  multiple
                  list-type="image-card"
                  v-model:file-list="fileListEntrega"
                  :max="10"
                  accept="image/*"
                  :show-trigger="false"
                />

                <n-divider title-placement="left">Fotos de Recepción</n-divider>
                <n-upload
                  ref="uploadRecepcionRef"
                  multiple
                  v-model:file-list="fileListRecepcion"
                  :max="10"
                  accept="image/*"
                  :default-upload="false"
                  style="display: none"
                />
                <n-dropdown trigger="click" :options="photoOptions" @select="(key) => handlePhotoAction(key, 'recepcion')">
                  <n-button type="warning" secondary block>
                    <template #icon><n-icon><AddOutline /></n-icon></template>
                    Agregar Fotos de Recepción
                  </n-button>
                </n-dropdown>
                <n-upload
                  multiple
                  list-type="image-card"
                  v-model:file-list="fileListRecepcion"
                  :max="10"
                  accept="image/*"
                  :show-trigger="false"
                />
              </n-space>
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>

      <!-- Custom Camera Modal -->
      <CameraModal v-model:show="showCamera" @capture="handleCapture" />
      <template #footer>
        <n-space justify="end">
          <n-button type="primary" :loading="saving" @click="handleUpdate">Guardar</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-modal v-model:show="showAsignarModal" preset="card" title="Entregar Equipo" style="width: 450px; max-width: 95vw;">
      <n-space vertical>
        <n-form-item label="Usuario que recibe">
          <n-select v-model:value="asignarForm.idusuario_asignado" :options="usuariosOptions" :loading="loadingUsuarios" filterable placeholder="Seleccione un usuario" />
        </n-form-item>
        <n-form-item label="Fecha de Entrega">
          <n-date-picker v-model:value="asignarForm.fechaentrega" type="date" style="width: 100%" placeholder="Seleccione fecha" />
        </n-form-item>
      </n-space>
      <template #footer>
        <n-space justify="end">
          <n-button type="primary" :loading="saving" :disabled="!asignarForm.idusuario_asignado" @click="handleAsignar">Entregar</n-button>
        </n-space>
      </template>
    </n-modal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, NImage, NImageGroup, NUpload, NIcon, NDropdown, NDivider, NDatePicker, NTag } from 'naive-ui'
import { CreateOutline, PersonAddOutline, CalendarOutline, CameraOutline, AddOutline, ImageOutline } from '@vicons/ionicons5'
import { inventarioApi, usuariosApi } from '../api'
import CameraModal from '../components/CameraModal.vue'

const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const saving = ref(false)
const item = ref({})
const showEditModal = ref(false)
const usuariosOptions = ref([])
const loadingUsuarios = ref(false)
const isMobile = ref(false)
const uploadEntregaRef = ref(null)
const uploadRecepcionRef = ref(null)
const fileListEntrega = ref([])
const fileListRecepcion = ref([])
const showCamera = ref(false)
const captureCategory = ref('entrega')

const photoOptions = [
  {
    label: 'Subir desde Archivo',
    key: 'upload',
    icon: () => h(NIcon, null, { default: () => h(ImageOutline) })
  },
  {
    label: 'Tomar Foto',
    key: 'camera',
    icon: () => h(NIcon, null, { default: () => h(CameraOutline) })
  }
]

const getPhotoUrl = (photo) => {
  if (photo.startsWith('data:') || photo.startsWith('http')) return photo
  return `${API_URL}${photo}`
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

const editForm = ref({
  nserie: '',
  marca: '',
  modelo: '',
  nactivofijo: '',
  tipo_dispositivo: null,
  fechaentrega: null
})

const asignarForm = ref({
  idusuario_asignado: null,
  fechaentrega: Date.now()
})


const tipoOptions = [
  { label: 'Laptop', value: 'Laptop' },
  { label: 'Desktop', value: 'Desktop' },
  { label: 'Server', value: 'Server' },
  { label: 'Monitor', value: 'Monitor' },
  { label: 'Impresora', value: 'Impresora' },
  { label: 'Switch', value: 'Switch' },
  { label: 'Router', value: 'Router' },
  { label: 'Otro', value: 'Otro' }
]

function formatDate(date) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

async function loadItem() {
  loading.value = true
  try {
    const response = await inventarioApi.getById(route.params.id)
    item.value = response.data.data
    
    editForm.value = {
      nserie: item.value.nserie || '',
      marca: item.value.marca || '',
      modelo: item.value.modelo || '',
      nactivofijo: item.value.nactivofijo || '',
      tipo_dispositivo: item.value.tipo_dispositivo,
      fechaentrega: item.value.fechaentrega ? new Date(item.value.fechaentrega).getTime() : null
    }
  } catch (error) {
    message.error('Error al cargar item')
    router.back()
  } finally {
    loading.value = false
  }
}

async function loadUsuarios() {
  loadingUsuarios.value = true
  try {
    const response = await usuariosApi.getAll({ limit: 1000 })
    usuariosOptions.value = (response.data.data || []).map(u => ({
      label: u.nombre,
      value: u.id
    }))
  } catch (error) {
    console.error('Error loading usuarios')
  } finally {
    loadingUsuarios.value = false
  }
}

function handlePhotoAction(key, category) {
  captureCategory.value = category
  if (key === 'upload') {
    const ref = category === 'entrega' ? uploadEntregaRef : uploadRecepcionRef
    const uploadInput = ref.value?.$el.querySelector('input[type="file"]')
    if (uploadInput) uploadInput.click()
  } else if (key === 'camera') {
    showCamera.value = true
  }
}

function handleCapture({ file, preview }) {
  const targetList = captureCategory.value === 'entrega' ? fileListEntrega : fileListRecepcion
  targetList.value.push({
    id: 'camera-' + Date.now(),
    name: file.name,
    status: 'finished',
    file: file,
    url: preview
  })
}

async function handleUpdate() {
  saving.value = true
  try {
    const formData = new FormData()
    
    // Core fields
    Object.keys(editForm.value).forEach(key => {
      let val = editForm.value[key]
      if (key === 'fechaentrega' && val) {
        val = new Date(val).toISOString().split('T')[0]
      }
      if (val !== null && val !== undefined) {
        formData.append(key, val)
      }
    })

    // Existing Photos - Entrega
    if (item.value.fotos_entrega) {
      formData.append('fotos_entrega', typeof item.value.fotos_entrega === 'string' 
        ? item.value.fotos_entrega 
        : JSON.stringify(item.value.fotos_entrega))
    }
    // New Photos - Entrega
    fileListEntrega.value.forEach(f => {
      if (f.file) formData.append('fotos_entrega', f.file)
    })

    // Existing Photos - Recepcion
    if (item.value.fotos_recepcion) {
      formData.append('fotos_recepcion', typeof item.value.fotos_recepcion === 'string' 
        ? item.value.fotos_recepcion 
        : JSON.stringify(item.value.fotos_recepcion))
    }
    // New Photos - Recepcion
    fileListRecepcion.value.forEach(f => {
      if (f.file) formData.append('fotos_recepcion', f.file)
    })

    await inventarioApi.update(item.value.id, formData)
    message.success('Item actualizado')
    showEditModal.value = false
    fileListEntrega.value = []
    fileListRecepcion.value = []
    loadItem()
  } catch (error) {
    message.error('Error al actualizar: ' + (error.response?.data?.message || error.message))
  } finally {
    saving.value = false
  }
}

async function handleAsignar() {
  saving.value = true
  try {
    const data = {
      idusuario_asignado: asignarForm.value.idusuario_asignado,
      fechaentrega: asignarForm.value.fechaentrega ? new Date(asignarForm.value.fechaentrega).toISOString().split('T')[0] : null
    }
    await inventarioApi.asignarUsuario(item.value.id, data)
    message.success('Equipo entregado correctamente')
    showAsignarModal.value = false
    loadItem()
  } catch (error) {
    message.error('Error al realizar la entrega')
  } finally {
    saving.value = false
  }
}


onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  loadItem()
  loadUsuarios()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.detail-header {
  overflow: hidden;
}

.firma-container {
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.firma-img {
  max-width: 100%;
  max-height: 150px;
}

.gallery-container {
  min-height: 100px;
  padding: 10px;
}

.gallery-img {
  border-radius: 8px;
  cursor: pointer;
  object-fit: cover;
  border: 1px solid #eee;
}

/* Mobile styles */
@media (max-width: 767px) {
  .detail-header :deep(.n-page-header__title) {
    font-size: 16px;
  }
}
</style>
