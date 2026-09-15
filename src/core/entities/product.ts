// src/core/entities/product.ts

export class Product {
   // ✅ Campos privados SIN readonly (pueden modificarse)
   private readonly id: string;
   private name: string;
   private description: string;
   private price: number;
   private stockQuantity: number;
   private category: string;
   private image: string;
   private createdAt: Date;
   private updatedAt: Date;

   // Constructor PRIVADO
   private constructor(
      id: string,
      name: string,
      description: string,
      price: number,
      stockQuantity: number,
      category: string,
      image: string,
      createdAt: Date,
      updatedAt: Date,
   ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.price = price;
      this.stockQuantity = stockQuantity;
      this.category = category;
      this.image = image;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
   }

   // ✅ GETTERS (lectura segura)

   getPrice(): number {
      return this.price;
   }

   getStockQuantity(): number {
      return this.stockQuantity;
   }

   // ✅ FACTORY: Crear NUEVO producto
   static create(
      name: string,
      description: string,
      price: number,
      stockQuantity: number,
      category: string,
      image: string,
   ): Product {
      // Validaciones de negocio
      if (!name || name.trim() === '') {
         throw new Error('Product name cannot be empty');
      }
      if (name.length > 255) {
         throw new Error('Product name is too long (max 255 characters)');
      }
      if (price <= 0) {
         throw new Error('Product price must be greater than 0');
      }
      if (stockQuantity < 0) {
         throw new Error('Stock quantity cannot be negative');
      }
      if (!category || category.trim() === '') {
         throw new Error('Product category cannot be empty');
      }

      const now = new Date();
      return new Product(
         crypto.randomUUID(),
         name,
         description,
         price,
         stockQuantity,
         category,
         image,
         now,
         now,
      );
   }

   // ✅ FACTORY: Reconstituir DESDE DB
   static reconstituteFromDatabase(data: {
      id: string;
      name: string;
      description: string;
      price: number;
      stockQuantity: number;
      category: string;
      image: string;
      createdAt: Date;
      updatedAt: Date;
   }): Product {
      return new Product(
         data.id,
         data.name,
         data.description,
         data.price,
         data.stockQuantity,
         data.category,
         data.image,
         data.createdAt,
         data.updatedAt,
      );
   }

   // 🎯 LÓGICA DE NEGOCIO: Validar
   validate(): void {
      if (!this.id) throw new Error('Product ID is required');
      if (!this.name || this.name.trim() === '') {
         throw new Error('Product name cannot be empty');
      }
      if (this.price <= 0) {
         throw new Error('Product price must be greater than 0');
      }
      if (this.stockQuantity < 0) {
         throw new Error('Stock quantity cannot be negative');
      }
   }

   // 🎯 LÓGICA DE NEGOCIO: Reducir stock
   reduceStock(quantity: number): void {
      if (quantity <= 0) {
         throw new Error('Quantity must be greater than 0');
      }
      if (this.stockQuantity < quantity) {
         throw new Error(
            `Insufficient stock. Available: ${this.stockQuantity}, Requested: ${quantity}`,
         );
      }
      this.stockQuantity -= quantity;
      this.updatedAt = new Date();
   }

   // 🎯 LÓGICA DE NEGOCIO: Aumentar stock
   increaseStock(quantity: number): void {
      if (quantity <= 0) {
         throw new Error('Quantity must be greater than 0');
      }
      this.stockQuantity += quantity;
      this.updatedAt = new Date();
   }

   // 🎯 LÓGICA DE NEGOCIO: Actualizar precio
   updatePrice(newPrice: number): void {
      if (newPrice <= 0) {
         throw new Error('Price must be greater than 0');
      }
      this.price = newPrice;
      this.updatedAt = new Date();
   }

   // 🎯 LÓGICA DE NEGOCIO: Actualizar info
   updateInfo(updates: {
      name?: string;
      description?: string;
      category?: string;
      image?: string;
   }): void {
      if (updates.name !== undefined) {
         if (!updates.name || updates.name.trim() === '') {
            throw new Error('Product name cannot be empty');
         }
         this.name = updates.name;
      }
      if (updates.description !== undefined) {
         this.description = updates.description;
      }
      if (updates.category !== undefined) {
         if (!updates.category || updates.category.trim() === '') {
            throw new Error('Product category cannot be empty');
         }
         this.category = updates.category;
      }
      if (updates.image !== undefined) {
         this.image = updates.image;
      }
      this.updatedAt = new Date();
   }

   // 📊 Convertir a DTO (para respuestas HTTP y guardar en DB)
   toPrimitives() {
      return {
         id: this.id,
         name: this.name,
         description: this.description,
         price: this.price,
         stockQuantity: this.stockQuantity,
         category: this.category,
         image: this.image,
         createdAt: this.createdAt,
         updatedAt: this.updatedAt,
      };
   }
}
