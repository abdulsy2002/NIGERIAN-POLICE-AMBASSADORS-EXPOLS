// src/lib/stateBaseCodes.ts

export const STATE_BASE_CODES: Record<string, string> = {
  "Abia": "ABA", "Adamawa": "ADM", "Akwa Ibom": "AKI", "Anambra": "ANB",
  "Bauchi": "BCH", "Bayelsa": "BYL", "Benue": "BNU", "Borno": "BRN",
  "Cross River": "CRS", "Delta": "DLT", "Ebonyi": "EBN", "Edo": "EDO",
  "Ekiti": "EKT", "Enugu": "ENG", "FCT": "ABJ", "Gombe": "GMB",
  "Imo": "IMO", "Jigawa": "JGW", "Kaduna": "KDN", "Kano": "KNC",
  "Katsina": "KTS", "Kebbi": "KBB", "Kogi": "KGI", "Kwara": "KWR",
  "Lagos": "LOS", "Nasarawa": "NSR", "Niger": "NGR", "Ogun": "OGN",
  "Ondo": "OND", "Osun": "OSN", "Oyo": "OYO", "Plateau": "PLT",
  "Rivers": "RVR", "Sokoto": "SKT", "Taraba": "TRB", "Yobe": "YOB",
  "Zamfara": "ZMF"
};

export const getStateCode = (stateName: string): string => {
  return STATE_BASE_CODES[stateName] || "NAT"; // Fallback to NAT (National)
};