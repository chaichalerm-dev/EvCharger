import type { StationConfiguration } from "@/src/domain/models";
export const GEOGRAPHIC_COVERAGE = [
  {code:"BKK",country:"TH",name:"Bangkok",nameTh:"กรุงเทพมหานคร"},{code:"NBI",country:"TH",name:"Nonthaburi",nameTh:"นนทบุรี"},{code:"SPK",country:"TH",name:"Samut Prakan",nameTh:"สมุทรปราการ"},{code:"CBI",country:"TH",name:"Chonburi",nameTh:"ชลบุรี"},{code:"RYG",country:"TH",name:"Rayong",nameTh:"ระยอง"},{code:"CMI",country:"TH",name:"Chiang Mai",nameTh:"เชียงใหม่"},{code:"PKT",country:"TH",name:"Phuket",nameTh:"ภูเก็ต"},{code:"NMA",country:"TH",name:"Nakhon Ratchasima",nameTh:"นครราชสีมา"},{code:"KKN",country:"TH",name:"Khon Kaen",nameTh:"ขอนแก่น"},{code:"AYA",country:"TH",name:"Ayutthaya",nameTh:"พระนครศรีอยุธยา"},{code:"SKA",country:"TH",name:"Songkhla",nameTh:"สงขลา"}
] as const;
export const RADIUS_OPTIONS_KM=[1,3,5,10] as const;
export const SCORE_WEIGHTS={demand:.2,competition:.14,accessibility:.16,poi:.12,infrastructure:.14,floodRisk:.1,siteArea:.08,businessPotential:.06} as const;
export const SCORE_THRESHOLDS=[{min:90,label:"EXCELLENT"},{min:75,label:"HIGH_POTENTIAL"},{min:60,label:"POTENTIAL"},{min:40,label:"LOW_POTENTIAL"},{min:0,label:"NOT_RECOMMENDED"}] as const;
export const STATION_CONFIGURATIONS:StationConfiguration[]=[
  {type:"CHARGING_POINT",label:"Charging Point",minAreaSqm:80,recommendedAreaSqm:150,chargerRange:[2,4],parkingRange:[2,5],description:"Compact installation for convenient destination charging."},
  {type:"EV_HUB",label:"EV Hub",minAreaSqm:350,recommendedAreaSqm:500,chargerRange:[6,14],parkingRange:[8,20],description:"Multi-charger hub for high-traffic commercial locations."},
  {type:"FULL_EV_STATION",label:"Full EV Station",minAreaSqm:900,recommendedAreaSqm:1400,chargerRange:[12,30],parkingRange:[18,50],description:"Full-service charging destination with supporting facilities."}
];
export const OPPORTUNITY_LIFECYCLE=["LEAD","SUBMITTED","UNDER_ANALYSIS","QUALIFIED","SITE_SURVEY","APPROVED","CONTRACT","CONSTRUCTION","INSTALLED","OPERATIONAL"] as const;
