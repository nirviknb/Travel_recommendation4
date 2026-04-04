/* =========================================
   WANDERLUST — COUNTRY LEGAL REQUIREMENTS
   Tourist entry requirements per country
   Sources: IATA, government travel advisories
   Updated: 2026
   ========================================= */

const countryLegalRequirements = {
  'Australia': {
    visa: 'Electronic Travel Authority (ETA) or eVisitor visa required for most nationalities. Apply online before travel.',
    passport: 'Passport must be valid for the duration of your stay. No minimum validity period beyond departure required.',
    health: 'No mandatory vaccinations. Yellow fever certificate required if arriving from endemic countries.',
    customs: 'Strict biosecurity laws. Declare all food, plant material, and animal products. No fresh produce allowed.',
    driving: 'International Driving Permit (IDP) recommended. Drive on the left. Foreign license valid for 3 months.',
    insurance: 'Travel insurance strongly recommended. Australia has Reciprocal Health Care Agreements with 11 countries.',
    currency: 'No limit on currency import, but amounts over AUD 10,000 must be declared.',
    electronics: 'All electronic devices subject to inspection. No restrictions on personal electronics.',
    medications: 'Prescription meds must be in original packaging with doctor\'s letter. Max 3-month supply allowed.',
    additional: [
      'Register with Smart Traveller (smartraveller.gov.au) for safety updates',
      'Working Holiday Visa holders must have sufficient funds (AUD 5,000)',
      'Some national parks require permits for overnight stays'
    ]
  },
  'Japan': {
    visa: 'Visa-free for 68+ countries (up to 90 days). Check embassy for your nationality. eVisa available for some.',
    passport: 'Passport must be valid for the duration of your stay.',
    health: 'No mandatory vaccinations. Routine vaccines recommended.',
    customs: 'Strict drug laws. Many OTC medications (e.g., pseudoephedrine, codeine) are prohibited. Declare all items.',
    driving: 'IDP required (Geneva Convention 1949). Drive on the left. Foreign license valid for 1 year.',
    insurance: 'Not mandatory but strongly recommended. Healthcare costs are high for foreigners.',
    currency: 'No limit on currency import, but amounts over JPY 1,000,000 must be declared.',
    electronics: 'No restrictions on personal electronics. Power outlets are Type A (100V).',
    medications: 'Bring Yakkan Shoumei (import certificate) for prescription meds exceeding 1-month supply. Some ADHD meds banned.',
    additional: [
      'Visit Japan Web: Complete immigration/customs procedures online before arrival',
      'Carry passport at all times (legal requirement for foreigners)',
      'Tipping is not customary and may be considered rude'
    ]
  },
  'Brazil': {
    visa: 'eVisa required for US, Canadian, Australian citizens. Tourist visa-free for EU, UK, and many South American countries.',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'Yellow fever vaccination recommended (required for some regions). Zika and dengue precautions advised.',
    customs: 'No restrictions on personal electronics. Declare items over USD 1,000.',
    driving: 'IDP recommended. Drive on the right. Brazilian traffic laws strictly enforced.',
    insurance: 'Travel insurance mandatory for some visa types. Strongly recommended for all travelers.',
    currency: 'No limit on currency import, but amounts over BRL 10,000 or USD 10,000 equivalent must be declared.',
    electronics: 'Personal electronics allowed duty-free. Max 2 cameras, 1 phone, 1 tablet per person.',
    medications: 'Prescription meds in original packaging with doctor\'s prescription. ANVISA approval needed for controlled substances.',
    additional: [
      'Register with your embassy upon arrival',
      'Some favelas require guided tours for safety',
      'Carnival period: book accommodations months in advance'
    ]
  },
  'France': {
    visa: 'Schengen visa-free for 90 days (EU, US, UK, Canada, Australia, NZ). ETIAS authorization required from 2025.',
    passport: 'Passport must be valid for at least 3 months beyond planned departure from Schengen area.',
    health: 'No mandatory vaccinations. EU Health Insurance Card (EHIC) for EU citizens.',
    customs: 'EU duty-free limits apply. No meat/dairy from non-EU countries.',
    driving: 'IDP recommended for non-EU licenses. Drive on the right. Crit\'Air emissions sticker required in cities.',
    insurance: 'Schengen visa applicants must show travel insurance (min. EUR 30,000 coverage).',
    currency: 'No limit on currency import within EU. Amounts over EUR 10,000 must be declared.',
    electronics: 'No restrictions. EU plug types C and E (230V).',
    medications: 'Prescription meds allowed for personal use (max 3-month supply). Carry prescription.',
    additional: [
      'ETIAS (European Travel Information and Authorization System) required from mid-2025 for visa-exempt travelers',
      'Paris Museum Pass recommended for multiple attractions',
      'Carry ID at all times; police may request identification'
    ]
  },
  'Nepal': {
    visa: 'Tourist visa on arrival available (15/30/90 days). USD 30/50/125. eVisa available online. Some nationalities must apply in advance.',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'Hepatitis A, Typhoid, and Japanese Encephalitis vaccines recommended. Malaria prophylaxis for Terai region.',
    customs: 'Declare electronics over USD 500. No drones without permit. Import of religious artifacts restricted.',
    driving: 'IDP required. Drive on the left. Road conditions are challenging; domestic flights preferred.',
    insurance: 'Travel insurance mandatory for trekking (must cover helicopter rescue up to 6,000m).',
    currency: 'Import of Nepalese currency prohibited. Foreign currency unlimited but must be declared.',
    electronics: 'Personal electronics allowed. Drone permit required from Department of Tourism (USD 500+).',
    medications: 'Carry comprehensive medical kit. Pharmacies available in Kathmandu/Pokhara but limited in remote areas.',
    additional: [
      'TIMS card required for trekking (USD 20 individual / USD 10 group)',
      'National park entry permits required (e.g., Annapurna: USD 30, Sagarmatha: USD 30)',
      'Register with your embassy; emergency rescue insurance essential',
      'Photography of military installations and border areas prohibited'
    ]
  },
  'USA': {
    visa: 'ESTA (Visa Waiver Program) for 40+ countries (USD 21, valid 2 years). B-1/B-2 tourist visa for others (USD 185).',
    passport: 'Passport must be valid for at least 6 months beyond intended stay (waived for some countries).',
    health: 'No mandatory vaccinations. Health insurance strongly recommended (healthcare is extremely expensive).',
    customs: 'Strict customs. Declare all food, plants, animal products. Max USD 800 duty-free per person.',
    driving: 'Valid foreign license accepted for up to 1 year. IDP recommended. Drive on the right.',
    insurance: 'Not legally required but essential. Average hospital visit costs USD 2,000-10,000+.',
    currency: 'No limit on currency import, but amounts over USD 10,000 must be declared (FinCEN Form 105).',
    electronics: 'Personal electronics allowed. CBP may search devices at border.',
    medications: 'FDA-approved medications only. Carry in original packaging with prescription. Some foreign meds are controlled substances in the US.',
    additional: [
      'ESTA must be obtained at least 72 hours before travel',
      'Global Entry/TSA PreCheck recommended for frequent travelers',
      'Some states have different driving laws; check local regulations'
    ]
  },
  'Italy': {
    visa: 'Schengen visa-free for 90 days (EU, US, UK, Canada, Australia, NZ). ETIAS required from 2025.',
    passport: 'Passport must be valid for at least 3 months beyond planned departure from Schengen area.',
    health: 'No mandatory vaccinations. EHIC for EU citizens. Travel insurance recommended.',
    customs: 'EU duty-free limits. No meat/dairy from non-EU countries.',
    driving: 'IDP required for non-EU licenses. Drive on the right. ZTL (limited traffic zones) in historic centers.',
    insurance: 'Schengen visa applicants need min. EUR 30,000 coverage.',
    currency: 'Amounts over EUR 10,000 must be declared.',
    electronics: 'No restrictions. EU plug types C, F, L (230V).',
    medications: 'Prescription meds for personal use (max 3-month supply). Carry prescription.',
    additional: [
      'ETIAS required from mid-2025 for visa-exempt travelers',
      'City tourist taxes apply (EUR 3-7/night, varies by city)',
      'Some cities require advance booking for major attractions (Colosseum, Uffizi)',
      'Driving in historic city centers (ZTL) results in heavy fines'
    ]
  },
  'Spain': {
    visa: 'Schengen visa-free for 90 days. ETIAS required from 2025.',
    passport: 'Passport must be valid for at least 3 months beyond planned departure from Schengen area.',
    health: 'No mandatory vaccinations. EHIC for EU citizens.',
    customs: 'EU duty-free limits apply.',
    driving: 'IDP recommended. Drive on the right. Green Card (insurance) required for non-EU vehicles.',
    insurance: 'Schengen visa applicants need min. EUR 30,000 coverage.',
    currency: 'Amounts over EUR 10,000 must be declared.',
    electronics: 'No restrictions. EU plug types C, F (230V).',
    medications: 'Prescription meds for personal use. Carry prescription.',
    additional: [
      'ETIAS required from mid-2025',
      'Tourist tax in Barcelona and other cities',
      'Sagrada Familia and Alhambra require advance booking',
      'Carry ID; random police checks common in tourist areas'
    ]
  },
  'Thailand': {
    visa: 'Visa exemption for 93 countries (30-90 days depending on nationality). Visa on arrival for some (15 days, THB 2,000).',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'No mandatory vaccinations. Hepatitis A, Typhoid recommended. Mosquito protection essential.',
    customs: 'No more than 200 cigarettes or 250g tobacco. No e-cigarettes (illegal). Buddha images require export permit.',
    driving: 'IDP required. Drive on the left. Motorbike accidents are the #1 cause of tourist injuries.',
    insurance: 'Strongly recommended. Medical evacuation can cost USD 10,000+.',
    currency: 'No limit on currency import, but amounts over USD 20,000 must be declared.',
    electronics: 'E-cigarettes and vaping devices are ILLEGAL in Thailand (fine up to THB 30,000 or imprisonment).',
    medications: 'Category II psychotropic drugs require permission. Codeine-containing products restricted.',
    additional: [
      'TM.6 departure card no longer required at airports (as of 2024)',
      'Respect royal family; lese-majeste laws carry severe penalties',
      'Shoulders and knees must be covered at temples',
      'National park fees: THB 200-500 for foreigners'
    ]
  },
  'Indonesia': {
    visa: 'Visa on arrival for 90+ countries (IDR 500,000, 30 days). eVOA available online. Visa-free for ASEAN countries.',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'No mandatory vaccinations. Hepatitis A, Typhoid recommended. Dengue and malaria precautions for some regions.',
    customs: 'Strict drug laws (death penalty for trafficking). No pornographic materials. Limit 1L alcohol, 200 cigarettes.',
    driving: 'IDP required. Drive on the left. Bali traffic is chaotic; scooter accidents common.',
    insurance: 'Strongly recommended. Medical evacuation from remote islands is expensive.',
    currency: 'Declare amounts over IDR 100,000,000 (approx. USD 6,500).',
    electronics: 'Personal electronics allowed. Drones require permit from Ministry of Transport.',
    medications: 'Strict drug laws. Carry prescription for all medications. Codeine and ADHD medications may be restricted.',
    additional: [
      'Bali tourist tax: IDR 150,000 per foreign visitor (Love Bali levy)',
      'Respect local customs in Bali (sarong required at temples)',
      'Some areas in Papua require special permits (Surat Jalan)',
      'Import of traditional medicines requires BPOM approval'
    ]
  },
  'Greece': {
    visa: 'Schengen visa-free for 90 days. ETIAS required from 2025.',
    passport: 'Passport must be valid for at least 3 months beyond planned departure from Schengen area.',
    health: 'No mandatory vaccinations. EHIC for EU citizens.',
    customs: 'EU duty-free limits. No antiquities export without permit.',
    driving: 'IDP required for non-EU licenses. Drive on the right.',
    insurance: 'Schengen visa applicants need min. EUR 30,000 coverage.',
    currency: 'Amounts over EUR 10,000 must be declared.',
    electronics: 'No restrictions. EU plug types C, F (230V).',
    medications: 'Prescription meds for personal use. Carry prescription.',
    additional: [
      'ETIAS required from mid-2025',
      'Archaeological site tickets: EUR 20-30 (Acropolis)',
      'Ferry bookings essential during summer (June-September)',
      'Ancient artifact export is strictly prohibited'
    ]
  },
  'India': {
    visa: 'e-Visa available for 160+ countries (USD 25-80, 30 days to 5 years). Regular visa through embassy for others.',
    passport: 'Passport must be valid for at least 6 months from date of entry, with 2 blank pages.',
    health: 'Hepatitis A, Typhoid recommended. Yellow fever certificate if arriving from endemic countries. Malaria prophylaxis for some regions.',
    customs: 'No more than 200 cigarettes. Gold/jewelry limits apply. Declare electronics over INR 50,000.',
    driving: 'IDP required. Drive on the left. Traffic conditions are challenging; hired drivers recommended.',
    insurance: 'Strongly recommended. Medical facilities vary widely in quality.',
    currency: 'Import of Indian currency prohibited. Foreign currency unlimited but must be declared.',
    electronics: 'Personal electronics allowed. Drones require DGCA approval.',
    medications: 'Carry prescription for all medications. Narcotic and psychotropic substances strictly controlled.',
    additional: [
      'e-Visa must be applied for at least 4 days before travel',
      'OCI (Overseas Citizen of India) cardholders have different rules',
      'Protected Area Permit (PAP) required for some northeastern states',
      'Photography restrictions near military and border areas'
    ]
  },
  'Morocco': {
    visa: 'Visa-free for 90 days for EU, US, UK, Canada, Australia, NZ, and many others.',
    passport: 'Passport must be valid for at least 3 months from date of entry.',
    health: 'No mandatory vaccinations. Hepatitis A, Typhoid recommended.',
    customs: 'No more than 200 cigarettes, 1L alcohol. No pork products. Antiquities export prohibited.',
    driving: 'IDP recommended. Drive on the right. Road conditions vary; highways are good.',
    insurance: 'Recommended. Private healthcare is good in cities but limited in rural areas.',
    currency: 'Import of foreign currency unlimited. Export limited to amount declared on entry.',
    electronics: 'Personal electronics allowed. No restrictions.',
    medications: 'Carry prescription for all medications. Some OTC meds in other countries are controlled in Morocco.',
    additional: [
      'Alcohol available in licensed hotels/restaurants only',
      'Dress modestly, especially in medinas and rural areas',
      'Ramadan: eating/drinking in public during daylight hours is discouraged',
      'Haggling is expected in souks; start at 50% of asking price'
    ]
  },
  'New Zealand': {
    visa: 'NZeTA (New Zealand Electronic Travel Authority) required for visa-waiver countries (USD 17-23). Visitor visa for others.',
    passport: 'Passport must be valid for at least 3 months beyond intended departure date.',
    health: 'No mandatory vaccinations. Routine vaccines recommended.',
    customs: 'Extremely strict biosecurity. Declare ALL food, outdoor equipment, footwear. Fines up to NZD 400,000 for non-declaration.',
    driving: 'Valid foreign license accepted for up to 12 months. Drive on the left. NZ road conditions vary.',
    insurance: 'ACC covers accident injuries for all visitors, but travel insurance for illness/theft is essential.',
    currency: 'No limit on currency import, but amounts over NZD 10,000 must be declared.',
    electronics: 'Personal electronics allowed. All items subject to biosecurity inspection.',
    medications: 'Prescription meds in original packaging with doctor\'s letter. Max 3-month supply. Some meds require Medsafe approval.',
    additional: [
      'IVL (International Visitor Conservation and Tourism Levy): NZD 35 included in NZeTA',
      'Clean outdoor gear before arrival (biosecurity requirement)',
      'Some conservation areas require permits (Great Walks book months ahead)',
      'Drone use restricted near airports and in national parks without permit'
    ]
  },
  'South Africa': {
    visa: 'Visa-free for 90 days for many countries (US, UK, EU, Australia). Visa required for India, China, and others.',
    passport: 'Passport must be valid for at least 30 days beyond intended departure, with 2 blank pages.',
    health: 'No mandatory vaccinations. Hepatitis A, Typhoid recommended. Malaria prophylaxis for Kruger area.',
    customs: 'No more than 200 cigarettes, 2L wine, 1L spirits. Declare all wildlife products.',
    driving: 'Valid foreign license accepted. Drive on the left. Road conditions are generally good.',
    insurance: 'Strongly recommended. Private healthcare is excellent but expensive.',
    currency: 'No limit on currency import, but amounts over ZAR 25,000 must be declared.',
    electronics: 'Personal electronics allowed. No restrictions.',
    medications: 'Prescription meds in original packaging. Carry prescription. Some medications legal elsewhere are controlled in SA.',
    additional: [
      ' unabridged birth certificate required for travelers under 18',
      'Yellow fever certificate required if transiting through endemic countries',
      'Game reserve fees: ZAR 200-500/day for international visitors',
      'Safety: avoid walking alone at night in urban areas'
    ]
  },
  'Cambodia': {
    visa: 'Visa on arrival (USD 30, 30 days) or e-Visa (USD 36) for most nationalities. Visa-free for ASEAN countries.',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'Hepatitis A, Typhoid recommended. Malaria prophylaxis for rural areas. Dengue precautions.',
    customs: 'No more than 200 cigarettes, 1L alcohol. Antiquities export strictly prohibited.',
    driving: 'IDP required. Drive on the right. Road conditions outside cities are poor.',
    insurance: 'Recommended. Medical facilities are limited outside Phnom Penh and Siem Reap.',
    currency: 'USD widely accepted. No limit on currency import.',
    electronics: 'Personal electronics allowed. No restrictions.',
    medications: 'Carry prescription for all medications. Pharmacies available but quality varies.',
    additional: [
      'Angkor Wat pass: USD 37 (1 day), USD 62 (3 days), USD 72 (7 days)',
      'Respect temple dress codes (shoulders and knees covered)',
      'Landmine awareness: stay on marked paths in rural areas',
      'Photography of military installations prohibited'
    ]
  },
  'Jordan': {
    visa: 'Visa on arrival (JOD 40, 40 days) for most nationalities. Jordan Pass (includes visa + attractions) recommended.',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'No mandatory vaccinations. Hepatitis A, Typhoid recommended.',
    customs: 'No more than 200 cigarettes, 1L alcohol. No pork products.',
    driving: 'IDP required. Drive on the right. Road conditions are generally good.',
    insurance: 'Recommended. Healthcare is good in Amman but limited elsewhere.',
    currency: 'No limit on currency import, but amounts over JOD 10,000 must be declared.',
    electronics: 'Personal electronics allowed. No restrictions.',
    medications: 'Carry prescription for all medications.',
    additional: [
      'Jordan Pass (JOD 70-80) includes visa fee + Petra entry — best value',
      'Petra entry without Jordan Pass: JOD 50',
      'Wadi Rum requires guide (arrange through visitor center)',
      'Dress modestly, especially outside tourist areas'
    ]
  },
  'Peru': {
    visa: 'Visa-free for 90-183 days for most nationalities (US, EU, UK, Canada, Australia, NZ).',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'Yellow fever vaccination recommended for Amazon region. Altitude sickness precautions for Cusco/Machu Picchu.',
    customs: 'No more than 200 cigarettes, 2L alcohol. No coca leaves or derivatives export.',
    driving: 'IDP required. Drive on the right. Mountain roads are challenging.',
    insurance: 'Strongly recommended. Helicopter rescue from Machu Picchu area is expensive.',
    currency: 'No limit on currency import, but amounts over USD 10,000 must be declared.',
    electronics: 'Personal electronics allowed. No restrictions.',
    medications: 'Altitude sickness medication (Acetazolamide) recommended. Carry prescription for all medications.',
    additional: [
      'Machu Picchu tickets sell out months ahead; book in advance',
      'Inca Trail permit required (limited to 500 people/day including porters)',
      'Yellow fever certificate required for Amazon region visits',
      'Coca tea is legal locally but illegal to export'
    ]
  },
  'China': {
    visa: 'Tourist visa (L visa) required for most nationalities. Apply at Chinese embassy/consulate. 15-day visa-free for some EU countries (2024-2025 trial).',
    passport: 'Passport must be valid for at least 6 months from date of entry, with 2 blank pages.',
    health: 'No mandatory vaccinations. Hepatitis A, Typhoid recommended.',
    customs: 'No more than 400 cigarettes, 1.5L alcohol. No politically sensitive materials.',
    driving: 'Chinese license required. Foreign licenses and IDP are NOT valid. Use public transport or hired drivers.',
    insurance: 'Recommended. Healthcare quality varies; international hospitals in major cities.',
    currency: 'No limit on currency import, but amounts over USD 5,000 or CNY 20,000 must be declared.',
    electronics: 'VPN services restricted. Google, Facebook, Instagram, WhatsApp blocked (use local alternatives).',
    medications: 'Carry prescription for all medications. Some OTC meds in other countries are controlled in China.',
    additional: [
      'Register with local police within 24 hours of arrival (hotel does this automatically)',
      'Download WeChat and Alipay before arrival (essential for payments)',
      'Great Wall sections: Badaling (crowded), Mutianyu (moderate), Jinshanling (hiking)',
      'Tibet requires separate Tibet Travel Permit'
    ]
  },
  'French Polynesia': {
    visa: 'Visa-free for 90 days for EU, US, UK, Canada, Australia, NZ citizens.',
    passport: 'Passport must be valid for at least 3 months beyond intended departure.',
    health: 'No mandatory vaccinations. Dengue and Zika precautions advised.',
    customs: 'No more than 200 cigarettes, 1L alcohol. No fresh produce.',
    driving: 'Valid foreign license accepted for up to 1 year. Drive on the right.',
    insurance: 'Strongly recommended. Medical evacuation to mainland France or Hawaii is expensive.',
    currency: 'CFP Franc (XPF). No limit on currency import.',
    electronics: 'No restrictions. EU plug types A, B, E (110V/220V).',
    medications: 'Carry prescription for all medications.',
    additional: [
      'Inter-island flights are expensive; budget accordingly',
      'Some atolls require permission from local authorities',
      'Marine reserves: no fishing or collecting coral/shells',
      'Accommodation: overwater bungalows book 6-12 months ahead'
    ]
  },
  'Mexico': {
    visa: 'Visa-free for 180 days for US, Canada, EU, UK, Japan, and many others. FMM tourist card required.',
    passport: 'Passport must be valid for the duration of your stay.',
    health: 'No mandatory vaccinations. Hepatitis A, Typhoid recommended. Traveler\'s diarrhea precautions.',
    customs: 'No more than 10 cigars, 200 cigarettes, 3L alcohol. Declare items over USD 10,000.',
    driving: 'Valid foreign license accepted. Drive on the right. Mexican auto insurance is mandatory.',
    insurance: 'Strongly recommended. Mexican auto insurance is legally required if driving.',
    currency: 'No limit on currency import, but amounts over USD 10,000 must be declared.',
    electronics: 'Personal electronics allowed. No restrictions.',
    medications: 'Carry prescription for all medications. Some OTC meds in the US require prescription in Mexico.',
    additional: [
      'FMM (Forma Migratoria Multiple) tourist card: included in airfare or USD 30 at land border',
      'Cenote swimming: use biodegradable sunscreen only',
      'Sargassum season: May-August on Caribbean coast',
      'Tulum ruins: arrive early to avoid heat and crowds'
    ]
  },
  'Myanmar': {
    visa: 'e-Visa available for most nationalities (USD 50, 28 days). Visa on arrival not available.',
    passport: 'Passport must be valid for at least 6 months from date of entry.',
    health: 'Hepatitis A, Typhoid, Japanese Encephalitis recommended. Malaria prophylaxis for rural areas.',
    customs: 'No more than 200 cigarettes, 1L alcohol. No Buddhist artifacts export.',
    driving: 'IDP required. Drive on the right. Road conditions are poor outside major cities.',
    insurance: 'Essential. Medical facilities are very limited.',
    currency: 'Foreign currency must be in pristine condition (no tears, marks, or folds).',
    electronics: 'Personal electronics allowed. Drones require permit.',
    medications: 'Carry comprehensive medical kit. Pharmacies are limited.',
    additional: [
      'Check travel advisories before booking; situation is volatile',
      'Some regions require special permits',
      'ATMs may not work; bring sufficient USD cash',
      'Respect Buddhist customs: remove shoes at temples, no pointing feet at Buddha'
    ]
  }
};

/* ---- Map destination name to country ---- */

function getCountryFromDestination(destinationName) {
  if (!destinationName) return null;

  const countryMap = {
    'Sydney, Australia': 'Australia',
    'Melbourne, Australia': 'Australia',
    'Tokyo, Japan': 'Japan',
    'Kyoto, Japan': 'Japan',
    'Rio de Janeiro, Brazil': 'Brazil',
    'São Paulo, Brazil': 'Brazil',
    'Paris, France': 'France',
    'Nice, France': 'France',
    'Pokhara, Nepal': 'Nepal',
    'Kathmandu, Nepal': 'Nepal',
    'New York, USA': 'USA',
    'San Francisco, USA': 'USA',
    'Miami, USA': 'USA',
    'Rome, Italy': 'Italy',
    'Venice, Italy': 'Italy',
    'Florence, Italy': 'Italy',
    'Barcelona, Spain': 'Spain',
    'Madrid, Spain': 'Spain',
    'Bangkok, Thailand': 'Thailand',
    'Chiang Mai, Thailand': 'Thailand',
    'Bali, Indonesia': 'Indonesia',
    'Santorini, Greece': 'Greece',
    'Athens, Greece': 'Greece',
    'Jaipur, India': 'India',
    'Goa, India': 'India',
    'Marrakech, Morocco': 'Morocco',
    'Queenstown, New Zealand': 'New Zealand',
    'Cape Town, South Africa': 'South Africa',
    'Angkor Wat, Cambodia': 'Cambodia',
    'Taj Mahal, India': 'India',
    'Borobudur, Indonesia': 'Indonesia',
    'Petra, Jordan': 'Jordan',
    'Machu Picchu, Peru': 'Peru',
    'Great Wall of China': 'China',
    'Bora Bora, French Polynesia': 'French Polynesia',
    'Copacabana Beach, Brazil': 'Brazil',
    'Maya Bay, Thailand': 'Thailand',
    'Bondi Beach, Australia': 'Australia',
    'Ngapali Beach, Myanmar': 'Myanmar',
    'Navagio Beach, Greece': 'Greece',
    'Tulum, Mexico': 'Mexico',
    'Raja Ampat, Indonesia': 'Indonesia'
  };

  return countryMap[destinationName] || null;
}

function getLegalRequirementsForDestination(destinationName) {
  const country = getCountryFromDestination(destinationName);
  if (!country || !countryLegalRequirements[country]) return null;
  return { country, ...countryLegalRequirements[country] };
}
