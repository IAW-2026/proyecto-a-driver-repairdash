-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "mail" TEXT NOT NULL,
    "telefono" TEXT,
    "estado" TEXT NOT NULL,
    "rating_promedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trabajo" (
    "id" TEXT NOT NULL,
    "id_worker" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "tipo_servicio" TEXT NOT NULL,
    "descripcion" TEXT,
    "direccion" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_finalizacion" TIMESTAMP(3),

    CONSTRAINT "Trabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ganancia" (
    "id" TEXT NOT NULL,
    "id_worker" TEXT NOT NULL,
    "id_cliente" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ganancia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Worker_mail_key" ON "Worker"("mail");

-- AddForeignKey
ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_id_worker_fkey" FOREIGN KEY ("id_worker") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ganancia" ADD CONSTRAINT "Ganancia_id_worker_fkey" FOREIGN KEY ("id_worker") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
