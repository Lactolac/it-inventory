<template>
  <div>
    <n-card title="Gestión de Departamentos" :bordered="false" class="main-card">
      <template #header-extra>
        <n-button type="primary" @click="openCreate" size="small" class="create-btn">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          <span class="btn-text">Nuevo Departamento</span>
        </n-button>
      </template>

      <n-space vertical size="large">
        <n-input
          v-model:value="searchText"
          placeholder="Buscar departamento..."
          clearable
          @update:value="handleSearch"
          class="search-input"
        >
          <template #prefix>
            <n-icon><SearchOutline /></n-icon>
          </template>
        </n-input>

        <!-- Desktop table -->
        <n-data-table
          :columns="columns"
          :data="departamentos"
          :loading="loading"
          :pagination="pagination"
          :row-key="row => row.id"
          class="desktop-table"
        />

        <!-- Mobile cards -->
        <div class="mobile-cards">
          <n-spin :show="loading">
            <n-space vertical size="small">
              <n-card 
                v-for="depto in departamentos" 
                :key="depto.id" 
                size="small" 
                hoverable
                class="mobile-card"
              >
                <template #header>
                  <div class="card-header">
                    <span class="depto-nombre">{{ depto.nombre }}</span>
                  </div>
                </template>
                <div class="card-content">
                  <div class="card-info">
                    <span class="info-label">País:</span>
                    <span>{{ depto.pais_nombre || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">CD:</span>
                    <span>{{ depto.cd_nombre || '-' }}</span>
                  </div>
                  <div class="card-stats">
                    <n-tag type="info" size="small">Usuarios: {{ depto.total_usuarios || 0 }}</n-tag>
                    <n-tag type="success" size="small">Licencias: {{ depto.total_licencias || 0 }}</n-tag>
                    <n-tag type="warning" size="small">Puestos: {{ depto.total_puestos || 0 }}</n-tag>
                  </div>
                </div>
                <template #action>
                  <n-space justify="end">
                    <n-button size="small" @click="viewPuestos(depto)">Ver Puestos</n-button>
                    <n-button size="small" @click="handleEdit(depto)">Editar</n-button>
                    <n-popconfirm @positive-click="handleDelete(depto.id)">
                      <template #trigger>
                        <n-button size="small" type="error">Eliminar</n-button>
                      </template>
                      ¿Está seguro de eliminar este departamento?
                    </n-popconfirm>
                  </n-space>
                </template>
              </n-card>
            </n-space>
          </n-spin>
        </div>
      </n-space>
    </n-card>

    <!-- Modal para crear/editar -->
    <n-modal v-model:show="showModal" preset="dialog" :title="editingId ? 'Editar Departamento' : 'Nuevo Departamento'">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item label="Nombre" path="nombre">
          <n-input v-model:value="formData.nombre" placeholder="Nombre del departamento" />
        </n-form-item>
        <n-form-item label="País" path="idpais">
          <n-select 
            v-model:value="formData.idpais" 
            :options="paisesOptions" 
            placeholder="Seleccionar país"
            clearable
            :loading="loadingPaises"
            @update:value="handlePaisChange"
          />
        </n-form-item>
        <n-form-item label="Centro de Distribución (CD)" path="idcd">
          <n-select 
            v-model:value="formData.idcd" 
            :options="cdOptions" 
            placeholder="Seleccionar CD"
            clearable
            :loading="loadingCDs"
            :disabled="!formData.idpais"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            {{ editingId ? 'Actualizar' : 'Crear' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modal para ver puestos -->
    <n-modal v-model:show="showPuestosModal" preset="card" title="Puestos del Departamento" style="width: 600px; max-width: 95vw;">
      <template #header-extra>
        <n-button type="primary" size="small" @click="showAddPuestoModal">
          Agregar Puesto
        </n-button>
      </template>
      
      <!-- Desktop table -->
      <n-data-table
        :columns="puestosColumns"
        :data="puestos"
        :loading="loadingPuestos"
        size="small"
        class="desktop-table"
      />

      <!-- Mobile cards -->
      <div class="mobile-cards">
        <n-spin :show="loadingPuestos">
          <n-space vertical size="small">
            <n-card 
              v-for="puesto in puestos" 
              :key="puesto.id" 
              size="small" 
              hoverable
              class="mobile-card"
            >
              <div class="card-header">
                <span class="puesto-nombre">{{ puesto.nombre }}</span>
              </div>
              <template #action>
                <n-popconfirm @positive-click="handleDeletePuesto(puesto.id)">
                  <template #trigger>
                    <n-button size="small" type="error">Eliminar</n-button>
                  </template>
                  ¿Está seguro de eliminar este puesto?
                </n-popconfirm>
              </template>
            </n-card>
          </n-space>
        </n-spin>
      </div>
    </n-modal>

    <!-- Modal para agregar puesto -->
    <n-modal v-model:show="showPuestoForm" preset="dialog" title="Nuevo Puesto">
      <n-form ref="puestoFormRef" :model="puestoData" :rules="puestoRules">
        <n-form-item label="Nombre del Puesto" path="nombre">
          <n-input v-model:value="puestoData.nombre" placeholder="Nombre del puesto" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button type="primary" :loading="savingPuesto" @click="handleSavePuesto">
            Crear
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modal preguntar si desea crear puestos -->
    <n-modal v-model:show="showPreguntaPuestos" preset="dialog" title="Crear Puestos" content="¿Desea crear puestos para este departamento?" positive-text="Sí" negative-text="No" @positive-click="handleCrearPuestos" @negative-click="handleNoCrearPuestos" />
  </div>
</template>

<script setup>
import { ref, reactive, h, onMounted, computed } from 'vue'
import { NButton, NSpace, NTag, NPopconfirm, NIcon, useMessage } from 'naive-ui'
import { departamentosApi, puestosApi, paisesApi, centrosDistribucionApi } from '../api'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const searchText = ref('')
const departamentos = ref([])
const formRef = ref(null)
const lastCreatedDepto = ref(null)

const formData = reactive({
  nombre: '',
  idpais: null,
  idcd: null
})

const rules = {
  nombre: [{ required: true, message: 'El nombre es requerido', trigger: 'blur' }]
}

const pagination = reactive({
  pageSize: 10
})

// Paises y CDs
const paises = ref([])
const loadingPaises = ref(false)
const centrosDistribucion = ref([])
const loadingCDs = ref(false)

const paisesOptions = computed(() => {
  return paises.value.map(p => ({
    label: p.nombre,
    value: p.id
  }))
})

const cdOptions = computed(() => {
  return centrosDistribucion.value.map(cd => ({
    label: cd.nombre,
    value: cd.id
  }))
})

// Puestos
const showPuestosModal = ref(false)
const loadingPuestos = ref(false)
const puestos = ref([])
const selectedDepartamento = ref(null)
const showPuestoForm = ref(false)
const savingPuesto = ref(false)
const puestoFormRef = ref(null)
const puestoData = reactive({
  nombre: ''
})

const puestoRules = {
  nombre: [{ required: true, message: 'El nombre es requerido', trigger: 'blur' }]
}

// Pregunta para crear puestos
const showPreguntaPuestos = ref(false)

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: 'Nombre',
    key: 'nombre'
  },
  {
    title: 'País',
    key: 'pais_nombre',
    render(row) {
      return row.pais_nombre || '-'
    }
  },
  {
    title: 'CD',
    key: 'cd_nombre',
    render(row) {
      return row.cd_nombre || '-'
    }
  },
  {
    title: 'Usuarios',
    key: 'total_usuarios',
    width: 100,
    render(row) {
      return h(NTag, { type: 'info' }, { default: () => row.total_usuarios || 0 })
    }
  },
  {
    title: 'Licencias',
    key: 'total_licencias',
    width: 100,
    render(row) {
      return h(NTag, { type: 'success' }, { default: () => row.total_licencias || 0 })
    }
  },
  {
    title: 'Puestos',
    key: 'total_puestos',
    width: 100,
    render(row) {
      return h(NTag, { type: 'warning' }, { default: () => row.total_puestos || 0 })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 250,
    render(row) {
      return h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => viewPuestos(row) }, { default: () => 'Ver Puestos' }),
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => 'Editar' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => 'Eliminar' }),
            default: () => '¿Está seguro de eliminar este departamento?'
          })
        ]
      })
    }
  }
]

const puestosColumns = [
  {
    title: 'ID',
    key: 'id',
    width: 60
  },
  {
    title: 'Nombre',
    key: 'nombre'
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render(row) {
      return h(NPopconfirm, {
        onPositiveClick: () => handleDeletePuesto(row.id)
      }, {
        trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => 'Eliminar' }),
        default: () => '¿Está seguro de eliminar este puesto?'
      })
    }
  }
]

const loadPaises = async () => {
  loadingPaises.value = true
  try {
    const response = await paisesApi.getActive()
    paises.value = response.data.data
  } catch (error) {
    console.error('Error loading paises:', error)
  } finally {
    loadingPaises.value = false
  }
}

const loadCDsByPais = async (idpais) => {
  if (!idpais) {
    centrosDistribucion.value = []
    return
  }
  loadingCDs.value = true
  try {
    const response = await centrosDistribucionApi.getByPais(idpais)
    centrosDistribucion.value = response.data.data
  } catch (error) {
    console.error('Error loading CDs:', error)
  } finally {
    loadingCDs.value = false
  }
}

const handlePaisChange = (value) => {
  formData.idcd = null
  if (value) {
    loadCDsByPais(value)
  } else {
    centrosDistribucion.value = []
  }
}

const loadDepartamentos = async () => {
  loading.value = true
  try {
    const response = await departamentosApi.getAll({ search: searchText.value })
    departamentos.value = response.data.data
  } catch (error) {
    message.error('Error al cargar departamentos')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadDepartamentos()
}

const openCreate = () => {
  editingId.value = null
  formData.nombre = ''
  formData.idpais = null
  formData.idcd = null
  centrosDistribucion.value = []
  showModal.value = true
}

const handleEdit = async (row) => {
  editingId.value = row.id
  formData.nombre = row.nombre
  formData.idpais = row.idpais
  formData.idcd = row.idcd
  
  // Load CDs for the selected pais
  if (row.idpais) {
    await loadCDsByPais(row.idpais)
  }
  
  showModal.value = true
}

const handleSave = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  saving.value = true
  try {
    if (editingId.value) {
      await departamentosApi.update(editingId.value, formData)
      message.success('Departamento actualizado correctamente')
      showModal.value = false
    } else {
      const response = await departamentosApi.create(formData)
      lastCreatedDepto.value = response.data
      message.success('Departamento creado correctamente')
      showModal.value = false
      // Preguntar si desea crear puestos
      showPreguntaPuestos.value = true
    }
    resetForm()
    loadDepartamentos()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al guardar departamento')
  } finally {
    saving.value = false
  }
}

const handleCrearPuestos = () => {
  showPreguntaPuestos.value = false
  if (lastCreatedDepto.value) {
    selectedDepartamento.value = lastCreatedDepto.value
    puestos.value = []
    showPuestosModal.value = true
    showPuestoForm.value = true
  }
}

const handleNoCrearPuestos = () => {
  showPreguntaPuestos.value = false
  lastCreatedDepto.value = null
}

const handleDelete = async (id) => {
  try {
    await departamentosApi.delete(id)
    message.success('Departamento eliminado correctamente')
    loadDepartamentos()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al eliminar departamento')
  }
}

const resetForm = () => {
  editingId.value = null
  formData.nombre = ''
  formData.idpais = null
  formData.idcd = null
  centrosDistribucion.value = []
  formRef.value?.restoreValidation()
}

const viewPuestos = async (row) => {
  selectedDepartamento.value = row
  showPuestosModal.value = true
  loadingPuestos.value = true
  try {
    const response = await departamentosApi.getPuestos(row.id)
    puestos.value = response.data.data
  } catch (error) {
    message.error('Error al cargar puestos')
  } finally {
    loadingPuestos.value = false
  }
}

const showAddPuestoModal = () => {
  puestoData.nombre = ''
  showPuestoForm.value = true
}

const handleSavePuesto = async () => {
  try {
    await puestoFormRef.value?.validate()
  } catch {
    return
  }

  savingPuesto.value = true
  try {
    await puestosApi.create({
      nombre: puestoData.nombre,
      iddepartamento: selectedDepartamento.value.id
    })
    message.success('Puesto creado correctamente')
    showPuestoForm.value = false
    puestoData.nombre = ''
    // Recargar puestos
    const response = await departamentosApi.getPuestos(selectedDepartamento.value.id)
    puestos.value = response.data.data
    loadDepartamentos()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al crear puesto')
  } finally {
    savingPuesto.value = false
  }
}

const handleDeletePuesto = async (id) => {
  try {
    await puestosApi.delete(id)
    message.success('Puesto eliminado correctamente')
    const response = await departamentosApi.getPuestos(selectedDepartamento.value.id)
    puestos.value = response.data.data
    loadDepartamentos()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al eliminar puesto')
  }
}

onMounted(() => {
  loadDepartamentos()
  loadPaises()
})
</script>

<style scoped>
.main-card {
  min-height: calc(100vh - 120px);
}

.search-input {
  max-width: 300px;
}

.desktop-table {
  display: table;
}

.mobile-cards {
  display: none;
}

.btn-text {
  display: inline;
}

/* Mobile styles */
@media (max-width: 767px) {
  .search-input {
    max-width: 100% !important;
    width: 100% !important;
  }
  
  .desktop-table {
    display: none;
  }
  
  .mobile-cards {
    display: block;
  }
  
  .mobile-card {
    margin-bottom: 8px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .depto-nombre, .puesto-nombre {
    font-weight: 600;
    font-size: 14px;
  }
  
  .card-content {
    padding: 8px 0;
  }
  
  .card-info {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 13px;
  }
  
  .info-label {
    color: #666;
    min-width: 40px;
  }
  
  .card-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  
  .btn-text {
    display: none;
  }
  
  .create-btn {
    padding: 0 8px;
  }
}
</style>
