/// <reference types="node" />
import { PrismaClient, Role, LocationType, Priority, RequestStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 กำลังเริ่มต้น Seeding ข้อมูลระบบ Fixify (เฉพาะประเภท BUILDING)...');

  // 1. ล้างข้อมูลเก่าทั้งหมดตามลำดับความสัมพันธ์
  await prisma.notification.deleteMany();
  await prisma.repairPart.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.requestLog.deleteMany();
  await prisma.request.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.category.deleteMany();
  await prisma.locationManager.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await argon2.hash('password123');

  // 2. สร้าง Admin 1 คน
  const admin = await prisma.user.create({
    data: {
      name: 'สมศักดิ์ ผู้ดูแลระบบ',
      email: 'admin@fixify.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // 3. ข้อมูล 5 อาคาร (เฉพาะชื่ออาคาร ไม่เอาชั้น) และ Manager 5 คน
  const buildingData = [
    {
      buildingName: 'อาคาร 1 - อาคารอำนวยการและบริหาร (Building 1)',
      managerName: 'วิชัย รัตนวิบูลย์',
      managerEmail: 'manager1@fixify.com',
      code: 'B1',
    },
    {
      buildingName: 'อาคาร 2 - อาคารวิจัยและพัฒนานวัตกรรม (Building 2)',
      managerName: 'มนตรี วงศ์พิพิธ',
      managerEmail: 'manager2@fixify.com',
      code: 'B2',
    },
    {
      buildingName: 'อาคาร 3 - อาคารวิศวกรรมและซ่อมบำรุงกลาง (Building 3)',
      managerName: 'เกรียงไกร เกียรติกำจาย',
      managerEmail: 'manager3@fixify.com',
      code: 'B3',
    },
    {
      buildingName: 'อาคาร 4 - อาคารศูนย์อาหารและบริการสวัสดิการ (Building 4)',
      managerName: 'สมปอง ทรัพย์มหาศาล',
      managerEmail: 'manager4@fixify.com',
      code: 'B4',
    },
    {
      buildingName: 'อาคาร 5 - อาคารหอพักและที่พักบุคลากร (Building 5)',
      managerName: 'อภิสิทธิ์ ธนะโชติ',
      managerEmail: 'manager5@fixify.com',
      code: 'B5',
    },
  ];

  // 4. รายชื่อช่างคนไทย 25 คน (ตึกละ 5 คน)
  const technicianNames = [
    // อาคาร 1 (5 คน)
    ['ประสิทธิ์ ว่องไวช่างไฟ', 'ชาญชัย ท่อประปาดี', 'กิตติศักดิ์ ช่างแอร์มือหนึ่ง', 'เอกชัย สีนวลการช่าง', 'ณรงค์ สารพัดซ่อม'],
    // อาคาร 2 (5 คน)
    ['ธีรพงษ์ อิเล็กทรอนิกส์', 'ปกรณ์ ช่างระบบเน็ตเวิร์ก', 'อนุรักษ์ ลิฟต์และกลไก', 'สราวุธ งานช่างละเอียด', 'วิรัตน์ ตรวจเช็กระบบ'],
    // อาคาร 3 (5 คน)
    ['บุญส่ง เครื่องกลหนัก', 'อำนาจ ประสานท่อลม', 'สุวิทย์ ติดตั้งระบบแรงดัน', 'ศิริชัย หม้อแปลงไฟฟ้า', 'วีระศักดิ์ ซ่อมบำรุงอาคาร'],
    // อาคาร 4 (5 คน)
    ['ธวัชชัย งานสุขาภิบาล', 'ประวิทย์ เดินสายไฟร้านอาหาร', 'พงษ์ศักดิ์ ช่างปั๊มน้ำ', 'ทนงศักดิ์ ซ่อมเตาและแก๊ส', 'ชลธิศ บำบัดน้ำเสีย'],
    // อาคาร 5 (5 คน)
    ['สุทิน ช่างลูกบิดและประตู', 'พัฒนพงษ์ ซ่อมหน้าต่างกระจก', 'นพรัตน์ แอร์หอพัก', 'ยงยุทธ โคมไฟทางเดิน', 'วรวุฒิ ดาดฟ้ากันรั่วซึม'],
  ];

  // 5. หมวดหมู่งานซ่อม (Categories)
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'ระบบไฟฟ้าและแสงสว่าง' } }),
    prisma.category.create({ data: { name: 'ระบบประปาและสุขาภิบาล' } }),
    prisma.category.create({ data: { name: 'ระบบปรับอากาศและการระบายอากาศ' } }),
    prisma.category.create({ data: { name: 'งานโครงสร้าง ประตู-หน้าต่าง และเฟอร์นิเจอร์' } }),
    prisma.category.create({ data: { name: 'ระบบไอที สายสัญญาณ และกล้องวงจรปิด' } }),
  ]);

  const createdBuildings: any[] = [];
  const createdManagers: any[] = [];
  const createdTechnicians: any[] = [];

  // 6. สร้างอาคาร (BUILDING อย่างเดียว ไม่สร้างชั้น/ห้อง), ผูก Manager และสร้างช่าง 5 คนต่ออาคาร
  for (let i = 0; i < buildingData.length; i++) {
    const item = buildingData[i];

    // สร้าง Manager ประจำอาคาร
    const manager = await prisma.user.create({
      data: {
        name: item.managerName,
        email: item.managerEmail,
        passwordHash,
        role: Role.MANAGER,
        isActive: true,
      },
    });
    createdManagers.push(manager);

    // สร้างเฉพาะประเภท BUILDING เท่านั้น (ไม่สร้าง FLOOR หรือ ROOM)
    const buildingLocation = await prisma.location.create({
      data: {
        name: item.buildingName,
        type: LocationType.BUILDING,
      },
    });
    createdBuildings.push(buildingLocation);

    // ผูกหัวหน้าผู้ดูแลอาคาร (LocationManager)
    await prisma.locationManager.create({
      data: {
        locationId: buildingLocation.id,
        managerId: manager.id,
      },
    });

    // สร้างอุปกรณ์ตัวอย่างประจำอาคาร
    await prisma.asset.create({
      data: {
        name: `ระบบปรับอากาศรวมศูนย์ (${item.code})`,
        assetCode: `AC-${item.code}-MAIN`,
        locationId: buildingLocation.id,
      },
    });

    // สร้างช่าง 5 คน สังกัด Manager ประจำอาคารนี้
    const techGroup = technicianNames[i];
    for (let t = 0; t < techGroup.length; t++) {
      const techUser = await prisma.user.create({
        data: {
          name: techGroup[t],
          email: `tech.b${i + 1}.${t + 1}@fixify.com`,
          passwordHash,
          role: Role.TECHNICIAN,
          managerId: manager.id,
          isActive: true,
        },
      });
      createdTechnicians.push(techUser);
    }
  }

  // 7. ผู้แจ้งซ่อม (Requester) คนไทย 50 คน
  const requesterNames = [
    'นารีรัตน์ รัตนเจริญ', 'ธนากร ภูมิมินทร์', 'กมลชนก ดำรงศักดิ์', 'จิรภัทร ชาญวณิช', 'ชลธิชา อัศวเดช',
    'ณัฐพล เลิศอนันต์', 'ดนัย เกษมสุข', 'ทิพวรรณ วัฒนาลัย', 'ธิดารัตน์ ศรีสุวรรณ', 'นิกร เมธีธรรม',
    'ปิยะวัฒน์ กิจเจริญ', 'พรเพ็ญ แสงประกาย', 'ภานุพงศ์ ศิริจันทร์', 'มลฤดี ทองวิเศษ', 'ยุทธนา วงศ์ศิริ',
    'รชต ประเสริฐพร', 'ลลิตา ธนารักษ์', 'วรัญญา บุญเลิศ', 'ศราวุธ พงษ์ศิริ', 'สิริมา กุลสถิตย์',
    'หทัยทิพย์ บดินทร์เดชา', 'อนิรุตติ์ มหิทธิเดช', 'กิตติศักดิ์ ชวาลิน', 'จารุวรรณ โรจนวิทย์', 'ฉัตรชัย ภูมิปัญโญ',
    'ชัชวาลย์ สมบูรณ์ทรัพย์', 'ณภัทร ธนเกียรติ', 'ดวงใจ สุขสวัสดิ์', 'ทรงพล ยงค์ยุทธ', 'ธนภัทร เลิศพิริยะ',
    'นพดล เจริญศิลป์', 'บุษกร พิพัฒน์พร', 'ปิยมาภรณ์ เกตุแก้ว', 'พรรณทิพา บุญญานุวัตร', 'พิเชษฐ์ จตุรภัทร',
    'ภัทรพงศ์ อุดมลาภ', 'เมทินี ศิริวัฒนา', 'ยุพาพร วารินทร์', 'รังสรรค์ โชคชัยบวร', 'ลักขณา อมรเวช',
    'วชิรวิทย์ ติณณภพ', 'ศศิธร บุญญาภิรมย์', 'สถาพร สุขสมจิต', 'อรทัย ลีลาวดี', 'อภิชาต ไตรภพ',
    'กานดา ชินพงศ์', 'เขมทัต ธานีรัตน์', 'คงเดช วัฒนประเสริฐ', 'งามจิตต์ มหาลาภ', 'จิราพร วรวงศ์พิศาล',
  ];

  console.log('👤 กำลังสร้าง Requester 50 คน...');
  const createdRequesters: any[] = [];
  for (let r = 0; r < requesterNames.length; r++) {
    const requester = await prisma.user.create({
      data: {
        name: requesterNames[r],
        email: `requester${r + 1}@fixify.com`,
        passwordHash,
        role: Role.REQUESTER,
        isActive: true,
      },
    });
    createdRequesters.push(requester);
  }

  // 8. สร้างตัวอย่างใบแจ้งซ่อมเริ่มต้น 5 ใบ (ผูกเข้ากับตัวอาคารโดยตรง)
  for (let b = 0; b < buildingData.length; b++) {
    const targetBuilding = createdBuildings[b];
    const targetManager = createdManagers[b];
    const targetTech = createdTechnicians[b * 5];
    const targetRequester = createdRequesters[b];
    const targetCategory = categories[b % categories.length];

    const requestNo = `MR-2026-000${b + 1}`;
    const sampleRequest = await prisma.request.create({
      data: {
        requestNo,
        title: `งานตรวจสอบระบบซ่อมบำรุงประจำเดือน - ${targetBuilding.name}`,
        description: `ตรวจสอบความเรียบร้อยและบำรุงรักษาอุปกรณ์ส่วนกลาง ประจำ ${targetBuilding.name}`,
        categoryId: targetCategory.id,
        locationId: targetBuilding.id,
        priority: b === 0 ? Priority.HIGH : Priority.MEDIUM,
        status: b === 0 ? RequestStatus.ASSIGNED : RequestStatus.PENDING_MANAGER,
        requesterId: targetRequester.id,
        managerId: targetManager.id,
        technicianId: b === 0 ? targetTech.id : null,
        assignedAt: b === 0 ? new Date() : null,
      },
    });

    await prisma.requestLog.create({
      data: {
        requestId: sampleRequest.id,
        userId: targetRequester.id,
        action: 'CREATE_REQUEST',
        newStatus: RequestStatus.PENDING_MANAGER,
        note: 'เปิดใบแจ้งซ่อมเข้าระบบ',
      },
    });

    if (b === 0) {
      await prisma.requestLog.create({
        data: {
          requestId: sampleRequest.id,
          userId: targetManager.id,
          action: 'ASSIGN_TECHNICIAN',
          oldStatus: RequestStatus.PENDING_MANAGER,
          newStatus: RequestStatus.ASSIGNED,
          note: `มอบหมายงานให้ช่าง ${targetTech.name}`,
        },
      });
    }
  }

  console.log('----------------------------------------------------');
  console.log('✅ Seeding เสร็จสมบูรณ์แล้ว (เฉพาะ BUILDING)!');
  console.log(`- 👑 Admin (1 คน): admin@fixify.com (ชื่อ: ${admin.name})`);
  console.log(`- 🏢 สถานที่ (${createdBuildings.length} แห่ง - ประเภท BUILDING ทั้งหมด):`);
  buildingData.forEach((b, idx) => {
    console.log(`   ${idx + 1}. ${b.buildingName} -> หัวหน้า: ${b.managerName} (${b.managerEmail})`);
  });
  console.log(`- 🔧 Technician (${createdTechnicians.length} คน - ตึกละ 5 คน)`);
  console.log(`- 👥 Requester (${createdRequesters.length} คน)`);
  console.log('🔑 รหัสผ่านของทุกบัญชี: password123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ เกิดข้อผิดพลาดในการ Seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
