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
  {
    category: 'Board-Level Repair',
    question: 'How long do board-level repairs typically take once accepted?',
    answer:
      'Timelines vary by device category, the complexity of the fault, and current volume. A technician will provide an estimated timeline once diagnostics are complete and a repair path has been identified.',
  },
  {
    category: 'Board-Level Repair',
    question: 'Will a board-level repair affect my manufacturer warranty?',
    answer:
      'For most consumer devices, opening the enclosure for third-party repair can affect an existing manufacturer warranty. If your device is still under warranty, that is worth weighing before submitting it for evaluation, and we are happy to discuss it during intake.',
  },
  {
    category: 'Apple Devices',
    question: 'Do you repair Android phones and tablets?',
    answer:
      'Our published service pages focus on iPhone and iPad board-level repair, but we evaluate a range of Android phones and tablets as well. Submit a repair request describing the device and symptoms and a technician will confirm whether it falls within our current capability.',
  },
  {
    category: 'Apple Devices',
    question: 'What if my iPhone or iPad has severe corrosion from water damage?',
    answer:
      'Severe corrosion is evaluated the same way any liquid-damage case is: under magnification, checking for shorted rails and compromised components before any repair estimate is given. Some corrosion damage is repairable; some has progressed too far. We will tell you which applies after inspection.',
  },
  {
    category: 'Gaming',
    question: 'Do you repair older PS4 or Xbox One consoles?',
    answer:
      'Yes. While our newest-generation console pages focus on PS5, Xbox Series X/S, and Switch, the same board-level diagnostic process applies to PS4 and Xbox One hardware. Submit a repair request with the console model and symptoms.',
  },
  {
    category: 'Gaming',
    question: 'Can a console with a broken disc drive still be repaired?',
    answer:
      'A failed disc drive is typically a separate issue from a board-level electrical fault, and the two are diagnosed independently. If the drive itself is mechanically damaged, we will let you know whether that is something we can address or whether it falls outside board-level repair.',
  },
  {
    category: 'Computers & GPUs',
    question: 'Do you repair laptop motherboards specifically?',
    answer:
      'Yes. Laptop motherboards are evaluated using the same board-level and component-level process as desktop boards, accounting for the tighter component spacing and connector layouts typical of laptop designs.',
  },
  {
    category: 'Computers & GPUs',
    question: 'Can you repair a GPU that was worn out from mining or heavy rendering use?',
    answer:
      'Extended heavy-load use is a common cause of VRM and power-circuitry wear on graphics cards. These are evaluated the same way as any other GPU fault: board-level diagnostics first, followed by findings and options before any repair is approved.',
  },
  {
    category: 'Computers & GPUs',
    question: 'Do you repair desktop power supplies?',
    answer:
      'Power supply units are evaluated on a case-by-case basis. Submit a repair request describing the symptoms and a technician will confirm whether the unit falls within our current diagnostic capability.',
  },
  {
    category: 'Mining Hardware',
    question: 'Do you repair power supply units for mining rigs?',
    answer:
      'Yes. Mining rig power supplies are evaluated as part of our broader ASIC and mining hardware diagnostics, since power circuitry faults are one of the most common failure points in continuous-duty mining operations.',
  },
  {
    category: 'Mining Hardware',
    question: 'Can you evaluate multiple units from the same mining operation at once?',
    answer:
      'Yes. We work with both individual hobbyist miners and larger operations submitting several units at a time. Contact us or submit a business account request to discuss volume intake.',
  },
  {
    category: 'Automotive',
    question: 'Do you repair TCM (Transmission Control Module) units?',
    answer:
      'Yes. TCM boards are evaluated using the same component-level diagnostic approach used for ECU, ECM, and BCM modules, covering power, communication, and corrosion-related faults.',
  },
  {
    category: 'Automotive',
    question: 'Can a module with corrosion damage still be repaired?',
    answer:
      'It depends on the extent of the corrosion and which circuits it has affected. Evaluation under magnification determines whether the module is a viable repair candidate or whether the damage has progressed too far.',
  },
  {
    category: 'Aviation',
    question: 'What documentation will I receive after an aviation electronics evaluation?',
    answer:
      'You receive written findings describing the condition of the board or assembly and the work performed. Any return-to-service documentation, certification, or regulatory sign-off remains your responsibility or that of a qualified facility, as applicable to your equipment.',
  },
  {
    category: 'Aviation',
    question: 'Do you work on general aviation electronics as well as larger aircraft systems?',
    answer:
      'We accept aviation electronics for technical evaluation on a case-by-case basis, general aviation included, when the work falls within our documented capability and applicable authorization requirements. Contact us with details about the specific board or assembly.',
  },
  {
    category: 'Service Options',
    question: "What's the difference between mail-in repair and local drop-off?",
    answer:
      'Local drop-off means bringing the device, board, or module directly to our Harlingen laboratory. Mail-in repair follows the same diagnostic and repair process, but the item is shipped to us instead — useful for customers outside easy driving distance.',
  },
  {
    category: 'Service Options',
    question: 'Do you offer expedited or priority service?',
    answer:
      'Priority service options are available for business and trade account customers with recurring repair needs. Contact us to discuss availability for a specific job.',
  },
  {
    category: 'Service Options',
    question: 'Can I check the status of my repair?',
    answer:
      'A technician will keep you updated at key points in the process — after diagnostics, before repair begins, and when the item is ready. A self-service customer portal for real-time status tracking is planned as a future feature.',
  },
  {
    category: 'Pricing',
    question: 'Is the diagnostic fee separate from the repair cost?',
    answer:
      'Diagnostics and repair are typically quoted as separate line items, since a diagnostic can determine that a board is not economically repairable. Contact us for current diagnostic rates, or submit a repair request and a technician will explain the pricing structure for your specific case.',
  },
  {
    category: 'Pricing',
    question: 'Do you offer a warranty on completed repairs?',
    answer:
      'Warranty terms depend on the specific repair performed and the device category. A technician will confirm what applies to your repair before work begins.',
  },
  {
    category: 'Intake',
    question: 'What information should I include with my repair request?',
    answer:
      'A clear description of the symptoms, when they started, and any relevant history (drops, liquid exposure, prior repairs) helps our technicians prepare for diagnostics. Photos, videos, and error screenshots uploaded through the repair request form are also useful.',
  },
  {
    category: 'Intake',
    question: 'Do I need an appointment to drop off a device?',
    answer:
      'Submitting a repair request ahead of time helps our technicians prepare and gives you an idea of next steps, but it is not a strict requirement for local drop-off. Mail-in customers should always wait for intake instructions before shipping anything.',
  },
  {
    category: 'Business Services',
    question: 'Is there a minimum volume required for a trade account?',
    answer:
      'No strict minimum is required to open a trade account. Volume pricing and priority options scale with your repair volume as it grows. Contact us to discuss what makes sense for your business.',
  },
  {
    category: 'Business Services',
    question: "Can you provide white-label diagnostic reports for my shop's customers?",
    answer:
      'White-label reporting is available in appropriate cases for trade account customers, such as repair shops that want to present findings under their own name to their end customer. Discuss this option when setting up your trade account.',
  },
  {
    category: 'Process',
    question: 'Who determines whether a repair is worth pursuing?',
    answer:
      'After diagnostics, we communicate our findings and the available options, including cost, so you can decide whether the repair makes sense given the device’s value and your needs. We do not proceed with repair work without that authorization.',
  },
  {
    category: 'Process',
    question: 'Will I be contacted before any repair work begins?',
    answer:
      'Yes. Diagnostics are completed first, findings are communicated, and repair work only proceeds once you approve the recommended path and cost.',
  },
  {
    category: 'Data',
    question: 'Should I back up my device before sending it in?',
    answer:
      'Where possible, yes. While data preservation is a consideration during board-level repair whenever technically feasible, it is not guaranteed, and customers are responsible for maintaining their own backups unless a specific data-recovery agreement is in place.',
  },
  {
    category: 'Shipping & Packaging',
    question: 'How should I package a device for mail-in repair?',
    answer:
      'Specific packaging guidance is provided as part of your intake instructions once a repair request is submitted, tailored to the device or board being shipped. In general, secure padding around the item and a rigid outer box are recommended to prevent movement in transit.',
  },
  {
    category: 'Shipping & Packaging',
    question: 'Am I responsible for return shipping costs?',
    answer:
      'Shipping arrangements, including return shipping, are confirmed during intake and may vary by repair type and business or trade account status. A technician will explain the specifics for your repair before you ship anything.',
  },
  {
    category: 'Shipping & Packaging',
    question: 'Is my package insured during transit?',
    answer:
      'Insurance and shipping-carrier options are discussed as part of your intake instructions. We recommend choosing a shipping method with tracking and, for higher-value items, declared-value insurance coverage.',
  },
]

export const faqCategories = Array.from(new Set(faqs.map((faq) => faq.category)))
