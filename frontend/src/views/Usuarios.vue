<template>
  <div>
    <n-card title="Gestión de Usuarios" :bordered="false" class="main-card">
      <template #header-extra>
        <n-button type="primary" @click="openCreate" size="small" class="create-btn">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          <span class="btn-text">Nuevo Usuario</span>
        </n-button>
      </template>

      <n-space vertical size="large">
        <div class="filters">
          <n-input v-model:value="search" placeholder="Buscar..." clearable class="filter-item search-input" @update:value="handleSearch">
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          
          <n-select 
            v-model:value="paisFilter" 
            :options="paisOptions" 
            placeholder="País"
            clearable
            class="filter-item"
            :loading="loadingPaises"
            @update:value="handlePaisFilterChange"
          />

          <n-select 
            v-model:value="cdFilter" 
            :options="cdOptions" 
            placeholder="CD"
            clearable
            class="filter-item"
            :loading="loadingCDs"
            :disabled="!paisFilter"
            @update:value="handleCDFilterChange"
          />

          <n-select 
            v-model:value="departamentoFilter" 
            :options="departamentoOptions" 
            placeholder="Departamento"
            clearable
            class="filter-item"
            :loading="loadingDepartamentos"
            :disabled="!cdFilter"
            @update:value="handleSearch"
          />
        </div>

        <!-- Desktop table -->
        <n-data-table
          :columns="columns"
          :data="data"
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
                v-for="item in data" 
                :key="item.id" 
                size="small" 
                hoverable
                class="mobile-card"
              >
                <template #header>
                  <div class="card-header">
                    <span class="item-nombre">{{ item.nombre }}</span>
                    <n-tag v-if="item.inventario_nserie" type="success" size="small">
                      {{ item.inventario_nserie }}
                    </n-tag>
                  </div>
                </template>
                <div class="card-content">
                  <div class="card-info">
                    <span class="info-label">Correo:</span>
                    <span>{{ item.correo || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">País:</span>
                    <span>{{ item.pais_nombre || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">CD:</span>
                    <span>{{ item.cd_nombre || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Departamento:</span>
                    <span>{{ item.departamento_nombre || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Puesto:</span>
                    <span>{{ item.puesto_nombre || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Equipo:</span>
                    <span>{{ item.inventario_nserie || 'Sin asignar' }}</span>
                  </div>
                </div>
                <template #action>
                  <n-space justify="end">
                    <n-button size="small" @click="handleEdit(item)">Editar</n-button>
                    <n-button size="small" type="error" @click="handleDelete(item)">Eliminar</n-button>
                  </n-space>
                </template>
              </n-card>
            </n-space>
          </n-spin>
        </div>
      </n-space>
    </n-card>

    <!-- Modal Crear/Editar -->
    <n-modal v-model:show="showModal" preset="card" :title="editingItem ? 'Editar Usuario' : 'Nuevo Usuario'" style="width: 600px; max-width: 95vw;">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-grid :cols="24" :x-gap="20">
          <n-gi :span="12" class="form-col">
            <n-form-item label="Nombre" path="nombre">
              <n-input v-model:value="form.nombre" placeholder="Nombre completo" />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Correo" path="correo">
              <n-input v-model:value="form.correo" placeholder="correo@empresa.com" />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="País" path="idpais">
              <n-select 
                v-model:value="form.idpais" 
                :options="paisOptions" 
                placeholder="Seleccionar país"
                :loading="loadingPaises"
                @update:value="handlePaisChange"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Centro de Distribución" path="idcd">
              <n-select 
                v-model:value="form.idcd" 
                :options="cdOptionsModal" 
                placeholder="Seleccionar CD"
                :loading="loadingCDsModal"
                :disabled="!form.idpais"
                @update:value="handleCDChange"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Departamento" path="iddepartamento">
              <n-select 
                v-model:value="form.iddepartamento" 
                :options="departamentoModalOptions" 
                placeholder="Seleccionar departamento"
                :loading="loadingDepartamentosModal"
                :disabled="!form.idcd"
                @update:value="handleDepartamentoChange"
              />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Puesto" path="idpuesto">
              <n-select 
                v-model:value="form.idpuesto" 
                :options="puestoOptions" 
                placeholder="Seleccionar puesto"
                :loading="loadingPuestos"
                :disabled="!form.iddepartamento"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-form>

      <template #footer>
        <n-space justify="end">
          <n-button type="primary" :loading="saving" @click="handleSave">
            {{ editingItem ? 'Actualizar' : 'Crear' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useMessage, useDialog, NButton, NTag, NSpace } from 'naive-ui'
import { AddOutline, SearchOutline, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { usuariosApi, departamentosApi, puestosApi, paisesApi, centrosDistribucionApi } from '../api'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingItem = ref(null)
const search = ref('')
const departamentoFilter = ref(null)
const cdFilter = ref(null)
const paisFilter = ref(null)
const data = ref([])
const formRef = ref(null)

// Filtros
const paises = ref([])
const centros = ref([])
const departamentos_filter = ref([])
const loadingPaises = ref(false)
const loadingCDs = ref(false)
const loadingDepartamentos = ref(false)

const pagination = ref({ pageSize: 10 })

const form = ref({
  nombre: '',
  correo: '',
  idpais: null,
  idcd: null,
  iddepartamento: null,
  idpuesto: null
})

const rules = {
  nombre: { required: true, message: 'El nombre es requerido' }
}

const paisOptions = computed(() => {
  return paises.value.map(p => ({
    label: p.nombre,
    value: p.id
  }))
})

const cdOptions = computed(() => {
  return centros.value.map(c => ({
    label: c.nombre,
    value: c.id
  }))
})

const departamentoOptions = computed(() => {
  return departamentos_filter.value.map(d => ({
    label: d.nombre,
    value: d.id
  }))
})

// Options para el Modal
const cdOptionsModal = computed(() => {
  return centros_modal.value.map(c => ({
    label: c.nombre,
    value: c.id
  }))
})

const departamentoModalOptions = computed(() => {
  return departamentos_modal.value.map(d => ({
    label: d.nombre,
    value: d.id
  }))
})

const puestoOptions = computed(() => {
  return puestos.value.map(p => ({
    label: p.nombre,
    value: p.id
  }))
})

const columns = [
  {
    title: 'Nombre',
    key: 'nombre',
    ellipsis: { tooltip: true }
  },
  {
    title: 'Correo',
    key: 'correo',
    ellipsis: { tooltip: true }
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
    title: 'Departamento',
    key: 'departamento_nombre',
    render(row) {
      return row.departamento_nombre || '-'
    }
  },
  {
    title: 'Puesto',
    key: 'puesto_nombre',
    render(row) {
      return row.puesto_nombre || '-'
    }
  },
  {
    title: 'Equipo Asignado',
    key: 'inventario_nserie',
    render(row) {
      if (row.inventario_nserie) {
        return h(NTag, { type: 'success', size: 'small' }, { default: () => row.inventario_nserie })
      }
      return h(NTag, { type: 'default', size: 'small' }, { default: () => 'Sin asignar' })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 100,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            quaternary: true,
            onClick: () => handleEdit(row)
          }, { icon: () => h(CreateOutline) }),
          h(NButton, {
            size: 'small',
            quaternary: true,
            type: 'error',
            onClick: () => handleDelete(row)
          }, { icon: () => h(TrashOutline) })
        ]
      })
    }
  }
]

async function loadData() {
  loading.value = true
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (departamentoFilter.value) params.iddepartamento = departamentoFilter.value
    if (cdFilter.value) params.idcd = cdFilter.value
    if (paisFilter.value) params.idpais = paisFilter.value
    
    const response = await usuariosApi.getAll(params)
    data.value = response.data.data || []
  } catch (error) {
    message.error('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

async function loadPaises() {
  loadingPaises.value = true
  try {
    const response = await paisesApi.getActive()
    paises.value = response.data.data || []
  } catch (error) {
    console.error('Error loading paises')
  } finally {
    loadingPaises.value = false
  }
}

async function loadCDs(idpais) {
  if (!idpais) {
    centros.value = []
    return
  }
  loadingCDs.value = true
  try {
    const response = await centrosDistribucionApi.getByPais(idpais)
    centros.value = response.data.data || []
  } catch (error) {
    console.error('Error loading CDs')
  } finally {
    loadingCDs.value = false
  }
}

async function loadDepartamentosFilter(idcd) {
  if (!idcd) {
    departamentos_filter.value = []
    return
  }
  loadingDepartamentos.value = true
  try {
    // Assuming API supports filtering by CD
    const response = await departamentosApi.getAll({ idcd })
    departamentos_filter.value = response.data.data || []
  } catch (error) {
    console.error('Error loading departamentos filter')
  } finally {
    loadingDepartamentos.value = false
  }
}

function handlePaisFilterChange(val) {
  paisFilter.value = val
  cdFilter.value = null
  departamentoFilter.value = null
  centros.value = []
  departamentos_filter.value = []
  if (val) loadCDs(val)
  handleSearch()
}

function handleCDFilterChange(val) {
  cdFilter.value = val
  departamentoFilter.value = null
  departamentos_filter.value = []
  if (val) loadDepartamentosFilter(val)
  handleSearch()
}

// Para el Modal
const centros_modal = ref([])
const loadingCDsModal = ref(false)
const departamentos_modal = ref([])
const loadingDepartamentosModal = ref(false)
const puestos = ref([])
const loadingPuestos = ref(false)

async function handlePaisChange(val) {
  form.value.idcd = null
  form.value.iddepartamento = null
  form.value.idpuesto = null
  centros_modal.value = []
  departamentos_modal.value = []
  puestos.value = []
  if (val) {
    loadingCDsModal.value = true
    try {
      const response = await centrosDistribucionApi.getByPais(val)
      centros_modal.value = response.data.data || []
    } finally {
      loadingCDsModal.value = false
    }
  }
}

async function handleCDChange(val) {
  form.value.iddepartamento = null
  form.value.idpuesto = null
  departamentos_modal.value = []
  puestos.value = []
  if (val) {
    loadingDepartamentosModal.value = true
    try {
      const response = await departamentosApi.getAll({ idcd: val })
      departamentos_modal.value = response.data.data || []
    } finally {
      loadingDepartamentosModal.value = false
    }
  }
}

function handleDepartamentoChange(val) {
  form.value.idpuesto = null
  puestos.value = []
  if (val) loadPuestos(val)
}

async function loadPuestos(iddepartamento) {
  if (!iddepartamento) {
    puestos.value = []
    return
  }
  loadingPuestos.value = true
  try {
    const response = await puestosApi.getAll({ iddepartamento })
    puestos.value = response.data.data || []
  } catch (error) {
    console.error('Error loading puestos')
  } finally {
    loadingPuestos.value = false
  }
}

function handleSearch() {
  loadData()
}

function openCreate() {
  editingItem.value = null
  form.value = {
    nombre: '',
    correo: '',
    idpais: null,
    idcd: null,
    iddepartamento: null,
    idpuesto: null
  }
  centros_modal.value = []
  departamentos_modal.value = []
  puestos.value = []
  showModal.value = true
}

async function handleEdit(item) {
  editingItem.value = item
  form.value = {
    nombre: item.nombre || '',
    correo: item.correo || '',
    idpais: item.idpais,
    idcd: item.idcd,
    iddepartamento: item.iddepartamento,
    idpuesto: item.idpuesto
  }
  
  // Cargar datos en cascada para la edición
  if (item.idpais) {
    loadingCDsModal.value = true
    const res = await centrosDistribucionApi.getByPais(item.idpais)
    centros_modal.value = res.data.data || []
    loadingCDsModal.value = false
  }
  if (item.idcd) {
    loadingDepartamentosModal.value = true
    const res = await departamentosApi.getAll({ idcd: item.idcd })
    departamentos_modal.value = res.data.data || []
    loadingDepartamentosModal.value = false
  }
  if (item.iddepartamento) {
    loadPuestos(item.iddepartamento)
  }
  
  showModal.value = true
}

async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true
    
    if (editingItem.value) {
      await usuariosApi.update(editingItem.value.id, form.value)
      message.success('Usuario actualizado correctamente')
    } else {
      await usuariosApi.create(form.value)
      message.success('Usuario creado correctamente')
    }
    
    showModal.value = false
    editingItem.value = null
    loadData()
  } catch (error) {
    if (error.response) {
      message.error(error.response.data?.error || 'Error al guardar')
    }
  } finally {
    saving.value = false
  }
}

function handleDelete(item) {
  dialog.warning({
    title: 'Confirmar eliminación',
    content: `¿Está seguro de eliminar al usuario "${item.nombre}"?`,
    positiveText: 'Eliminar',
    negativeText: 'Cancelar',
    onPositiveClick: async () => {
      try {
        await usuariosApi.delete(item.id)
        message.success('Usuario eliminado correctamente')
        loadData()
      } catch (error) {
        message.error(error.response?.data?.error || 'Error al eliminar')
      }
    }
  })
}

onMounted(() => {
  loadData()
  loadPaises()
})
</script>

<style scoped>
.main-card {
  min-height: calc(100vh - 120px);
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.filter-item {
  width: 200px;
}

.search-input {
  width: 300px;
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
  .filters {
    flex-direction: column;
  }
  
  .search-input, .depto-filter {
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
  
  .item-nombre {
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
    min-width: 100px;
  }
  
  .btn-text {
    display: none;
  }
  
  .create-btn {
    padding: 0 8px;
  }
  
  .form-col {
    grid-column: span 24 !important;
  }
}
</style>
