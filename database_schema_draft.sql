-- =============================================
-- ERP MULTI-TENANT INITIAL SCHEMA DRAFT (MySQL)
-- MySQL Database Script
-- =============================================

CREATE DATABASE IF NOT EXISTS erp_multitenant;
USE erp_multitenant;

-- 1. Tabla Multinegocio (Multi-tenant)
CREATE TABLE Empresas (
    IdEmpresa INT AUTO_INCREMENT PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Rut VARCHAR(20) NULL,
    TipoNegocio VARCHAR(50) NOT NULL -- 'Supermercado', 'Ferreteria', 'Restaurante'
);

-- 2. Roles y Usuarios
CREATE TABLE Roles (
    IdRol INT AUTO_INCREMENT PRIMARY KEY,
    NombreRol VARCHAR(50) NOT NULL -- 'Administrador', 'Vendedor', 'Cajero', 'Repartidor'
);

CREATE TABLE Usuarios (
    IdUsuario INT AUTO_INCREMENT PRIMARY KEY,
    IdEmpresa INT NOT NULL,
    IdRol INT NOT NULL,
    NombreCompleto VARCHAR(150) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    PasswordHash VARCHAR(256) NOT NULL,
    Activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (IdEmpresa) REFERENCES Empresas(IdEmpresa),
    FOREIGN KEY (IdRol) REFERENCES Roles(IdRol)
);

-- 3. Productos e Inventario
CREATE TABLE Productos (
    IdProducto INT AUTO_INCREMENT PRIMARY KEY,
    IdEmpresa INT NOT NULL,
    CodigoBarras VARCHAR(50) NULL,
    Nombre VARCHAR(150) NOT NULL,
    Descripcion TEXT NULL,
    PrecioVenta DECIMAL(18,2) NOT NULL,
    Costo DECIMAL(18,2) NOT NULL,
    ControlaStock BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (IdEmpresa) REFERENCES Empresas(IdEmpresa)
);

CREATE TABLE Stock (
    IdProducto INT NOT NULL PRIMARY KEY,
    Cantidad DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    FechaUltimaActualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (IdProducto) REFERENCES Productos(IdProducto)
);

-- 4. Ventas y Pedidos (Delivery)
CREATE TABLE Documentos (
    IdVenta INT AUTO_INCREMENT PRIMARY KEY,
    IdEmpresa INT NOT NULL,
    IdUsuarioCreador INT NOT NULL,
    TipoDocumento VARCHAR(20) NOT NULL, -- 'Boleta', 'Factura', 'NotaCredito'
    SubTotal DECIMAL(18,2) NOT NULL,
    Impuestos DECIMAL(18,2) NOT NULL,
    Total DECIMAL(18,2) NOT NULL,
    MetodoPago VARCHAR(50) NOT NULL, -- 'Efectivo', 'Tarjeta', 'Transferencia'
    FechaVenta DATETIME DEFAULT CURRENT_TIMESTAMP,
    Observaciones TEXT NULL,
    FOREIGN KEY (IdEmpresa) REFERENCES Empresas(IdEmpresa),
    FOREIGN KEY (IdUsuarioCreador) REFERENCES Usuarios(IdUsuario)
);

-- 5. Control de Delivery (Repartidores)
CREATE TABLE Despachos (
    IdDespacho INT AUTO_INCREMENT PRIMARY KEY,
    IdVenta INT NOT NULL,
    IdRepartidor INT NULL,
    EstadoEntrega VARCHAR(50) DEFAULT 'Pendiente', -- 'Pendiente', 'En Ruta', 'Entregado', 'Aplazado'
    DireccionEntrega VARCHAR(250) NOT NULL,
    Latitud DECIMAL(10,8) NULL,
    Longitud DECIMAL(11,8) NULL,
    ObservacionesEntrega TEXT NULL,
    FechaAsignacion DATETIME NULL,
    FechaEntrega DATETIME NULL,
    FOREIGN KEY (IdVenta) REFERENCES Documentos(IdVenta),
    FOREIGN KEY (IdRepartidor) REFERENCES Usuarios(IdUsuario)
);

