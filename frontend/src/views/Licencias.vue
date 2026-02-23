<template>
  <div>
    <n-card title="Gestión de Licencias" :bordered="false" class="main-card">
      <template #header-extra>
        <n-button type="primary" @click="showModal = true" size="small" class="create-btn">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          <span class="btn-text">Nueva Licencia</span>
        </n-button>
      </template>

      <n-space vertical size="large">
        <div class="filters">
          <n-input v-model:value="search" placeholder="Buscar..." clearable class="search-input" @update:value="handleSearch">
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          
          <n-select 
            v-model:value="expiradaFilter" 
            :options="expiradaOptions" 
            placeholder="Estado"
            clearable
            class="estado-filter"
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
                    <n-tag v-if="item.fexpiraciones" :type="new Date(item.fexpiraciones) < new Date() ? 'error' : 'success'" size="small">
                      {{ new Date(item.fexpiraciones) < new Date() ? 'Expirada' : 'Vigente' }}
                    </n-tag>
                  </div>
                </template>
                <div class="card-content">
                  <div class="card-info">
                    <span class="info-label">Compra:</span>
                    <span>{{ item.fcompra ? new Date(item.fcompra).toLocaleDateString() : '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Expiración:</span>
                    <span>{{ item.fexpiraciones ? new Date(item.fexpiraciones).toLocaleDateString() : '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Cantidad:</span>
                    <span>{{ item.cantidad || 1 }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Departamento:</span>
                    <span>{{ item.departamento_nombre || '-' }}</span>
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
    <n-modal v-model:show="showModal" preset="card" :title="editingItem ? 'Editar Licencia' : 'Nueva Licencia'" style="width: 500px; max-width: 95vw;">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item label="Nombre" path="nombre">
          <n-input v-model:value="form.nombre" placeholder="Nombre de la licencia" />
        </n-form-item>
        <n-form-item label="Fecha Compra" path="fcompra">
          <n-date-picker v-model:value="form.fcompra" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Fecha Expiración" path="fexpiraciones">
          <n-date-picker v-model:value="form.fexpiraciones" type="date" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Cantidad" path="cantidad">
          <n-input-number v-model:value="form.cantidad" :min="1" style="width: 100%" />
        </n-form-item>
        <n-form-item label="Departamento" path="iddepartamento">
          <n-select v-model:value="form.iddepartamento" :options="departamentoOptions" placeholder="Seleccionar" :loading="loadingDptos" />
        </n-form-item>
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
import { licenciasApi, departamentosApi } from '../api'

const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingItem = ref(null)
const search = ref('')
const expiradaFilter = ref(null)
const data = ref([])
const formRef = ref(null)
const departamentoOptions = ref([])
const loadingDptos = ref(false)

const pagination = ref({ pageSize: 10 })

const form = ref({
  nombre: '',
  fcompra: null,
  fexpiraciones: null,
  cantidad: 1,
  iddepartamento: null
})

const rules = {
  nombre: { required: true, message: 'El nombre es requerido' }
}

const expiradaOptions = [
  { label: 'Vigentes', value: 'false' },
  { label: 'Expiradas', value: 'true' }
]

const columns = [
  {
    title: 'Nombre',
    key: 'nombre',
    ellipsis: { tooltip: true }
  },
  {
    title: 'Fecha Compra',
    key: 'fcompra',
    render(row) {
      return row.fcompra ? new Date(row.fcompra).toLocaleDateString() : 'N/A'
    }
  },
  {
    title: 'Fecha Expiración',
    key: 'fexpiraciones',
    render(row) {
      if (!row.fexpiraciones) return 'N/A'
      const date = new Date(row.fexpiraciones)
      const isExpired = date < new Date()
      return h(NTag, { type: isExpired ? 'error' : 'success', size: 'small' }, {
        default: () => date.toLocaleDateString()
      })
    }
  },
  {
    title: 'Cantidad',
    key: 'cantidad'
  },
  {
    title: 'Departamento',
    key: 'departamento_nombre',
    render(row) {
      return row.departamento_nombre || 'N/A'
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
    if (expiradaFilter.value) params.expiradas = expiradaFilter.value
    
    const response = await licenciasApi.getAll(params)
    data.value = response.data.data || []
  } catch (error) {
    message.error('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

async function loadDepartamentos() {
  loadingDptos.value = true
  try {
    const response = await departamentosApi.getAll()
    departamentoOptions.value = (response.data.data || []).map(d => ({
      label: d.nombre,
      value: d.id
    }))
  } catch (error) {
    console.error('Error loading departamentos')
  } finally {
    loadingDptos.value = false
  }
}

function handleSearch() {
  loadData()
}

function handleEdit(item) {
  editingItem.value = item
  form.value = {
    nombre: item.nombre || '',
    fcompra: item.fcompra ? new Date(item.fcompra).getTime() : null,
    fexpiraciones: item.fexpiraciones ? new Date(item.fexpiraciones).getTime() : null,
    cantidad: item.cantidad || 1,
    iddepartamento: item.iddepartamento
  }
  showModal.value = true
}

async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true
    
    const payload = {
      ...form.value,
      fcompra: form.value.fcompra ? new Date(form.value.fcompra).toISOString().split('T')[0] : null,
      fexpiraciones: form.value.fexpiraciones ? new Date(form.value.fexpiraciones).toISOString().split('T')[0] : null
    }
    
    if (editingItem.value) {
      await licenciasApi.update(editingItem.value.id, payload)
      message.success('Licencia actualizada correctamente')
    } else {
      await licenciasApi.create(payload)
      message.success('Licencia creada correctamente')
    }
    
    showModal.value = false
    editingItem.value = null
    resetForm()
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
    content: `¿Está seguro de eliminar la licencia "${item.nombre}"?`,
    positiveText: 'Eliminar',
    negativeText: 'Cancelar',
    onPositiveClick: async () => {
      try {
        await licenciasApi.delete(item.id)
        message.success('Licencia eliminada correctamente')
        loadData()
      } catch (error) {
        message.error('Error al eliminar')
      }
    }
  })
}

function resetForm() {
  form.value = {
    nombre: '',
    fcompra: null,
    fexpiraciones: null,
    cantidad: 1,
    iddepartamento: null
  }
}

onMounted(() => {
  loadData()
  loadDepartamentos()
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

.search-input {
  width: 300px;
}

.estado-filter {
  width: 150px;
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
  
  .search-input, .estado-filter {
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
    min-width: 90px;
  }
  
  .btn-text {
    display: none;
  }
  
  .create-btn {
    padding: 0 8px;
  }
}
</style>
