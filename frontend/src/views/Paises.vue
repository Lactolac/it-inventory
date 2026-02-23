<template>
  <div>
    <n-card title="Gestión de Países" :bordered="false" class="main-card">
      <template #header-extra>
        <n-button type="primary" @click="openCreate" size="small" class="create-btn">
          <template #icon>
            <n-icon><AddOutline /></n-icon>
          </template>
          <span class="btn-text">Nuevo País</span>
        </n-button>
      </template>

      <n-space vertical size="large">
        <n-input
          v-model:value="searchText"
          placeholder="Buscar país..."
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
          :data="paises"
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
                v-for="pais in paises" 
                :key="pais.id" 
                size="small" 
                hoverable
                class="mobile-card"
              >
                <template #header>
                  <div class="card-header">
                    <span class="pais-nombre">{{ pais.nombre }}</span>
                    <n-tag :type="pais.activo ? 'success' : 'error'" size="small">
                      {{ pais.activo ? 'Activo' : 'Inactivo' }}
                    </n-tag>
                  </div>
                </template>
                <div class="card-content">
                  <div class="card-stats">
                    <n-tag type="info" size="small">CDs: {{ pais.total_centros || 0 }}</n-tag>
                    <n-tag type="warning" size="small">Deptos: {{ pais.total_departamentos || 0 }}</n-tag>
                  </div>
                </div>
                <template #action>
                  <n-space justify="end">
                    <n-button size="small" type="primary" @click="viewCentros(pais)">
                      Ver CDs
                    </n-button>
                    <n-button size="small" @click="handleEdit(pais)">
                      Editar
                    </n-button>
                    <n-popconfirm @positive-click="handleDelete(pais.id)">
                      <template #trigger>
                        <n-button size="small" type="error">Eliminar</n-button>
                      </template>
                      ¿Está seguro de eliminar este país?
                    </n-popconfirm>
                  </n-space>
                </template>
              </n-card>
            </n-space>
          </n-spin>
        </div>
      </n-space>
    </n-card>

    <!-- Modal para crear/editar país -->
    <n-modal v-model:show="showModal" preset="dialog" :title="editingId ? 'Editar País' : 'Nuevo País'">
      <n-form ref="formRef" :model="formData" :rules="rules">
        <n-form-item label="Nombre" path="nombre">
          <n-input v-model:value="formData.nombre" placeholder="Nombre del país" />
        </n-form-item>
        <n-form-item label="Activo" path="activo">
          <n-switch v-model:value="formData.activo" />
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

    <!-- Modal para ver centros de distribución -->
    <n-modal v-model:show="showCentrosModal" preset="card" :title="`Centros de Distribución - ${selectedPais?.nombre || ''}`" style="width: 700px; max-width: 95vw;">
      <template #header-extra>
        <n-button type="primary" size="small" @click="openCreateCentro">
          Agregar CD
        </n-button>
      </template>
      
      <!-- Desktop table for CDs -->
      <n-data-table
        :columns="centrosColumns"
        :data="centros"
        :loading="loadingCentros"
        size="small"
        class="desktop-table"
      />

      <!-- Mobile cards for CDs -->
      <div class="mobile-cards">
        <n-spin :show="loadingCentros">
          <n-space vertical size="small">
            <n-card 
              v-for="centro in centros" 
              :key="centro.id" 
              size="small" 
              hoverable
              class="mobile-card"
            >
              <div class="card-header">
                <span class="centro-nombre">{{ centro.nombre }}</span>
                <n-tag :type="centro.activo ? 'success' : 'error'" size="small">
                  {{ centro.activo ? 'Activo' : 'Inactivo' }}
                </n-tag>
              </div>
              <template #action>
                <n-space justify="end">
                  <n-button size="small" @click="handleEditCentro(centro)">Editar</n-button>
                  <n-popconfirm @positive-click="handleDeleteCentro(centro.id)">
                    <template #trigger>
                      <n-button size="small" type="error">Eliminar</n-button>
                    </template>
                    ¿Está seguro de eliminar este centro?
                  </n-popconfirm>
                </n-space>
              </template>
            </n-card>
          </n-space>
        </n-spin>
      </div>
    </n-modal>

    <!-- Modal para crear/editar centro de distribución -->
    <n-modal v-model:show="showCentroForm" preset="dialog" :title="editingCentroId ? 'Editar Centro de Distribución' : 'Nuevo Centro de Distribución'">
      <n-form ref="centroFormRef" :model="centroData" :rules="centroRules">
        <n-form-item label="Nombre" path="nombre">
          <n-input v-model:value="centroData.nombre" placeholder="Nombre del centro de distribución" />
        </n-form-item>
        <n-form-item label="Activo" path="activo">
          <n-switch v-model:value="centroData.activo" />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="end">
          <n-button type="primary" :loading="savingCentro" @click="handleSaveCentro">
            {{ editingCentroId ? 'Actualizar' : 'Crear' }}
          </n-button>
        </n-space>
      </template>
    </n-modal>

    <!-- Modal preguntar si desea crear CDs -->
    <n-modal v-model:show="showPreguntaCD" preset="dialog" title="Crear Centro de Distribución" content="¿Desea crear centros de distribución para este país?" positive-text="Sí" negative-text="No" @positive-click="handleCrearCD" @negative-click="handleNoCrearCD" />
  </div>
</template>

<script setup>
import { ref, reactive, h, onMounted } from 'vue'
import { NButton, NSpace, NTag, NPopconfirm, NIcon, NSwitch, useMessage } from 'naive-ui'
import { paisesApi, centrosDistribucionApi } from '../api'
import { SearchOutline, AddOutline } from '@vicons/ionicons5'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingId = ref(null)
const searchText = ref('')
const paises = ref([])
const formRef = ref(null)

const formData = reactive({
  nombre: '',
  activo: true
})

const rules = {
  nombre: [{ required: true, message: 'El nombre es requerido', trigger: 'blur' }]
}

const pagination = reactive({
  pageSize: 10
})

// Centros de distribución
const showCentrosModal = ref(false)
const loadingCentros = ref(false)
const centros = ref([])
const selectedPais = ref(null)
const showCentroForm = ref(false)
const savingCentro = ref(false)
const centroFormRef = ref(null)
const editingCentroId = ref(null)
const lastCreatedPais = ref(null)

// Pregunta para crear CDs
const showPreguntaCD = ref(false)

const centroData = reactive({
  nombre: '',
  activo: true
})

const centroRules = {
  nombre: [{ required: true, message: 'El nombre es requerido', trigger: 'blur' }]
}

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
    title: 'Estado',
    key: 'activo',
    width: 100,
    render(row) {
      return h(NTag, { 
        type: row.activo ? 'success' : 'error' 
      }, { 
        default: () => row.activo ? 'Activo' : 'Inactivo' 
      })
    }
  },
  {
    title: 'Centros CD',
    key: 'total_centros',
    width: 100,
    render(row) {
      return h(NTag, { type: 'info' }, { default: () => row.total_centros || 0 })
    }
  },
  {
    title: 'Departamentos',
    key: 'total_departamentos',
    width: 120,
    render(row) {
      return h(NTag, { type: 'warning' }, { default: () => row.total_departamentos || 0 })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 280,
    render(row) {
      return h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', type: 'primary', onClick: () => viewCentros(row) }, { default: () => 'Ver CDs' }),
          h(NButton, { size: 'small', onClick: () => handleEdit(row) }, { default: () => 'Editar' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDelete(row.id)
          }, {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => 'Eliminar' }),
            default: () => '¿Está seguro de eliminar este país?'
          })
        ]
      })
    }
  }
]

const centrosColumns = [
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
    title: 'Estado',
    key: 'activo',
    width: 100,
    render(row) {
      return h(NTag, { 
        type: row.activo ? 'success' : 'error' 
      }, { 
        default: () => row.activo ? 'Activo' : 'Inactivo' 
      })
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, null, {
        default: () => [
          h(NButton, { size: 'small', onClick: () => handleEditCentro(row) }, { default: () => 'Editar' }),
          h(NPopconfirm, {
            onPositiveClick: () => handleDeleteCentro(row.id)
          }, {
            trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => 'Eliminar' }),
            default: () => '¿Está seguro de eliminar este centro?'
          })
        ]
      })
    }
  }
]

const loadPaises = async () => {
  loading.value = true
  try {
    const response = await paisesApi.getAll({ search: searchText.value })
    paises.value = response.data.data
  } catch (error) {
    message.error('Error al cargar países')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  loadPaises()
}

const openCreate = () => {
  editingId.value = null
  formData.nombre = ''
  formData.activo = true
  showModal.value = true
}

const handleEdit = (row) => {
  editingId.value = row.id
  formData.nombre = row.nombre
  formData.activo = row.activo
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
      await paisesApi.update(editingId.value, formData)
      message.success('País actualizado correctamente')
      showModal.value = false
    } else {
      const response = await paisesApi.create(formData)
      lastCreatedPais.value = response.data.data
      message.success('País creado correctamente')
      showModal.value = false
      // Preguntar si desea crear CDs
      showPreguntaCD.value = true
    }
    resetForm()
    loadPaises()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al guardar país')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await paisesApi.delete(id)
    message.success('País eliminado correctamente')
    loadPaises()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al eliminar país')
  }
}

const resetForm = () => {
  editingId.value = null
  formData.nombre = ''
  formData.activo = true
  formRef.value?.restoreValidation()
}

const viewCentros = async (row) => {
  selectedPais.value = row
  showCentrosModal.value = true
  loadingCentros.value = true
  try {
    const response = await centrosDistribucionApi.getByPais(row.id)
    centros.value = response.data.data
  } catch (error) {
    message.error('Error al cargar centros de distribución')
  } finally {
    loadingCentros.value = false
  }
}

const openCreateCentro = () => {
  editingCentroId.value = null
  centroData.nombre = ''
  centroData.activo = true
  showCentroForm.value = true
}

const handleEditCentro = (row) => {
  editingCentroId.value = row.id
  centroData.nombre = row.nombre
  centroData.activo = row.activo
  showCentroForm.value = true
}

const handleSaveCentro = async () => {
  try {
    await centroFormRef.value?.validate()
  } catch {
    return
  }

  savingCentro.value = true
  try {
    if (editingCentroId.value) {
      await centrosDistribucionApi.update(editingCentroId.value, {
        nombre: centroData.nombre,
        idpais: selectedPais.value.id,
        activo: centroData.activo
      })
      message.success('Centro de distribución actualizado correctamente')
    } else {
      await centrosDistribucionApi.create({
        nombre: centroData.nombre,
        idpais: selectedPais.value.id,
        activo: centroData.activo
      })
      message.success('Centro de distribución creado correctamente')
    }
    showCentroForm.value = false
    editingCentroId.value = null
    // Recargar centros
    const response = await centrosDistribucionApi.getByPais(selectedPais.value.id)
    centros.value = response.data.data
    loadPaises()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al guardar centro de distribución')
  } finally {
    savingCentro.value = false
  }
}

const handleDeleteCentro = async (id) => {
  try {
    await centrosDistribucionApi.delete(id)
    message.success('Centro de distribución eliminado correctamente')
    const response = await centrosDistribucionApi.getByPais(selectedPais.value.id)
    centros.value = response.data.data
    loadPaises()
  } catch (error) {
    message.error(error.response?.data?.error || 'Error al eliminar centro de distribución')
  }
}

const handleCrearCD = () => {
  showPreguntaCD.value = false
  if (lastCreatedPais.value) {
    selectedPais.value = lastCreatedPais.value
    centros.value = []
    showCentrosModal.value = true
    showCentroForm.value = true
  }
}

const handleNoCrearCD = () => {
  showPreguntaCD.value = false
  lastCreatedPais.value = null
}

onMounted(() => {
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
  
  .pais-nombre, .centro-nombre {
    font-weight: 600;
    font-size: 14px;
  }
  
  .card-content {
    padding: 8px 0;
  }
  
  .card-stats {
    display: flex;
    gap: 8px;
  }
  
  .btn-text {
    display: none;
  }
  
  .create-btn {
    padding: 0 8px;
  }
}
</style>
