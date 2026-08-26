export interface SearchLocation {
  id: string;
  label: string;
  labelTh: string;
  province: string;
  district: string;
  latitude: number;
  longitude: number;
  referenceSiteId?: string;
}

export const SEARCH_LOCATIONS: SearchLocation[] = [
  { id: "loc-rama9", label: "Rama IX, Huai Khwang, Bangkok", labelTh: "พระราม 9 ห้วยขวาง กรุงเทพมหานคร", province: "Bangkok", district: "Huai Khwang", latitude: 13.7559, longitude: 100.5665, referenceSiteId: "site-bkk-rama9" },
  { id: "loc-bangna", label: "Bang Na, Bangkok", labelTh: "บางนา กรุงเทพมหานคร", province: "Bangkok", district: "Bang Na", latitude: 13.6681, longitude: 100.6357, referenceSiteId: "site-bkk-bangna" },
  { id: "loc-asok", label: "Asok, Watthana, Bangkok", labelTh: "อโศก เขตวัฒนา กรุงเทพมหานคร", province: "Bangkok", district: "Watthana", latitude: 13.7370, longitude: 100.5604 },
  { id: "loc-ladprao", label: "Lat Phrao, Bangkok", labelTh: "ลาดพร้าว กรุงเทพมหานคร", province: "Bangkok", district: "Lat Phrao", latitude: 13.8110, longitude: 100.5613 },
  { id: "loc-rattanathibet", label: "Rattanathibet, Nonthaburi", labelTh: "รัตนาธิเบศร์ นนทบุรี", province: "Nonthaburi", district: "Mueang Nonthaburi", latitude: 13.8658, longitude: 100.4944, referenceSiteId: "site-nbi-rattanathibet" },
  { id: "loc-rangsit", label: "Rangsit, Pathum Thani", labelTh: "รังสิต ปทุมธานี", province: "Pathum Thani", district: "Thanyaburi", latitude: 13.9889, longitude: 100.6170 },
  { id: "loc-samutprakan", label: "Samut Prakan City", labelTh: "เมืองสมุทรปราการ", province: "Samut Prakan", district: "Mueang Samut Prakan", latitude: 13.5991, longitude: 100.5998 },
  { id: "loc-sriracha", label: "Si Racha, Chonburi", labelTh: "ศรีราชา ชลบุรี", province: "Chonburi", district: "Si Racha", latitude: 13.1674, longitude: 100.9313, referenceSiteId: "site-cbi-sriracha" },
  { id: "loc-rayong", label: "Mueang Rayong", labelTh: "เมืองระยอง", province: "Rayong", district: "Mueang Rayong", latitude: 12.6801, longitude: 101.2518, referenceSiteId: "site-ryg-mapta" },
  { id: "loc-chiangmai", label: "Nimman, Chiang Mai", labelTh: "นิมมาน เชียงใหม่", province: "Chiang Mai", district: "Mueang Chiang Mai", latitude: 18.7953, longitude: 98.9677, referenceSiteId: "site-cmi-nimman" },
  { id: "loc-phuket", label: "Phuket Bypass, Phuket", labelTh: "บายพาส ภูเก็ต", province: "Phuket", district: "Mueang Phuket", latitude: 7.9202, longitude: 98.3858, referenceSiteId: "site-pkt-bypass" },
  { id: "loc-khonkaen", label: "Mittraphap Road, Khon Kaen", labelTh: "ถนนมิตรภาพ ขอนแก่น", province: "Khon Kaen", district: "Mueang Khon Kaen", latitude: 16.4426, longitude: 102.8357, referenceSiteId: "site-kkn-mittraphap" },
  { id: "loc-korat", label: "Mueang Nakhon Ratchasima", labelTh: "เมืองนครราชสีมา", province: "Nakhon Ratchasima", district: "Mueang Nakhon Ratchasima", latitude: 14.9799, longitude: 102.0978 },
  { id: "loc-ayutthaya", label: "Ayutthaya City", labelTh: "พระนครศรีอยุธยา", province: "Ayutthaya", district: "Phra Nakhon Si Ayutthaya", latitude: 14.3532, longitude: 100.5689 },
  { id: "loc-hatyai", label: "Hat Yai, Songkhla", labelTh: "หาดใหญ่ สงขลา", province: "Songkhla", district: "Hat Yai", latitude: 7.0084, longitude: 100.4747 }
];
