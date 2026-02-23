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
            <n-descriptions-item label="Fecha Revisión">{{ formatDate(item.fecha_revision) }}</n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- Asignación -->
        <n-card title="Asignación">
          <n-descriptions :column="isMobile ? 1 : 2" label-placement="left">
            <n-descriptions-item label="Usuario Asignado">
              {{ item.usuario_asignado_nombre || 'Sin asignar' }}
            </n-descriptions-item>
            <n-descriptions-item label="Auditor">
              {{ item.auditor_nombre || 'Sin asignar' }}
            </n-descriptions-item>
            <n-descriptions-item label="Registrado por">
              {{ item.usuario_registro_nombre || 'N/A' }}
            </n-descriptions-item>
          </n-descriptions>
        </n-card>

        <!-- Foto -->
        <n-card title="Foto del Dispositivo">
          <div v-if="item.fotoid" class="foto-container">
            <img :src="item.fotoid" alt="Foto" class="foto-img" />
          </div>
          <n-empty v-else description="Sin foto" />
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
              Asignar Usuario
            </n-button>
            <n-button type="warning" @click="showRevisionModal = true" :block="isMobile">
              <template #icon><n-icon><CalendarOutline /></n-icon></template>
              Programar Revisión
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
        </n-grid>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button type="primary" :loading="saving" @click="handleUpdate">Guardar</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modal Asignar -->
    <n-modal v-model:show="showAsignarModal" preset="card" title="Asignar Usuario" style="width: 400px; max-width: 95vw;">
      <n-form-item label="Usuario">
        <n-select v-model:value="asignarForm.idusuario_asignado" :options="usuariosOptions" :loading="loadingUsuarios" filterable />
      </n-form-item>
      <template #footer>
        <n-space justify="end">
          <n-button type="primary" :loading="saving" @click="handleAsignar">Asignar</n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modal Revisión -->
    <n-modal v-model:show="showRevisionModal" preset="card" title="Programar Revisión" style="width: 400px; max-width: 95vw;">
      <n-form-item label="Fecha Revisión">
        <n-date-picker v-model:value="revisionForm.fecha_revision" type="date" style="width: 100%" />
      </n-form-item>
      <n-form-item label="Auditor">
        <n-select v-model:value="revisionForm.idauditoria" :options="usuariosOptions" :loading="loadingUsuarios" filterable />
      </n-form-item>
      <template #footer>
        <n-space justify="end">
          <n-button type="primary" :loading="saving" @click="handleRevision">Programar</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { CreateOutline, PersonAddOutline, CalendarOutline } from '@vicons/ionicons5'
import { inventarioApi, usuariosApi } from '../api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const loading = ref(false)
const saving = ref(false)
const item = ref({})
const showEditModal = ref(false)
const showAsignarModal = ref(false)
const showRevisionModal = ref(false)
const usuariosOptions = ref([])
const loadingUsuarios = ref(false)
const isMobile = ref(false)

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
  idusuario_asignado: null
})

const revisionForm = ref({
  fecha_revision: null,
  idauditoria: null
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

async function handleUpdate() {
  saving.value = true
  try {
    const data = {
      ...editForm.value,
      fechaentrega: editForm.value.fechaentrega ? new Date(editForm.value.fechaentrega).toISOString().split('T')[0] : null
    }
    await inventarioApi.update(item.value.id, data)
    message.success('Item actualizado correctamente')
    showEditModal.value = false
    loadItem()
  } catch (error) {
    message.error('Error al actualizar')
  } finally {
    saving.value = false
  }
}

async function handleAsignar() {
  saving.value = true
  try {
    await inventarioApi.asignarUsuario(item.value.id, asignarForm.value.idusuario_asignado)
    message.success('Usuario asignado correctamente')
    showAsignarModal.value = false
    loadItem()
  } catch (error) {
    message.error('Error al asignar')
  } finally {
    saving.value = false
  }
}

async function handleRevision() {
  saving.value = true
  try {
    const data = {
      fecha_revision: revisionForm.value.fecha_revision ? new Date(revisionForm.value.fecha_revision).toISOString().split('T')[0] : null,
      idauditoria: revisionForm.value.idauditoria
    }
    await inventarioApi.setRevision(item.value.id, data)
    message.success('Revisión programada correctamente')
    showRevisionModal.value = false
    loadItem()
  } catch (error) {
    message.error('Error al programar revisión')
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

.foto-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.foto-img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

/* Mobile styles */
@media (max-width: 767px) {
  .detail-header :deep(.n-page-header__title) {
    font-size: 16px;
  }
}
</style>
