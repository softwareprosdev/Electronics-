export const siteConfig = {
  name: 'TraceWorks Lab',
  shortName: 'TraceWorks Lab',
  legalName: 'TraceWorks Lab — Firmware-Level Electronics Repairs',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+19563921440',
  phoneDisplay: process.env.NEXT_PUBLIC_BUSINESS_PHONE_DISPLAY || '(956) 392-1440',
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || 'info@traceworkslab.com',
  repairEmail: process.env.REPAIR_NOTIFY_EMAIL || 'repairs@traceworkslab.com',
  addressLocality: 'Harlingen',
  addressRegion: 'TX',
  serviceArea: [
    'Harlingen',
    'San Benito',
    'La Feria',
    'Mercedes',
    'Weslaco',
    'Donna',
    'Alamo',
    'Pharr',
    'San Juan',
    'McAllen',
    'Mission',
    'Edinburg',
    'Brownsville',
  ],
  zipCodes: [
    '78550',
    '78551',
    '78552',
    '78553',
    '78570',
    '78572',
    '78573',
    '78574',
    '78577',
  ],
  tagline: 'Firmware-Level Electronics Repairs.',
  positioningLine:
    'Diagnose • Repair • Restore — Board-Level Diagnostics • Component-Level Repair • Embedded Systems • NAND/Memory • Motherboards • Automotive Modules • Aviation Electronics • GPUs • ASICs • Game Consoles',
  coreMessage: 'When standard repair shops say "it’s not repairable," we trace the fault.',
}

export const primaryNav = [
  { label: 'Board-Level Repair', href: '/board-level-repair' },
  { label: 'Phones & Tablets', href: '/iphone-board-repair' },
  { label: 'Computers & GPUs', href: '/motherboard-repair' },
  { label: 'Gaming', href: '/ps5-repair' },
  { label: 'Automotive', href: '/automotive-ecm-repair' },
  { label: 'Aviation', href: '/aviation-electronics-repair' },
  { label: 'Mining Hardware', href: '/asic-board-repair' },
  { label: 'Mail-In Repair', href: '/mail-in-repair' },
  { label: 'Business Services', href: '/business-services' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export const footerLinks = {
  services: [
    { label: 'Board-Level Repair', href: '/board-level-repair' },
    { label: 'Component-Level Repair', href: '/component-level-repair' },
    { label: 'Phones & Tablets', href: '/iphone-board-repair' },
    { label: 'Computers & GPUs', href: '/gpu-repair' },
    { label: 'Gaming Consoles', href: '/ps5-repair' },
    { label: 'Automotive Electronics', href: '/automotive-ecm-repair' },
    { label: 'Aviation Electronics', href: '/aviation-electronics-repair' },
    { label: 'ASIC Mining Hardware', href: '/asic-board-repair' },
  ],
  company: [
    { label: 'Mail-In Repair', href: '/mail-in-repair' },
    { label: 'Business Services', href: '/business-services' },
    { label: 'Repair Shop Partners', href: '/repair-shop-partner-program' },
    { label: 'Service Areas', href: '/service-area/harlingen' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Repair Policy', href: '/repair-policy' },
  ],
}

export const diagnosticProcess = [
  {
    step: '01',
    title: 'Intake',
    description: 'Device, board, module, or assembly is documented.',
  },
  {
    step: '02',
    title: 'Visual Inspection',
    description: 'Microscopic inspection and physical examination.',
  },
  {
    step: '03',
    title: 'Electrical Diagnostics',
    description:
      'Voltage, resistance, continuity, current-draw and power-rail analysis where applicable.',
  },
  {
    step: '04',
    title: 'Component-Level Analysis',
    description:
      'Technicians identify failed components, shorts, damaged traces, memory issues, power-management problems, or other board-level faults.',
  },
  {
    step: '05',
    title: 'Repair Strategy',
    description: 'Customer receives findings and recommended repair path.',
  },
  {
    step: '06',
    title: 'Board Repair',
    description: 'Qualified repair is performed using appropriate laboratory equipment.',
  },
  {
    step: '07',
    title: 'Testing',
    description: 'The repaired board is tested against applicable functional criteria.',
  },
  {
    step: '08',
    title: 'Final Quality Control',
    description: 'Repair documentation and final status are recorded.',
  },
]

export const labEquipment = [
  { name: 'Microscope', description: 'Microscopic inspection of boards and components.' },
  { name: 'BGA Rework Station', description: 'Controlled reballing and IC placement.' },
  { name: 'Hot-Air Rework', description: 'Controlled-heat component removal and installation.' },
  { name: 'Precision Soldering Station', description: 'Fine-pitch soldering and microsoldering.' },
  { name: 'Oscilloscope', description: 'Signal analysis on live circuits.' },
  { name: 'Digital Multimeter', description: 'Voltage, resistance, and continuity testing.' },
  { name: 'DC Power Supply', description: 'Controlled current-draw and power-rail testing.' },
  { name: 'Logic Analyzer', description: 'Digital signal and communication-bus analysis.' },
  { name: 'EEPROM / NAND Programmers', description: 'Memory and firmware-level diagnostics.' },
  { name: 'Thermal Inspection Equipment', description: 'Identifying heat-related component failure.' },
]
