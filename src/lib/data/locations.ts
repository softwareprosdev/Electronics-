export interface LocationContent {
  slug: string
  city: string
  zipCodes: string[]
  headline: string
  summary: string
  nearby: string[]
  corridorNote: string
  localPoints: string[]
}

export const locations: LocationContent[] = [
  {
    slug: 'harlingen',
    city: 'Harlingen',
    zipCodes: ['78550', '78551', '78552', '78553'],
    headline: 'Board-Level Electronics Repair in Harlingen, TX',
    summary:
      'Harlingen is the center of our service area. Customers throughout ZIP codes 78550, 78551, 78552, and 78553 can reach our laboratory for board-level diagnostics, component-level repair, and mail-in service for devices, boards, and modules other shops were unable to resolve.',
    nearby: ['San Benito', 'La Feria', 'Combes', 'Los Fresnos'],
    corridorNote:
      'Harlingen sits at the heart of the Rio Grande Valley repair corridor that runs from Brownsville in the east to Mission in the west, making it a practical drop-off and mail-in point for the surrounding communities.',
    localPoints: [
      'Central location for customers throughout the Rio Grande Valley',
      'Drop-off and mail-in service available from a single intake point',
      'Serves consumer, business, automotive, and specialty electronics customers',
    ],
  },
  {
    slug: 'brownsville',
    city: 'Brownsville',
    zipCodes: ['78520', '78521', '78526'],
    headline: 'Board-Level Electronics Repair Serving Brownsville, TX',
    summary:
      'Brownsville customers, including businesses near the Port of Brownsville and along the US-77/83 corridor, can route board-level electronics work to our laboratory through mail-in service or coordinated drop-off.',
    nearby: ['Los Fresnos', 'San Benito', 'Port Isabel'],
    corridorNote:
      'Brownsville anchors the eastern end of our Rio Grande Valley service area, roughly a 30-minute drive from our Harlingen-based laboratory via US-77.',
    localPoints: [
      'Mail-in service is the most practical option for many Brownsville customers',
      'Serves consumer electronics, automotive shops, and industrial customers',
      'Component-level repair for boards other Brownsville-area shops could not resolve',
    ],
  },
  {
    slug: 'weslaco',
    city: 'Weslaco',
    zipCodes: ['78596', '78599'],
    headline: 'Electronics Repair Laboratory Serving Weslaco, TX',
    summary:
      'Weslaco customers have direct access to the same board-level diagnostic and component-level repair capability used throughout the Rio Grande Valley, with mail-in and coordinated drop-off options available.',
    nearby: ['Mercedes', 'Donna', 'Progreso'],
    corridorNote:
      'Weslaco sits roughly midway along the Harlingen-to-Mission corridor, making it a convenient stop for customers traveling US-83.',
    localPoints: [
      'Serves consumer, gaming, and automotive electronics customers',
      'Business and repair-shop partnership accounts available',
      'Mail-in repair available for customers who prefer not to travel',
    ],
  },
  {
    slug: 'mcallen',
    city: 'McAllen',
    zipCodes: ['78501', '78503', '78504'],
    headline: 'Board-Level Electronics Repair Serving McAllen, TX',
    summary:
      'McAllen customers, repair shops, and businesses can route board-level electronics work to our laboratory for component-level evaluation, including devices and modules that local McAllen-area shops were unable to repair.',
    nearby: ['Edinburg', 'Pharr', 'Mission', 'San Juan'],
    corridorNote:
      'McAllen is one of the larger population centers along our service corridor, and many of our repair-shop partnerships and business accounts originate from the McAllen metro area.',
    localPoints: [
      'Repair Shop Partner Program available for McAllen-area repair businesses',
      'Business and trade accounts for computer stores, automotive shops, and refurbishers',
      'Component-level repair for GPUs, motherboards, and consumer electronics',
    ],
  },
  {
    slug: 'mission',
    city: 'Mission',
    zipCodes: ['78572', '78573', '78574'],
    headline: 'Electronics Repair Laboratory Serving Mission, TX',
    summary:
      'Mission marks the western edge of our primary Rio Grande Valley service corridor. Customers in Mission and the surrounding area can access board-level and component-level repair through mail-in service or coordinated drop-off.',
    nearby: ['Alamo', 'Palmview', 'McAllen'],
    corridorNote:
      'Mission is the westernmost point in the Harlingen-to-Mission service corridor we reference across the site, roughly 45 minutes from our Harlingen-based laboratory.',
    localPoints: [
      'Mail-in service recommended for Mission-area customers',
      'Serves consumer, automotive, and business electronics customers',
      'Component-level repair for boards and devices other shops could not resolve',
    ],
  },
  {
    slug: 'edinburg',
    city: 'Edinburg',
    zipCodes: ['78539', '78541', '78542'],
    headline: 'Board-Level Repair Serving Edinburg, TX',
    summary:
      'Edinburg customers and repair businesses, including those near the University of Texas Rio Grande Valley campus, can submit devices, boards, and modules to our laboratory for advanced diagnostics and component-level repair.',
    nearby: ['McAllen', 'Pharr', 'San Juan'],
    corridorNote:
      'Edinburg sits just north of McAllen along the Rio Grande Valley corridor and is served by the same mail-in and drop-off coordination available to the rest of the region.',
    localPoints: [
      'Serves students, businesses, and consumer electronics customers',
      'Component-level repair for laptops, phones, and gaming hardware',
      'Business accounts available for Edinburg-area repair shops and IT companies',
    ],
  },
]

export function getLocationBySlug(slug: string): LocationContent | undefined {
  return locations.find((location) => location.slug === slug)
}
