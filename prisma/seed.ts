import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase(): Promise<void> {
  await prisma.comment.deleteMany();
  await prisma.historyEntry.deleteMany();
  await prisma.document.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.cuttingPiece.deleteMany();
  await prisma.cuttingList.deleteMany();
  await prisma.render.deleteMany();
  await prisma.designModule.deleteMany();
  await prisma.design.deleteMany();
  await prisma.moduleTemplate.deleteMany();
  await prisma.material.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  await prisma.person.deleteMany();
}

async function main(): Promise<void> {
  await clearDatabase();

  const architectPerson = await prisma.person.create({
    data: {
      firstName: 'Carlos',
      lastName: 'Osuna',
      phone: '+52 662 150 4015',
      email: 'arquitecto@bois.mx',
      address: 'Hermosillo, Sonora'
    }
  });

  const supervisorPerson = await prisma.person.create({
    data: {
      firstName: 'Mariana',
      lastName: 'Hurtado',
      phone: '+52 662 345 6789',
      email: 'supervisor@bois.mx',
      address: 'Hermosillo, Sonora'
    }
  });

  const collaboratorPerson = await prisma.person.create({
    data: {
      firstName: 'Oscar',
      lastName: 'Herrera',
      phone: '+52 662 567 1234',
      email: 'colaborador@bois.mx',
      address: 'Hermosillo, Sonora'
    }
  });

  const responsiblePerson = await prisma.person.create({
    data: {
      firstName: 'Mario',
      lastName: 'Ochoa',
      phone: '+52 662 987 6543',
      email: 'responsable@bois.mx',
      address: 'Hermosillo, Sonora'
    }
  });

  const architect = await prisma.user.create({
    data: {
      personId: architectPerson.id,
      username: 'architect',
      email: 'arquitecto@bois.mx',
      passwordHash: 'demo-password-hash-architect',
      role: 'ARCHITECT'
    }
  });

  const supervisor = await prisma.user.create({
    data: {
      personId: supervisorPerson.id,
      username: 'supervisor',
      email: 'supervisor@bois.mx',
      passwordHash: 'demo-password-hash-supervisor',
      role: 'SUPERVISOR'
    }
  });

  await prisma.user.create({
    data: {
      personId: collaboratorPerson.id,
      username: 'collaborator',
      email: 'colaborador@bois.mx',
      passwordHash: 'demo-password-hash-collaborator',
      role: 'COLLABORATOR'
    }
  });

  const responsible = await prisma.user.create({
    data: {
      personId: responsiblePerson.id,
      username: 'responsible',
      email: 'responsable@bois.mx',
      passwordHash: 'demo-password-hash-responsible',
      role: 'RESPONSIBLE'
    }
  });

  const clientPerson = await prisma.person.create({
    data: {
      firstName: 'Gustavo',
      lastName: 'Correa',
      phone: '+52 662 345 6789',
      email: 'gustavo.correa@gmail.com',
      address: 'Av. 12a esquina Calle XIII, San Carlos, Sonora, México',
      rfc: 'COGG800101ABC'
    }
  });

  const client = await prisma.client.create({
    data: {
      personId: clientPerson.id,
      projectAddress: 'Av. 12a esquina Calle XIII, San Carlos, Sonora, México',
      initialContactDate: new Date('2025-04-15T10:00:00.000Z'),
      consentAcceptedAt: new Date('2025-04-15T10:30:00.000Z'),
      notes: 'Cliente interesado en cocina integral con isla y paneles blancos.'
    }
  });

  const whiteMdf = await prisma.material.create({
    data: {
      code: 'MDF-BLANCO-18',
      name: 'MDF Blanco 18mm',
      category: 'Madera',
      unit: 'SHEET',
      cost: 780,
      thicknessMm: 18,
      colorHex: '#F2F2F2',
      supplier: 'Proveedor local'
    }
  });

  const blackGranite = await prisma.material.create({
    data: {
      code: 'CUARZO-GRIS',
      name: 'Cubierta Cuarzo Gris',
      category: 'Cubierta',
      unit: 'SQUARE_METER',
      cost: 1650,
      thicknessMm: 30,
      colorHex: '#777A7C',
      supplier: 'Canteras Sonora'
    }
  });

  await prisma.material.createMany({
    data: [
      {
        code: 'MELAMINA-NOGAL-18',
        name: 'Melamina Nogal 18mm',
        category: 'Madera',
        unit: 'SHEET',
        cost: 920,
        thicknessMm: 18,
        colorHex: '#8A5A3B'
      },
      {
        code: 'MDF-NEGRO-18',
        name: 'MDF Negro 18mm',
        category: 'Madera',
        unit: 'SHEET',
        cost: 860,
        thicknessMm: 18,
        colorHex: '#222222'
      },
      {
        code: 'MDF-TRASERA-3',
        name: 'MDF Trasera 3mm',
        category: 'Madera',
        unit: 'SHEET',
        cost: 290,
        thicknessMm: 3,
        colorHex: '#E8E3DA'
      },
      {
        code: 'MADERA-NATURAL',
        name: 'Madera Natural',
        category: 'Madera',
        unit: 'BOARD',
        cost: 1200,
        thicknessMm: 18,
        colorHex: '#B8895B'
      }
    ]
  });

  const hardware = await prisma.material.create({
    data: {
      code: 'HERRAJE-STD',
      name: 'Herraje estándar para cocina',
      category: 'Herrajes',
      unit: 'PIECE',
      cost: 95,
      supplier: 'Herrajes del Norte'
    }
  });

  const baseTemplate = await prisma.moduleTemplate.create({
    data: {
      code: 'BASE-CABINET-001',
      name: 'Gabinete bajo',
      category: 'Cocina',
      defaultWidthMm: 800,
      defaultHeightMm: 720,
      defaultDepthMm: 560,
      parameterJson: JSON.stringify({
        doors: 2,
        shelves: 1,
        hasToeKick: true
      })
    }
  });

  const wallTemplate = await prisma.moduleTemplate.create({
    data: {
      code: 'WALL-CABINET-001',
      name: 'Alacena',
      category: 'Cocina',
      defaultWidthMm: 800,
      defaultHeightMm: 700,
      defaultDepthMm: 350,
      parameterJson: JSON.stringify({
        doors: 2,
        shelves: 2
      })
    }
  });

  await prisma.moduleTemplate.createMany({
    data: [
      {
        code: 'TALL-CABINET-001',
        name: 'Torre',
        category: 'Cocina',
        defaultWidthMm: 600,
        defaultHeightMm: 2100,
        defaultDepthMm: 560
      },
      {
        code: 'SHELF-001',
        name: 'Repisa',
        category: 'Cocina',
        defaultWidthMm: 800,
        defaultHeightMm: 30,
        defaultDepthMm: 300
      },
      {
        code: 'ISLAND-001',
        name: 'Isla',
        category: 'Cocina',
        defaultWidthMm: 1800,
        defaultHeightMm: 900,
        defaultDepthMm: 900
      },
      {
        code: 'APPLIANCE-PLACEHOLDER-001',
        name: 'Electrodoméstico',
        category: 'Electrodomésticos',
        defaultWidthMm: 600,
        defaultHeightMm: 850,
        defaultDepthMm: 600
      }
    ]
  });
  const islandTemplate = await prisma.moduleTemplate.findUniqueOrThrow({
    where: { code: 'ISLAND-001' }
  });

  const roomSpaceTimestamp = new Date('2025-04-15T15:00:00.000Z').toISOString();
  const roomSpace = {
    layoutType: 'RECTANGULAR',
    widthMm: 3400,
    depthMm: 2800,
    heightMm: 2400,
    wallThicknessMm: 120,
    notes: 'Medidas capturadas en sitio por arquitectura.',
    openings: [
      {
        name: 'Puerta principal',
        type: 'DOOR',
        widthMm: 900,
        heightMm: 2100,
        positionMm: 300
      },
      {
        name: 'Ventana',
        type: 'WINDOW',
        widthMm: 1200,
        heightMm: 1100,
        positionMm: 1900
      }
    ],
    createdAt: roomSpaceTimestamp,
    updatedAt: roomSpaceTimestamp
  };

  const project = await prisma.project.create({
    data: {
      clientId: client.id,
      createdById: architect.id,
      name: 'Cocina paneles blancos isla oscura',
      description: 'Cocina residencial completa con isla, alacenas y cubierta negra.',
      location: 'San Carlos, Sonora',
      status: 'DESIGN',
      startDate: new Date('2025-04-15T09:00:00.000Z'),
      deliveryDate: new Date('2025-05-12T18:00:00.000Z'),
      roomSpaceJson: JSON.stringify(roomSpace)
    }
  });

  const design = await prisma.design.create({
    data: {
      projectId: project.id,
      createdById: architect.id,
      title: 'Diseño preliminar cocina isla',
      version: 1,
      status: 'IN_REVIEW',
      roomSpaceJson: JSON.stringify(roomSpace),
      designJson: JSON.stringify({
        camera: { position: [3, 2, 4], target: [0, 0, 0] },
        units: 'mm',
        style: 'Minimalista moderno'
      }),
      notes: 'Primera propuesta con isla central y alacenas blancas.'
    }
  });

  await prisma.designModule.createMany({
    data: [
      {
        designId: design.id,
        templateId: baseTemplate.id,
        materialId: whiteMdf.id,
        name: 'Gabinete base principal',
        kind: 'BASE_CABINET',
        positionXmm: 500,
        positionYmm: 0,
        positionZmm: 0,
        widthMm: 1800,
        heightMm: 700,
        depthMm: 560,
        quantity: 3
      },
      {
        designId: design.id,
        templateId: wallTemplate.id,
        materialId: whiteMdf.id,
        name: 'Alacena',
        kind: 'WALL_CABINET',
        positionXmm: 500,
        positionYmm: 1650,
        positionZmm: 0,
        widthMm: 1800,
        heightMm: 700,
        depthMm: 350,
        quantity: 3
      },
      {
        designId: design.id,
        templateId: islandTemplate.id,
        materialId: blackGranite.id,
        name: 'Isla central',
        kind: 'ISLAND',
        positionXmm: 1200,
        positionYmm: 0,
        positionZmm: 1200,
        widthMm: 1600,
        heightMm: 900,
        depthMm: 900,
        quantity: 1
      }
    ]
  });

  await prisma.render.create({
    data: {
      projectId: project.id,
      designId: design.id,
      createdById: architect.id,
      title: 'Cocina paneles blancos isla oscura',
      version: 1,
      status: 'PRELIMINARY',
      filePath: 'renders/cocina-paneles-blancos-v1.png',
      thumbnailPath: 'renders/thumb-cocina-paneles-blancos-v1.png',
      format: 'PNG',
      resolutionWidth: 3840,
      resolutionHeight: 2160,
      sizeMb: 8.9,
      viewType: 'Isométrica',
      cameraAngle: 'Frontal',
      quality: 'Alta',
      notes: 'Agregar iluminación bajo alacenas para realzar profundidad.'
    }
  });

  const cuttingList = await prisma.cuttingList.create({
    data: {
      projectId: project.id,
      designId: design.id,
      generatedById: supervisor.id,
      version: 1,
      status: 'PENDING_VALIDATION',
      designVersion: design.version,
      generatedAt: new Date(),
      notes: 'Lista generada con piezas iniciales para revisión.'
    }
  });

  await prisma.cuttingPiece.createMany({
    data: [
      {
        cuttingListId: cuttingList.id,
        materialId: whiteMdf.id,
        sourceModuleName: 'Gabinete bajo',
        pieceName: 'Lateral gabinete bajo',
        category: 'Estructura',
        materialName: whiteMdf.name,
        widthMm: 550,
        heightMm: 700,
        thicknessMm: 15,
        quantity: 8,
        grainDirection: 'VERTICAL',
        edgeBanding: 'VISIBLE_EDGES',
        comments: 'Vertical, lado visible del mueble',
        isManual: false,
        sortOrder: 1
      },
      {
        cuttingListId: cuttingList.id,
        materialId: whiteMdf.id,
        sourceModuleName: 'Gabinete bajo',
        pieceName: 'Base gabinete bajo',
        category: 'Estructura',
        materialName: whiteMdf.name,
        widthMm: 550,
        heightMm: 564,
        thicknessMm: 15,
        quantity: 4,
        grainDirection: 'NONE',
        edgeBanding: 'NONE',
        comments: 'Interno, no visible',
        isManual: false,
        sortOrder: 2
      },
      {
        cuttingListId: cuttingList.id,
        materialId: whiteMdf.id,
        sourceModuleName: 'Gabinete bajo',
        pieceName: 'Puerta de gabinete',
        category: 'Frente',
        materialName: whiteMdf.name,
        widthMm: 450,
        heightMm: 700,
        thicknessMm: 15,
        quantity: 10,
        grainDirection: 'VERTICAL',
        edgeBanding: 'ALL',
        comments: 'Puerta abatible estándar',
        isManual: false,
        sortOrder: 3
      }
    ]
  });

  const quoteSubtotal = 18490;
  const laborCost = 6500;
  const taxAmount = (quoteSubtotal + laborCost) * 0.16;
  const total = quoteSubtotal + laborCost + taxAmount;

  const quote = await prisma.quote.create({
    data: {
      projectId: project.id,
      cuttingListId: cuttingList.id,
      createdById: supervisor.id,
      version: 1,
      status: 'PENDING',
      subtotal: quoteSubtotal,
      laborCost,
      extraCost: 0,
      taxRate: 0.16,
      taxAmount,
      advancePayment: total * 0.5,
      total,
      notes: 'Cotización inicial pendiente de aprobación del cliente.'
    }
  });

  await prisma.quoteItem.createMany({
    data: [
      {
        quoteId: quote.id,
        materialId: whiteMdf.id,
        sourceType: 'MATERIAL',
        description: 'MDF blanco mate para gabinetes',
        quantity: 8,
        unit: 'Hoja',
        unitPrice: 780,
        amount: 6240,
        comments: 'Concepto inicial de materiales.',
        sortOrder: 1
      },
      {
        quoteId: quote.id,
        materialId: blackGranite.id,
        sourceType: 'MATERIAL',
        description: 'Cubierta negra para isla y encimera',
        quantity: 4.2,
        unit: 'm2',
        unitPrice: 1650,
        amount: 6930,
        comments: 'Área estimada de cubierta.',
        sortOrder: 2
      },
      {
        quoteId: quote.id,
        materialId: hardware.id,
        sourceType: 'MATERIAL',
        description: 'Herrajes, bisagras y jaladeras',
        quantity: 56,
        unit: 'Pieza',
        unitPrice: 95,
        amount: 5320,
        comments: 'Herrajes estándar del proyecto.',
        sortOrder: 3
      }
    ]
  });

  await prisma.activity.createMany({
    data: [
      {
        projectId: project.id,
        assignedToId: architect.id,
        title: 'Toma de medidas',
        stage: 'Planeación',
        status: 'DONE',
        priority: 'MEDIUM',
        startDate: new Date('2025-04-15T09:00:00.000Z'),
        dueDate: new Date('2025-04-15T18:00:00.000Z'),
        completedAt: new Date('2025-04-15T15:00:00.000Z')
      },
      {
        projectId: project.id,
        assignedToId: responsible.id,
        title: 'Confirmación de materiales',
        stage: 'Producción',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        startDate: new Date('2025-04-20T09:00:00.000Z'),
        dueDate: new Date('2025-04-25T18:00:00.000Z')
      },
      {
        projectId: project.id,
        assignedToId: responsible.id,
        title: 'Instalación de módulos',
        stage: 'Instalación',
        status: 'PENDING',
        priority: 'MEDIUM',
        startDate: new Date('2025-05-07T09:00:00.000Z'),
        dueDate: new Date('2025-05-10T18:00:00.000Z')
      }
    ]
  });

  await prisma.alert.create({
    data: {
      projectId: project.id,
      createdById: supervisor.id,
      title: 'Sin confirmación',
      message:
        'Retraso en confirmación de materiales por parte del proveedor. Se requiere seguimiento urgente.',
      priority: 'URGENT'
    }
  });

  await prisma.document.createMany({
    data: [
      {
        projectId: project.id,
        uploadedById: architect.id,
        title: 'Levantamiento de medidas',
        fileName: 'levantamiento_de_medidas.pdf',
        filePath: 'documents/levantamiento_de_medidas.pdf',
        mimeType: 'application/pdf',
        documentType: 'MEASUREMENTS',
        stage: 'Planeación',
        notes: 'Documento base para iniciar diseño.'
      },
      {
        projectId: project.id,
        uploadedById: supervisor.id,
        title: 'Cotización formal',
        fileName: 'cotizacion_formal.docx',
        filePath: 'documents/cotizacion_formal.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        documentType: 'QUOTE',
        stage: 'Planeación',
        notes: 'Cotización para revisión del cliente.'
      }
    ]
  });

  await prisma.historyEntry.createMany({
    data: [
      {
        projectId: project.id,
        userId: architect.id,
        action: 'CREATED',
        entityType: 'Project',
        entityId: project.id,
        title: 'Proyecto creado',
        description: 'Se creó el expediente inicial con cliente y medidas.'
      },
      {
        projectId: project.id,
        userId: architect.id,
        action: 'CREATED',
        entityType: 'Design',
        entityId: design.id,
        title: 'Diseño preliminar creado',
        description: 'Se guardó la primera versión del diseño.'
      },
      {
        projectId: project.id,
        userId: supervisor.id,
        action: 'CREATED',
        entityType: 'CuttingList',
        entityId: cuttingList.id,
        title: 'Despiece generado',
        description: 'Se generó la primera lista de despiece pendiente de validación.'
      },
      {
        projectId: project.id,
        userId: supervisor.id,
        action: 'CREATED',
        entityType: 'Quote',
        entityId: quote.id,
        title: 'Cotización generada',
        description: 'Se generó la primera cotización pendiente de aprobación.'
      }
    ]
  });

  await prisma.comment.create({
    data: {
      projectId: project.id,
      designId: design.id,
      userId: supervisor.id,
      targetType: 'DESIGN',
      targetId: design.id,
      body: 'Revisar profundidad de la isla antes de aprobar diseño final.'
    }
  });

  console.info('Seed completado: usuarios, cliente, proyecto y datos demo creados.');
}

main()
  .catch((error: unknown) => {
    console.error('Error ejecutando seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
