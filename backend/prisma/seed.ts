/// <reference types="node" />
import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 กำลังเริ่มต้น Seeding ข้อมูลผู้ใช้ระบบ Fixify (เฉพาะ User)...');

  const passwordHash = await argon2.hash('password123');

  // 1. Admin (1 คน)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fixify.com' },
    update: {
      name: 'สมศักดิ์ ผู้ดูแลระบบ',
      passwordHash,
      role: Role.ADMIN,
      managerId: null,
      isActive: true,
    },
    create: {
      name: 'สมศักดิ์ ผู้ดูแลระบบ',
      email: 'admin@fixify.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  // 2. Manager (5 คน) และ Technician (25 คน สังกัด Manager คนละ 5 คน)
  const managerData = [
    { name: 'วิชัย รัตนวิบูลย์', email: 'wichai@fixify.com' },
    { name: 'มนตรี วงศ์พิพิธ', email: 'montri@fixify.com' },
    { name: 'เกรียงไกร เกียรติกำจาย', email: 'kriangkrai@fixify.com' },
    { name: 'สมปอง ทรัพย์มหาศาล', email: 'sompong@fixify.com' },
    { name: 'อภิสิทธิ์ ธนะโชติ', email: 'aphisit@fixify.com' },
  ];

  const technicianData = [
    // ทีมที่ 1 (5 คน)
    [
      { name: 'ประสิทธิ์ สุขเจริญ', email: 'prasit@fixify.com' },
      { name: 'ชาญชัย วัฒนกุล', email: 'chanchai@fixify.com' },
      { name: 'เกียรติศักดิ์ มั่นคง', email: 'kiattisak@fixify.com' },
      { name: 'เอกชัย พงษ์พานิช', email: 'ekachai@fixify.com' },
      { name: 'ณรงค์ ศรีวิไล', email: 'narong@fixify.com' },
    ],
    // ทีมที่ 2 (5 คน)
    [
      { name: 'ธีรพงษ์ จันทร์เพ็ญ', email: 'theeraphong@fixify.com' },
      { name: 'ปกรณ์ อินทรักษา', email: 'pakorn@fixify.com' },
      { name: 'อนุรักษ์ ทองดี', email: 'anurak@fixify.com' },
      { name: 'จักรพันธ์ แก้วมณี', email: 'jakkaphan@fixify.com' },
      { name: 'วิรัตน์ บุญชู', email: 'wirat@fixify.com' },
    ],
    // ทีมที่ 3 (5 คน)
    [
      { name: 'บุญส่ง แสงจันทร์', email: 'bunsong@fixify.com' },
      { name: 'อำนาจ ภู่เงิน', email: 'amnat@fixify.com' },
      { name: 'สุวิทย์ ชัยชนะ', email: 'suwit@fixify.com' },
      { name: 'ศิริชัย ปรีชาพล', email: 'sirichai@fixify.com' },
      { name: 'วีระศักดิ์ สมบัติเจริญ', email: 'weerasak@fixify.com' },
    ],
    // ทีมที่ 4 (5 คน)
    [
      { name: 'ธวัชชัย วงษ์สุวรรณ', email: 'thawatchai@fixify.com' },
      { name: 'ประวิทย์ ทวีทรัพย์', email: 'prawit@fixify.com' },
      { name: 'พงษ์ศักดิ์ นาคประเสริฐ', email: 'phongsak@fixify.com' },
      { name: 'ทนงศักดิ์ มีสุข', email: 'thanongsak@fixify.com' },
      { name: 'ชลธิศ เหลืองอร่าม', email: 'chonlathit@fixify.com' },
    ],
    // ทีมที่ 5 (5 คน)
    [
      { name: 'สุทิน คำมี', email: 'suthin@fixify.com' },
      { name: 'พัฒนพงษ์ อุดมเดช', email: 'phatthanaphong@fixify.com' },
      { name: 'นพรัตน์ ใจดี', email: 'nopparat@fixify.com' },
      { name: 'ยงยุทธ พูลสวัสดิ์', email: 'yongyut@fixify.com' },
      { name: 'วรวุฒิ กาญจนากูล', email: 'worawut@fixify.com' },
    ],
  ];

  const createdManagers = [];
  const createdTechnicians = [];

  for (let i = 0; i < managerData.length; i++) {
    const m = managerData[i];
    const manager = await prisma.user.upsert({
      where: { email: m.email },
      update: {
        name: m.name,
        passwordHash,
        role: Role.MANAGER,
        managerId: null,
        isActive: true,
      },
      create: {
        name: m.name,
        email: m.email,
        passwordHash,
        role: Role.MANAGER,
        isActive: true,
      },
    });
    createdManagers.push(manager);

    for (const tech of technicianData[i]) {
      const techUser = await prisma.user.upsert({
        where: { email: tech.email },
        update: {
          name: tech.name,
          passwordHash,
          role: Role.TECHNICIAN,
          managerId: manager.id,
          isActive: true,
        },
        create: {
          name: tech.name,
          email: tech.email,
          passwordHash,
          role: Role.TECHNICIAN,
          managerId: manager.id,
          isActive: true,
        },
      });
      createdTechnicians.push(techUser);
    }
  }

  // 3. ผู้แจ้งซ่อม (Requester) คนไทย 50 คน
  const requesterData = [
    { name: 'นารีรัตน์ รัตนเจริญ', email: 'nareerat@fixify.com' },
    { name: 'ธนากร ภูมิมินทร์', email: 'thanakorn@fixify.com' },
    { name: 'กมลชนก ดำรงศักดิ์', email: 'kamonchanok@fixify.com' },
    { name: 'จิรภัทร ชาญวณิช', email: 'jiraphat@fixify.com' },
    { name: 'ชลธิชา อัศวเดช', email: 'chonthicha@fixify.com' },
    { name: 'ณัฐพล เลิศอนันต์', email: 'natthaphon@fixify.com' },
    { name: 'ดนัย เกษมสุข', email: 'danai@fixify.com' },
    { name: 'ทิพวรรณ วัฒนาลัย', email: 'thippawan@fixify.com' },
    { name: 'ธิดารัตน์ ศรีสุวรรณ', email: 'thidarat@fixify.com' },
    { name: 'นิกร เมธีธรรม', email: 'nikorn@fixify.com' },
    { name: 'ปิยะวัฒน์ กิจเจริญ', email: 'piyawat@fixify.com' },
    { name: 'พรเพ็ญ แสงประกาย', email: 'pornpen@fixify.com' },
    { name: 'ภานุพงศ์ ศิริจันทร์', email: 'phanuphong@fixify.com' },
    { name: 'มลฤดี ทองวิเศษ', email: 'monruedee@fixify.com' },
    { name: 'ยุทธนา วงศ์ศิริ', email: 'yutthana@fixify.com' },
    { name: 'รชต ประเสริฐพร', email: 'rachata@fixify.com' },
    { name: 'ลลิตา ธนารักษ์', email: 'lalita@fixify.com' },
    { name: 'วรัญญา บุญเลิศ', email: 'waranya@fixify.com' },
    { name: 'ศราวุธ พงษ์ศิริ', email: 'sarawut@fixify.com' },
    { name: 'สิริมา กุลสถิตย์', email: 'sirima@fixify.com' },
    { name: 'หทัยทิพย์ บดินทร์เดชา', email: 'hathaitip@fixify.com' },
    { name: 'อนิรุตติ์ มหิทธิเดช', email: 'anirut@fixify.com' },
    { name: 'กิตติศักดิ์ ชวาลิน', email: 'kittisak@fixify.com' },
    { name: 'จารุวรรณ โรจนวิทย์', email: 'jaruwan@fixify.com' },
    { name: 'ฉัตรชัย ภูมิปัญโญ', email: 'chatchai@fixify.com' },
    { name: 'ชัชวาลย์ สมบูรณ์ทรัพย์', email: 'chatchawan@fixify.com' },
    { name: 'ณภัทร ธนเกียรติ', email: 'naphat@fixify.com' },
    { name: 'ดวงใจ สุขสวัสดิ์', email: 'duangjai@fixify.com' },
    { name: 'ทรงพล ยงค์ยุทธ', email: 'songphon@fixify.com' },
    { name: 'ธนภัทร เลิศพิริยะ', email: 'thanaphat@fixify.com' },
    { name: 'นพดล เจริญศิลป์', email: 'noppadon@fixify.com' },
    { name: 'บุษกร พิพัฒน์พร', email: 'butsakorn@fixify.com' },
    { name: 'ปิยมาภรณ์ เกตุแก้ว', email: 'piyamaporn@fixify.com' },
    { name: 'พรรณทิพา บุญญานุวัตร', email: 'phanthipa@fixify.com' },
    { name: 'พิเชษฐ์ จตุรภัทร', email: 'phichet@fixify.com' },
    { name: 'ภัทรพงศ์ อุดมลาภ', email: 'phattharaphong@fixify.com' },
    { name: 'เมทินี ศิริวัฒนา', email: 'metinee@fixify.com' },
    { name: 'ยุพาพร วารินทร์', email: 'yuphaporn@fixify.com' },
    { name: 'รังสรรค์ โชคชัยบวร', email: 'rangsan@fixify.com' },
    { name: 'ลักขณา อมรเวช', email: 'lakkhana@fixify.com' },
    { name: 'วชิรวิทย์ ติณณภพ', email: 'wachirawit@fixify.com' },
    { name: 'ศศิธร บุญญาภิรมย์', email: 'sasithorn@fixify.com' },
    { name: 'สถาพร สุขสมจิต', email: 'sathaphon@fixify.com' },
    { name: 'อรทัย ลีลาวดี', email: 'orathai@fixify.com' },
    { name: 'อภิชาต ไตรภพ', email: 'aphichat@fixify.com' },
    { name: 'กานดา ชินพงศ์', email: 'kanda@fixify.com' },
    { name: 'เขมทัต ธานีรัตน์', email: 'khemmathat@fixify.com' },
    { name: 'คงเดช วัฒนประเสริฐ', email: 'khongdet@fixify.com' },
    { name: 'งามจิตต์ มหาลาภ', email: 'ngamjit@fixify.com' },
    { name: 'จิราพร วรวงศ์พิศาล', email: 'jiraporn@fixify.com' },
  ];

  console.log('👤 กำลังสร้าง Requester 50 คน...');
  const createdRequesters = [];
  for (const req of requesterData) {
    const requester = await prisma.user.upsert({
      where: { email: req.email },
      update: {
        name: req.name,
        passwordHash,
        role: Role.REQUESTER,
        managerId: null,
        isActive: true,
      },
      create: {
        name: req.name,
        email: req.email,
        passwordHash,
        role: Role.REQUESTER,
        isActive: true,
      },
    });
    createdRequesters.push(requester);
  }

  console.log('----------------------------------------------------');
  console.log('✅ Seeding ข้อมูล User เสร็จสมบูรณ์แล้ว!');
  console.log(`- 👑 Admin (1 คน): ${admin.email} (ชื่อ: ${admin.name})`);
  console.log(`- 🧑‍💼 Manager (${createdManagers.length} คน)`);
  console.log(`- 🔧 Technician (${createdTechnicians.length} คน - สังกัด Manager คนละ 5 คน)`);
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
