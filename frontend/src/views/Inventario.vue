<template>
  <div>
    <n-card title="Gestión de Inventario" :bordered="false" class="main-card">
      <template #header-extra>
        <n-button type="primary" @click="showModal = true" size="small" class="create-btn">
          <template #icon><n-icon><AddOutline /></n-icon></template>
          <span class="btn-text">Nuevo Item</span>
        </n-button>
      </template>

      <n-space vertical size="large">
        <div class="filters">
          <n-input v-model:value="search" placeholder="Buscar..." clearable class="search-input">
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          
          <n-select 
            v-model:value="tipoFilter" 
            :options="tipoOptions" 
            placeholder="Tipo de dispositivo"
            clearable
            class="tipo-filter"
          />
        </div>

        <!-- Desktop table -->
        <n-data-table
          :columns="columns"
          :data="filteredData"
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
                v-for="item in filteredData" 
                :key="item.id" 
                size="small" 
                hoverable
                class="mobile-card"
                @click="router.push(`/inventario/${item.id}`)"
              >
                <template #header>
                  <div class="card-header">
                    <span class="item-nserie">{{ item.nserie || 'Sin serie' }}</span>
                    <n-tag type="info" size="small">{{ item.tipo_dispositivo || 'N/A' }}</n-tag>
                  </div>
                </template>
                <div class="card-content">
                  <div class="card-info">
                    <span class="info-label">Marca:</span>
                    <span>{{ item.marca || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Modelo:</span>
                    <span>{{ item.modelo || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Activo Fijo:</span>
                    <span>{{ item.nactivofijo || '-' }}</span>
                  </div>
                  <div class="card-info">
                    <span class="info-label">Cantidad:</span>
                    <span>{{ item.cantidad || 1 }}</span>
                  </div>
                </div>
                <template #action>
                  <n-space justify="end">
                    <n-button size="small" @click.stop="handleEdit(item)">Editar</n-button>
                    <n-button size="small" type="error" @click.stop="handleDelete(item)">Eliminar</n-button>
                  </n-space>
                </template>
              </n-card>
            </n-space>
          </n-spin>
        </div>
      </n-space>
    </n-card>

    <!-- Modal Crear/Editar -->
    <n-modal v-model:show="showModal" preset="card" :title="editingItem ? 'Editar Item' : 'Nuevo Item'" style="width: 600px; max-width: 95vw;">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-grid :cols="24" :x-gap="20">
          <n-gi :span="12" class="form-col">
            <n-form-item label="No. Serie" path="nserie">
              <n-input v-model:value="form.nserie" placeholder="Número de serie" />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Activo Fijo" path="nactivofijo">
              <n-input v-model:value="form.nactivofijo" placeholder="Número de activo fijo" />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Marca" path="marca">
              <n-input v-model:value="form.marca" placeholder="Marca" />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Modelo" path="modelo">
              <n-input v-model:value="form.modelo" placeholder="Modelo" />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Cantidad" path="cantidad">
              <n-input-number v-model:value="form.cantidad" :min="1" style="width: 100%" />
            </n-form-item>
          </n-gi>
          <n-gi :span="12" class="form-col">
            <n-form-item label="Tipo" path="tipo_dispositivo">
              <n-select v-model:value="form.tipo_dispositivo" :options="tipoDispositivoOptions" placeholder="Seleccionar tipo" />
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
import { useRouter } from 'vue-router'
import { useMessage, useDialog, NButton, NTag, NSpace } from 'naive-ui'
import { AddOutline, SearchOutline, CreateOutline, TrashOutline, EyeOutline } from '@vicons/ionicons5'
import { inventarioApi } from '../api'

const router = useRouter()
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editingItem = ref(null)
const search = ref('')
const tipoFilter = ref(null)
const data = ref([])
const formRef = ref(null)

const pagination = ref({
  pageSize: 10
})

const form = ref({
  nserie: '',
  marca: '',
  modelo: '',
  nactivofijo: '',
  cantidad: 1,
  tipo_dispositivo: null
})

const rules = {
  tipo_dispositivo: { required: true, message: 'El tipo es requerido' }
}

const tipoDispositivoOptions = [
  { label: 'Laptop', value: 'Laptop' },
  { label: 'Desktop', value: 'Desktop' },
  { label: 'Server', value: 'Server' },
  { label: 'Monitor', value: 'Monitor' },
  { label: 'Impresora', value: 'Impresora' },
  { label: 'Switch', value: 'Switch' },
  { label: 'Router', value: 'Router' },
  { label: 'Otro', value: 'Otro' }
]

const tipoOptions = computed(() => {
  const tipos = [...new Set(data.value.map(item => item.tipo_dispositivo).filter(Boolean))]
  return tipos.map(tipo => ({ label: tipo, value: tipo }))
})

const filteredData = computed(() => {
  let result = data.value
  
  if (search.value) {
    const s = search.value.toLowerCase()
    result = result.filter(item => 
      item.nserie?.toLowerCase().includes(s) ||
      item.marca?.toLowerCase().includes(s) ||
      item.modelo?.toLowerCase().includes(s) ||
      item.nactivofijo?.toLowerCase().includes(s)
    )
  }
  
  if (tipoFilter.value) {
    result = result.filter(item => item.tipo_dispositivo === tipoFilter.value)
  }
  
  return result
})

const columns = [
  {
    title: 'No. Serie',
    key: 'nserie',
    ellipsis: { tooltip: true }
  },
  {
    title: 'Marca',
    key: 'marca'
  },
  {
    title: 'Modelo',
    key: 'modelo'
  },
  {
    title: 'Activo Fijo',
    key: 'nactivofijo'
  },
  {
    title: 'Tipo',
    key: 'tipo_dispositivo',
    render(row) {
      return h(NTag, { type: 'info', size: 'small' }, { default: () => row.tipo_dispositivo || 'N/A' })
    }
  },
  {
    title: 'Cantidad',
    key: 'cantidad'
  },
  {
    title: 'Fecha Ingreso',
    key: 'fechaingreso',
    render(row) {
      return row.fechaingreso ? new Date(row.fechaingreso).toLocaleDateString() : 'N/A'
    }
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 150,
    render(row) {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, {
            size: 'small',
            quaternary: true,
            onClick: () => router.push(`/inventario/${row.id}`)
          }, { icon: () => h(EyeOutline) }),
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
    const response = await inventarioApi.getAll()
    data.value = response.data.data || []
  } catch (error) {
    message.error('Error al cargar datos')
  } finally {
    loading.value = false
  }
}

function handleEdit(item) {
  editingItem.value = item
  form.value = {
    nserie: item.nserie || '',
    marca: item.marca || '',
    modelo: item.modelo || '',
    nactivofijo: item.nactivofijo || '',
    cantidad: item.cantidad || 1,
    tipo_dispositivo: item.tipo_dispositivo
  }
  showModal.value = true
}

async function handleSave() {
  try {
    await formRef.value?.validate()
    saving.value = true
    
    if (editingItem.value) {
      await inventarioApi.update(editingItem.value.id, form.value)
      message.success('Item actualizado correctamente')
    } else {
      await inventarioApi.create(form.value)
      message.success('Item creado correctamente')
    }
    
    showModal.value = false
    editingItem.value = null
    resetForm()
    loadData()
  } catch (error) {
    if (error.response) {
      message.error(error.response.data?.message || 'Error al guardar')
    }
  } finally {
    saving.value = false
  }
}

function handleDelete(item) {
  dialog.warning({
    title: 'Confirmar eliminación',
    content: `¿Está seguro de eliminar el item ${item.nserie || item.id}?`,
    positiveText: 'Eliminar',
    negativeText: 'Cancelar',
    onPositiveClick: async () => {
      try {
        await inventarioApi.delete(item.id)
        message.success('Item eliminado correctamente')
        loadData()
      } catch (error) {
        message.error('Error al eliminar item')
      }
    }
  })
}

function resetForm() {
  form.value = {
    nserie: '',
    marca: '',
    modelo: '',
    nactivofijo: '',
    cantidad: 1,
    tipo_dispositivo: null
  }
}

onMounted(() => {
  loadData()
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

.tipo-filter {
  width: 200px;
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
  
  .search-input, .tipo-filter {
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
    cursor: pointer;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  .item-nserie {
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
    min-width: 80px;
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
