/**
 * Countries for the interest form: Arabic name, dial code and the allowed length of the
 * national mobile number (without the country code or a leading 0). Shared by the client
 * form and the server, so both validate the same way.
 */
export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  dial: string; // without "+"
  min: number;
  max: number;
  example: string; // placeholder for the number field
}

export const COUNTRIES: Country[] = [
  // Arab countries first
  { code: 'QA', name: 'قطر', dial: '974', min: 8, max: 8, example: '33123456' },
  { code: 'SA', name: 'السعودية', dial: '966', min: 9, max: 9, example: '512345678' },
  { code: 'AE', name: 'الإمارات', dial: '971', min: 9, max: 9, example: '501234567' },
  { code: 'KW', name: 'الكويت', dial: '965', min: 8, max: 8, example: '50012345' },
  { code: 'BH', name: 'البحرين', dial: '973', min: 8, max: 8, example: '36001234' },
  { code: 'OM', name: 'عُمان', dial: '968', min: 8, max: 8, example: '92123456' },
  { code: 'SD', name: 'السودان', dial: '249', min: 9, max: 9, example: '912345678' },
  { code: 'EG', name: 'مصر', dial: '20', min: 10, max: 10, example: '1001234567' },
  { code: 'JO', name: 'الأردن', dial: '962', min: 9, max: 9, example: '790123456' },
  { code: 'PS', name: 'فلسطين', dial: '970', min: 9, max: 9, example: '599123456' },
  { code: 'LB', name: 'لبنان', dial: '961', min: 7, max: 8, example: '71123456' },
  { code: 'SY', name: 'سوريا', dial: '963', min: 9, max: 9, example: '944567890' },
  { code: 'IQ', name: 'العراق', dial: '964', min: 10, max: 10, example: '7901234567' },
  { code: 'YE', name: 'اليمن', dial: '967', min: 9, max: 9, example: '712345678' },
  { code: 'LY', name: 'ليبيا', dial: '218', min: 9, max: 9, example: '912345678' },
  { code: 'TN', name: 'تونس', dial: '216', min: 8, max: 8, example: '20123456' },
  { code: 'DZ', name: 'الجزائر', dial: '213', min: 9, max: 9, example: '551234567' },
  { code: 'MA', name: 'المغرب', dial: '212', min: 9, max: 9, example: '612345678' },
  { code: 'MR', name: 'موريتانيا', dial: '222', min: 8, max: 8, example: '22123456' },
  { code: 'SO', name: 'الصومال', dial: '252', min: 8, max: 9, example: '612345678' },
  { code: 'DJ', name: 'جيبوتي', dial: '253', min: 8, max: 8, example: '77831001' },
  { code: 'KM', name: 'جزر القمر', dial: '269', min: 7, max: 7, example: '3212345' },
  { code: 'SS', name: 'جنوب السودان', dial: '211', min: 9, max: 9, example: '977123456' },
  // Other countries with Arab communities
  { code: 'TR', name: 'تركيا', dial: '90', min: 10, max: 10, example: '5012345678' },
  { code: 'GB', name: 'المملكة المتحدة', dial: '44', min: 10, max: 10, example: '7400123456' },
  { code: 'US', name: 'الولايات المتحدة', dial: '1', min: 10, max: 10, example: '2015550123' },
  { code: 'CA', name: 'كندا', dial: '1', min: 10, max: 10, example: '5062345678' },
  { code: 'DE', name: 'ألمانيا', dial: '49', min: 10, max: 11, example: '15123456789' },
  { code: 'FR', name: 'فرنسا', dial: '33', min: 9, max: 9, example: '612345678' },
  { code: 'NL', name: 'هولندا', dial: '31', min: 9, max: 9, example: '612345678' },
  { code: 'BE', name: 'بلجيكا', dial: '32', min: 9, max: 9, example: '470123456' },
  { code: 'SE', name: 'السويد', dial: '46', min: 9, max: 9, example: '701234567' },
  { code: 'NO', name: 'النرويج', dial: '47', min: 8, max: 8, example: '40612345' },
  { code: 'IT', name: 'إيطاليا', dial: '39', min: 9, max: 10, example: '3123456789' },
  { code: 'ES', name: 'إسبانيا', dial: '34', min: 9, max: 9, example: '612345678' },
  { code: 'IE', name: 'أيرلندا', dial: '353', min: 9, max: 9, example: '850123456' },
  { code: 'AU', name: 'أستراليا', dial: '61', min: 9, max: 9, example: '412345678' },
  { code: 'MY', name: 'ماليزيا', dial: '60', min: 9, max: 10, example: '123456789' },
  { code: 'ET', name: 'إثيوبيا', dial: '251', min: 9, max: 9, example: '911234567' },
  { code: 'ER', name: 'إريتريا', dial: '291', min: 7, max: 7, example: '7123456' },
  { code: 'TD', name: 'تشاد', dial: '235', min: 8, max: 8, example: '63012345' },
  { code: 'KE', name: 'كينيا', dial: '254', min: 9, max: 9, example: '712123456' },
  { code: 'NG', name: 'نيجيريا', dial: '234', min: 10, max: 10, example: '8021234567' },
  { code: 'IN', name: 'الهند', dial: '91', min: 10, max: 10, example: '8123456789' },
  { code: 'PK', name: 'باكستان', dial: '92', min: 10, max: 10, example: '3012345678' },
];

export const findCountry = (code: string) => COUNTRIES.find((c) => c.code === code);

/** Keep digits only (also converts Arabic-Indic digits) and drop a leading trunk 0. */
export const normalizeNational = (raw: string) => {
  const western = raw.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
  return western.replace(/\D/g, '').replace(/^0+/, '');
};

/** Returns an Arabic error message, or '' when the number fits the country. */
export const phoneError = (country: Country | undefined, national: string) => {
  if (!country) return 'اختر الدولة';
  if (!national) return 'يرجى كتابة رقم الجوال';
  if (national.length < country.min || national.length > country.max) {
    const len = country.min === country.max ? `${country.min}` : `${country.min} إلى ${country.max}`;
    return `رقم الجوال في ${country.name} يتكون من ${len} أرقام بعد مفتاح الدولة (+${country.dial})`;
  }
  return '';
};
