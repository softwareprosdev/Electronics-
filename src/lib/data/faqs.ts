export interface FaqItem {
  question: string
  answer: string
  category: string
}

export const faqs: FaqItem[] = [
  {
    category: 'Board-Level Repair',
    question: 'What is board-level repair?',
    answer:
      'Board-level repair means diagnosing and repairing a failure directly on the printed circuit board rather than replacing an entire assembly, part, or device. It requires tracing a fault back to the specific circuit responsible for it.',
  },
  {
    category: 'Board-Level Repair',
    question: 'What is component-level repair?',
    answer:
      'Component-level repair goes further than board-level work by identifying the individual failed component, such as an IC, capacitor, or connector, and replacing only that part rather than the entire board.',
  },
  {
    category: 'Board-Level Repair',
    question: 'Can you repair a dead motherboard?',
    answer:
      'A motherboard with no power, no display, or no boot is evaluated through board-level diagnostics before any repair-or-replace decision is made. Many "dead" motherboards have an isolated, repairable fault.',
  },
  {
    category: 'Board-Level Repair',
    question: 'Can you repair liquid-damaged boards?',
    answer:
      'Liquid-damaged boards are evaluated for corrosion, shorted circuits, and component damage. Repairability depends on the extent of the damage and how long it has been present, which is why prompt evaluation matters.',
  },
  {
    category: 'Board-Level Repair',
    question: 'Do you repair boards other shops cannot?',
    answer:
      'Many of the boards we receive have already been evaluated elsewhere and labeled unrepairable. Because we work at the component level with microscopic inspection and specialized diagnostic equipment, we are frequently able to identify a repair path that modular-replacement-focused shops cannot pursue.',
  },
  {
    category: 'Apple Devices',
    question: 'Do you repair iPhone motherboards?',
    answer:
      'Yes. We perform board-level diagnostics and component-level repair on iPhone logic boards, including power-management faults, charging-circuit issues, boot loops, and liquid damage.',
  },
  {
    category: 'Apple Devices',
    question: 'Do you repair iPad logic boards?',
    answer:
      'Yes. iPad logic boards are evaluated using the same board-level and component-level approach used for iPhone, covering power, charging, and storage-related faults.',
  },
  {
    category: 'Gaming',
    question: 'Do you repair PS5 motherboards?',
    answer:
      'Yes. PS5 board-level repair covers no-power conditions, HDMI circuit faults, USB-C charging issues, and storage-related failures.',
  },
  {
    category: 'Gaming',
    question: 'Do you repair Xbox boards?',
    answer:
      'Yes. Xbox Series X, Series S, and Xbox One consoles are evaluated at the board level for power, HDMI, and overheating-related failures.',
  },
  {
    category: 'Gaming',
    question: 'Do you repair Nintendo Switch 2 consoles?',
    answer:
      'Yes. We extend the same board-level diagnostic and component-level repair process used on the original Switch and Switch OLED to Nintendo Switch 2 hardware.',
  },
  {
    category: 'Computers & GPUs',
    question: 'Do you repair GPUs?',
    answer:
      'Yes. Graphics card evaluation covers no-display conditions, artifacting, no-power issues, and power-circuitry faults. We do not guarantee GPU core-level replacement or repair of every core failure; findings are communicated after diagnostics.',
  },
  {
    category: 'Mining Hardware',
    question: 'Do you repair ASIC mining boards?',
    answer:
      'Yes. ASIC control boards and hashboards are evaluated for power circuitry, communication faults, overheating damage, and connector or trace repair.',
  },
  {
    category: 'Automotive',
    question: 'Do you repair automotive ECM modules?',
    answer:
      'Yes. ECM board-level diagnostics cover communication faults, no-power conditions, and component-level failures. Programming and module services are performed only where technically supported and legally authorized.',
  },
  {
    category: 'Automotive',
    question: 'Do you repair BCM modules?',
    answer:
      'Yes. Body Control Module diagnostics cover power faults, communication-bus issues, and component-level board damage.',
  },
  {
    category: 'Aviation',
    question: 'Do you repair aviation electronics?',
    answer:
      'Aviation electronics are accepted for technical evaluation and repair when within our capabilities and applicable authorization requirements. We do not claim FAA certification, PMA authorization, or repair-station certification unless specifically documented for an engagement.',
  },
  {
    category: 'Service Options',
    question: 'Do you offer mail-in repair?',
    answer:
      'Yes. Customers outside our local Harlingen-to-Mission service area can ship devices, boards, or modules to our laboratory. Do not ship equipment before receiving intake instructions unless otherwise directed.',
  },
  {
    category: 'Pricing',
    question: 'How does diagnostic pricing work?',
    answer:
      'Advanced board-level and component-level diagnostics require inspection before a price can be quoted. Contact us for current diagnostic rates, or submit a repair request and a technician will follow up.',
  },
  {
    category: 'Pricing',
    question: 'Do you guarantee repairs?',
    answer:
      'We do not promise a repair outcome before inspection. Diagnosis does not guarantee repairability. Once a board or device has been evaluated, we communicate findings and available options before any repair work begins.',
  },
  {
    category: 'Intake',
    question: 'Can I send photos first?',
    answer:
      'Yes. Our repair request form allows you to upload photos, videos, error screenshots, and board images alongside a description of the symptoms, which helps our technicians prepare for diagnostics.',
  },
  {
    category: 'Business Services',
    question: 'Can repair shops send customer boards?',
    answer:
      'Yes. Our Repair Shop Partner Program allows repair businesses to outsource board-level and component-level work while maintaining their own customer relationship.',
  },
  {
    category: 'Business Services',
    question: 'Do you offer business accounts?',
    answer:
      'Yes. Trade accounts are available for repair shops, computer stores, automotive shops, dealerships, fleet operators, mining operations, aviation organizations, and other businesses with recurring repair needs.',
  },
  {
    category: 'Process',
    question: 'How long does diagnostics take?',
    answer:
      'Diagnostic timelines vary by device category and current volume. A technician will provide an estimated timeline after intake and initial review.',
  },
  {
    category: 'Data',
    question: 'Can you recover data?',
    answer:
      'Data preservation is a consideration during board-level repair whenever technically possible, but it is not guaranteed. Customers are responsible for maintaining backups unless a specific data-recovery agreement is in place.',
  },
  {
    category: 'Board-Level Repair',
    question: 'Can you repair boards damaged by liquid?',
    answer:
      'Liquid-damaged boards are assessed for corrosion, shorted circuits, and component viability. Some liquid damage is repairable; some is not. Evaluation determines which applies to a given board.',
  },
  {
    category: 'Process',
    question: 'What happens if a board cannot be repaired?',
    answer:
      'If diagnostics determine a board is unrepairable, we communicate that finding along with any relevant details before closing out the request. You are never charged for a repair that was not performed.',
  },
  {
    category: 'Automotive',
    question: 'Can you unlock or bypass vehicle security systems?',
    answer:
      'No. We do not perform unauthorized immobilizer, VIN, odometer, or anti-theft bypass procedures. Programming and module services are performed only where technically supported and legally authorized.',
  },
  {
    category: 'Apple Devices',
    question: 'Can you unlock a stolen or activation-locked device?',
    answer:
      'No. We do not perform activation-lock bypasses, stolen-device unlocking, fraudulent carrier unlocking, or identifier alteration intended to conceal a device’s identity.',
  },
]

export const faqCategories = Array.from(new Set(faqs.map((faq) => faq.category)))
