<template>
  <div class="login-container">
    <n-card class="login-card" :bordered="false">
      <div class="login-header">
        <img src="../assets/lactolac-logo.png" alt="Lactolac" class="login-logo" />
        <h1 class="title">IT Inventory</h1>
        <p class="subtitle">Sistema de Gestión de Inventario</p>
      </div>
      
      <n-form ref="formRef" :model="form" :rules="rules" size="large">
        <n-form-item path="username" label="Usuario">
          <n-input 
            v-model:value="form.username" 
            placeholder="Ingrese su usuario"
            @keyup.enter="handleLogin"
          />
        </n-form-item>
        
        <n-form-item path="password" label="Contraseña">
          <n-input 
            v-model:value="form.password" 
            type="password"
            placeholder="Ingrese su contraseña"
            show-password-on="click"
            @keyup.enter="handleLogin"
          />
        </n-form-item>

        <n-form-item>
          <n-button 
            type="primary" 
            block 
            :loading="loading"
            @click="handleLogin"
          >
            Iniciar Sesión
          </n-button>
        </n-form-item>
      </n-form>

      <n-alert v-if="error" type="error" :title="error" class="mt-4" />
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const message = useMessage()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const error = ref('')

const form = ref({
  username: '',
  password: '',
  country: 'sv'
})

const rules = {
  username: {
    required: true,
    message: 'El usuario es requerido',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: 'La contraseña es requerida',
    trigger: 'blur'
  }
}

async function handleLogin() {
  try {
    await formRef.value?.validate()
    
    loading.value = true
    error.value = ''
    
    const result = await authStore.login(form.value)
    
    if (result.success) {
      message.success('Bienvenido!')
      router.push('/inventario')
    } else {
      error.value = result.message
    }
  } catch (e) {
    console.error('Validation error:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0056a6 0%, #003366 100%);
  padding: 16px;
}

.login-card {
  width: 400px;
  max-width: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-logo {
  width: 180px;
  max-width: 100%;
  height: auto;
  margin: 0 auto 16px;
  display: block;
}

.title {
  margin: 0;
  font-size: 24px;
  color: #0056a6;
}

.subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.mt-4 {
  margin-top: 16px;
}

/* Mobile styles */
@media (max-width: 480px) {
  .login-card {
    width: 100%;
    border-radius: 12px;
  }
  
  .login-logo {
    width: 140px;
  }
  
  .title {
    font-size: 20px;
  }
  
  .subtitle {
    font-size: 12px;
  }
}
</style>
