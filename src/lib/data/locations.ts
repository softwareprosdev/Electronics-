export interface LocationContent {
  slug: string
  city: string
  zipCodes: string[]
  headline: string
  summary: string
  areaContext: string
  nearby: string[]
  corridorNote: string
  localPoints: string[]
  serviceOptions: string[]
}

export const locations: LocationContent[] = [
  {
    slug: 'harlingen',
    city: 'Harlingen',
    zipCodes: ['78550', '78551', '78552', '78553'],
    headline: 'Board-Level Electronics Repair in Harlingen, TX',
    summary:
      'Harlingen is the center of our service area. Customers throughout ZIP codes 78550, 78551, 78552, and 78553 can reach our laboratory for board-level diagnostics, component-level repair, and mail-in service for devices, boards, and modules other shops were unable to resolve.',
    areaContext:
      'Harlingen is home to Valley International Airport and sits at the junction of US-77 and US-83, making it a practical hub for both local drop-off and mail-in traffic from across the Rio Grande Valley. The city\'s mix of medical facilities, retail centers, and small businesses gives us a steady base of both consumer and business repair customers.',
    nearby: ['San Benito', 'La Feria', 'Combes', 'Los Fresnos'],
    corridorNote:
      'Harlingen sits at the heart of the Rio Grande Valley repair corridor that runs from Brownsville in the east to Mission in the west, making it a practical drop-off and mail-in point for the surrounding communities.',
    localPoints: [
      'Central location for customers throughout the Rio Grande Valley',
      'Drop-off and mail-in service available from a single intake point',
      'Serves consumer, business, automotive, and specialty electronics customers',
      'Home base for our repair laboratory and equipment',
    ],
    serviceOptions: [
      'In-person drop-off directly at our Harlingen laboratory',
      'Mail-in repair with a trackable shipping process for customers who prefer not to travel',
      'Business and trade accounts for local repair shops, IT companies, and retailers',
      'Diagnostic-first evaluation before any repair cost is committed to',
    ],
  },
  {
    slug: 'brownsville',
    city: 'Brownsville',
    zipCodes: ['78520', '78521', '78526'],
    headline: 'Board-Level Electronics Repair Serving Brownsville, TX',
    summary:
      'Brownsville customers, including businesses near the Port of Brownsville and along the US-77/83 corridor, can route board-level electronics work to our laboratory through mail-in service or coordinated drop-off.',
    areaContext:
      'Brownsville\'s economy spans the Port of Brownsville, UTRGV\'s Brownsville campus, and a growing aerospace and industrial presence in the surrounding area, alongside a large base of retail and consumer electronics use. That mix means we see everything from student laptops and phones to business equipment and specialty industrial electronics from the Brownsville area.',
    nearby: ['Los Fresnos', 'San Benito', 'Port Isabel'],
    corridorNote:
      'Brownsville anchors the eastern end of our Rio Grande Valley service area, roughly a 30-minute drive from our Harlingen-based laboratory via US-77.',
    localPoints: [
      'Mail-in service is the most practical option for many Brownsville customers',
      'Serves consumer electronics, automotive shops, and industrial customers',
      'Component-level repair for boards other Brownsville-area shops could not resolve',
      'Familiarity with the port, campus, and industrial customer base in the area',
    ],
    serviceOptions: [
      'Mail-in repair with prepaid, trackable shipping for the roughly 30-minute distance from Harlingen',
      'Coordinated drop-off for customers who prefer to hand off equipment in person',
      'Business accounts for repair shops, IT providers, and industrial customers near the port',
      'Written diagnostic findings before any repair work begins',
    ],
  },
  {
    slug: 'weslaco',
    city: 'Weslaco',
    zipCodes: ['78596', '78599'],
    headline: 'Electronics Repair Laboratory Serving Weslaco, TX',
    summary:
      'Weslaco customers have direct access to the same board-level diagnostic and component-level repair capability used throughout the Rio Grande Valley, with mail-in and coordinated drop-off options available.',
    areaContext:
      'Weslaco sits at the heart of the Mid-Valley area, with a retail and agricultural business base along US-83 that generates steady demand for both consumer device repair and business electronics service. Its central position between Harlingen and McAllen makes it a natural stop for customers traveling the corridor either direction.',
    nearby: ['Mercedes', 'Donna', 'Progreso'],
    corridorNote:
      'Weslaco sits roughly midway along the Harlingen-to-Mission corridor, making it a convenient stop for customers traveling US-83.',
    localPoints: [
      'Serves consumer, gaming, and automotive electronics customers',
      'Business and repair-shop partnership accounts available',
      'Mail-in repair available for customers who prefer not to travel',
      'Convenient midway point along the US-83 corridor',
    ],
    serviceOptions: [
      'Mail-in repair for customers throughout the Mid-Valley area',
      'Drop-off coordination for customers traveling the US-83 corridor',
      'Trade and business accounts for Weslaco-area repair shops and retailers',
      'Clear, upfront diagnostic pricing before repair work is approved',
    ],
  },
  {
    slug: 'mcallen',
    city: 'McAllen',
    zipCodes: ['78501', '78503', '78504'],
    headline: 'Board-Level Electronics Repair Serving McAllen, TX',
    summary:
      'McAllen customers, repair shops, and businesses can route board-level electronics work to our laboratory for component-level evaluation, including devices and modules that local McAllen-area shops were unable to repair.',
    areaContext:
      'As the largest metro area in our service region, McAllen has a dense concentration of retail, medical, and IT businesses, along with a large consumer electronics customer base. Many of our repair-shop partnerships and business accounts originate from McAllen-area computer stores, phone shops, and IT service providers who route their board-level and component-level cases to us rather than turning customers away.',
    nearby: ['Edinburg', 'Pharr', 'Mission', 'San Juan'],
    corridorNote:
      'McAllen is one of the larger population centers along our service corridor, and many of our repair-shop partnerships and business accounts originate from the McAllen metro area.',
    localPoints: [
      'Repair Shop Partner Program available for McAllen-area repair businesses',
      'Business and trade accounts for computer stores, automotive shops, and refurbishers',
      'Component-level repair for GPUs, motherboards, and consumer electronics',
      'Largest customer base in our service area, spanning consumer and B2B work',
    ],
    serviceOptions: [
      'Mail-in repair with trackable shipping for McAllen-metro customers',
      'Repair Shop Partner Program for local shops that need board-level backup',
      'Business and trade accounts with volume-friendly intake for computer stores and IT companies',
      'Diagnostic-first process so you know the cost before committing to repair',
    ],
  },
  {
    slug: 'mission',
    city: 'Mission',
    zipCodes: ['78572', '78573', '78574'],
    headline: 'Electronics Repair Laboratory Serving Mission, TX',
    summary:
      'Mission marks the western edge of our primary Rio Grande Valley service corridor. Customers in Mission and the surrounding area can access board-level and component-level repair through mail-in service or coordinated drop-off.',
    areaContext:
      'Mission has seen steady residential and retail growth in recent years, and its position near the Anzalduas International Bridge gives it a mix of local and cross-border commercial activity. Consumer devices, small-business electronics, and automotive modules make up the bulk of the repair work we see from the Mission area.',
    nearby: ['Alamo', 'Palmview', 'McAllen'],
    corridorNote:
      'Mission is the westernmost point in the Harlingen-to-Mission service corridor we reference across the site, roughly 45 minutes from our Harlingen-based laboratory.',
    localPoints: [
      'Mail-in service recommended for Mission-area customers',
      'Serves consumer, automotive, and business electronics customers',
      'Component-level repair for boards and devices other shops could not resolve',
      'Reachable via the full length of our Harlingen-to-Mission service corridor',
    ],
    serviceOptions: [
      'Mail-in repair recommended given the roughly 45-minute distance from Harlingen',
      'Coordinated drop-off available for customers who prefer to travel',
      'Automotive module evaluation for Mission-area vehicle owners and repair shops',
      'Transparent diagnostic findings before any repair cost is approved',
    ],
  },
  {
    slug: 'edinburg',
    city: 'Edinburg',
    zipCodes: ['78539', '78541', '78542'],
    headline: 'Board-Level Repair Serving Edinburg, TX',
    summary:
      'Edinburg customers and repair businesses, including those near the University of Texas Rio Grande Valley campus, can submit devices, boards, and modules to our laboratory for advanced diagnostics and component-level repair.',
    areaContext:
      'As the seat of Hidalgo County and home to UTRGV\'s main campus, Edinburg has a large student and faculty population alongside its government and business base. That combination drives steady demand for laptop, phone, and tablet board-level repair, in addition to the business and automotive electronics work we see across the rest of our service area.',
    nearby: ['McAllen', 'Pharr', 'San Juan'],
    corridorNote:
      'Edinburg sits just north of McAllen along the Rio Grande Valley corridor and is served by the same mail-in and drop-off coordination available to the rest of the region.',
    localPoints: [
      'Serves students, businesses, and consumer electronics customers',
      'Component-level repair for laptops, phones, and gaming hardware',
      'Business accounts available for Edinburg-area repair shops and IT companies',
      'Familiarity with student and campus-driven device repair needs',
    ],
    serviceOptions: [
      'Mail-in repair convenient for students and staff without time to travel',
      'Drop-off coordination for Edinburg-area customers and businesses',
      'Business accounts for repair shops and IT providers serving the campus and county government',
      'Fast diagnostic turnaround so devices are not out of use longer than necessary',
    ],
  },
]

export function getLocationBySlug(slug: string): LocationContent | undefined {
  return locations.find((location) => location.slug === slug)
}
