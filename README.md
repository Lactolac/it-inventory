# IT Inventory

Sistema integral de Gestión de Inventario para el departamento de IT de Lactolac.

## 🚀 Características Principales del Sistema

- **📦 Administrador de Inventario**
  - Registro completo del ciclo de vida de los equipos (laptops, desktops, monitores, servidores, etc.).
  - Búsqueda, filtrado y edición de activos con campos detallados.
  - Asignación de equipos al personal, generación de responsivas (actas de entrega o devolución) y control de status (Asignado, En Stock, En Reparación).

- **🔑 Control de Licencias**
  - Mantenimiento y registro de suscripciones y licencias de software por usuario (Office 365, Adobe, AutoCAD, etc.).
  - Alertas sobre software próximo a expirar.
  - Asignación de licencias a los usuarios correspondientes para control de costos y cumplimiento.

- **👥 Gestión de Usuarios**
  - Administración del listado de empleados de la empresa.
  - Vinculación directa entre un usuario y los equipos / licencias que tiene asignados bajo su responsabilidad.

- **🏢 Estructura Organizativa y Geográfica**
  - **Países**: Gestión e incorporación de los países donde la empresa tiene presencia.
  - **Centros de Distribución (CDs)**: Identificación física y lógica por cada país.
  - **Departamentos y Puestos**: Control de la jerarquía de la compañía para que los roles y responsabilidades estén centralizados.

- **📱 Diseño 100% Responsivo e Intuitivo**
  - Interfaz de usuario amigable y moderna optimizada para su visualización desde cualquier computadora, tableta o dispositivo móvil.

- **🛡️ Autenticación Segura**
  - Diferentes roles de acceso y cifrado para proteger la confidencialidad de los datos.

## 🛠️ Tecnologías Usadas

- **Frontend:** Vue.js 3, Naive UI (Librería de Componentes Web), Vite.
- **Backend:** Node.js, Express, Base de Datos SQL (PostgreSQL).

## 📁 Estructura del Proyecto

- `/frontend` — Lógica, diseño e interfaces del lado del cliente.
- `/backend` — API REST, conexión con la base de datos y procesamiento en el servidor.
