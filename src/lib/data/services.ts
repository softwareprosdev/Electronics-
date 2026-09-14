export type ServiceCategorySlug =
  | 'board-level'
  | 'phones-tablets'
  | 'computers'
  | 'gaming'
  | 'automotive'
  | 'aviation'
  | 'mining'

export interface ServiceContent {
  slug: string
  category: ServiceCategorySlug
  name: string
  shortSummary: string
  heroHeadline: string
  metaTitle: string
  metaDescription: string
  intro: string[]
  symptoms: string[]
  whatWeEvaluate: string[]
  ctaHeadline: string
  ctaLabel: string
  disclaimer?: string
  relatedSlugs: string[]
}

export const serviceCategories: Record<
  ServiceCategorySlug,
  { name: string; description: string }
> = {
  'board-level': {
    name: 'Board-Level & Component-Level Repair',
    description:
      'The foundation of everything we do: diagnostics and repair performed at the printed circuit board and individual component level.',
  },
  'phones-tablets': {
    name: 'Phones & Tablets',
    description: 'iPhone, iPad, Android phone, and Android tablet board-level service.',
  },
  computers: {
    name: 'Computers, Motherboards & GPUs',
    description: 'Desktop and laptop motherboards, GPUs, and PC electronics.',
  },
  gaming: {
    name: 'Gaming Consoles',
    description: 'PlayStation, Xbox, and Nintendo board-level repair.',
  },
  automotive: {
    name: 'Automotive Electronics',
    description: 'ECM, ECU, BCM, TCM, and other automotive control module repair.',
  },
  aviation: {
    name: 'Aviation Electronics',
    description: 'Avionics and electronic assembly evaluation and repair.',
  },
  mining: {
    name: 'ASIC & Mining Hardware',
    description: 'Cryptocurrency mining hardware and ASIC control board repair.',
  },
}

export const services: ServiceContent[] = [
  {
    slug: 'advanced-electronics-repair',
    category: 'board-level',
    name: 'Advanced Electronics Repair',
    shortSummary:
      'Component-level diagnostics and repair for devices, boards, and systems that standard repair shops turn away.',
    heroHeadline: 'Advanced Electronics Repair & Reprogramming',
    metaTitle: 'Advanced Electronics Repair in Harlingen & the Rio Grande Valley',
    metaDescription:
      'Component-level diagnostics and board-level repair for phones, computers, GPUs, game consoles, automotive modules, aviation electronics, and ASIC hardware. Serving Harlingen to Mission, TX.',
    intro: [
      'Most repair facilities are built around modular replacement: swap the screen, swap the battery, swap the board, swap the device. That approach works for a large share of everyday repairs. It does not work when the failure is inside the electronics themselves.',
      'Our laboratory specializes in the cases that fall outside standard repair: no-power boards, boot failures, memory and storage faults, shorted power rails, liquid-damaged PCBs, and firmware-related failures across consumer, computing, gaming, automotive, aviation, and mining hardware.',
    ],
    symptoms: [
      'Device or board shows no signs of power',
      'Intermittent operation or random shutdowns',
      'Error codes with no clear resolution',
      'Boot loops or failure to complete startup',
      'Liquid exposure with lingering symptoms after drying',
    ],
    whatWeEvaluate: [
      'Voltage, resistance, and continuity across the board',
      'Power-rail behavior under current-draw testing',
      'Component condition under microscopic inspection',
      'Memory and storage integrity where applicable',
      'Firmware state and recoverability',
    ],
    ctaHeadline: 'Have a device, board, or module another shop called unrepairable?',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['board-level-repair', 'component-level-repair', 'microsoldering'],
  },
  {
    slug: 'board-level-repair',
    category: 'board-level',
    name: 'Board-Level Repair',
    shortSummary: 'Diagnostics and repair performed directly on the printed circuit board.',
    heroHeadline: 'Board-Level Repair',
    metaTitle: 'Board-Level Repair Services | Rio Grande Valley Electronics Lab',
    metaDescription:
      'Board-level repair for phones, computers, GPUs, consoles, and automotive modules. Voltage analysis, trace repair, IC replacement, and power-rail diagnostics.',
    intro: [
      'Board-level repair means the work happens on the printed circuit board itself, not on the enclosure around it. Instead of replacing an entire assembly, our technicians trace a failure back to the specific circuit, trace, or component responsible.',
      'This approach is used across every category we service: phones, tablets, laptop and desktop motherboards, GPUs, game consoles, automotive modules, aviation electronics, and ASIC boards.',
    ],
    symptoms: [
      'No-power or dead-board conditions',
      'Shorted power rails',
      'Damaged or lifted traces',
      'Corroded or damaged connectors',
      'Board that powers on but will not boot fully',
    ],
    whatWeEvaluate: [
      'Short-circuit location using current-draw and thermal methods',
      'Trace continuity and pad integrity',
      'Connector and header condition',
      'Power-management IC behavior',
      'Overall board viability before committing to repair',
    ],
    ctaHeadline: 'A dead board is not always a dead device.',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['component-level-repair', 'microsoldering', 'motherboard-repair'],
  },
  {
    slug: 'component-level-repair',
    category: 'board-level',
    name: 'Component-Level Repair',
    shortSummary: 'Individual failed components are identified, removed, and replaced.',
    heroHeadline: 'Component-Level Repair',
    metaTitle: 'Component-Level Electronics Repair | Harlingen Repair Laboratory',
    metaDescription:
      'Component-level repair: identifying and replacing individual failed ICs, capacitors, and power-management components rather than replacing an entire board or device.',
    intro: [
      'Component-level repair goes one step further than board-level work: rather than replacing an entire circuit board, our technicians identify the specific failed component and replace only that part.',
      'This is the most technically demanding tier of electronics repair, and it is where devices, boards, and modules that other shops have already given up on typically end up.',
    ],
    symptoms: [
      'Specific IC or regulator running hot or failing to function',
      'Capacitor or inductor failure affecting a power rail',
      'Isolated circuit failure within an otherwise functional board',
      'Repeated failure of the same subsystem after prior repairs',
    ],
    whatWeEvaluate: [
      'Individual component behavior against expected specifications',
      'Root-cause failure analysis, not just symptom suppression',
      'Compatibility and sourcing of replacement components',
      'Post-repair testing of the affected circuit',
    ],
    ctaHeadline: 'When the failure is a single component, replacing the whole board is not the answer.',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['board-level-repair', 'microsoldering', 'nand-repair'],
  },
  {
    slug: 'microsoldering',
    category: 'board-level',
    name: 'Microsoldering',
    shortSummary: 'Precision soldering work on fine-pitch components under magnification.',
    heroHeadline: 'Microsoldering',
    metaTitle: 'Microsoldering Repair Services | South Texas Electronics Lab',
    metaDescription:
      'Microsoldering for IC replacement, connector repair, trace repair, and BGA-related diagnostics performed under microscopic inspection.',
    intro: [
      'Microsoldering is the physical skill behind component-level repair: removing and installing fine-pitch ICs, connectors, and passive components without damaging surrounding circuitry.',
      'It is performed under magnification, using controlled heat profiles appropriate to the board and component in question, and is a prerequisite for most of the repairs described throughout this site.',
    ],
    symptoms: [
      'Damaged or missing charging, display, or data connectors',
      'Lifted pads or damaged solder joints',
      'IC packages requiring removal and reballing or replacement',
      'Fine-pitch component damage from prior repair attempts',
    ],
    whatWeEvaluate: [
      'Pad and trace condition before any rework begins',
      'Appropriate heat profile for the specific board and component',
      'Component orientation, alignment, and placement accuracy',
      'Post-rework continuity and functional testing',
    ],
    ctaHeadline: 'Fine-pitch component damage requires fine-pitch repair skill.',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['component-level-repair', 'board-level-repair', 'iphone-board-repair'],
  },
  {
    slug: 'iphone-board-repair',
    category: 'phones-tablets',
    name: 'iPhone Board Repair',
    shortSummary: 'Logic board diagnostics and component-level repair for iPhone.',
    heroHeadline: 'iPhone Logic Board Repair',
    metaTitle: 'iPhone Board Repair | Logic Board Diagnostics | Harlingen, TX',
    metaDescription:
      'iPhone logic board repair: no-power diagnostics, boot-loop troubleshooting, charging circuit repair, NAND-related diagnostics, and component-level microsoldering.',
    intro: [
      'When an iPhone will not power on, will not charge, is stuck in a boot loop, or has failed after liquid exposure, the issue is frequently on the logic board rather than in a part that can simply be swapped.',
      'Our technicians perform board-level diagnostics on iPhone logic boards, including power-management analysis, charging-circuit evaluation, and component-level microsoldering, with a focus on preserving the board and its data whenever technically possible.',
    ],
    symptoms: [
      'No power, no charging, or charging that does not hold',
      'Boot loop or stuck on the manufacturer logo',
      'Liquid damage with corrosion or short-circuit symptoms',
      'Storage-related errors or inaccessible data',
      'Display or Face ID-related board faults',
    ],
    whatWeEvaluate: [
      'Power-management IC and charging circuit behavior',
      'Short-circuit location on the logic board',
      'NAND and storage-related diagnostics',
      'Board condition following liquid exposure',
      'Data-preservation options before repair proceeds',
    ],
    ctaHeadline: "iPhone won't power on? Don't replace the whole device yet.",
    ctaLabel: 'Request a Diagnostic',
    disclaimer:
      'Device identification, configuration, and diagnostics are performed only where technically supported and legally authorized. We do not perform activation-lock bypasses, stolen-device unlocking, or identifier alteration intended to conceal a device’s identity.',
    relatedSlugs: ['ipad-board-repair', 'nand-repair', 'microsoldering'],
  },
  {
    slug: 'ipad-board-repair',
    category: 'phones-tablets',
    name: 'iPad Board Repair',
    shortSummary: 'Logic board diagnostics and component-level repair for iPad.',
    heroHeadline: 'iPad Logic Board Repair',
    metaTitle: 'iPad Board Repair | Logic Board Diagnostics | Rio Grande Valley',
    metaDescription:
      'iPad logic board repair: no-power diagnostics, charging circuit faults, storage-related issues, and component-level microsoldering.',
    intro: [
      'iPad logic boards fail for many of the same reasons iPhone boards do: power-management faults, liquid damage, and storage-related errors. Because iPads are frequently used in business, education, and point-of-sale environments, board-level repair can be significantly more practical than replacement.',
      'We evaluate iPad logic boards for no-power conditions, charging faults, and boot failures, using the same board-level and component-level methods used across our consumer electronics work.',
    ],
    symptoms: [
      'No power or failure to charge',
      'Boot loop or failure to complete startup',
      'Liquid damage with intermittent or worsening symptoms',
      'Storage or data-access errors',
    ],
    whatWeEvaluate: [
      'Power-management and charging-circuit behavior',
      'Short-circuit location and board condition',
      'Storage and NAND-related diagnostics',
      'Feasibility of board-level repair versus replacement',
    ],
    ctaHeadline: 'A dead iPad does not always mean a dead logic board.',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['iphone-board-repair', 'nand-repair', 'microsoldering'],
  },
  {
    slug: 'nand-repair',
    category: 'board-level',
    name: 'NAND / eMMC / UFS Repair',
    shortSummary: 'Diagnostics for NAND, eMMC, and UFS storage failures.',
    heroHeadline: 'NAND, eMMC & UFS Storage Diagnostics',
    metaTitle: 'NAND / eMMC / UFS Storage Repair | Component-Level Diagnostics',
    metaDescription:
      'NAND, eMMC, and UFS storage diagnostics for phones, tablets, and computers experiencing boot failures, storage errors, or firmware corruption.',
    intro: [
      'NAND, eMMC, and UFS are the memory and storage technologies used in most modern phones, tablets, and many embedded systems. When storage fails or firmware becomes corrupted, a device can appear completely dead, stuck in a boot loop, or unable to recognize its own storage.',
      'Our technicians diagnose storage-related failures at the component level, evaluating whether the issue is in the storage IC itself, the controller circuitry, or elsewhere on the board.',
    ],
    symptoms: [
      'Device stuck in a boot loop tied to storage errors',
      'Disk, storage, or firmware-related error codes',
      'Device not recognizing internal storage',
      'Corruption following an incomplete update or firmware event',
    ],
    whatWeEvaluate: [
      'Storage IC condition and connectivity to the board',
      'Controller-level communication with storage',
      'Firmware state and recoverability where applicable',
      'Data-preservation options prior to any repair action',
    ],
    ctaHeadline: 'Storage-related failures are diagnosable before they are declared unrepairable.',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['iphone-board-repair', 'motherboard-repair', 'component-level-repair'],
  },
  {
    slug: 'motherboard-repair',
    category: 'computers',
    name: 'Motherboard Repair',
    shortSummary: 'Laptop and desktop motherboard diagnostics and component-level repair.',
    heroHeadline: 'Laptop & Desktop Motherboard Repair',
    metaTitle: 'Motherboard Repair | Laptop & Desktop Board-Level Diagnostics',
    metaDescription:
      'Laptop and desktop motherboard repair: no-power diagnostics, shorted rails, damaged connectors, and component-level IC replacement.',
    intro: [
      'A motherboard that will not power on, shows no display, or shuts down unexpectedly is often treated as a reason to replace an entire laptop or desktop. In many cases the actual failure is isolated to a specific circuit, connector, or component on the board.',
      'We perform board-level diagnostics on laptop and desktop motherboards, including power-rail analysis, connector repair, and component-level replacement of failed ICs and passive components.',
    ],
    symptoms: [
      'No power, no display, or no POST',
      'Random shutdowns or failure to stay powered on',
      'Damaged charging or power-input connectors',
      'Liquid damage on a laptop motherboard',
      'Board that powers on but fails to boot an operating system',
    ],
    whatWeEvaluate: [
      'Power-rail voltages and current draw at startup',
      'Short-circuit location using thermal and electrical methods',
      'Connector and header condition',
      'Chipset and power-management IC behavior',
    ],
    ctaHeadline: 'A dead motherboard deserves a diagnosis before a replacement.',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['gpu-repair', 'component-level-repair', 'nand-repair'],
  },
  {
    slug: 'gpu-repair',
    category: 'computers',
    name: 'GPU Repair',
    shortSummary: 'NVIDIA and AMD graphics card board-level diagnostics and repair.',
    heroHeadline: 'GPU Board-Level Repair',
    metaTitle: 'GPU Repair | NVIDIA & AMD Graphics Card Board-Level Diagnostics',
    metaDescription:
      'GPU repair for NVIDIA and AMD graphics cards: no-display diagnostics, artifacting, no-power conditions, shorted rails, and power-circuitry repair.',
    intro: [
      'A graphics card that shows no display, produces artifacts, or will not power on represents a significant cost if replaced outright. Many of these failures originate in the power circuitry, VRAM-related connections, or PCIe interface rather than the GPU core itself.',
      'We evaluate NVIDIA and AMD graphics cards at the board level, focusing on power delivery, connector condition, and component-level faults. We do not claim guaranteed GPU core replacement or repair of every core-level failure; findings and options are communicated after diagnostics.',
    ],
    symptoms: [
      'No display output despite the card powering on',
      'Visual artifacting or corrupted output',
      'No power or fans that do not spin',
      'Shorted power rails or failure under load',
      'PCIe connection or detection issues',
    ],
    whatWeEvaluate: [
      'Power-delivery circuitry and voltage regulation',
      'VRAM-related connections where applicable',
      'PCIe interface and detection behavior',
      'Shorted rail location and component-level cause',
    ],
    ctaHeadline: 'GPU not displaying? Request diagnostics before you replace it.',
    ctaLabel: 'Request a Diagnostic',
    relatedSlugs: ['motherboard-repair', 'component-level-repair', 'board-level-repair'],
  },
  {
    slug: 'ps5-repair',
    category: 'gaming',
    name: 'PS5 Repair',
    shortSummary: 'PlayStation 5 board-level diagnostics and component-level repair.',
    heroHeadline: 'PS5 Board-Level Repair',
    metaTitle: 'PS5 Repair | PlayStation 5 Board-Level Diagnostics',
    metaDescription:
      'PS5 repair for no-power conditions, HDMI faults, USB-C charging issues, storage-related failures, and shorted motherboard diagnostics.',
    intro: [
      'A PS5 that will not power on, has no HDMI output, or shuts down unexpectedly is frequently assumed to need a full board or console replacement. Our technicians diagnose PS5 motherboards at the component level before any replacement is considered.',
      'This includes evaluation of the HDMI circuit, USB-C charging and data circuitry, power-management components, and storage-related failures.',
    ],
    symptoms: [
      'No power or a console that will not turn on',
      'No HDMI signal or a damaged HDMI port',
      'USB-C ports that do not charge controllers or connect accessories',
      'Overheating-related shutdowns',
      'Storage or boot failures',
    ],
    whatWeEvaluate: [
      'HDMI circuit and port condition',
      'USB-C charging and data-line integrity',
      'Power-management IC and rail behavior',
      'Storage subsystem and boot-related faults',
    ],
    ctaHeadline: "PS5 dead? Start a board diagnostic before you replace it.",
    ctaLabel: 'Start a Board Diagnostic',
    relatedSlugs: ['xbox-repair', 'nintendo-switch-repair', 'component-level-repair'],
  },
  {
    slug: 'xbox-repair',
    category: 'gaming',
    name: 'Xbox Repair',
    shortSummary: 'Xbox Series X, Series S, and Xbox One board-level diagnostics.',
    heroHeadline: 'Xbox Board-Level Repair',
    metaTitle: 'Xbox Repair | Series X, Series S & Xbox One Board Diagnostics',
    metaDescription:
      'Xbox Series X, Series S, and Xbox One repair: no-power diagnostics, HDMI faults, overheating, and component-level board repair.',
    intro: [
      'Xbox Series X, Series S, and Xbox One consoles share many of the same board-level failure points as other modern game consoles: power-management faults, HDMI circuit damage, and overheating-related component failure.',
      'We diagnose Xbox motherboards at the component level, identifying whether a no-power, no-display, or shutdown issue originates in the power supply path, the HDMI circuit, or elsewhere on the board.',
    ],
    symptoms: [
      'No power or a console stuck on a blank screen',
      'No HDMI output or intermittent display',
      'Overheating-related shutdowns',
      'Disc drive or storage-related failures',
      'Liquid or physical damage to the board',
    ],
    whatWeEvaluate: [
      'Power supply and power-management circuitry',
      'HDMI circuit and connector condition',
      'Thermal history and component stress',
      'Storage and boot-related subsystems',
    ],
    ctaHeadline: "Console won't turn on? Don't replace it yet.",
    ctaLabel: 'Start a Board Diagnostic',
    relatedSlugs: ['ps5-repair', 'nintendo-switch-repair', 'component-level-repair'],
  },
  {
    slug: 'nintendo-switch-repair',
    category: 'gaming',
    name: 'Nintendo Switch Repair',
    shortSummary: 'Nintendo Switch and Switch OLED board-level diagnostics and repair.',
    heroHeadline: 'Nintendo Switch Board-Level Repair',
    metaTitle: 'Nintendo Switch Repair | Board-Level Diagnostics',
    metaDescription:
      'Nintendo Switch and Switch OLED repair: charging port failure, no-power diagnostics, no-display issues, and component-level board repair.',
    intro: [
      'Nintendo Switch and Switch OLED consoles are especially prone to charging-port and USB-C circuit damage from repeated docking and undocking, along with liquid exposure and drop-related board damage.',
      'We evaluate Switch motherboards at the component level, addressing charging circuitry, power-management faults, and no-display conditions.',
    ],
    symptoms: [
      'Will not charge or charges only in certain positions',
      'No power or a black screen on startup',
      'No display when docked, undocked, or both',
      'Liquid damage or corrosion on the board',
      'Overheating during charging or docked use',
    ],
    whatWeEvaluate: [
      'USB-C charging circuit and connector condition',
      'Power-management IC behavior',
      'Display-related circuitry',
      'Board condition following liquid or physical damage',
    ],
    ctaHeadline: "Switch won't charge or power on? Let us diagnose the board.",
    ctaLabel: 'Start a Board Diagnostic',
    relatedSlugs: ['nintendo-switch-2-repair', 'ps5-repair', 'microsoldering'],
  },
  {
    slug: 'nintendo-switch-2-repair',
    category: 'gaming',
    name: 'Nintendo Switch 2 Repair',
    shortSummary: 'Nintendo Switch 2 board-level diagnostics and component-level repair.',
    heroHeadline: 'Nintendo Switch 2 Board-Level Repair',
    metaTitle: 'Nintendo Switch 2 Repair | Board-Level Diagnostics',
    metaDescription:
      'Nintendo Switch 2 repair: charging and USB-C circuit diagnostics, no-power conditions, no-display issues, and component-level board repair.',
    intro: [
      'As Nintendo Switch 2 hardware enters wider use, we are extending the same board-level diagnostic and component-level repair approach used on the original Switch and Switch OLED to the newer platform.',
      'Evaluation covers charging and USB-C circuitry, power-management components, and display-related faults, with repair strategy communicated only after inspection.',
    ],
    symptoms: [
      'Will not charge or power on',
      'No display when docked or undocked',
      'Overheating or unexpected shutdowns',
      'Physical or liquid damage to the board',
    ],
    whatWeEvaluate: [
      'USB-C charging circuit and connector condition',
      'Power-management IC behavior',
      'Display and video-output circuitry',
      'Overall board condition and repair feasibility',
    ],
    ctaHeadline: 'Diagnostics before disposal, even on the newest hardware.',
    ctaLabel: 'Start a Board Diagnostic',
    relatedSlugs: ['nintendo-switch-repair', 'ps5-repair', 'xbox-repair'],
  },
  {
    slug: 'automotive-ecu-repair',
    category: 'automotive',
    name: 'Automotive ECU Repair',
    shortSummary: 'Engine Control Unit board-level diagnostics and module repair.',
    heroHeadline: 'Automotive ECU Repair',
    metaTitle: 'Automotive ECU Repair | Engine Control Unit Board Diagnostics',
    metaDescription:
      'ECU board-level diagnostics and repair for communication faults, no-power conditions, and component-level failures. Programming performed only where technically supported and legally authorized.',
    intro: [
      'An Engine Control Unit (ECU) that fails, throws persistent fault codes, or loses communication with the rest of the vehicle is not always a candidate for outright replacement. Our technicians evaluate ECU boards for component-level failures, corrosion damage, and power-related faults.',
      'Programming and module services are performed only where technically supported and legally authorized. We do not perform unauthorized security bypasses.',
    ],
    symptoms: [
      'Persistent or unresolved fault codes',
      'Loss of communication with the vehicle network',
      'No-start conditions traced to the ECU',
      'Corrosion or liquid damage to the module',
      'Intermittent faults that come and go',
    ],
    whatWeEvaluate: [
      'Power and ground circuit integrity',
      'Communication-bus behavior (where applicable)',
      'Board condition under microscopic inspection',
      'Component-level failure points on the module',
    ],
    ctaHeadline: 'ECU failure? Request a module evaluation before replacement.',
    ctaLabel: 'Request Module Evaluation',
    disclaimer:
      'Programming and module services are performed only where technically supported and legally authorized. We do not perform unlawful immobilizer, VIN, odometer, or anti-theft bypass procedures.',
    relatedSlugs: ['automotive-ecm-repair', 'bcm-repair', 'board-level-repair'],
  },
  {
    slug: 'automotive-ecm-repair',
    category: 'automotive',
    name: 'Automotive ECM Repair',
    shortSummary: 'Engine Control Module board-level diagnostics and repair.',
    heroHeadline: 'Automotive ECM Repair',
    metaTitle: 'Automotive ECM Repair | Engine Control Module Board Diagnostics',
    metaDescription:
      'ECM board-level diagnostics: communication faults, no-power conditions, and component-level module repair. Programming performed only where technically supported and legally authorized.',
    intro: [
      'The Engine Control Module (ECM) manages core engine functions, and its failure can leave a vehicle inoperable. Rather than defaulting to full module replacement, we evaluate ECM boards at the component level to identify the actual point of failure.',
      'As with all automotive module work, programming and module services are performed only where technically supported and legally authorized.',
    ],
    symptoms: [
      'No-start or intermittent-start conditions',
      'Communication faults with other vehicle modules',
      'Persistent diagnostic trouble codes',
      'Physical or liquid damage to the module housing or board',
    ],
    whatWeEvaluate: [
      'Power, ground, and communication-circuit integrity',
      'Board-level component condition',
      'Connector and pin condition',
      'Recoverability of the module following the fault',
    ],
    ctaHeadline: 'ECM failure? Request a module evaluation before replacement.',
    ctaLabel: 'Request Module Evaluation',
    disclaimer:
      'Programming and module services are performed only where technically supported and legally authorized. We do not perform unlawful immobilizer, VIN, odometer, or anti-theft bypass procedures.',
    relatedSlugs: ['automotive-ecu-repair', 'bcm-repair', 'board-level-repair'],
  },
  {
    slug: 'bcm-repair',
    category: 'automotive',
    name: 'BCM Repair',
    shortSummary: 'Body Control Module board-level diagnostics and repair.',
    heroHeadline: 'Automotive BCM Repair',
    metaTitle: 'BCM Repair | Body Control Module Board-Level Diagnostics',
    metaDescription:
      'BCM board-level diagnostics for lighting, locking, power, and communication faults. Programming performed only where technically supported and legally authorized.',
    intro: [
      'The Body Control Module (BCM) governs functions ranging from lighting and locking to power windows and communication with other vehicle systems. A failed BCM can produce a wide range of seemingly unrelated symptoms.',
      'We evaluate BCM boards at the component level for power faults, corrosion, and communication-circuit failures, and communicate findings before any repair or programming step is taken.',
    ],
    symptoms: [
      'Erratic lighting, locking, or window behavior',
      'Communication faults with other modules',
      'No-power or intermittent-power conditions on the module',
      'Corrosion or liquid damage',
    ],
    whatWeEvaluate: [
      'Power and ground circuit integrity',
      'Communication-bus behavior where applicable',
      'Component-level condition of the board',
      'Connector and pin integrity',
    ],
    ctaHeadline: 'BCM failure? Request a module evaluation before replacement.',
    ctaLabel: 'Request Module Evaluation',
    disclaimer:
      'Programming and module services are performed only where technically supported and legally authorized.',
    relatedSlugs: ['automotive-ecm-repair', 'automotive-ecu-repair', 'component-level-repair'],
  },
  {
    slug: 'aviation-electronics-repair',
    category: 'aviation',
    name: 'Aviation Electronics Repair',
    shortSummary: 'Technical evaluation and repair of aviation circuit boards and electronic assemblies.',
    heroHeadline: 'Aviation Electronics Repair',
    metaTitle: 'Aviation Electronics Repair | Technical Board Evaluation',
    metaDescription:
      'Aviation electronics accepted for technical evaluation and repair when within our capabilities and applicable authorization requirements. Avionics boards, navigation units, and electronic assemblies.',
    intro: [
      'Aviation electronics are accepted for technical evaluation and repair when within our capabilities and applicable authorization requirements. This includes avionics circuit boards, navigation units, electronic control boards, display electronics, power boards, and communication electronics.',
      'We do not claim FAA certification, PMA authorization, STC authority, or repair-station certification unless specifically documented and communicated for a given engagement.',
    ],
    symptoms: [
      'Failed or intermittent circuit boards',
      'No-power or power-related faults',
      'Display or communication electronics failure',
      'Physical or environmental damage to an assembly',
    ],
    whatWeEvaluate: [
      'Board and component-level condition under inspection',
      'Power circuitry and communication electronics',
      'Feasibility of repair within our technical capability',
      'Documentation needs for return-to-service processes handled by the customer or a qualified facility',
    ],
    ctaHeadline: 'Aviation electronics — request a technical evaluation.',
    ctaLabel: 'Request Technical Evaluation',
    disclaimer:
      'Aviation equipment may be subject to regulatory, manufacturer, maintenance, documentation, and return-to-service requirements. Customers are responsible for ensuring all work complies with applicable aviation regulations and maintenance procedures.',
    relatedSlugs: ['avionics-board-repair', 'board-level-repair', 'component-level-repair'],
  },
  {
    slug: 'avionics-board-repair',
    category: 'aviation',
    name: 'Avionics Board Repair',
    shortSummary: 'Component-level evaluation and repair of avionics circuit boards.',
    heroHeadline: 'Avionics Board Repair',
    metaTitle: 'Avionics Board Repair | Component-Level Technical Evaluation',
    metaDescription:
      'Avionics circuit board evaluation and repair at the component level, accepted when within our technical capability and applicable authorization requirements.',
    intro: [
      'Avionics circuit boards combine dense component layouts with strict reliability requirements. When a board has failed, we perform the same board-level and component-level diagnostic process used across our other work, adapted to the standards required for aviation electronics.',
      'Work is accepted only when within our technical capability and applicable authorization requirements, and customers remain responsible for any regulatory or return-to-service obligations tied to the equipment.',
    ],
    symptoms: [
      'Failed circuit boards removed from service',
      'No-power or intermittent operation',
      'Component-level damage identified during maintenance',
      'Environmental or corrosion-related damage',
    ],
    whatWeEvaluate: [
      'Component-level condition under microscopic inspection',
      'Power and signal circuitry',
      'Repair feasibility given the board’s design and condition',
      'Documentation of findings for the customer’s records',
    ],
    ctaHeadline: 'Aviation electronics — request a technical evaluation.',
    ctaLabel: 'Request Technical Evaluation',
    disclaimer:
      'Aviation equipment may be subject to regulatory, manufacturer, maintenance, documentation, and return-to-service requirements. Customers are responsible for ensuring all work complies with applicable aviation regulations and maintenance procedures.',
    relatedSlugs: ['aviation-electronics-repair', 'board-level-repair', 'microsoldering'],
  },
  {
    slug: 'asic-board-repair',
    category: 'mining',
    name: 'ASIC Board Repair',
    shortSummary: 'Control board and hashboard diagnostics for ASIC mining hardware.',
    heroHeadline: 'ASIC & Cryptocurrency Mining Hardware Repair',
    metaTitle: 'ASIC Board Repair | Mining Hardware Board-Level Diagnostics',
    metaDescription:
      'ASIC miner control board and hashboard repair: no-power diagnostics, overheating-related failures, communication faults, and component-level repair.',
    intro: [
      'ASIC miners run continuously under heavy thermal and electrical load, which makes control boards, hashboards, and power circuitry prone to component-level failure over time. Full-unit replacement is rarely the most economical path when a failure is isolated to a specific board or circuit.',
      'We diagnose ASIC control boards and hashboards at the component level, evaluating power circuitry, communication faults, and connector or trace damage.',
    ],
    symptoms: [
      'No-power conditions on a control board or hashboard',
      'Overheating-related board failures',
      'Communication faults between boards or with the controller',
      'Connector or trace damage from heat or vibration',
      'Reduced hashrate traced to a specific board',
    ],
    whatWeEvaluate: [
      'Power circuitry and voltage regulation on affected boards',
      'Communication-bus integrity between boards',
      'Thermal damage and component condition',
      'Connector and trace repair feasibility',
    ],
    ctaHeadline: 'Miner down? Submit your board for evaluation.',
    ctaLabel: 'Submit Your Board',
    relatedSlugs: ['mining-hardware-repair', 'component-level-repair', 'board-level-repair'],
  },
  {
    slug: 'mining-hardware-repair',
    category: 'mining',
    name: 'Mining Hardware Repair',
    shortSummary: 'Board-level diagnostics for cryptocurrency mining hardware.',
    heroHeadline: 'Cryptocurrency Mining Hardware Repair',
    metaTitle: 'Mining Hardware Repair | ASIC & Controller Board Diagnostics',
    metaDescription:
      'Mining hardware repair for controller boards, power circuitry, and hashboard electronics. No-power and overheating-related board failures evaluated at the component level.',
    intro: [
      'Cryptocurrency mining hardware combines high power density with continuous operation, and that combination produces predictable board-level failure patterns: power circuitry wear, connector damage, and thermal stress on components.',
      'Our laboratory evaluates mining hardware at the board and component level, whether the issue is isolated to a single hashboard, the controller board, or the power circuitry feeding the unit.',
    ],
    symptoms: [
      'Unit will not power on',
      'One or more boards not reporting or communicating',
      'Overheating-related shutdowns or damage',
      'Reduced performance traced to specific hardware',
    ],
    whatWeEvaluate: [
      'Power circuitry across affected boards',
      'Controller-to-hashboard communication',
      'Component-level thermal damage',
      'Connector and trace condition',
    ],
    ctaHeadline: 'Miner down? Submit your board for evaluation.',
    ctaLabel: 'Submit Your Board',
    relatedSlugs: ['asic-board-repair', 'component-level-repair', 'board-level-repair'],
  },
]

export function getServiceBySlug(slug: string): ServiceContent | undefined {
  return services.find((service) => service.slug === slug)
}

export function getServicesByCategory(category: ServiceCategorySlug): ServiceContent[] {
  return services.filter((service) => service.category === category)
}

export const homepageServiceCards: { slug: string; label: string; icon: string }[] = [
  { slug: 'board-level-repair', label: 'Board-Level Repair', icon: 'circuit' },
  { slug: 'iphone-board-repair', label: 'iPhone & iPad', icon: 'phone' },
  { slug: 'motherboard-repair', label: 'Computer Motherboards', icon: 'cpu' },
  { slug: 'gpu-repair', label: 'GPU Repair', icon: 'gpu' },
  { slug: 'ps5-repair', label: 'PS5 / Xbox / Nintendo', icon: 'console' },
  { slug: 'automotive-ecm-repair', label: 'Automotive ECM / BCM', icon: 'car' },
  { slug: 'aviation-electronics-repair', label: 'Aviation Electronics', icon: 'plane' },
  { slug: 'asic-board-repair', label: 'ASIC / Mining Hardware', icon: 'miner' },
]
